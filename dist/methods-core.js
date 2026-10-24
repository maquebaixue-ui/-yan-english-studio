import * as C from './core.js';
import {normaliseSentence} from './learning-core.js';
import {freshMethods} from './methods-state.js';
import {OUTPUTS,REASONS,LISTENING_TIMING} from './methods-data.js';
export {OUTPUTS,REASONS,LISTENING_TIMING};
export const methods=s=>s.methods??=freshMethods();
const day=(s,d)=>methods(s).days[d]??={listening:[],output:[]};
function complete(s,kind,id,date){const ids=day(s,date)[kind];if(!ids.includes(id)){ids.push(id);C.ensureDay(s,date).activities++;}}
export function listening(s,id,date=C.today()){if(!LISTENING_TIMING[id])throw Error('找不到这篇原创听力');return methods(s).listening[id]??={stage:0,gist:'',played:false,shadowed:[],unclear:[],last:date};}
export function output(s,id,date=C.today()){if(!OUTPUTS.some(q=>q.id===id))throw Error('找不到这道输出练习');return methods(s).output[id]??={stage:0,fillAttempts:0,attempts:0,matched:0,last:date,answer:'',selfChecked:false};}
export function heard(s,id,date=C.today()){const r=listening(s,id,date);r.played=true;r.last=date;}
export function advanceListening(s,id,gist,date=C.today()){
 const r=listening(s,id,date);if(!r.played)throw Error('先播放并听一听，再继续。');
 if(r.stage===0){if(!gist?.trim())throw Error('用中文或英文写一句大意即可，不需要写得完美。');r.gist=gist.trim().slice(0,500);r.stage=1;}
 else if(r.stage===1)r.stage=2;
 else if(r.stage===2){if(r.shadowed.length!==LISTENING_TIMING[id].sentences.length)throw Error('逐句听并跟读后，再点“这句跟读过了”。');r.stage=3;complete(s,'listening',id,date);}
 r.last=date;return r;
}
export function shadow(s,id,index,date=C.today()){const r=listening(s,id,date);if(r.stage!==2||!Number.isInteger(index)||!LISTENING_TIMING[id].sentences[index])throw Error('请选择有效的跟读句子');if(!r.shadowed.includes(index))r.shadowed.push(index);r.last=date;}
export function unclear(s,id,index,value,date=C.today()){
 const r=listening(s,id,date),text=LISTENING_TIMING[id].sentences[index];if(!text||!Number.isInteger(index))throw Error('无效的听力句子');const ref=`ear:${id}:${index}`;
 if(value){if(!r.unclear.includes(index))r.unclear.push(index);return C.mistake(s,{category:'听力',refId:ref,prompt:`逐句精听 · 第 ${index+1} 句`,answer:text,note:'学习者主动标记为没听懂；复习时先隐藏文本再听。'},date);}
 r.unclear=r.unclear.filter(i=>i!==index);C.resolveMistakes(s,'听力',ref,date);
}
export function fillOutput(s,id,answer,date=C.today()){const q=OUTPUTS.find(q=>q.id===id),r=output(s,id,date);if(r.stage!==1)throw Error('请先看例句，再练填空。');r.fillAttempts++;r.last=date;const ok=normaliseSentence(answer)===normaliseSentence(q.gap);if(ok)r.stage=2;return ok;}
export function checkOutput(s,id,answer,date=C.today()){
 const q=OUTPUTS.find(q=>q.id===id),r=output(s,id,date);if(r.stage!==2||!answer?.trim()||answer.length>300)throw Error('请先完成填空，再写出你的英文句子。');
 const match=[q.english,...q.alternatives].some(a=>normaliseSentence(a)===normaliseSentence(answer));r.attempts++;r.matched+=Number(match);r.answer=answer.trim();r.last=date;r.selfChecked=false;
 if(match){r.stage=3;complete(s,'output',id,date);C.resolveMistakes(s,'语法','out:'+id,date);}return match;
}
export function confirmOutput(s,id,wasWrong,date=C.today()){
 const q=OUTPUTS.find(q=>q.id===id),r=output(s,id,date);if(r.stage!==2||!r.attempts||!r.answer)throw Error('请先写句子并对照参考。');
 if(wasWrong)return C.mistake(s,{category:'语法',refId:'out:'+id,prompt:q.chinese+'（'+q.topic+'）',answer:q.english,userAnswer:r.answer,note:q.tip+' 学习者对照后确认需要重练。'},date);
 r.selfChecked=true;r.stage=3;complete(s,'output',id,date);
}
export function setReason(s,id,reason,date=C.today()){if(!s.mistakes.some(m=>m.id===id)||!Object.hasOwn(REASONS,reason))throw Error('请选择有效错因');return methods(s).reasons[id]={reason,next:C.addDays(date,1),last:date};}
export function reasonQueue(s,date=C.today()){return s.mistakes.filter(m=>!m.resolved&&s.methods?.reasons[m.id]?.next<=date).sort((a,b)=>s.methods.reasons[a.id].next.localeCompare(s.methods.reasons[b.id].next)||b.count-a.count);}
export function suggestedOutput(s,date=C.today()){
 const due=reasonQueue(s,date),reason=s.methods?.reasons[due[0]?.id]?.reason,topic=reason==='negative'?'否定':reason==='tense'?'过去':null;
 return [...OUTPUTS].sort((a,b)=>Number(!!topic&&b.topic.includes(topic))-Number(!!topic&&a.topic.includes(topic))||Number(s.methods?.output[a.id]?.stage===3)-Number(s.methods?.output[b.id]?.stage===3)||(s.methods?.output[a.id]?.attempts||0)-(s.methods?.output[b.id]?.attempts||0)||a.id.localeCompare(b.id)).slice(0,2);
}
