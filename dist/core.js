import {WORDS, GRAMMAR} from './data.js';
export const STORAGE_KEY = 'yan-english-studio:v1';
export const BACKUP_KEY = 'yan-english-studio:before-import';
export const CATEGORIES = ['单词','拼写','语法','阅读','听力'];
export const SKILLS = ['听力','阅读','写作','口语'];
export const INTERVALS = [1,3,7,14,30,60];
const wordIds = new Set(WORDS.map(x=>x.id)), grammarIds = new Set(GRAMMAR.map(x=>x.id));
export function today(now=new Date()) {return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function addDays(date,n){const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+n);return today(d);}
export function daysBetween(a,b){return Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000);}
export function validDate(s){return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T12:00:00`).getTime()) && today(new Date(`${s}T12:00:00`))===s;}
export function uid(){return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
export function freshState(date=today()){return {version:1,createdAt:date,settings:{targetDate:'2026-11-30',targetBand:6,nextBand:6.5},days:{},cards:{},grammar:{},mistakes:[],records:[],lastExport:null};}
export function ensureDay(s,date=today()){
 if(!s.days[date]) s.days[date]={newIds:WORDS.filter(w=>!s.cards[w.id]).slice(0,20).map(w=>w.id),reviewIds:dueIds(s,date),wordDone:[],reviewDone:[],grammarDone:[],spellingAttempts:0,activities:0};
 return s.days[date];
}
export function dueIds(s,date=today()){return WORDS.filter(w=>s.cards[w.id]?.due<=date).map(w=>w.id);}
export function schedule(previous,rating,date=today()){
 if(!['again','fuzzy','good'].includes(rating)) throw new Error('无效的记忆选项');
 const stage=rating==='good'?Math.min((previous?.stage??-1)+1,INTERVALS.length-1):0;
 return {stage,due:addDays(date,INTERVALS[stage]),lastRating:rating,reps:(previous?.reps||0)+1,lapses:(previous?.lapses||0)+(rating==='again'?1:0)};
}
function addUnique(list,id){if(!list.includes(id)) list.push(id);}
export function mistake(s,{category,refId=null,prompt,answer,userAnswer='',note=''},date=today()){
 const existing=refId?s.mistakes.find(m=>m.category===category&&m.refId===refId):null;
 if(existing){existing.count++;existing.lastAt=date;existing.userAnswer=userAnswer;existing.note=note;existing.resolved=false;return existing;}
 const m={id:uid(),category,refId,prompt,answer,userAnswer,note,createdAt:date,lastAt:date,count:1,resolved:false};s.mistakes.unshift(m);return m;
}
export function resolveMistakes(s,category,refId,date=today()){s.mistakes.filter(m=>m.category===category&&m.refId===refId).forEach(m=>{m.resolved=true;m.lastAt=date;});}
export function normaliseAnswer(s){return s.trim().toLowerCase().replace(/\s+/g,' ');}
export function recordSpelling(s,id,answer,date=today()){
 const word=WORDS.find(w=>w.id===id);if(!word)throw new Error('找不到单词');
 const correct=normaliseAnswer(answer)===word.word.toLowerCase();
 const day=ensureDay(s,date);day.spellingAttempts++;day.activities++;
 if(correct) resolveMistakes(s,'拼写',id,date);
 else mistake(s,{category:'拼写',refId:id,prompt:word.meaning,answer:word.word,userAnswer:answer,note:word.example?`例句：${word.example}`:`ECDICT 英语释义：${word.definition}`},date);
 return correct;
}
export function rateWord(s,id,rating,mode='new',date=today(),spellingCorrect=true){
 const word=WORDS.find(w=>w.id===id);if(!word)throw new Error('找不到单词');
 const day=ensureDay(s,date);
 const effective=rating==='good'&&!spellingCorrect?'fuzzy':rating;
 s.cards[id]=schedule(s.cards[id],effective,date);
 addUnique(mode==='new'?day.wordDone:day.reviewDone,id);day.activities++;
 if(effective==='good')resolveMistakes(s,'单词',id,date);
 else mistake(s,{category:'单词',refId:id,prompt:word.word,answer:word.meaning,userAnswer:effective==='again'?'不会':'模糊',note:word.example?`${word.example}\n${word.translation}`:`ECDICT 英语释义：${word.definition}`},date);
 return s.cards[id];
}
export function grammarQueue(s,date=today()){
 const completed=s.days[date]?.grammarDone||[];
 return [...GRAMMAR].sort((a,b)=>(s.grammar[a.id]?.attempts||0)-(s.grammar[b.id]?.attempts||0)||a.id.localeCompare(b.id)).filter(q=>!completed.includes(q.id)).slice(0,5-Math.min(completed.length,5)).map(q=>q.id);
}
export function answerGrammar(s,id,option,date=today()){
 const q=GRAMMAR.find(x=>x.id===id);if(!q||!Number.isInteger(option)||!q.options[option])throw new Error('无效的语法答案');
 const correct=option===q.answer, prev=s.grammar[id];
 s.grammar[id]={attempts:(prev?.attempts||0)+1,correct:(prev?.correct||0)+(correct?1:0),last:date};
 const day=ensureDay(s,date);addUnique(day.grammarDone,id);day.activities++;
 if(correct)resolveMistakes(s,'语法',id,date);
 else mistake(s,{category:'语法',refId:id,prompt:q.prompt,answer:q.options[q.answer],userAnswer:q.options[option],note:q.explanation},date);
 return correct;
}
export function addRecord(s,r,date=today()){
 if(!SKILLS.includes(r.skill)||!validDate(r.date)||r.date>date)throw new Error('请选择有效的技能和日期，不能记录未来练习。');
 if(!r.title?.trim())throw new Error('请填写练习材料或题目。');
 if(!Number.isInteger(r.minutes)||r.minutes<1||r.minutes>1440)throw new Error('练习用时须为 1–1440 分钟之间的整数。');
 if(['听力','阅读'].includes(r.skill)){
   if(!Number.isInteger(r.correct)||r.correct<0||!Number.isInteger(r.total)||r.total<1||r.total>40||r.correct>r.total)throw new Error('正确题数须为 0 至总题数之间的整数，总题数须为 1–40。');
 }else if(!r.feedback?.trim())throw new Error('请写下一条练习反馈。');
 const record={id:uid(),date:r.date,skill:r.skill,title:r.title.trim(),correct:['听力','阅读'].includes(r.skill)?r.correct:null,total:['听力','阅读'].includes(r.skill)?r.total:null,feedback:r.feedback?.trim()||'',nextAction:r.nextAction?.trim()||'',minutes:r.minutes||0};
 s.records.unshift(record);ensureDay(s,r.date).activities++;return record;
}
export function streak(s,date=today()){
 let cursor=s.days[date]?.activities>0?date:addDays(date,-1),count=0;
 while(s.days[cursor]?.activities>0){count++;cursor=addDays(cursor,-1);}return count;
}
export function dailyStats(s,date=today()){
 const d=ensureDay(s,date),vocab=d.newIds.filter(id=>d.wordDone.includes(id)).length,review=d.reviewIds.filter(id=>d.reviewDone.includes(id)).length,grammar=Math.min(5,d.grammarDone.length),records=s.records.filter(r=>r.date===date).length;
 const tasks=[...(d.newIds.length?[{id:'new',done:vocab>=d.newIds.length,value:vocab,total:d.newIds.length}]:[]),...(d.reviewIds.length?[{id:'review',done:review>=d.reviewIds.length,value:review,total:d.reviewIds.length}]:[]),{id:'grammar',done:grammar>=5,value:grammar,total:5},{id:'record',done:records>0,value:Math.min(records,1),total:1}];
 const fraction=tasks.reduce((n,t)=>n+Math.min(1,t.value/t.total),0)/tasks.length;
 return {vocab,review,grammar,records,tasks,percent:Math.round(fraction*100),completed:tasks.filter(t=>t.done).length,xp:d.wordDone.length*10+d.reviewDone.length*5+d.grammarDone.length*5+records*20};
}
export function exportEnvelope(s){return {app:'YAN English Studio',schemaVersion:1,exportedAt:new Date().toISOString(),data:s};}

// Validate every stored field, then reconstruct objects. Imported files cannot add
// executable content, arbitrary card IDs, or prototype keys to application state.
export function validateState(input){
 const fail=()=>{throw new Error('备份结构无效或版本不兼容。原有数据未改变。');};
 const obj=v=>{if(!v||typeof v!=='object'||Array.isArray(v))fail();return v;};
 const str=(v,max=5000)=>{if(typeof v!=='string'||v.length>max)fail();return v;};
 const num=(v,min=0,max=1000000)=>{if(!Number.isInteger(v)||v<min||v>max)fail();return v;};
 const date=v=>{if(!validDate(v))fail();return v;};
 const arr=(v,max=50000)=>{if(!Array.isArray(v)||v.length>max)fail();return v;};
 const ids=(v,allowed,max)=>{const a=arr(v,max).map(x=>{if(!allowed.has(x))fail();return x;});if(new Set(a).size!==a.length)fail();return a;};
 const s=obj(input);if(s.version!==1)fail();const settings=obj(s.settings);
 const result=freshState(date(s.createdAt));
 result.settings={targetDate:date(settings.targetDate),targetBand:settings.targetBand,nextBand:settings.nextBand};
 if(![6,6.5].includes(settings.targetBand)||settings.nextBand!==6.5)fail();
 for(const [key,value] of Object.entries(obj(s.days))){date(key);const d=obj(value);result.days[key]={newIds:ids(d.newIds,wordIds,20),reviewIds:ids(d.reviewIds,wordIds,WORDS.length),wordDone:ids(d.wordDone,wordIds,WORDS.length),reviewDone:ids(d.reviewDone,wordIds,WORDS.length),grammarDone:ids(d.grammarDone,grammarIds,GRAMMAR.length),spellingAttempts:num(d.spellingAttempts),activities:num(d.activities)};}
 for(const [key,value] of Object.entries(obj(s.cards))){if(!wordIds.has(key))fail();const c=obj(value);if(!['again','fuzzy','good'].includes(c.lastRating))fail();result.cards[key]={stage:num(c.stage,0,INTERVALS.length-1),due:date(c.due),lastRating:c.lastRating,reps:num(c.reps),lapses:num(c.lapses)};}
 for(const [key,value] of Object.entries(obj(s.grammar))){if(!grammarIds.has(key))fail();const g=obj(value);result.grammar[key]={attempts:num(g.attempts),correct:num(g.correct),last:date(g.last)};if(g.correct>g.attempts)fail();}
 result.mistakes=arr(s.mistakes).map(v=>{const m=obj(v);if(!CATEGORIES.includes(m.category)||typeof m.resolved!=='boolean')fail();if(m.refId!==null&&!(m.category==='语法'?grammarIds:wordIds).has(m.refId))fail();return {id:str(m.id,100),category:m.category,refId:m.refId,prompt:str(m.prompt),answer:str(m.answer),userAnswer:str(m.userAnswer),note:str(m.note),createdAt:date(m.createdAt),lastAt:date(m.lastAt),count:num(m.count,1),resolved:m.resolved};});
 result.records=arr(s.records).map(v=>{const r=obj(v);if(!SKILLS.includes(r.skill))fail();const raw=['听力','阅读'].includes(r.skill);if(raw){num(r.total,1,40);num(r.correct,0,r.total);}else if(r.correct!==null||r.total!==null)fail();return {id:str(r.id,100),date:date(r.date),skill:r.skill,title:str(r.title),correct:r.correct,total:r.total,feedback:str(r.feedback),nextAction:str(r.nextAction),minutes:num(r.minutes,0,1440)};});
 if(new Set(result.mistakes.map(x=>x.id)).size!==result.mistakes.length||new Set(result.records.map(x=>x.id)).size!==result.records.length)fail();
 result.lastExport=s.lastExport===null?null:date(s.lastExport);return result;
}
export function parseBackup(text){
 if(text.length>8*1024*1024)throw new Error('备份文件超过 8 MB，请检查文件。');
 let envelope;try{envelope=JSON.parse(text);}catch{throw new Error('这不是有效的 JSON 备份文件。');}
 if(!envelope||typeof envelope!=='object'||Array.isArray(envelope)||envelope.app!=='YAN English Studio'||envelope.schemaVersion!==1)throw new Error('请选择 YAN English Studio 导出的 v1 备份。');
 return validateState(envelope.data);
}
