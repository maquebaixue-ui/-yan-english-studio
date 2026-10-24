import {TRANSFORMS,DIMENSIONS} from './learning-data.js';
export const freshLearning=()=>({words:{},transforms:{},days:{}});
export function markDimension(s,id,dimension,correct,date){
 if(!Object.hasOwn(DIMENSIONS,dimension)||typeof correct!=='boolean')throw new Error('无效的训练结果');
 const learning=s.learning??=freshLearning(),word=learning.words[id]??={},old=word[dimension]||{attempts:0,correct:0};
 word[dimension]={attempts:old.attempts+1,correct:old.correct+Number(correct),last:date,lastCorrect:correct};
 return word[dimension];
}
export function validateLearning(raw,{wordIds,date,num,obj,arr,str,fail}){
 if(raw===undefined)return freshLearning();
 const s=obj(raw),result=freshLearning(),tids=new Set(TRANSFORMS.map(x=>x.id));
 function record(v){const r=obj(v);const attempts=num(r.attempts,1),correct=num(r.correct,0,attempts);if(typeof r.lastCorrect!=='boolean')fail();return {attempts,correct,last:date(r.last),lastCorrect:r.lastCorrect};}
 for(const [id,value] of Object.entries(obj(s.words))){if(!wordIds.has(id))fail();const w=obj(value),clean={};for(const [key,v] of Object.entries(w)){if(!Object.hasOwn(DIMENSIONS,key))fail();clean[key]=record(v);}result.words[id]=clean;}
 for(const [id,value] of Object.entries(obj(s.transforms))){if(!tids.has(id))fail();result.transforms[id]=record(value);}
 const list=(value,allowed,max)=>{const ids=arr(value,max).map(id=>{if(!allowed.has(id))fail();return id;});if(new Set(ids).size!==ids.length)fail();return ids;};
 for(const [day,value] of Object.entries(obj(s.days))){date(day);const d=obj(value);result.days[day]={dictation:list(d.dictation,wordIds,6000),transform:list(d.transform,tids,24),use:list(d.use,wordIds,6000)};if(d.plan){const p=obj(d.plan);if(!['spell','listen','use','grammar','review'].includes(p.focus))fail();result.days[day].plan={focus:p.focus,reason:str(p.reason,300),dictation:list(p.dictation,wordIds,5),transform:list(p.transform,tids,3),use:list(p.use,wordIds,1)};}}
 return result;
}
