import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LIBRARY,PRACTICES} from '../dist/library-data.js';
import * as C from '../dist/core.js';
test('32 local materials with 50 complete answerable practice items',()=>{
 assert.equal(LIBRARY.length,32);assert.equal(new Set(LIBRARY.map(x=>x.id)).size,32);
 assert.equal(PRACTICES.reduce((n,p)=>n+p.questions.length,0),50);
 for(const item of LIBRARY){assert.ok(item.title);if(item.questions){assert.ok(item.text);for(const q of item.questions){assert.equal(q.options.length,3);assert.ok(q.options[q.answer]);assert.ok(q.explanation);}}else assert.ok(item.body.length>=3);}
});
test('longest passage mistake and zero score survive existing backup schema',()=>{
 const s=C.freshState();for(const item of PRACTICES){const q=item.questions[0];C.mistake(s,{category:item.kind,prompt:item.title+' · '+q.prompt+'\n\n'+item.text,answer:q.options[q.answer],userAnswer:'wrong',note:q.explanation});C.addRecord(s,{skill:item.kind,date:C.today(),title:item.title,correct:0,total:5,minutes:5,feedback:'Original practice'});}
 const restored=C.parseBackup(JSON.stringify(C.exportEnvelope(s)));assert.deepEqual(restored,s);
});
