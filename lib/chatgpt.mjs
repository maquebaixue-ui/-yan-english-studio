// Supported Sign in with ChatGPT OSS flow. Credentials never leave this runtime.
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes,randomUUID,createHash,createPublicKey,verify,timingSafeEqual} from 'node:crypto';
import {buildTutorMessages} from '../dist/ai-prompts.js';
const ISSUER='https://auth.openai.com',RESOURCE='https://api.openai.com/v1';
const SCOPES='openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const failure=(message,status=400)=>Object.assign(new Error(message),{status});
const random=()=>randomBytes(32).toString('base64url');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
async function jsonResponse(response,max=256*1024){
 if(!response.ok){await response.body?.cancel().catch(()=>{});throw failure(`ChatGPT 服务返回 HTTP ${response.status}，请检查授权或稍后重试。`,502);}
 const reader=response.body?.getReader();if(!reader)throw failure('服务没有返回内容。',502);const chunks=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max)throw failure('服务返回内容过大。',502);chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw failure('服务返回格式无法读取。',502);}
}
export async function verifyChatGPTIdentity(token,{clientId,nonce,subject,jwks,now=Date.now()}){
 try{
  const parts=token.split('.');if(parts.length!==3)throw Error();
  const header=JSON.parse(Buffer.from(parts[0],'base64url')),claims=JSON.parse(Buffer.from(parts[1],'base64url'));
  if(header.alg!=='RS256'||typeof header.kid!=='string'||header.crit||header.jku||header.x5u)throw Error();
  const key=jwks.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256')&&(!k.use||k.use==='sig'));if(!key)throw Error();
  if(!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key,format:'jwk'}),Buffer.from(parts[2],'base64url')))throw Error();
  if(claims.iss!==ISSUER||!(Array.isArray(claims.aud)?claims.aud:[claims.aud]).includes(clientId)||!Number.isFinite(claims.exp)||claims.exp*1000<=now||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>256)throw Error();
  if(claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf*1000>now+30000))throw Error();
  if(Array.isArray(claims.aud)&&claims.aud.length>1&&claims.azp!==clientId)throw Error();
  if(nonce!==undefined&&!equal(claims.nonce,nonce))throw Error();
  if(subject!==undefined&&claims.sub!==subject)throw Error();
  return {subject:claims.sub,email:typeof claims.email==='string'&&claims.email_verified===true?claims.email.slice(0,320):''};
 }catch{throw failure('ChatGPT 身份验证未通过，原有账号未更改。请重新登录。',401);}
}
export async function readChatGPTStream(response){
 if(!response.ok){await response.body?.cancel().catch(()=>{});throw failure(response.status===401?'ChatGPT 授权已失效，请重新登录。':response.status===429?'ChatGPT 使用量或频率达到限制，请稍后再试。':`ChatGPT 返回 HTTP ${response.status}。`,502);}
 const reader=response.body?.getReader();if(!reader)throw failure('ChatGPT 未返回生成内容。',502);
 const decoder=new TextDecoder();let buffer='',answer='',completed=false,total=0;
 function event(block){
  const raw=block.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');if(!raw||raw==='[DONE]')return;
  let data;try{data=JSON.parse(raw);}catch{throw failure('ChatGPT 流式回复格式无效。',502);}
  if(data.type==='response.output_text.delta'&&typeof data.delta==='string')answer+=data.delta;
  if(answer.length>24000)throw failure('回复过长，请缩短问题重试。',502);
  if(['response.failed','response.incomplete','error'].includes(data.type))throw failure('ChatGPT 未完成回复，可能是额度、权限或生成被中断。请在 ChatGPT 中检查应用授权和用量。',502);
  if(data.type==='response.completed'){
   if(data.response?.status&&data.response.status!=='completed')throw failure('ChatGPT 没有完成这次回复。',502);
   completed=true;
   if(!answer)answer=(data.response?.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text||'').join('');
  }
 }
 try{while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>4*1024*1024)throw failure('ChatGPT 流式响应过大。',502);buffer=(buffer+decoder.decode(value,{stream:true})).replace(/\r\n/g,'\n');let end;while((end=buffer.indexOf('\n\n'))>=0){event(buffer.slice(0,end));buffer=buffer.slice(end+2);}if(buffer.length>1024*1024)throw failure('ChatGPT 流式事件过大。',502);}buffer+=decoder.decode();if(buffer.trim())event(buffer);}finally{await reader.cancel().catch(()=>{});}
 if(!completed||!answer.trim())throw failure('回复未完整结束，没有添加 AI 回答。你的草稿仍可重试。',502);
 return answer.slice(0,24000);
}
export function createChatGPTService({directory,port,hosts,fetcher=fetch,now=()=>Date.now()}){
 const file=path.join(directory,'chatgpt.json'),redirectUri=`http://127.0.0.1:${port}/auth/callback`;
 let saved={hostId:'urn:uuid:'+randomUUID(),profiles:{},active:null},pending=null,discovery=null,lock=null,renewing=null,note='',loadError=false;
 const ready=readFile(file,'utf8').then(text=>{const value=JSON.parse(text);if(typeof value.hostId!=='string'||!/^urn:uuid:[a-f0-9-]{36}$/i.test(value.hostId)||!value.profiles||typeof value.profiles!=='object'||Array.isArray(value.profiles))throw Error();saved=value;}).catch(e=>{if(e.code!=='ENOENT'){loadError=true;note='本机 ChatGPT 配置无法读取，已保留原文件；请先备份 .local/chatgpt.json 后再处理。';}});
 const current=()=>saved.profiles[saved.active]||null;
 async function persist(){if(loadError)throw failure(note);await mkdir(directory,{recursive:true});await writeFile(file+'.tmp',JSON.stringify(saved),{mode:0o600});await rename(file+'.tmp',file);}
 async function exclusive(fn){if(lock)throw failure('ChatGPT 正在处理另一项操作，请稍后。',409);lock=true;try{return await fn();}finally{lock=null;}}
 async function metadata(){
  if(discovery)return discovery;
  const data=await jsonResponse(await fetcher(ISSUER+'/.well-known/openid-configuration',{redirect:'error',signal:AbortSignal.timeout(15000)}));
  if(data.issuer!==ISSUER)throw failure('OpenAI 登录服务标识不匹配。',502);
  for(const key of ['authorization_endpoint','token_endpoint','jwks_uri','revocation_endpoint']){const u=new URL(data[key]);if(u.origin!==ISSUER||u.username||u.password||u.hash)throw failure('OpenAI 登录服务地址不匹配。',502);}
  discovery=data;return data;
 }
 async function exchange(params){const d=await metadata();return jsonResponse(await fetcher(d.token_endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...params,resource:RESOURCE}),redirect:'error',signal:AbortSignal.timeout(20000)}));}
 function credentials(tokens,previous={}){
  const scopes=typeof tokens.scope==='string'?tokens.scope.split(/\s+/):previous.scopes||[];
  if(!scopes.includes('chatgpt.tokens.use.direct')||!scopes.includes('resource.invoke'))throw failure('此账号未授予 ChatGPT 额度使用权限；登录身份本身不代表可生成回复。',403);
  if(tokens.token_type?.toLowerCase()!=='bearer'||typeof tokens.access_token!=='string'||!tokens.access_token||tokens.access_token.length>16000||!Number.isFinite(tokens.expires_in)||tokens.expires_in<=0||tokens.expires_in>7*86400)throw failure('OpenAI 返回的授权凭据无效。',502);
  return {accessToken:tokens.access_token,refreshToken:tokens.refresh_token||previous.refreshToken||'',idToken:tokens.id_token||previous.idToken||'',scopes,expiresAt:now()+tokens.expires_in*1000};
 }
 async function activeToken(){
  await ready;if(loadError)throw failure(note);let profile=current();if(!profile?.accessToken)throw failure('请先在电脑本机页面使用 Continue with ChatGPT 登录。',401);
  if(profile.expiresAt>now()+60000)return profile.accessToken;
  if(!profile.refreshToken)throw failure('ChatGPT 授权已过期，请重新登录。',401);
  if(!renewing)renewing=(async()=>{const tokens=await exchange({grant_type:'refresh_token',client_id:profile.clientId,refresh_token:profile.refreshToken});const next=credentials(tokens,profile);if(tokens.id_token){const d=await metadata(),jwks=await jsonResponse(await fetcher(d.jwks_uri,{redirect:'error',signal:AbortSignal.timeout(15000)}));await verifyChatGPTIdentity(tokens.id_token,{clientId:profile.clientId,subject:profile.subject,jwks,now:now()});}Object.assign(profile,next);await persist();return profile.accessToken;})().finally(()=>{renewing=null;});
  return renewing;
 }
 async function models(){const token=await activeToken();const data=await jsonResponse(await fetcher(RESOURCE+'/models',{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(15000)}));if(!Array.isArray(data.models))throw failure('账号模型列表格式不受支持。',502);return data.models.filter(x=>x.visibility==='list'&&typeof x.slug==='string'&&x.slug.length<=160).map(x=>({id:x.slug,name:String(x.display_name||x.slug).slice(0,160)}));}
 async function status(){await ready;const p=current();return {connected:!!p?.accessToken,account:p?.email||p?.subject||'',active:saved.active,profiles:Object.entries(saved.profiles).map(([id,p])=>({id,label:p.email||p.subject,authorized:!!p.accessToken})),message:note||(p?.accessToken?'已保存本机授权；实际模型以此账号可用列表为准。':'尚未连接 ChatGPT。'),canConfigure:true};}
 async function request(input,model,signal){return exclusive(async()=>{
  if(input.allowRemote!==true)throw failure('请先允许将本次文字发送给 ChatGPT。');
  const messages=buildTutorMessages(input),token=await activeToken(),available=await models();if(!available.some(x=>x.id===model))throw failure('所选模型不在这个 ChatGPT 账号的可用列表中，请重新选择。');
  const response=await fetcher(RESOURCE+'/responses',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({model,instructions:messages[0].content,input:messages.slice(1),store:false,stream:true}),redirect:'error',signal:signal||AbortSignal.timeout(180000)});
  return {answer:(await readChatGPTStream(response)).slice(0,input.task==='companion'?4000:24000),model,provider:'chatgpt',label:input.task==='companion'?'ChatGPT 陪伴 · 非真人':'ChatGPT 学习建议 · 非官方评分'};
 });}
 function access(req){if(!hosts.has(req.headers.host)||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))throw failure('ChatGPT 登录设置只在电脑本机页面操作。',403);if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`)throw failure('登录操作来源不匹配。',403);if(req.headers['sec-fetch-site']==='cross-site'||req.headers['x-yan-client']!=='1')throw failure('登录操作来源无效。',403);}
 const json=(res,code,data)=>res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(data));
 async function handle(req,res,pathname){
  if(pathname!=='/auth/callback'&&!pathname.startsWith('/api/chatgpt/'))return false;
  try{
   await ready;
   if(pathname==='/auth/callback'){
    if(req.method!=='GET'||req.headers.host!==`127.0.0.1:${port}`||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))throw failure('登录回调地址无效。',403);
    const params=new URL(req.url,redirectUri).searchParams,cookie=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('yan_login='))?.slice(10),attempt=pending;
    if(!attempt||now()>attempt.expiresAt||!equal(params.get('state'),attempt.state)||!equal(cookie,attempt.cookie))throw failure('登录已过期或不属于这个浏览器，请从本机学习页面重新开始。',400);
    pending=null;
    try{await exclusive(async()=>{
     if(params.has('error'))throw failure('你取消了 ChatGPT 授权；原有连接未更改。');
     const issued=params.get('client_id')||attempt.clientId;if(!issued||issued==='dynamic_agent_client'||!/^oaiapp_[a-zA-Z0-9_-]+$/.test(issued)||attempt.clientId!=='dynamic_agent_client'&&issued!==attempt.clientId)throw failure('未收到匹配的 ChatGPT 应用标识，请重新开始。');
     const code=params.get('code');if(!code||code.length>4096)throw failure('未收到有效登录授权码。');
     const tokens=await exchange({grant_type:'authorization_code',client_id:issued,code,code_verifier:attempt.verifier,redirect_uri:redirectUri}),next=credentials(tokens),d=await metadata(),jwks=await jsonResponse(await fetcher(d.jwks_uri,{redirect:'error',signal:AbortSignal.timeout(15000)}));
     const identity=await verifyChatGPTIdentity(tokens.id_token,{clientId:issued,nonce:attempt.nonce,subject:attempt.subject,jwks,now:now()});
     const id=createHash('sha256').update(issued+'\0'+identity.subject).digest('hex');saved.profiles[id]={...identity,clientId:issued,...next};saved.active=id;await persist();note='ChatGPT 授权已完成。请读取账号模型列表，再选择模型开始。';
    });}catch(e){note=e.status?e.message:'ChatGPT 登录未完成，请重新授权。原有账号仍保留。';}
    res.writeHead(303,{'Location':'/#ai','Cache-Control':'no-store','Set-Cookie':'yan_login=; HttpOnly; SameSite=Lax; Path=/auth/callback; Max-Age=0','Referrer-Policy':'no-referrer'}).end();return true;
   }
   access(req);if(loadError)throw failure(note);
   if(req.method==='GET'&&pathname==='/api/chatgpt/status'){json(res,200,await status());return true;}
   if(req.method==='GET'&&pathname==='/api/chatgpt/models'){json(res,200,{models:await exclusive(models)});return true;}
   if(req.method!=='POST')throw failure('不支持的登录操作。',405);
   let body='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>2048)throw failure('登录操作数据过大。',413);body+=chunk;}let value;try{value=JSON.parse(body||'{}');}catch{throw failure('登录操作格式错误。');}
   if(pathname==='/api/chatgpt/signin'){
    if(req.headers.host!==`127.0.0.1:${port}`)throw failure(`请先打开 http://127.0.0.1:${port}/#ai，再开始 ChatGPT 登录；登录回调必须使用同一回环地址。`);
    const output=await exclusive(async()=>{await persist();const selected=value.profileId?saved.profiles[value.profileId]:null;if(value.profileId&&!selected)throw failure('这个账号注册不存在。');const d=await metadata();pending={state:random(),nonce:random(),verifier:randomBytes(48).toString('base64url'),cookie:random(),expiresAt:now()+10*60000,clientId:selected?.clientId||'dynamic_agent_client',subject:selected?.subject};const url=new URL(d.authorization_endpoint);url.search=new URLSearchParams({client_id:pending.clientId,...(!selected?{agent_name_hint:'YAN English Studio'}:{}),ext_agent_host_id:saved.hostId,response_type:'code',redirect_uri:redirectUri,scope:SCOPES,resource:RESOURCE,state:pending.state,nonce:pending.nonce,code_challenge_method:'S256',code_challenge:createHash('sha256').update(pending.verifier).digest('base64url')});return {authorizationUrl:url.href};});
    res.setHeader('Set-Cookie',`yan_login=${pending.cookie}; HttpOnly; SameSite=Lax; Path=/auth/callback; Max-Age=600`);json(res,200,output);return true;
   }
   if(pathname==='/api/chatgpt/signout'){
    const output=await exclusive(async()=>{const p=current();let revoked=!p?.refreshToken;if(p?.refreshToken)try{const d=await metadata(),r=await fetcher(d.revocation_endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:p.refreshToken,token_type_hint:'refresh_token',client_id:p.clientId}),redirect:'error',signal:AbortSignal.timeout(12000)});revoked=r.status===200;await r.body?.cancel();}catch{}if(p)for(const key of ['accessToken','refreshToken','idToken','expiresAt','scopes'])delete p[key];pending=null;await persist();note=revoked?'已退出 ChatGPT。':'本机已退出；未能确认远程撤销，请到 ChatGPT 设置中断开此应用。';return {signedOut:true,revoked};});json(res,200,output);return true;
   }
   throw failure('登录接口不存在。',404);
  }catch(e){json(res,e.status||503,{error:e.status?e.message:'无法连接 OpenAI 登录服务，请检查网络后重试。'});}
  return true;
 }
 return {handle,status,models,request};
}
