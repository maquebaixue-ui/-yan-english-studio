import {HINTS,PAIRS} from './recall-data.js';
export const freshRecall=()=>({words:{},pairs:{}});
export function seedRecall(s,id,date,due){s.recall??=freshRecall();return s.recall.words[id]??={anchor:date,due,studied:date,todayPassed:null,nextPassed:null,weekPassed:null,attempts:0,independent:0,assisted:0,unmatched:0,cueDate:null,cues:[],events:[]};}
export function validateRecall(raw,{wordIds,date,num,obj,arr,fail}){
 if(raw===undefined)return freshRecall();const src=obj(raw),out=freshRecall(),pids=new Set(PAIRS.map(p=>p.id));
 const bool=v=>{if(typeof v!=='boolean')fail();return v;},optional=v=>v===null?null:date(v);
 const hints=(v,allowed)=>{const a=arr(v,5);if(new Set(a).size!==a.length||a.some(x=>!allowed.has(x)))fail();return [...a];};
 const stats=r=>{const x={attempts:num(r.attempts),independent:num(r.independent),assisted:num(r.assisted),unmatched:num(r.unmatched)};if(x.attempts!==x.independent+x.assisted+x.unmatched)fail();return x;};
 for(const[id,value]of Object.entries(obj(src.words))){if(!wordIds.has(id))fail();const r=obj(value),anchor=date(r.anchor),events=arr(r.events,6).map(v=>{const e=obj(v);if(!['today','next','week','practice'].includes(e.kind))fail();const h=hints(e.hints,new Set(Object.keys(HINTS)));const day=date(e.date);if(day<anchor)fail();return{date:day,match:bool(e.match),hints:h,kind:e.kind};});
  const item={anchor,due:date(r.due),studied:date(r.studied),todayPassed:optional(r.todayPassed),nextPassed:optional(r.nextPassed),weekPassed:optional(r.weekPassed),...stats(r),cueDate:optional(r.cueDate),cues:hints(r.cues,new Set(['initial','audio','reveal'])),events};
  if(item.due<anchor||item.studied<anchor||item.todayPassed&&item.todayPassed!==anchor||item.nextPassed&&item.nextPassed<=anchor||item.weekPassed&&(!item.nextPassed||item.weekPassed<=item.nextPassed||(Date.parse(item.weekPassed)-Date.parse(anchor))/86400000<7)||item.events.length>item.attempts||item.cues.length&&!item.cueDate)fail();out.words[id]=item;
 }
 for(const[id,value]of Object.entries(obj(src.pairs))){if(!pids.has(id))fail();const r=obj(value),events=arr(r.events,6).map(v=>{const e=obj(v);return {date:date(e.date),index:num(e.index,0,1),match:bool(e.match),supported:bool(e.supported)};});out.pairs[id]={...stats(r),last:date(r.last),events,cueDate:optional(r.cueDate),cueIndices:hints(r.cueIndices,new Set([0,1]))};if(events.length>r.attempts||r.cueIndices.length&&!r.cueDate)fail();}
 return out;
}
