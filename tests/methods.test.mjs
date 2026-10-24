import {test}from'node:test';import assert from'node:assert/strict';
import * as C from'../dist/core.js';import * as M from'../dist/methods-core.js';import{earRef}from'../dist/methods-data.js';
import {createMethods}from'../dist/methods.js';
const date='2026-10-24';
const roundtrip=s=>assert.deepEqual(C.parseBackup(JSON.stringify(C.exportEnvelope(s))),s);
test('old backups gain empty method records without inventing practice or scores',()=>{const old=C.freshState(date);delete old.methods;const s=C.validateState(old);assert.deepEqual(s.methods,{listening:{},output:{},reasons:{},days:{}});assert.equal(C.dailyStats(s,date).percent,0);});
test('all three listening voices have monotonic valid sentence windows matching original text',()=>{
 let count=0;for(const [id,x]of Object.entries(M.LISTENING_TIMING)){assert.ok(/^l0[1-4]$/.test(id));count+=x.sentences.length;for(const v of ['M2','M4','M5']){assert.equal(x.voices[v].length,x.sentences.length);let last=0;for(const[start,end]of x.voices[v]){assert.ok(start>=last);assert.ok(end>start);last=end;}}}
 assert.equal(count,30);assert.deepEqual(earRef('ear:l01:0'),{lesson:'l01',index:0});assert.equal(earRef('ear:l01:999'),null);
});
test('intensive listening requires real play, a gist, and every self-confirmed sentence before completion',()=>{
 const s=C.freshState(date),r=M.listening(s,'l01',date);assert.throws(()=>M.advanceListening(s,'l01','a gist',date),/先播放/);M.heard(s,'l01',date);assert.throws(()=>M.advanceListening(s,'l01',' ',date));M.advanceListening(s,'l01','办理借书证',date);assert.equal(r.stage,1);M.advanceListening(s,'l01',null,date);assert.equal(r.stage,2);assert.throws(()=>M.advanceListening(s,'l01',null,date));
 const mistake=M.unclear(s,'l01',1,true,date);assert.equal(mistake.refId,'ear:l01:1');M.unclear(s,'l01',1,true,date);assert.equal(s.mistakes.length,1);assert.equal(r.unclear.length,1);
 for(let i=0;i<M.LISTENING_TIMING.l01.sentences.length;i++)M.shadow(s,'l01',i,date);M.advanceListening(s,'l01',null,date);assert.deepEqual(s.methods.days[date].listening,['l01']);assert.equal(s.mistakes[0].resolved,false,'completion must not resolve an unclear sentence');M.unclear(s,'l01',1,false,date);assert.equal(s.mistakes[0].resolved,true);roundtrip(s);
});
test('faded output accepts contractions, withholds automatic wrong labels and keeps self-check separate',()=>{
 const s=C.freshState(date),r=M.output(s,'o01',date);assert.throws(()=>M.checkOutput(s,'o01','x',date));r.stage=1;assert.equal(M.fillOutput(s,'o01',"doesn't like",date),true);assert.equal(r.stage,2);assert.equal(M.checkOutput(s,'o01','She dislikes coffee.',date),false);assert.equal(s.mistakes.length,0);assert.equal(s.methods.days[date],undefined);
 M.confirmOutput(s,'o01',false,date);assert.equal(r.selfChecked,true);assert.equal(r.matched,0);assert.deepEqual(s.methods.days[date].output,['o01']);roundtrip(s);
 r.stage=2;assert.equal(M.checkOutput(s,'o01',"she doesn’t like coffee!",date),true);assert.equal(r.selfChecked,false);assert.equal(r.matched,1);assert.equal(s.methods.days[date].output.length,1);roundtrip(s);
});
test('confirmed output errors support reason scheduling and resolve only after the original sentence is matched',()=>{
 const s=C.freshState(date),r=M.output(s,'o07',date);r.stage=1;M.fillOutput(s,'o07','did not go',date);M.checkOutput(s,'o07',"He didn't went to school yesterday.",date);const m=M.confirmOutput(s,'o07',true,date);M.setReason(s,m.id,'negative',date);assert.equal(m.refId,'out:o07');assert.equal(s.methods.reasons[m.id].next,'2026-10-25');assert.deepEqual(M.reasonQueue(s,date),[]);assert.equal(M.reasonQueue(s,'2026-10-25')[0].id,m.id);assert.match(M.suggestedOutput(s,'2026-10-25')[0].topic,/否定/);roundtrip(s);
 M.checkOutput(s,'o07',"He didn't go to school yesterday.",'2026-10-25');assert.equal(m.resolved,true);assert.equal(M.reasonQueue(s,'2026-10-25').length,0);assert.equal(C.dailyStats(s,'2026-10-25').grammar,0);roundtrip(s);
});
test('every original output can complete the fill and full phases without changing normal task counts',()=>{const s=C.freshState(date);for(const q of M.OUTPUTS){const r=M.output(s,q.id,date);r.stage=1;assert.equal(M.fillOutput(s,q.id,q.gap,date),true);assert.equal(M.checkOutput(s,q.id,q.english,date),true);}assert.equal(s.methods.days[date].output.length,12);assert.equal(C.dailyStats(s,date).vocab,0);assert.equal(C.dailyStats(s,date).grammar,0);roundtrip(s);});
test('method backup rejects unknown identities, duplicate shadows, invalid counters, reasons and orphan mistake keys',()=>{
 const s=C.freshState(date),r=M.listening(s,'l01',date);r.shadowed=[0,0];assert.throws(()=>C.validateState(s));r.shadowed=[];s.methods.reasons.unknown={reason:'sound',last:date,next:'2026-10-25'};assert.throws(()=>C.validateState(s));delete s.methods.reasons.unknown;s.methods.output.o99={};assert.throws(()=>C.validateState(s));delete s.methods.output.o99;M.output(s,'o01',date).matched=1;assert.throws(()=>C.validateState(s));
 const x=C.freshState(date);C.mistake(x,{category:'听力',refId:'ear:l01:999',prompt:'x',answer:'y'},date);assert.throws(()=>C.validateState(x));x.mistakes[0].refId='out:o99';x.mistakes[0].category='语法';assert.throws(()=>C.validateState(x));
});
test('reason form avoids HTML named-property collisions and submits the selected mistake identity',()=>{
 const previous=globalThis.document,previousCancel=globalThis.cancelAnimationFrame;globalThis.cancelAnimationFrame=()=>{};globalThis.document={addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];}};const s=C.freshState(),m=C.mistake(s,{category:'拼写',refId:'w001',prompt:'学习',answer:'study'});let feedback='';
 try{const view=createMethods({esc:String,head:()=>'',button:()=>'',getState:()=>s,commit:fn=>fn(s),render(){},go(){},toast:x=>feedback=x,stopAudio(){},retryMistake(){},openWords(){},openDictation(){}});view.openReason(m.id);const html=view.view();assert.match(html,/name="mistakeId"/);assert.doesNotMatch(html,/name="id"/);assert.equal(view.submit({id:'method-reason-form'},{mistakeId:m.id,reason:'spelling'}),true);assert.equal(s.methods.reasons[m.id].reason,'spelling');assert.match(feedback,/明天/);roundtrip(s);}finally{globalThis.document=previous;globalThis.cancelAnimationFrame=previousCancel;}
});
