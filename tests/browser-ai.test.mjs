import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserAI,validateBrowserConfig,API_STORAGE_KEY} from '../dist/browser-ai.js';
import {createExtras} from '../dist/extras.js';
import {freshState,exportEnvelope} from '../dist/core.js';

const sample={baseUrl:'https://api.example.test/v1',model:'my-model',apiKey:'test-only-not-a-real-key'};
const input={task:'companion',text:'I feel tired.',history:[],allowRemote:true};
function fixture(fetcher){const data=new Map();return {data,ai:createBrowserAI({storage:()=>({getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}),fetcher})};}

test('browser config rejects unsafe destinations and only retains keys for the same normalized endpoint',()=>{
 const previous=validateBrowserConfig(sample);
 assert.equal(validateBrowserConfig({...sample,baseUrl:sample.baseUrl+'/chat/completions/'}).baseUrl,sample.baseUrl);
 assert.equal(validateBrowserConfig({...sample,apiKey:''},previous).apiKey,sample.apiKey);
 for(const baseUrl of ['http://api.example.test/v1','https://u:p@api.example.test/v1','https://api.example.test/v1?key=secret','https://api.example.test/#key','https://127.0.0.1/v1','https://localhost/v1','https://192.168.1.2/v1','https://[::1]/v1','https://home.local/v1'])assert.throws(()=>validateBrowserConfig({...sample,baseUrl}));
 assert.throws(()=>validateBrowserConfig({...sample,baseUrl:'https://other.example.test/v1',apiKey:''},previous),/密钥/);
 assert.throws(()=>validateBrowserConfig({...sample,baseUrl:'https://api.example.test/other',apiKey:''},previous),/密钥/);
 assert.throws(()=>validateBrowserConfig({...sample,model:'bad\nmodel'}));
});

test('saving never calls a provider, defaults to memory, and opt-in secrets stay separate from learning backups',()=>{
 let calls=0;const {ai,data}=fixture(()=>{calls++;});
 ai.save(sample);assert.equal(calls,0);assert.equal(data.size,0);assert.equal(ai.status().status,'unverified');
 assert.equal(JSON.stringify(ai.status()).includes(sample.apiKey),false);
 ai.save({...sample,remember:true});assert.equal(JSON.parse(data.get(API_STORAGE_KEY)).apiKey,sample.apiKey);
 assert.equal(JSON.stringify(exportEnvelope(freshState())).includes(sample.apiKey),false);
 const restored=createBrowserAI({storage:()=>({getItem:k=>data.get(k)}),fetcher:()=>{calls++;}});assert.equal(restored.status().keyConfigured,true);assert.equal(calls,0);
 ai.save({...sample,remember:false});assert.equal(data.size,0);
 ai.forget();assert.equal(ai.status().keyConfigured,false);
});

test('requests require per-send permission and validated context; direct calls include only bounded task text and selected endpoint',async()=>{
 const calls=[];const {ai}=fixture(async(url,options)=>{calls.push({url,options});return Response.json({choices:[{message:{content:'Take one small step.'}}]});});
 ai.save(sample);
 await assert.rejects(ai.request({...input,allowRemote:false}),/允许/);assert.equal(calls.length,0);
 await assert.rejects(ai.request({...input,history:[{role:'system',content:'bad'}]}));assert.equal(calls.length,0);
 const result=await ai.request(input);assert.equal(result.answer,'Take one small step.');assert.equal(calls.length,1);
 const {url,options}=calls[0];assert.equal(url,sample.baseUrl+'/chat/completions');assert.equal(options.headers.Authorization,'Bearer '+sample.apiKey);
 for(const [k,v] of Object.entries({credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',mode:'cors'}))assert.equal(options[k],v);
 const body=JSON.parse(options.body);assert.deepEqual(Object.keys(body).sort(),['messages','model','stream']);assert.equal(body.messages.at(-1).content,input.text);assert.equal(body.messages.filter(m=>m.role==='system').length,1);
 assert.equal(options.body.includes(sample.apiKey),false);
});

test('provider errors and CORS failures never leak secrets or create substitute replies',async()=>{
 for(const [fetcher,pattern] of [[async()=>Response.json({error:sample.apiKey},{status:401}),/认证/],[async()=>{throw new TypeError(sample.apiKey);},/CORS/],[async()=>Response.json({choices:[]}),/没有返回/],[async()=>new Response('not json'),/格式/],[async()=>new Response('x'.repeat(1024*1024+1)),/过大/]]){
  const {ai}=fixture(fetcher);ai.save(sample);await assert.rejects(ai.request(input),e=>{assert.match(e.message,pattern);assert.equal(e.message.includes(sample.apiKey),false);return true;});
 }
});

test('cancellation releases the request lock and connection changes are blocked while sending',async()=>{
 let started;const ready=new Promise(r=>started=r),{ai}=fixture(async(url,{signal})=>{started();return new Promise((resolve,reject)=>{if(signal.aborted)reject(new DOMException('aborted','AbortError'));else signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true});});});
 ai.save(sample);const controller=new AbortController(),pending=ai.request(input,controller.signal);await ready;
 assert.throws(()=>ai.save(sample),/结束/);assert.throws(()=>ai.forget(),/结束/);await assert.rejects(ai.request(input),/已有/);
 controller.abort();await assert.rejects(pending,{name:'AbortError'});assert.doesNotThrow(()=>ai.forget());
});

test('public AI page exposes phone configuration without a running local server',()=>{
 const extras=createExtras({esc:v=>String(v??'').replaceAll('<','&lt;'),head:(a,b,c)=>`<h1>${b}</h1><p>${c}</p>`,button:(label,action)=>`<button data-action="${action}">${label}</button>`,icon:()=>'',commit:()=>{},toast:()=>{},go:()=>{},render:()=>{},route:()=> 'ai',download:()=>{}});
 const html=extras.aiPage();assert.match(html,/手机 API 连接/);assert.match(html,/id="ai-browser-config"/);assert.match(html,/id="browser-api-key"[^>]+type="password"/);assert.match(html,/无需电脑开机/);assert.match(html,/id="chat-form"/);assert.match(html,/CORS/);
 assert.equal(html.includes(sample.apiKey),false);
 assert.match(html,/请先在顶部“手机 API 连接”填写设置/);
 assert.equal(html.includes('会发送到 ，'),false);
});
