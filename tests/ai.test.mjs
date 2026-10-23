import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import {EventEmitter} from 'node:events';
import {validateConfig,requestTutor,createAiService} from '../lib/ai.mjs';

test('API config: HTTPS only; key reuse limited to identical endpoint; local mode removes key',()=>{
 const previous=validateConfig({provider:'compatible',baseUrl:'https://example.com/v1/',model:'sample',apiKey:'test-only-secret'});
 assert.equal(validateConfig({provider:'compatible',baseUrl:'https://example.com/v1',model:'sample2'},previous).apiKey,'test-only-secret');
 assert.throws(()=>validateConfig({provider:'compatible',baseUrl:'https://different.example/v1',model:'sample'},previous));
 assert.throws(()=>validateConfig({provider:'compatible',baseUrl:'http://example.com',model:'sample',apiKey:'test'}));
 assert.throws(()=>validateConfig({provider:'ollama',model:'example:cloud'}));
 assert.deepEqual(validateConfig({provider:'ollama',model:'local-model'},previous),{provider:'ollama',model:'local-model'});
});
test('Ollama adapter sends only given exercise text and extracts a real response',async()=>{
 let request;
 const response=await requestTutor({provider:'ollama',model:'test-model'},{task:'sentence',text:'She did not went.'},async(url,init)=>{
  request={url,...init};return Response.json({message:{content:'Use go after did not.'}});
 });
 assert.equal(request.url,'http://127.0.0.1:11434/api/chat');const payload=JSON.parse(request.body);
 assert.equal(payload.stream,false);assert.equal(payload.messages.length,2);assert.equal(payload.messages[1].content,'She did not went.');
 assert.equal(response.answer,'Use go after did not.');assert.equal(response.label,'AI 学习建议 · 非官方评分');
});
test('compatible adapter uses configured path and server-side bearer; no fabricated fallback',async()=>{
 const config={provider:'compatible',model:'test',baseUrl:'https://example.com/v1',apiKey:'test-only-secret'};
 const output=await requestTutor(config,{task:'writing',text:'My essay'},async(url,init)=>{assert.equal(url,'https://example.com/v1/chat/completions');assert.equal(init.headers.Authorization,'Bearer test-only-secret');return Response.json({choices:[{message:{content:'Feedback'}}]});});
 assert.equal(output.answer,'Feedback');
 await assert.rejects(requestTutor(config,{task:'writing',text:'My essay'},async()=>Response.json({error:'sensitive upstream details'},{status:401})),/认证/);
 await assert.rejects(requestTutor(config,{task:'writing',text:'My essay'},async()=>Response.json({choices:[]})),/没有返回/);
 await assert.rejects(requestTutor(config,{task:'bad',text:'My essay'}),/请选择任务/);
});
test('HTTP boundary blocks cross-origin/unknown hosts, strips keys, persists local settings and protects phone configuration',async t=>{
 const directory=await mkdtemp(path.join(tmpdir(),'yan-ai-test-'));const hosts=new Set();let calls=0;
 const ai=createAiService({directory,hosts,fetcher:async(url)=>{calls++;return Response.json(url.endsWith('/tags')?{models:[{name:'qwen3:4b'},{name:'hidden:cloud'}]}:{message:{content:'Test response'},choices:[{message:{content:'Test response'}}]});}});
 const server=http.createServer((req,res)=>ai(req,res,new URL(req.url,'http://localhost').pathname));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;hosts.add(`127.0.0.1:${port}`);const base=`http://127.0.0.1:${port}`;
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});});
 const headers={'X-Yan-Client':'1'};
 assert.equal((await fetch(base+'/api/ai/status')).status,403);
 assert.equal((await fetch(base+'/api/ai/status',{headers:{...headers,Origin:'https://evil.example'}})).status,403);
 const badHostStatus=await new Promise((resolve,reject)=>{http.get(base+'/api/ai/status',{headers:{...headers,Host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);}).on('error',reject);});assert.equal(badHostStatus,403);
 let data=await(await fetch(base+'/api/ai/status',{headers})).json();assert.equal(data.status,'ready');assert.deepEqual(data.models,['qwen3:4b']);assert.ok(data.pairCode);
 const config={provider:'compatible',model:'test',baseUrl:'https://example.com/v1',apiKey:'test-only-secret'};
 assert.equal((await fetch(base+'/api/ai/config',{method:'POST',headers,body:JSON.stringify(config)})).status,200);
 assert.equal(JSON.parse(await readFile(path.join(directory,'ai.json'),'utf8')).apiKey,'test-only-secret');
 const statusText=await(await fetch(base+'/api/ai/status',{headers})).text();assert.ok(!statusText.includes('test-only-secret'));assert.ok(!statusText.includes('"apiKey"'));
 const denied=await fetch(base+'/api/ai/tutor',{method:'POST',headers,body:JSON.stringify({task:'writing',text:'essay'})});assert.equal(denied.status,400);
 const allowed=await fetch(base+'/api/ai/tutor',{method:'POST',headers,body:JSON.stringify({task:'writing',text:'essay',allowRemote:true})});assert.equal(allowed.status,200);
 assert.ok(calls>=2);
});

test('phone requires pairing and cannot reconfigure; local pair code is not returned to phone',async t=>{
 const directory=await mkdtemp(path.join(tmpdir(),'yan-pair-test-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const ai=createAiService({directory,hosts:new Set(['127.0.0.1:4173','192.168.1.8:4173']),fetcher:async()=>Response.json({models:[{name:'qwen3:4b'}]})});
 async function call(remote,host,pathname,code,method='GET'){
  const req=Readable.from([]);req.socket={remoteAddress:remote};req.headers={host,'x-yan-client':'1',...(code?{'x-yan-pair':code}:{})};req.method=method;
  const res=new EventEmitter();res.writeHead=(status)=>{res.status=status;return res;};res.end=text=>{res.body=JSON.parse(text);return res;};
  await ai(req,res,pathname);return res;
 }
 const local=await call('127.0.0.1','127.0.0.1:4173','/api/ai/status');const code=local.body.pairCode;
 assert.equal((await call('192.168.1.10','192.168.1.8:4173','/api/ai/status')).status,401);
 const phone=await call('192.168.1.10','192.168.1.8:4173','/api/ai/status',code);assert.equal(phone.status,200);assert.equal(phone.body.canConfigure,false);assert.equal(phone.body.pairCode,undefined);
 assert.equal((await call('192.168.1.10','192.168.1.8:4173','/api/ai/config',code,'POST')).status,403);
});
