import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../dist/core.js';
import {WORDS,GRAMMAR} from '../dist/data.js';
const date='2026-10-23';
test('content: 6000 unique words and 80 complete original grammar questions',()=>{
 assert.equal(WORDS.length,6000);assert.equal(new Set(WORDS.map(w=>w.word)).size,6000);assert.equal(GRAMMAR.length,80);
 for(const w of WORDS){for(const key of ['id','word','meaning','topic'])assert.ok(w[key],key);if(w.source==='ecdict'){assert.ok(w.definition);assert.equal(w.example,null);assert.equal(w.translation,null);}else {assert.ok(w.example);assert.ok(w.translation);}}
 for(const q of GRAMMAR){assert.ok(q.options[q.answer]);assert.ok(q.explanation);assert.ok(q.translation);}
});
test('daily allocation is stable and missed words remain available',()=>{
 const s=C.freshState(date);const first=C.ensureDay(s,date);assert.equal(first.newIds.length,20);const saved=structuredClone(first);
 C.recordSpelling(s,'w001','study',date);C.rateWord(s,'w001','good','new',date);
 assert.deepEqual(C.ensureDay(s,date).newIds,saved.newIds);
 const next=C.ensureDay(s,C.addDays(date,1));assert.equal(next.newIds.length,20);assert.equal(next.newIds[0],'w002');assert.ok(next.reviewIds.includes('w001'));
});
test('intervals advance on remembered, and reset on fuzzy/forgotten',()=>{
 let card;for(const interval of [1,3,7,14,30,60,60]){card=C.schedule(card,'good',date);assert.equal(card.due,C.addDays(date,interval));}
 assert.equal(C.schedule(card,'fuzzy',date).due,'2026-10-24');assert.equal(C.schedule(card,'again',date).stage,0);
 assert.throws(()=>C.schedule(card,'bogus',date));
 assert.equal(C.addDays('2026-12-31',1),'2027-01-01');assert.equal(C.addDays('2028-02-28',1),'2028-02-29');
});
test('wrong spelling creates deduplicated mistakes and caps remembered interval',()=>{
 const s=C.freshState(date);C.ensureDay(s,date);s.cards.w001=C.schedule(C.schedule(null,'good',date),'good',date);
 assert.equal(C.recordSpelling(s,'w001','stduy',date),false);C.recordSpelling(s,'w001','studdy',date);
 assert.equal(s.mistakes.length,1);assert.equal(s.mistakes[0].count,2);
 C.rateWord(s,'w001','good','review',date,false);assert.equal(s.cards.w001.due,C.addDays(date,1));
 assert.equal(C.recordSpelling(s,'w001',' STUDY ',date),true);assert.equal(s.mistakes.find(m=>m.category==='拼写').resolved,true);
 C.rateWord(s,'w001','good','review',date,true);assert.equal(s.mistakes.find(m=>m.category==='单词').resolved,true);
});
test('grammar records errors, resolves on correct retry, and counts each daily question once',()=>{
 const s=C.freshState(date);assert.equal(C.answerGrammar(s,'g001',1,date),false);assert.equal(s.mistakes.length,1);
 assert.equal(C.answerGrammar(s,'g001',0,date),true);assert.equal(s.mistakes[0].resolved,true);assert.equal(s.days[date].grammarDone.length,1);
 assert.equal(C.grammarQueue(s,date).length,4);assert.equal(C.dailyStats(s,date).grammar,1);
});
test('streak handles today, yesterday, gaps and backdated practice',()=>{
 const s=C.freshState(date);C.ensureDay(s,date);assert.equal(C.streak(s,date),0);
 C.ensureDay(s,'2026-10-21').activities=1;C.ensureDay(s,'2026-10-22').activities=1;assert.equal(C.streak(s,date),2);
 s.days[date].activities=1;assert.equal(C.streak(s,date),3);assert.equal(C.streak(s,'2026-10-25'),0);
});
test('raw scores reject out of range, fractions, future dates, empty titles; zero is valid',()=>{
 const s=C.freshState(date);const valid={date,skill:'听力',title:'官方练习',correct:0,total:40,minutes:20,feedback:'',nextAction:''};
 C.addRecord(s,valid,date);assert.equal(s.records[0].correct,0);assert.equal(C.dailyStats(s,date).records,1);
 for(const change of [{correct:41},{correct:-1},{correct:1.2},{total:0},{total:41},{minutes:0},{minutes:1.5},{date:'2026-10-24'},{title:' '}])assert.throws(()=>C.addRecord(s,{...valid,...change},date));
 assert.throws(()=>C.addRecord(s,{...valid,skill:'写作',feedback:''},date));
});
test('all daily tasks complete automatically, no fake starting progress',()=>{
 const s=C.freshState(date),day=C.ensureDay(s,date);assert.equal(C.dailyStats(s,date).percent,0);
 for(const id of day.newIds)C.rateWord(s,id,'good','new',date);
 for(const id of C.grammarQueue(s,date))C.answerGrammar(s,id,GRAMMAR.find(q=>q.id===id).answer,date);
 C.addRecord(s,{date,skill:'口语',title:'家乡',feedback:'有时忘记时态',minutes:10},date);
 assert.equal(C.dailyStats(s,date).percent,100);assert.equal(C.dailyStats(s,date).completed,3);
});
test('backup roundtrip preserves all learning data and rejects corrupted/malicious structures',()=>{
 const s=C.freshState(date);C.recordSpelling(s,'w001','stuy',date);C.rateWord(s,'w001','fuzzy','new',date);C.answerGrammar(s,'g001',1,date);
 C.addRecord(s,{date,skill:'阅读',title:'<script>alert(1)</script>',correct:19,total:40,minutes:60},date);
 const backup=JSON.stringify(C.exportEnvelope(s));assert.deepEqual(C.parseBackup(backup),s);
 assert.throws(()=>C.parseBackup('{'));assert.throws(()=>C.parseBackup(JSON.stringify({app:'other',schemaVersion:1,data:s})));
 for(const mutate of [x=>x.cards.bad={...x.cards.w001},x=>x.days[date].newIds=['w99999'],x=>x.cards.w001.due='2026-02-30',x=>x.records[0].correct=99,x=>x.mistakes[0].resolved='yes',x=>x.settings.targetBand=9]){const broken=structuredClone(s);mutate(broken);assert.throws(()=>C.validateState(broken));}
 const poison=JSON.parse(JSON.stringify(s));Object.defineProperty(poison.cards,'__proto__',{value:{polluted:true},enumerable:true});assert.throws(()=>C.validateState(poison));assert.equal({}.polluted,undefined);
});
test('bank exhaustion does not invent new words',()=>{const s=C.freshState(date);for(const w of WORDS)s.cards[w.id]=C.schedule(null,'good',date);assert.equal(C.ensureDay(s,C.addDays(date,1)).newIds.length,0);assert.equal(C.dueIds(s,C.addDays(date,1)).length,WORDS.length);});
