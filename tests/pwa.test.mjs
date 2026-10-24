import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import {panel,getPwaState} from '../dist/pwa.js';

const root=new URL('../dist/',import.meta.url);
const source=await readFile(new URL('sw.js',root),'utf8');
const base='https://example.test/-yan-english-studio/';

function worker({offline=false,failedPath=''}={}) {
 const stores=new Map(),listeners={},requests=[];
 let skips=0,claims=0,isOffline=offline;
 const caches={
  async open(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return {async put(url,response){store.set(typeof url==='string'?url:url.url,response);},async match(url){return store.get(typeof url==='string'?url:url.url)?.clone();}};},
  async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);}
 };
 const self={registration:{scope:base},clients:{async claim(){claims++;}},async skipWaiting(){skips++;},addEventListener(name,handler){listeners[name]=handler;}};
 const context=vm.createContext({self,caches,URL,Request,Response,Set,Promise,fetch:async request=>{const url=typeof request==='string'?request:request.url;requests.push(url);if(isOffline)throw new Error('offline');return new Response('asset:'+new URL(url).pathname,{status:url.endsWith(failedPath)&&failedPath?404:200});}});
 vm.runInContext(source,context);
 async function dispatch(type,extra={}){let waiting=Promise.resolve();listeners[type]({...extra,waitUntil(promise){waiting=promise;}});await waiting;}
 function request(url,{method='GET',mode='cors',range=false,cache='default'}={}){let response;listeners.fetch({request:{url,method,mode,cache,headers:new Headers(range?{range:'bytes=0-10'}:{})},respondWith(promise){response=promise;}});return response;}
 return {stores,requests,dispatch,request,setOffline(value){isOffline=value;},get skips(){return skips;},get claims(){return claims;},files:vm.runInContext('SHELL_FILES',context),name:vm.runInContext('CACHE',context),prefix:vm.runInContext('PREFIX',context)};
}

test('installable manifest and PNG icons work under the repository subpath',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
 assert.equal(new URL(manifest.scope,base).href,base);
 assert.equal(new URL(manifest.start_url,base).pathname,'/-yan-english-studio/');
 assert.equal(new URL(manifest.id,base).href,base);
 assert.equal(manifest.display,'standalone');
 assert.deepEqual(manifest.icons.map(i=>i.sizes),['192x192','512x512','512x512']);
 assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));
 for(const icon of [...manifest.icons,{src:'./icons/apple-touch-icon.png',sizes:'180x180'}]){
  const data=await readFile(new URL(icon.src,root));
  assert.equal(data.subarray(1,4).toString(),'PNG');
  const [width,height]=icon.sizes.split('x').map(Number);
  assert.equal(data.readUInt32BE(16),width);assert.equal(data.readUInt32BE(20),height);
 }
 const html=await readFile(new URL('index.html',root),'utf8');
 assert.match(html,/rel="manifest" href="\.\/manifest.webmanifest"/);
 assert.match(html,/apple-touch-icon/);assert.match(html,/src="\.\/pwa.js"/);
});

test('offline native listening supports cached audio byte ranges and rejects invalid ranges',async()=>{
 const w=worker();await w.dispatch('install');w.setOffline(true);
 const url=new URL('audio/l01.wav',base).href;
 const result=await w.request(url,{range:true});assert.equal(result.status,206);
 assert.equal(result.headers.get('Content-Type'),'audio/wav');assert.match(result.headers.get('Content-Range'),/^bytes 0-10\//);
 assert.equal((await result.arrayBuffer()).byteLength,11);
 assert.equal(await w.request(base+'app.js',{range:true}),undefined);
 const mp3=await w.request(base+'audio/voices/M4-l01.mp3',{range:true});assert.equal(mp3.status,206);assert.equal(mp3.headers.get('Content-Type'),'audio/mpeg');assert.equal((await mp3.arrayBuffer()).byteLength,11);
});

test('precache covers every public module, CSS and icon and no private or remote data',async()=>{
 const w=worker(),files=new Set(w.files);
 for(const filename of await readdir(root)){
  if(/\.(js|css|svg|webmanifest)$/.test(filename)&&filename!=='sw.js')assert.ok(files.has(filename),filename+' must be available offline');
 }
 for(const filename of files){assert.ok(!filename.startsWith('/'));assert.ok(!/https?:|api\/|materials\/|\.local|__qa|\.pdf|\.mp4/.test(filename));await readFile(new URL(filename,root));}
 await w.dispatch('install');
 assert.equal(w.requests.length,files.size);assert.equal(w.skips,0);
 assert.equal(w.stores.get(w.name).size,files.size);
 for(const url of w.requests)assert.ok(url.startsWith(base));
});

test('installed shell opens offline at both app URLs, with all modules and lessons',async()=>{
 const w=worker();await w.dispatch('install');w.setOffline(true);
 for(const url of [base,base+'index.html']){
  const response=await w.request(url,{mode:'navigate'});
  assert.equal(await response.text(),'asset:/-yan-english-studio/index.html');
 }
 for(const file of w.files){const response=await w.request(base+file);assert.equal(response.status,200);}
 assert.equal(w.requests.length,w.files.length,'cache hits must not use the network');
});

test('fragment-route navigations and normal reload requests use the cached entry document offline',async()=>{
 const w=worker();await w.dispatch('install');w.setOffline(true);
 for(const document of [base,base+'index.html']){
  for(const route of ['today','words','grammar','progress','mistakes','data','library','ai','more','media']){
   for(const cache of ['default','reload','no-cache']){
    const response=await w.request(document+'#'+route,{mode:'navigate',cache});
    assert.ok(response,document+'#'+route+' must be handled');
    assert.equal(await response.text(),'asset:/-yan-english-studio/index.html');
   }
  }
 }
 assert.equal(w.requests.length,w.files.length,'fragment/reload cache hits must not contact the unavailable server');
 for(const url of [base+'?private=1#today',base+'index.html?token=secret#more',base+'api/ai/status#today',base+'materials/test.pdf#today',base+'unknown#today','https://example.test/elsewhere/#today'])assert.equal(w.request(url,{mode:'navigate'}),undefined,url);
});

test('private endpoints, external resources, user media and arbitrary paths bypass the cache',async()=>{
 const w=worker();await w.dispatch('install');
 for(const url of [base+'api/ai/status',base+'api/ai/chat',base+'api/materials/status',base+'materials/test.pdf',base+'.local/ai.json',base+'my-video.mp4',base+'__qa.html',base+'app.js?token=private',base+'unknown', 'https://ielts.org/test.pdf','https://example.test/other-app/index.html','blob:https://example.test/media-id']){
  assert.equal(w.request(url,{mode:'navigate'}),undefined,url);
 }
 assert.equal(w.request(base+'app.js',{method:'POST'}),undefined);
 assert.equal(w.request(base+'app.js',{range:true}),undefined);
 assert.equal(w.stores.get(w.name).size,w.files.length);
});

test('partial install never replaces the old shell and update activation requires a message',async()=>{
 const failed=worker({failedPath:'data.js'}),old=failed.prefix+'previous';failed.stores.set(old,new Map([['old',new Response('old')]]));
 await assert.rejects(failed.dispatch('install'),/Incomplete/);
 assert.equal(failed.stores.has(failed.name),false);assert.equal(failed.stores.has(old),true);assert.equal(failed.skips,0);
 const w=worker();const foreign='yan-studio-shell:https://example.test/other-app/:old';
 w.stores.set(w.prefix+'old',new Map());w.stores.set(foreign,new Map());
 await w.dispatch('install');assert.equal(w.skips,0);
 await w.dispatch('message',{data:{type:'YAN_ACTIVATE_UPDATE'}});assert.equal(w.skips,1);
 await w.dispatch('activate');assert.equal(w.claims,1);assert.equal(w.stores.has(w.prefix+'old'),false);assert.equal(w.stores.has(foreign),true);
});

test('offline readiness is based on all cached assets, not just service worker registration',async()=>{
 const w=worker();let status;
 const extra={data:{type:'YAN_CACHE_STATUS'},ports:[{postMessage(value){status=value;}}]};
 await w.dispatch('message',extra);assert.equal(status.ready,false);
 await w.dispatch('install');await w.dispatch('message',extra);assert.equal(status.ready,true);
 w.stores.get(w.name).delete(base+'data.js');await w.dispatch('message',extra);assert.equal(status.ready,false);
});

test('PWA panel does not pretend installation or offline readiness has completed',()=>{
 assert.equal(getPwaState().offlineReady,false);assert.equal(getPwaState().installedThisSession,false);
 const html=panel();assert.match(html,/安卓/);assert.match(html,/iPhone/);assert.match(html,/需要联网/);assert.match(html,/备份/);
 assert.doesNotMatch(html,/浏览器已报告安装完成|内置内容已准备好，可离线学习/);
});

test('explicit preparation rebuilds evicted public cache without changing worker or activating updates',async()=>{
 const w=worker();await w.dispatch('install');w.stores.delete(w.name);let status;
 await w.dispatch('message',{data:{type:'YAN_PREPARE_OFFLINE'},ports:[{postMessage(value){status=value;}}]});
 assert.equal(status.ready,true);assert.equal(w.stores.get(w.name).size,w.files.length);assert.equal(w.skips,0);
 w.stores.delete(w.name);w.setOffline(true);
 await w.dispatch('message',{data:{type:'YAN_PREPARE_OFFLINE'},ports:[{postMessage(value){status=value;}}]});
 assert.equal(status.ready,false,'failed fetches must not claim offline readiness');
});
