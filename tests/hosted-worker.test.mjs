import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {freshState} from '../dist/core.js';
import {buildLearningSnapshot} from '../dist/connections.js';
const mcp=await readFile(new URL('../lib/learning-mcp.mjs',import.meta.url),'utf8'),source=await readFile(new URL('../hosting/worker.mjs',import.meta.url),'utf8');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(mcp+'\nconst PUBLIC_WORDS=[],PUBLIC_MATERIALS=[],PUBLIC_ASSETS={};\n'+source).toString('base64'))).default;
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
