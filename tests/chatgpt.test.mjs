import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createChatGPTService,verifyChatGPTIdentity,readChatGPTStream} from '../lib/chatgpt.mjs';
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048}),jwk={...publicKey.export({format:'jwk'}),kid:'qa-key',alg:'RS256',use:'sig'};
const jwt=claims=>{const head=Buffer.from(JSON.stringify({alg:'RS256',kid:'qa-key'})).toString('base64url'),body=Buffer.from(JSON.stringify(claims)).toString('base64url'),data=head+'.'+body;return data+'.'+sign('RSA-SHA256',Buffer.from(data),privateKey).toString('base64url');};
const claims={iss:'https://auth.openai.com',aud:'oaiapp_qa',sub:'user-qa',email:'qa@example.test',email_verified:true,nonce:'qa-nonce',exp:Math.floor(Date.now()/1000)+3600};
const sse=(events)=>new Response(events.map(x=>'data: '+JSON.stringify(x)+'\r\n\r\n').join(''),{headers:{'Content-Type':'text/event-stream'}});
test('OIDC verifies signature, issuer, audience, nonce, expiry and selected account before accepting identity',async()=>{
 assert.equal((await verifyChatGPTIdentity(jwt(claims),{clientId:'oaiapp_qa',nonce:'qa-nonce',jwks:{keys:[jwk]}})).email,claims.email);
 for(const changed of [{iss:'https://evil.test'},{aud:'another-client'},{nonce:'wrong'},{exp:1},{sub:'other-account'}])await assert.rejects(verifyChatGPTIdentity(jwt({...claims,...changed}),{clientId:'oaiapp_qa',nonce:'qa-nonce',subject:'user-qa',jwks:{keys:[jwk]}}),/身份验证/);
 await assert.rejects(verifyChatGPTIdentity(jwt(claims).slice(0,-8)+'bad-sign',{clientId:'oaiapp_qa',nonce:'qa-nonce',jwks:{keys:[jwk]}}));
});
test('Responses stream requires response.completed; incomplete or failed streams do not become chat replies',async()=>{
 assert.equal(await readChatGPTStream(sse([{type:'response.output_text.delta',delta:'你好。'},{type:'response.completed',response:{status:'completed'}}])),'你好。');
 await assert.rejects(readChatGPTStream(sse([{type:'response.output_text.delta',delta:'partial'}])),/完整/);
 await assert.rejects(readChatGPTStream(sse([{type:'response.output_text.delta',delta:'partial'},{type:'response.failed',response:{error:{code:'subscription_sharing_usage_limit_exceeded'}}}])),/未完成/);
 const bytes=new TextEncoder().encode('data: {"type":"response.output_text.delta","delta":"好"}\r\n\r\ndata: {"type":"response.completed"}\r\n\r\n');
 const stream=new ReadableStream({start(controller){for(const byte of bytes)controller.enqueue(Uint8Array.of(byte));controller.close();}});
 assert.equal(await readChatGPTStream(new Response(stream)),'好');
});
async function fixture(t){
 const directory=await mkdtemp(path.join(tmpdir(),'yan-chatgpt-')),calls=[];let service,authorize,refreshes=0,brokenNonce=false;
 const server=http.createServer(async(req,res)=>{if(!await service.handle(req,res,new URL(req.url,'http://localhost').pathname))res.writeHead(404).end();});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port,base=`http://127.0.0.1:${port}`,hosts=new Set([`127.0.0.1:${port}`]);
 const fetcher=async(url,options={})=>{
  calls.push({url,options});
  if(url.endsWith('openid-configuration'))return Response.json({issuer:'https://auth.openai.com',authorization_endpoint:'https://auth.openai.com/api/accounts/authorize',token_endpoint:'https://auth.openai.com/api/accounts/oauth/token',jwks_uri:'https://auth.openai.com/.well-known/jwks.json',revocation_endpoint:'https://auth.openai.com/revoke'});
  if(url.endsWith('jwks.json'))return Response.json({keys:[jwk]});
  if(url.endsWith('/oauth/token')){const form=new URLSearchParams(options.body);if(form.get('grant_type')==='refresh_token')refreshes++;else assert.equal(createHash('sha256').update(form.get('code_verifier')).digest('base64url'),authorize.searchParams.get('code_challenge'));assert.equal(form.get('client_id'),'oaiapp_qa');return Response.json({access_token:'qa-only-access',refresh_token:'qa-only-refresh',id_token:jwt({...claims,nonce:brokenNonce?'wrong':authorize.searchParams.get('nonce')}),token_type:'Bearer',scope:'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct',expires_in:3600});}
  if(url.endsWith('/models'))return Response.json({models:[{slug:'account-model',display_name:'Available model',visibility:'list'},{slug:'hidden-model',visibility:'hide'}]});
  if(url.endsWith('/responses'))return sse([{type:'response.output_text.delta',delta:'Actual test transport reply.'},{type:'response.completed'}]);
  if(url.endsWith('/revoke'))return new Response(null,{status:200});
  throw Error('Unexpected URL');
 };
 service=createChatGPTService({directory,port,hosts,fetcher});
 const request=(route,body,headers={})=>fetch(base+route,{method:body?'POST':'GET',headers:{'X-Yan-Client':'1',Origin:base,...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual'});
 async function start(){const r=await request('/api/chatgpt/signin',{});assert.equal(r.status,200);const data=await r.json();authorize=new URL(data.authorizationUrl);return {authorize,cookie:r.headers.get('set-cookie').split(';')[0]};}
 async function callback({cookie,authorize},params={}){const query=new URLSearchParams({state:authorize.searchParams.get('state'),code:'qa-code',client_id:'oaiapp_qa',...params});return fetch(base+'/auth/callback?'+query,{headers:{Cookie:cookie},redirect:'manual'});}
 t.after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));assert.equal(path.dirname(directory),tmpdir().replace(/[\\/]$/,''));assert.ok(path.basename(directory).startsWith('yan-chatgpt-'));await rm(directory,{recursive:true,force:true});});
 return {service,request,start,callback,calls,directory,setBrokenNonce:v=>brokenNonce=v};
}
test('official login binds state and cookie, consumes codes once, stores secrets privately, uses account model catalogue and revokes on logout',async t=>{
 const f=await fixture(t),started=await f.start();
 assert.equal(started.authorize.origin,'https://auth.openai.com');assert.equal(started.authorize.searchParams.get('client_id'),'dynamic_agent_client');assert.match(started.authorize.searchParams.get('ext_agent_host_id'),/^urn:uuid:/);assert.equal(started.authorize.searchParams.get('code_challenge_method'),'S256');
 assert.equal((await f.callback({...started,cookie:'yan_login=wrong'})).status,400);assert.equal(f.calls.some(x=>x.url.endsWith('/oauth/token')),false);
 assert.equal((await f.callback(started)).status,303);assert.equal((await f.callback(started)).status,400);
 const status=await f.service.status();assert.equal(status.connected,true);assert.equal(JSON.stringify(status).includes('qa-only-access'),false);assert.equal(JSON.stringify(status).includes('qa-only-refresh'),false);
 const saved=JSON.parse(await readFile(path.join(f.directory,'chatgpt.json'),'utf8'));assert.equal(saved.profiles[saved.active].clientId,'oaiapp_qa');
 assert.deepEqual(await f.service.models(),[{id:'account-model',name:'Available model'}]);
 await assert.rejects(f.service.request({task:'sentence',text:'Hello',allowRemote:false},'account-model'),/允许/);
 await assert.rejects(f.service.request({task:'sentence',text:'Hello',allowRemote:true},'hidden-model'),/可用列表/);
 const result=await f.service.request({task:'companion',text:'I feel tired.',history:[],allowRemote:true},'account-model');assert.equal(result.answer,'Actual test transport reply.');
 const payload=JSON.parse(f.calls.find(x=>x.url.endsWith('/responses')).options.body);assert.equal(payload.store,false);assert.equal(payload.stream,true);assert.equal(payload.input[0].role,'user');assert.equal(payload.model,'account-model');assert.equal(payload.previous_response_id,undefined);assert.equal(payload.input.some(x=>x.role==='system'),false);assert.ok(payload.instructions);
 const logout=await f.request('/api/chatgpt/signout',{});assert.equal(logout.status,200);assert.equal((await f.service.status()).connected,false);await assert.rejects(f.service.models(),/登录/);
 const record=JSON.parse(await readFile(path.join(f.directory,'chatgpt.json'),'utf8'));assert.equal(JSON.stringify(record).includes('qa-only-access'),false);assert.ok(f.calls.some(x=>x.url.endsWith('/revoke')));
});
test('bad identity cannot become an active account, and cross-origin login endpoints are rejected',async t=>{
 const f=await fixture(t);assert.equal((await f.request('/api/chatgpt/signin',{}, {Origin:'https://evil.test'})).status,403);assert.equal((await f.request('/api/chatgpt/status',undefined,{'X-Yan-Client':''})).status,403);
 const started=await f.start();f.setBrokenNonce(true);await f.callback(started);assert.equal((await f.service.status()).connected,false);await assert.rejects(f.service.models(),/登录/);
});
