import {REASONS,OUTPUTS,LISTENING_TIMING} from './methods-data.js';
export const freshMethods=()=>({listening:{},output:{},reasons:{},days:{}});
export function validateMethods(raw,{date,num,obj,arr,str,fail,mistakeIds}){
 if(raw===undefined)return freshMethods();const x=obj(raw),out=freshMethods(),oids=new Set(OUTPUTS.map(q=>q.id)),lids=new Set(Object.keys(LISTENING_TIMING));
 const boolean=v=>{if(typeof v!=='boolean')fail();return v;};
 const unique=(v,allowed,max)=>{const a=arr(v,max);if(new Set(a).size!==a.length||a.some(id=>!allowed.has(id)))fail();return [...a];};
 for(const [id,value]of Object.entries(obj(x.listening))){if(!lids.has(id))fail();const r=obj(value),count=LISTENING_TIMING[id].sentences.length;out.listening[id]={stage:num(r.stage,0,3),gist:str(r.gist,500),played:boolean(r.played),shadowed:unique(r.shadowed,new Set(Array.from({length:count},(_,i)=>i)),count),unclear:unique(r.unclear,new Set(Array.from({length:count},(_,i)=>i)),count),last:date(r.last)};if(r.stage===3&&r.shadowed.length!==count)fail();}
 for(const [id,value]of Object.entries(obj(x.output))){if(!oids.has(id))fail();const r=obj(value);out.output[id]={stage:num(r.stage,0,3),fillAttempts:num(r.fillAttempts),attempts:num(r.attempts),matched:num(r.matched,0,r.attempts),last:date(r.last),answer:str(r.answer,300),selfChecked:boolean(r.selfChecked)};if(r.stage===3&&r.attempts<1)fail();}
 for(const [id,value]of Object.entries(obj(x.reasons))){if(!mistakeIds.has(id)||['__proto__','constructor','prototype'].includes(id))fail();const r=obj(value);if(!Object.hasOwn(REASONS,r.reason))fail();out.reasons[id]={reason:r.reason,next:date(r.next),last:date(r.last)};}
 for(const [day,value]of Object.entries(obj(x.days))){date(day);const d=obj(value);out.days[day]={listening:unique(d.listening,lids,4),output:unique(d.output,oids,12)};}
 return out;
}
