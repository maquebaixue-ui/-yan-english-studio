import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../dist/core.js';
import {WORDS} from '../dist/data.js';
import {worldId,parseWorldResult,validateWorldImage,layoutWorldLabels} from '../dist/world-core.js';
import {createWorld,cameraHelp} from '../dist/world.js';
import {requestVision,visionConfig,visionStatus,createVisionLimiter} from '../lib/vision.mjs';
import {buildLearningSnapshot} from '../dist/connections.js';
import {validateSharedSnapshot,createLearningMcp} from '../lib/learning-mcp.mjs';
import {answerRecall,startTracking} from '../dist/recall-core.js';
import {answerDictation,answerUse} from '../dist/learning-core.js';
const card={word:'ceramic mug',ipa:'/səˈræmɪk mʌɡ/',meaning:'陶瓷杯',example:'A ceramic mug is on the table.',translation:'桌上有一个陶瓷杯。',expression:'I usually start my morning with a cup of tea.',expressionTranslation:'我通常喝杯茶开始早晨。',point:[.3,.5]};
const input={image:'data:image/jpeg;base64,/9j/2Q==',width:640,height:800,consent:true};
const result={scene:'书桌一角',items:[card]};
test('untrusted vision output has bounded clean cards, estimated coordinates, no executable fields, and empty results stay empty',()=>{
 assert.deepEqual(parseWorldResult('```json\n'+JSON.stringify(result)+'\n```'),result);
 assert.deepEqual(parseWorldResult({items:[],scene:''}).items,[]);
 assert.equal(parseWorldResult({items:[{...card,apiKey:'never',image:'never'}]}).items[0].apiKey,undefined);
 for(const raw of [{items:[{...card,point:[12,1]}]}, {items:Array(6).fill(card)},{items:[{...card,word:'<script>'}]},{items:[{...card,meaning:''}]},'not json'])assert.throws(()=>parseWorldResult(raw));
 assert.throws(()=>validateWorldImage({...input,consent:false}));assert.throws(()=>validateWorldImage({...input,image:'https://evil.test/photo'}));assert.throws(()=>validateWorldImage({...input,width:5000}));
 assert.equal(validateWorldImage(input).image,input.image);assert.equal(worldId(' Ceramic  Mug '),'world:ceramic%20mug');
 const labels=layoutWorldLabels(Array.from({length:5},()=>card),300,420);assert.equal(labels.length,5);assert.ok(labels.every(p=>p.x>0&&p.x<1&&p.y>0&&p.y<1));assert.equal(new Set(labels.map(p=>p.y)).size,5);
});
test('discovery collection deduplicates existing and new words, does not forge completion, and enters the original review/spelling/recall pipeline',()=>{
 const s=C.freshState('2026-10-26');C.ensureDay(s,'2026-10-26');const plan=[...s.days['2026-10-26'].newIds],r=C.collectWorld(s,card,'书桌','2026-10-26');
 assert.equal(r.id,worldId(card.word));assert.equal(C.wordsFor(s).length,WORDS.length+1);assert.equal(C.collectWorld(s,card,'书桌','2026-10-26').added,false);assert.equal(s.world.collection.length,1);
 assert.equal(s.cards[r.id].reps,0);assert.equal(s.days['2026-10-26'].activities,0);assert.deepEqual(s.days['2026-10-26'].newIds,plan);assert.ok(C.dueIds(s,'2026-10-26').includes(r.id));
 assert.equal(C.recordSpelling(s,r.id,'ceramic mug','2026-10-26'),true);C.rateWord(s,r.id,'good','review','2026-10-26');assert.equal(s.cards[r.id].due,'2026-10-27');
 startTracking(s,'2026-10-26');assert.equal(answerRecall(s,r.id,'ceramic mug','2026-10-27').match,true);
 assert.equal(answerDictation(s,r.id,0,[card.meaning],'ceramic mug','2026-10-27').spelled,true);assert.equal(answerUse(s,r.id,'ceramic mug','2026-10-27'),true);
 const builtin=WORDS[0];C.collectWorld(s,{...card,word:builtin.word},'身边','2026-10-26');assert.equal(s.world.words.length,1);assert.equal(s.world.collection[0].id,builtin.id);
 const clean=C.parseBackup(JSON.stringify(C.exportEnvelope(s)));assert.deepEqual(clean.world,s.world);assert.deepEqual(clean.cards,s.cards);assert.equal(clean.recall.words[r.id].attempts,1);
 const old=C.freshState('2026-10-26');delete old.world;assert.deepEqual(C.validateState(old).world,{words:[],collection:[]});
 const bad=structuredClone(s);bad.world.words[0].meaning='silently substituted';assert.throws(()=>C.validateState(bad));
 const orphan=structuredClone(s);orphan.world.collection=[];orphan.world.words=[];assert.throws(()=>C.validateState(orphan));
});
test('vision adapters send exactly one bounded image to a server-configured destination, never a browser key, and never fabricate provider failures',async()=>{
 const config={provider:'compatible',model:'vision-model',baseUrl:'https://vision.example.test/v1',apiKey:'test-server-secret'};let calls=0;
 const out=await requestVision(config,input,{fetcher:async(url,init)=>{calls++;assert.equal(url,config.baseUrl+'/chat/completions');assert.equal(init.redirect,'error');assert.equal(init.headers.Authorization,'Bearer test-server-secret');const body=JSON.parse(init.body);assert.equal(body.messages[1].content[1].image_url.url,input.image);assert.equal(body.stream,false);assert.equal(JSON.stringify(body).includes('test-server-secret'),false);return Response.json({choices:[{message:{content:JSON.stringify(result)}}]});}});
 assert.equal(out.items[0].word,card.word);assert.equal(calls,1);assert.equal(JSON.stringify(out).includes('secret'),false);
 assert.equal(JSON.stringify(visionStatus(config)).includes('secret'),false);assert.equal(visionConfig({VISION_MODEL:'v',VISION_BASE_URL:'http://127.0.0.1',VISION_API_KEY:'secret'}),null);
 await assert.rejects(requestVision(config,{...input,consent:false},{fetcher:()=>{throw Error('should not call');}}));
 await assert.rejects(requestVision(config,input,{fetcher:async()=>Response.json({error:'test-server-secret'},{status:422})}),e=>e.message.includes('图像输入')&&!e.message.includes('secret'));
 await assert.rejects(requestVision(config,input,{fetcher:async()=>Response.json({choices:[{message:{content:'not JSON'}}]})}),/模型没有返回/);
 await requestVision({provider:'ollama',model:'local-vision'},input,{fetcher:async(url,init)=>{const body=JSON.parse(init.body);assert.equal(url,'http://127.0.0.1:11434/api/chat');assert.equal(body.messages[1].images.length,1);assert.equal(init.headers.Authorization,undefined);return Response.json({message:{content:JSON.stringify(result)}});}});
});
test('explicit sharing includes discovery text only; MCP remains read-only, identity-isolated, and old snapshots compatible',async()=>{
 const s=C.freshState();C.collectWorld(s,card,'桌边',C.today());const snapshot=buildLearningSnapshot(s);assert.equal(snapshot.world.length,1);const clean=validateSharedSnapshot({...snapshot,image:input.image,apiKey:'secret'});assert.equal(JSON.stringify(clean).includes('/9j/'),false);assert.equal(JSON.stringify(clean).includes('secret'),false);
 const rpc=createLearningMcp({words:WORDS,materials:[],readSnapshot:async user=>user==='a'?snapshot:null}),call=user=>rpc({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_shared_world_vocabulary',arguments:{}}},user);
 assert.equal((await call()).result.isError,true);assert.equal(JSON.parse((await call('b')).result.content[0].text).shared,false);assert.equal(JSON.parse((await call('a')).result.content[0].text).items[0].word,card.word);
 const old={...snapshot};delete old.world;assert.doesNotThrow(()=>validateSharedSnapshot(old));
});
test('scan limiter enforces cooldown and daily allowance without limiting other users',()=>{let time=Date.parse('2026-10-26T01:00:00Z');const acquire=createVisionLimiter({now:()=>time,daily:2});acquire('a');assert.throws(()=>acquire('a'),/10 秒/);acquire('b');time+=10001;acquire('a');time+=10001;assert.throws(()=>acquire('a'),/30 次/);time+=86400000;assert.doesNotThrow(()=>acquire('a'));});
test('camera permission errors are useful; a late permission resolution after navigation releases every track',async()=>{
 assert.match(cameraHelp({name:'NotAllowedError'}),/权限/);assert.match(cameraHelp(null,false),/HTTPS/);
 let resolve,stops=0,active='world';const env={isSecureContext:true,navigator:{mediaDevices:{getUserMedia:()=>new Promise(r=>resolve=r)}},document:{querySelector:()=>null,querySelectorAll:()=>[]}};
 const w=createWorld({esc:String,button:()=>'',icon:()=>'',getState:()=>C.freshState(),commit:()=>{},render:()=>{},route:()=>active,toast:()=>{},openWord:()=>{},env,service:false});
 const pending=w.startCamera();active='today';w.leave();resolve({getTracks:()=>[{stop:()=>stops++}]});await pending;assert.equal(stops,1);assert.doesNotMatch(w.page(),/id="world-camera"/);
});

test('client requires consent, ignores cancelled late recognition and never transmits browser keys',async()=>{
 let calls=0,finish;const s=C.freshState(),env={document:{querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=>input.image})},createImageBitmap:async()=>({width:800,height:1200,close(){}})};
 const w=createWorld({esc:String,button:(label,a,extra='')=>`<button data-action="${a}" ${extra}>${label}</button>`,icon:()=>'',getState:()=>s,commit:fn=>fn(s),render:()=>{},route:()=> 'world',toast:()=>{},openWord:()=>{},env,service:true,fetcher:async(url,init)=>{if(url.endsWith('status'))return Response.json({configured:true,model:'test',destination:'test'});calls++;assert.equal(JSON.parse(init.body).consent,true);assert.equal(init.headers.Authorization,undefined);return new Promise(r=>finish=()=>r(Response.json(result)));}});
 w.mount();await new Promise(r=>setImmediate(r));await w.upload({size:100,type:'image/jpeg'});assert.equal(calls,0);await w.scan();assert.equal(calls,0);assert.match(w.page(),/本次发送许可/);
 w.input({type:'input',target:{id:'world-consent',checked:true}});const pending=w.scan();assert.equal(calls,1);w.act('world-cancel',{});finish();await pending;assert.doesNotMatch(w.page(),/data-action="world-label"/);assert.equal(s.world.collection.length,0);w.leave();assert.doesNotMatch(w.page(),/本次待识别照片/);
});
