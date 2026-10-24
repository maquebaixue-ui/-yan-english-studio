import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../dist/core.js';
import * as L from '../dist/learning-core.js';
import {WORDS} from '../dist/data.js';
const date='2026-10-24';
test('legacy backups migrate without inventing listening or application results; four dimensions are independent',()=>{
 const old=C.freshState(date);delete old.learning;C.ensureDay(old,date);old.cards.w001=C.schedule(null,'good',date);
 const s=C.validateState(old);assert.deepEqual(s.learning,{words:{},transforms:{},days:{}});
 C.rateWord(s,'w001','good','new',date,false);C.recordSpelling(s,'w001','stduy',date);
 assert.equal(s.learning.words.w001.recognize.lastCorrect,true);assert.equal(s.learning.words.w001.spell.lastCorrect,false);
 assert.equal(s.learning.words.w001.listen,undefined);assert.equal(s.learning.words.w001.use,undefined);
});
test('dictation separates correct meaning from wrong spelling, resolves only its own mistakes, and progress is unique',()=>{
 const s=C.freshState(date),w=WORDS[0],options=[w.meaning,'other'];
 assert.deepEqual(L.answerDictation(s,w.id,0,options,'stduy',date),{heard:true,spelled:false});
 assert.equal(s.learning.words.w001.listen.lastCorrect,true);assert.equal(s.learning.words.w001.spell.lastCorrect,false);
 L.answerDictation(s,w.id,1,options,'study',date);assert.equal(s.mistakes.find(m=>m.category==='听力').refId,'listen:w001');
 L.answerDictation(s,w.id,0,options,'study',date);assert.equal(s.mistakes.find(m=>m.category==='听力').resolved,true);
 assert.equal(s.learning.days[date].dictation.length,1);assert.deepEqual(C.parseBackup(JSON.stringify(C.exportEnvelope(s))),s);
});
test('all 24 transformations accept documented answers and contractions, reject tense errors, and retry through grammar mistakes',()=>{
 const s=C.freshState(date);assert.equal(L.answerTransform(s,'t03',"She didn't went to school yesterday.",date),false);
 assert.equal(s.mistakes[0].refId,'t03');assert.equal(L.answerTransform(s,'t03',"she didn’t go to school yesterday",date),true);assert.equal(s.mistakes[0].resolved,true);
 for(const q of L.TRANSFORMS){assert.equal(L.answerTransform(s,q.id,q.answer,date),true);for(const answer of q.alternatives)assert.equal(L.answerTransform(s,q.id,answer,date),true);}
 assert.equal(s.learning.days[date].transform.length,24);assert.deepEqual(C.validateState(s),s);
});
test('adaptive plan prioritizes real mistakes, freezes for the day, and never completes normal daily tasks',()=>{
 const s=C.freshState(date);C.ensureDay(s,date);L.answerTransform(s,'t18','wrong',date);L.answerTransform(s,'t19','wrong',date);
 const p=L.startPlan(s,date);assert.equal(p.focus,'grammar');assert.ok(p.transform.includes('t18'));assert.ok(p.transform.includes('t19'));
 C.recordSpelling(s,'w003','wrong',date);assert.deepEqual(L.makePlan(s,date),p);
 assert.equal(C.dailyStats(s,date).vocab,0);assert.equal(C.dailyStats(s,date).grammar,0);
 assert.deepEqual(C.validateState(s),s);assert.equal(L.makePlan(s,C.addDays(date,1)).dictation[0],'w003');
});
test('application uses verified original examples and has a separate mistake identity from recognition',()=>{
 const s=C.freshState(date);assert.ok(L.hasCloze(WORDS[0]));assert.ok(L.cloze(WORDS[0]).includes('_____'));
 L.answerUse(s,'w001','wrong',date);assert.equal(s.mistakes[0].refId,'use:w001');C.rateWord(s,'w001','good','new',date);assert.equal(s.mistakes[0].resolved,false);
 assert.equal(L.answerUse(s,'w001','study',date),true);assert.equal(s.mistakes[0].resolved,true);
 const missing=WORDS.find(w=>!w.example);assert.throws(()=>L.answerUse(s,missing.id,'anything',date));assert.deepEqual(C.validateState(s),s);
});
test('learning import rejects unknown identities, injected dimensions, bad counters and duplicate daily completions',()=>{
 const base=C.freshState(date);L.answerUse(base,'w001','study',date);L.startPlan(base,date);
 for(const mutate of [s=>s.learning.words.w001.use.correct=999,s=>s.learning.words.w001.hacked={},s=>s.learning.words.unknown={},s=>s.learning.days[date].use.push('w001'),s=>s.learning.days[date].plan.dictation=['../../private'],s=>s.mistakes.push({category:'语法',refId:'t999'})]){const s=structuredClone(base);mutate(s);assert.throws(()=>C.validateState(s));}
});
