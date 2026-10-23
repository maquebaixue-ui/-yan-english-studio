import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {csvRows,dictionaryCandidates} from '../lib/vocabulary.mjs';
import {WORDS,DICTIONARY_INFO} from '../dist/data.js';
import {findVocabulary,wordDetails,createVocabularyShelf} from '../dist/vocabulary-shelf.js';
import * as C from '../dist/core.js';

test('CSV preserves quoted commas, escaped quotes, Unicode, embedded and escaped newlines',()=>{
 assert.deepEqual([...csvRows('a,b,c\r\n"one,two","say ""hi""","第一行\n第二行"\r\n')],[['a','b','c'],['one,two','say "hi"','第一行\n第二行']]);
 assert.throws(()=>[...csvRows('a,"unclosed')]);
 const header='word,translation,phonetic,definition,exchange,bnc,frq,tag\n';
 const rows='study,v. 学习,s,learn,,2,5,gk\nstudies,v. 学习,s,learn,0:study,3,6,gk\nproper,n. 专名,p,name,,0,0,gk\nApple,n. 苹果,a,fruit,,1,1,gk\nlearn,v. 学会\\nvt. 学习,l,to gain knowledge,,4,7,gk\n';
 assert.deepEqual(dictionaryCandidates(header+rows,['study']).map(w=>w.word),['learn']);
});

test('dictionary extends to 6000 unique stable IDs with attribution and genuinely absent examples',async()=>{
 assert.equal(WORDS.length,6000);assert.equal(new Set(WORDS.map(w=>w.id)).size,6000);
 assert.equal(new Set(WORDS.map(w=>w.word)).size,6000);
 assert.equal(WORDS.filter(w=>w.example&&w.translation).length,1036);
 assert.equal(WORDS.filter(w=>w.source==='ecdict').length,4964);
 assert.equal(WORDS[1036].id,'w1037');assert.equal(WORDS.at(-1).id,'w6000');
 for(const w of WORDS.slice(1036)){assert.match(w.word,/^[a-z]{3,20}$/);assert.match(w.meaning,/[\u4e00-\u9fff]/);assert.ok(w.definition);assert.equal(w.example,null);assert.equal(w.translation,null);assert.ok(!/(?:^|\/)0:/.test(w.forms));}
 assert.match(DICTIONARY_INFO.commit,/^[a-f0-9]{40}$/);assert.match(DICTIONARY_INFO.sha256,/^[a-f0-9]{64}$/);
 assert.equal(DICTIONARY_INFO.licenseText,await readFile(new URL('../third-party/ECDICT-LICENSE.txt',import.meta.url),'utf8'));
});

test('English and Chinese search supports exact-first results and distinguishes vocabulary banks',()=>{
 assert.equal(findVocabulary('the','dictionary')[0].word,'the');
 assert.equal(findVocabulary('STUDY','core')[0].word,'study');
 assert.ok(findVocabulary('建议').some(w=>w.meaning.includes('建议')));
 assert.equal(findVocabulary('', 'core').length,1036);assert.equal(findVocabulary('', 'dictionary').length,4964);
 assert.equal(findVocabulary('<script>attack</script>').length,0);
});

test('preview is read-only, and self-directed practice schedules review without filling the daily new-word task',()=>{
 const s=C.freshState('2026-10-24');const day=C.ensureDay(s,'2026-10-24'),before=structuredClone(s);
 findVocabulary('the');wordDetails(WORDS[1036],String);assert.deepEqual(s,before);
 const w=WORDS.at(-1);C.recordSpelling(s,w.id,'wrong','2026-10-24');C.rateWord(s,w.id,'good','explore','2026-10-24',false);
 assert.equal(day.newIds.length,20);assert.equal(day.wordDone.length,0);assert.equal(s.cards[w.id].due,'2026-10-25');
 const loaded=C.parseBackup(JSON.stringify(C.exportEnvelope(s)));
 assert.ok(loaded.mistakes.every(m=>!m.note.includes('undefined')&&!m.note.includes('null')));
 assert.ok(loaded.mistakes.some(m=>m.note.includes('ECDICT 英语释义')));
});

test('dictionary rendering labels definitions and missing examples; query is escaped in the shelf',()=>{
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const html=wordDetails({...WORDS[1036],definition:'<script>bad</script>'},esc);
 assert.match(html,/暂无核验例句/);assert.match(html,/词典释义/);assert.ok(!html.includes('<script>'));
 const shelf=createVocabularyShelf({esc,button:()=>'',render:()=>{},open:()=>{}});
 shelf.submit({id:'vocabulary-search'},{query:'"><img src=x>',bank:'dictionary'});
 assert.ok(!shelf.view().includes('<img src=x>'));
});
