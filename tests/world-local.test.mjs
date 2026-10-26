import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LOCAL_OBJECTS,localObjectCards} from '../dist/world-local-data.js';
import {createLocalWorld} from '../dist/world-local.js';
import {createWorld} from '../dist/world.js';
import * as C from '../dist/core.js';
import {buildLearningSnapshot} from '../dist/connections.js';
import {validateSharedSnapshot} from '../lib/learning-mcp.mjs';
test('local detector filters unsupported, low-confidence and personal detections; cards are fixed templates and normalized anchors',()=>{
 assert.equal(Object.keys(LOCAL_OBJECTS).length,79);assert.equal(LOCAL_OBJECTS.person,undefined);
 const raw=[{class:'cup',score:.8,bbox:[20,40,60,80]},{class:'cup',score:.9,bbox:[100,100,100,100]},{class:'person',score:.99,bbox:[0,0,20,30]},{class:'book',score:.3,bbox:[0,0,20,30]},{class:'made-up-object',score:1,bbox:[0,0,20,30]}];
 const r=localObjectCards(raw,400,400);assert.equal(r.items.length,1);assert.equal(r.items[0].word,'cup');assert.equal(r.items[0].origin,'local');assert.deepEqual(r.items[0].point,[.375,.375]);assert.match(r.items[0].example,/cup/);assert.equal(localObjectCards([],400,400).items.length,0);
 for(const name of Object.keys(LOCAL_OBJECTS)){const r=localObjectCards([{class:name,score:.8,bbox:[0,0,100,100]}],200,200);const s=C.freshState();C.collectWorld(s,r.items[0],r.scene,C.today());assert.equal(C.validateState(s).world.collection[0].origin,'local');assert.equal(validateSharedSnapshot(buildLearningSnapshot(s)).world[0].origin,'local');}
});
test('every bundled local resource matches its pinned hash and quantized tensors have exact storage sizes',async()=>{
 const source=JSON.parse(await readFile(new URL('../dist/vendor/world/source.json',import.meta.url),'utf8'));
 let size=0;for(const item of source.files){const b=await readFile(new URL('../dist/'+item.file,import.meta.url));assert.equal(b.length,item.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),item.sha256);size+=b.length;}
 assert.ok(size<7*1024*1024);const model=JSON.parse(await readFile(new URL('../dist/models/world/model.json',import.meta.url),'utf8'));let expected=0,actual=0;
 for(const g of model.weightsManifest){for(const w of g.weights){const count=w.shape.reduce((a,b)=>a*b,1);if(w.dtype==='float32'){assert.equal(w.quantization.dtype,'uint8');assert.ok(Number.isFinite(w.quantization.min)&&w.quantization.scale>0);expected+=count;}else {assert.equal(w.dtype,'int32');expected+=count*4;}}for(const p of g.paths){assert.match(p,/^quantized-\d\.bin$/);actual+=(await readFile(new URL('../dist/models/world/'+p,import.meta.url))).length;}}
 assert.equal(expected,actual);assert.equal(source.license,'Apache-2.0');
});
function envWithWorker(reply){return {atob,document:{querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(16)})}),toDataURL:()=> 'data:image/jpeg;base64,/9j/2Q=='})},createImageBitmap:async()=>({width:2,height:2,close(){}}),Worker:class{postMessage(m,transfer){queueMicrotask(()=>this.onmessage({data:m.type==='load'?{id:m.id,ready:true}:{id:m.id,...reply(m,transfer)}}));}terminate(){}}};}
test('local mode scans without HTTP or remote consent; collection retains provenance through the original backup and review path',async()=>{
 let posts=0;const env=envWithWorker((m,transfer)=>{posts++;assert.equal(m.pixels.byteLength,16);assert.equal(transfer.length,1);return{predictions:[{class:'cup',score:.9,bbox:[0,0,2,2]}],width:2,height:2};}),s=C.freshState();
 const w=createWorld({esc:String,button:(l,a,extra='')=>`<button data-action="${a}" ${extra}>${l}</button>`,icon:()=>'',getState:()=>s,commit:fn=>fn(s),render:()=>{},route:()=> 'world',toast:()=>{},openWord:()=>{},env,service:false,fetcher:()=>{throw Error('local mode must not use HTTP');}});
 w.mount();assert.match(w.page(),/本地免费识别/);assert.doesNotMatch(w.page(),/允许将这张压缩照片发送/);await w.upload({size:20,type:'image/jpeg'});await w.scan();assert.equal(posts,1);assert.match(w.page(),/学习 cup/);w.act('world-label',{dataset:{index:'0'}});assert.match(w.page(),/内置模板例句/);w.act('world-collect',{});assert.equal(s.world.collection[0].origin,'local');assert.ok(C.dueIds(s).length);assert.equal(C.parseBackup(JSON.stringify(C.exportEnvelope(s))).world.collection[0].origin,'local');w.leave();
});
test('failure of the local worker stays local and never silently switches to a remote service',async()=>{
 const env=envWithWorker(()=>({error:'本地识别失败'}));const detector=createLocalWorld({env});await detector.prepare();await assert.rejects(detector.detect({image:'data:image/jpeg;base64,/9j/2Q=='}),/本地识别失败/);detector.dispose();
});
