import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {freshState} from '../dist/core.js';
import {buildLearningSnapshot} from '../dist/connections.js';
const mcp=await readFile(new URL('../lib/learning-mcp.mjs',import.meta.url),'utf8'),source=await readFile(new URL('../hosting/worker.mjs',import.meta.url),'utf8');
const schema=await readFile(new URL('../dist/world-core.js',import.meta.url),'utf8'),vision=(await readFile(new URL('../lib/vision.mjs',import.meta.url),'utf8')).replace(/^import [^\n]+\n/m,'');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(schema+'\n'+vision+'\n'+mcp+'\nconst PUBLIC_WORDS=[],PUBLIC_MATERIALS=[],PUBLIC_ASSETS={};\n'+source).toString('base64'))).default;
test('hosted snapshot endpoints require platform identity and same-origin writes, isolate users, and accept no private key fields',async()=>{
 const data=new Map(),env={BUCKET:{get:async key=>data.has(key)?{text:async()=>data.get(key)}:null,put:async(k,v)=>data.set(k,v),delete:async k=>data.delete(k)}};
 const send=(method,user,body,origin='https://study.example.test')=>worker.fetch(new Request('https://study.example.test/api/connections/snapshot',{method,headers:{Origin:origin,'X-Yan-Client':'1','Content-Type':'application/json',...(user?{'oai-authenticated-user-id':user}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);
 const snapshot=buildLearningSnapshot(freshState());
 assert.equal((await send('POST',null,snapshot)).status,401);assert.equal((await send('POST','owner-a',snapshot,'https://evil.test')).status,403);assert.equal(data.size,0);
 assert.equal((await send('POST','owner-a',{...snapshot,apiKey:'must-not-store',chatHistory:'must-not-store'})).status,200);assert.equal(JSON.stringify([...data.values()]).includes('must-not-store'),false);
 const status=user=>worker.fetch(new Request('https://study.example.test/api/connections/status',{headers:{'oai-authenticated-user-id':user}}),env).then(r=>r.json());
 assert.equal((await status('owner-a')).sharedDate,snapshot.date);assert.equal((await status('owner-b')).sharedDate,null);
 assert.equal((await send('DELETE','owner-b')).status,200);assert.equal(data.size,1);await send('DELETE','owner-a');assert.equal(data.size,0);
});

test('hosted vision requires identity, same-origin and photo consent; only cost counters persist',async t=>{
 const previous=globalThis.fetch;let calls=0;globalThis.fetch=async(url,init)=>{calls++;assert.equal(url,'https://vision.example.test/v1/chat/completions');assert.equal(init.headers.Authorization,'Bearer server-test-secret');return Response.json({choices:[{message:{content:JSON.stringify({scene:'test',items:[]})}}]});};t.after(()=>{globalThis.fetch=previous;});
 const data=new Map(),env={VISION_BASE_URL:'https://vision.example.test/v1',VISION_MODEL:'vision-test',VISION_API_KEY:'server-test-secret',BUCKET:{get:async k=>data.has(k)?{text:async()=>data.get(k)}:null,put:async(k,v)=>data.set(k,v)}};
 const input={image:'data:image/jpeg;base64,/9j/2Q==',width:600,height:800,consent:true};
 const send=(user,body,origin='https://study.example.test')=>worker.fetch(new Request('https://study.example.test/api/vision/scan',{method:'POST',headers:{Origin:origin,'X-Yan-Client':'1','Content-Type':'application/json',...(user?{'oai-authenticated-user-id':user}:{})},body:JSON.stringify(body)}),env);
 assert.equal((await send(null,input)).status,401);assert.equal((await send('a',input,'https://evil.test')).status,403);assert.equal((await send('a',{...input,consent:false})).status,502);assert.equal(calls,0);
 const status=await worker.fetch(new Request('https://study.example.test/api/vision/status',{headers:{'oai-authenticated-user-id':'a'}}),env);assert.equal((await status.text()).includes('server-test-secret'),false);
 const response=await send('a',input);assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(calls,1);assert.equal(JSON.stringify([...data.values()]).includes('/9j/'),false);
 assert.equal((await send('a',input)).status,429);assert.equal((await send('b',input)).status,200);assert.equal(calls,2);
 const unconfigured=await worker.fetch(new Request('https://study.example.test/api/vision/status',{headers:{'oai-authenticated-user-id':'a'}}),{});assert.equal((await unconfigured.json()).configured,false);
});
