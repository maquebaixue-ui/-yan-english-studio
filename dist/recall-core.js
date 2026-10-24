import * as C from './core.js';import {WORDS} from './data.js';
import {seedRecall,freshRecall} from './recall-state.js';import {PAIRS,HINTS} from './recall-data.js';
export {PAIRS,HINTS};
const wordMap=new Map(WORDS.map(w=>[w.id,w]));
export function track(s,id,date=C.today()){if(!wordMap.has(id))throw Error('找不到这个词');return seedRecall(s,id,date,C.addDays(date,1));}
export function startTracking(s,date=C.today()){for(const id of Object.keys(s.cards))track(s,id,date);return Object.keys(s.recall?.words||{}).length;}
export const dueRecall=(s,date=C.today())=>Object.entries(s.recall?.words||{}).filter(([,r])=>r.due<=date&&!r.events.some(e=>e.date===date)).sort((a,b)=>a[1].due.localeCompare(b[1].due)||a[0].localeCompare(b[0])).map(([id])=>id);
export function practiceIds(s,date=C.today()){const due=dueRecall(s,date);if(due.length)return due.slice(0,5);const ids=Object.keys(s.recall?.words||{});return ids.sort((a,b)=>(s.recall.words[a].attempts-s.recall.words[b].attempts)||a.localeCompare(b)).slice(0,5);}
export function hint(s,id,type,date=C.today()){if(!['initial','audio','reveal'].includes(type))throw Error('无效提示');const r=track(s,id,date);if(r.cueDate!==date){r.cueDate=date;r.cues=[];}if(!r.cues.includes(type))r.cues.push(type);}
export function activeHints(s,id,date=C.today()){const r=s.recall?.words[id];if(!r)return[];const hints=r.cueDate===date?[...r.cues]:[];if(r.events.some(e=>e.date===date))hints.push('repeat');if(r.studied===date&&r.anchor!==date)hints.push('review');return [...new Set(hints)];}
export function answerRecall(s,id,answer,date=C.today()){
 if(typeof answer!=='string'||answer.length>100)throw Error('请填写不超过100个字符的英文词形');const r=track(s,id,date),w=wordMap.get(id),hints=activeHints(s,id,date),match=C.normaliseAnswer(answer)===w.word.toLowerCase(),independent=match&&!hints.length;
 const gap=C.daysBetween(r.anchor,date);let kind=gap===0?'today':'practice';
 if(independent&&gap>=1&&!r.nextPassed)kind='next';else if(independent&&gap>=7&&r.nextPassed&&r.nextPassed<date&&!r.weekPassed)kind='week';
 r.attempts++;if(!match)r.unmatched++;else if(hints.length)r.assisted++;else r.independent++;
 if(independent){if(kind==='today')r.todayPassed=date;if(kind==='next')r.nextPassed=date;if(kind==='week')r.weekPassed=date;C.resolveMistakes(s,'拼写',id,date);}
 if(!match||hints.some(h=>h!=='repeat'))r.due=C.addDays(date,1);
 else if(kind==='next')r.due=r.anchor&&C.addDays(r.anchor,7)>date?C.addDays(r.anchor,7):C.addDays(date,1);
 else if(kind==='week')r.due=C.addDays(date,14);
 else if(r.due<=date)r.due=C.addDays(date,1);
 const event={date,match,hints,kind};r.events.push(event);r.events=r.events.slice(-6);C.ensureDay(s,date).activities++;return event;
}
export function addRecallMistake(s,id,answer,date=C.today()){const w=wordMap.get(id);if(!w)throw Error('无效词条');return C.mistake(s,{category:'拼写',refId:id,prompt:w.meaning+'（本卡词形）',answer:w.word,userAnswer:answer,note:'学习者对照后主动加入拼写复习。本次按指定卡片词形核对，不判断其他近义表达。'},date);}
export const readyPair=(s,pair)=>pair.words.every(w=>!!s.cards[w.id]);
function pairRecord(s,id,date){s.recall??=freshRecall();return s.recall.pairs[id]??={attempts:0,independent:0,assisted:0,unmatched:0,last:date,events:[],cueDate:null,cueIndices:[]};}
export function pairHint(s,id,index,date=C.today()){const p=PAIRS.find(p=>p.id===id);if(!p||!p.questions[index]||!Number.isInteger(index)||!readyPair(s,p))throw Error('请先分别学习这两个词');const r=pairRecord(s,id,date);if(r.cueDate!==date){r.cueDate=date;r.cueIndices=[];}if(!r.cueIndices.includes(index))r.cueIndices.push(index);}
export function pairAnswer(s,id,index,answer,supported=false,date=C.today()){
 const p=PAIRS.find(p=>p.id===id);if(!p||!Number.isInteger(index)||!p.questions[index]||!p.words.some(w=>w.word===answer)||typeof supported!=='boolean')throw Error('请先选择本题的一个词');if(!readyPair(s,p))throw Error('先分别接触这两个词，再进行对照。');
 const r=pairRecord(s,id,date);supported=supported||(r.cueDate===date&&r.cueIndices.includes(index))||r.events.some(e=>e.date===date&&e.index===index);const match=p.questions[index].answer===answer;r.attempts++;if(!match)r.unmatched++;else if(supported)r.assisted++;else r.independent++;r.last=date;r.events.push({date,index,match,supported});r.events=r.events.slice(-6);const ref=`mix:${id}:${index}`;
 if(!match)C.mistake(s,{category:'单词',refId:ref,prompt:p.questions[index].sentence+'\n'+p.questions[index].chinese,answer:p.questions[index].answer,userAnswer:answer,note:p.note},date);else if(!supported)C.resolveMistakes(s,'单词',ref,date);C.ensureDay(s,date).activities++;return{match,supported};
}
export function firstHint(word){return [...word].map((c,i)=>/[a-z]/i.test(c)&&i>0?'·':c).join('');}
