import {WORDS} from './data.js';
import * as C from './core.js';
import {TRANSFORMS,DIMENSIONS} from './learning-data.js';
import {freshLearning,markDimension} from './learning-state.js';
export {DIMENSIONS,TRANSFORMS};
const unique=(a,id)=>{if(!a.includes(id))a.push(id);};
export function trainingDay(s,date=C.today()){const l=s.learning??=freshLearning();return l.days[date]??={dictation:[],transform:[],use:[]};}
export const normaliseSentence=s=>C.normaliseAnswer(s).replace(/[’‘]/g,"'").replace(/\bdoesn't\b/g,'does not').replace(/\bdidn't\b/g,'did not').replace(/\bdon't\b/g,'do not').replace(/\bisn't\b/g,'is not').replace(/\bwasn't\b/g,'was not').replace(/\bcan't\b/g,'cannot').replace(/[.!?]+$/,'').trim();
export function hasCloze(w){return !!w.example&&new RegExp(`\\b${w.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i').test(w.example);}
export function cloze(w){return w.example.replace(new RegExp(`\\b${w.word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'gi'),'_____');}
export function dimensions(s,id){return Object.entries(DIMENSIONS).map(([key,label])=>{const r=s.learning?.words[id]?.[key];return {key,label,...r,status:!r?'未练':r.lastCorrect?'本次答对':'待巩固'};});}
export function makePlan(s,date=C.today()){
 const saved=s.learning?.days[date]?.plan;if(saved)return saved;
 const unresolved=s.mistakes.filter(x=>!x.resolved),counts=Object.fromEntries(C.CATEGORIES.map(k=>[k,unresolved.filter(x=>x.category===k).length]));
 let focus='spell',reason='先练 5 个听写、3 句变换和 1 个例句填空，收集你的真实表现。';
 if(C.dueIds(s,date).length>20){focus='review';reason=`有 ${C.dueIds(s,date).length} 个词到期，先完成复习；专项可以拆成几段做。`;}
 else if(counts['语法']>Math.max(counts['拼写'],counts['听力'])){focus='grammar';reason=`还有 ${counts['语法']} 道语法错题，今天优先巩固否定句和时态。`;}
 else if(counts['听力']>counts['拼写']){focus='listen';reason=`还有 ${counts['听力']} 条听力错题，先练声音和意思的对应。`;}
 else if(counts['拼写'])reason=`还有 ${counts['拼写']} 个拼写错词，先复习这些容易混淆的字母。`;
 else {const practiced=Object.values(s.learning?.words||{});const tested=practiced.filter(w=>w.recognize?.lastCorrect);if(tested.length>=3&&tested.filter(w=>!w.use?.lastCorrect).length>=3){focus='use';reason='已有至少 3 个词能认出，但例句应用尚待巩固，今天试着把词放回句子。';}}
 const priority=[...unresolved.filter(x=>['拼写','听力'].includes(x.category)&&(x.refId?.startsWith('w')||x.refId?.startsWith('listen:'))).map(x=>x.refId.replace(/^listen:/,'')),...C.dueIds(s,date),...Object.keys(s.cards),...(s.days[date]?.newIds||[]),...WORDS.slice(0,20).map(w=>w.id)];
 const ids=[...new Set(priority)].filter(id=>C.wordsFor(s).some(w=>w.id===id));
 const dictation=ids.slice(0,5);
 const wrongTransforms=new Set(unresolved.filter(m=>m.category==='语法').map(m=>m.refId));
 const transform=[...TRANSFORMS].sort((a,b)=>Number(wrongTransforms.has(b.id))-Number(wrongTransforms.has(a.id))||Number(s.learning?.transforms[a.id]?.lastCorrect||false)-Number(s.learning?.transforms[b.id]?.lastCorrect||false)||(s.learning?.transforms[a.id]?.attempts||0)-(s.learning?.transforms[b.id]?.attempts||0)||a.id.localeCompare(b.id)).slice(0,3).map(x=>x.id);
 const useIds=[...new Set([...ids,...C.wordsFor(s).filter(hasCloze).map(w=>w.id)])].filter(id=>hasCloze(C.wordsFor(s).find(w=>w.id===id)));
 const use=useIds.find(id=>!s.learning?.words[id]?.use?.lastCorrect)||useIds[0];
 return {focus,reason,dictation,transform,use:use?[use]:[]};
}
export function startPlan(s,date=C.today()){const d=trainingDay(s,date);return d.plan??=structuredClone(makePlan(s,date));}
export function answerDictation(s,id,meaningIndex,options,answer,date=C.today()){
 const w=C.wordsFor(s).find(x=>x.id===id);if(!w||!Number.isInteger(meaningIndex)||!Array.isArray(options)||!options[meaningIndex])throw new Error('请先选择听到的意思。');
 const heard=options[meaningIndex]===w.meaning,spelled=C.recordSpelling(s,id,answer,date);
 markDimension(s,id,'listen',heard,date);unique(trainingDay(s,date).dictation,id);
 const ref='listen:'+id;
 if(heard)C.resolveMistakes(s,'听力',ref,date);else C.mistake(s,{category:'听力',refId:ref,prompt:'听音辨义：'+w.word,answer:w.meaning,userAnswer:options[meaningIndex],note:'先听声音，再对照英文和释义。'},date);
 return {heard,spelled};
}
export function answerTransform(s,id,answer,date=C.today()){
 const q=TRANSFORMS.find(x=>x.id===id);if(!q)throw new Error('没有找到句型练习');
 const correct=[q.answer,...q.alternatives].some(a=>normaliseSentence(a)===normaliseSentence(answer)),old=s.learning?.transforms[id]||{attempts:0,correct:0};
 s.learning??=freshLearning();s.learning.transforms[id]={attempts:old.attempts+1,correct:old.correct+Number(correct),last:date,lastCorrect:correct};
 unique(trainingDay(s,date).transform,id);C.ensureDay(s,date).activities++;
 if(correct)C.resolveMistakes(s,'语法',id,date);else C.mistake(s,{category:'语法',refId:id,prompt:q.sentence+'\n'+q.prompt,answer:q.answer,userAnswer:answer,note:q.explanation},date);
 return correct;
}
export function answerUse(s,id,answer,date=C.today()){
 const w=C.wordsFor(s).find(x=>x.id===id);if(!w||!hasCloze(w))throw new Error('这个词暂无可用的核验例句。');
 const correct=C.normaliseAnswer(answer)===w.word.toLowerCase();markDimension(s,id,'use',correct,date);unique(trainingDay(s,date).use,id);C.ensureDay(s,date).activities++;
 if(correct)C.resolveMistakes(s,'单词','use:'+id,date);else C.mistake(s,{category:'单词',refId:'use:'+id,prompt:cloze(w),answer:w.word,userAnswer:answer,note:w.example+'\n'+w.translation},date);
 return correct;
}
