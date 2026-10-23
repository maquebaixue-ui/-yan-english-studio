import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {WORDS} from '../dist/data.js';
import * as C from '../dist/core.js';

test('expanded vocabulary preserves all 336 legacy word identities and the 20-word daily plan',()=>{
 const digest=createHash('sha256').update(JSON.stringify(WORDS.slice(0,336).map(w=>[w.id,w.word]))).digest('hex');
 assert.equal(digest,'f52683109a24645e2626b4269da85672637f6d0099970d96d4a6a339f2f017ab');
 const s=C.freshState('2026-10-24');C.ensureDay(s,'2026-10-24');
 C.recordSpelling(s,'w001','study','2026-10-24');C.rateWord(s,'w001','good','new','2026-10-24');
 const before=structuredClone(s);
 assert.deepEqual(C.parseBackup(JSON.stringify(C.exportEnvelope(s))),before);
 assert.equal(C.ensureDay(s,'2026-10-25').newIds.length,20);
 assert.equal(C.ensureDay(s,'2026-10-25').newIds[0],'w002');
});

test('new four-digit word IDs survive spelling mistakes, review scheduling and backup roundtrip',()=>{
 const last=WORDS.at(-1),s=C.freshState('2026-10-24');
 assert.equal(last.id,'w6000');
 C.recordSpelling(s,last.id,'wrong','2026-10-24');C.rateWord(s,last.id,'fuzzy','review','2026-10-24');
 const loaded=C.parseBackup(JSON.stringify(C.exportEnvelope(s)));
 assert.equal(loaded.cards[last.id].due,'2026-10-25');
 assert.ok(loaded.mistakes.some(m=>m.refId===last.id&&m.category==='拼写'));
 for(const w of WORDS.slice(336,1036)){
  assert.match(w.meaning,/^(v|n|adj|adv|prep|conj)\./);
  assert.match(w.translation,/[\u4e00-\u9fff]/);
  assert.match(w.example,new RegExp('\\b'+w.word+'(?:s|es)?\\b','i'));
 }
});
