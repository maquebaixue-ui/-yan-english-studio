import {WORDS} from './data.js';
const byTerm=new Map(WORDS.map(w=>[w.word,w.id]));
const rows=[
 ['p01','quiet','安静的','quite','相当；很',"It is _____ here.",'这里很安静。','quiet',"I am _____ tired.",'我相当累。','quite','quiet 描述安静；quite 常放在形容词前表示程度。'],
 ['p02','then','然后；那时','than','比',"Finish your work, and _____ take a break.",'完成工作，然后休息一下。','then',"This room is larger _____ that one.",'这间房比那间大。','than','then 表示时间或顺序；than 用于比较。'],
 ['p03','borrow','借入','lend','借出',"Can I _____ your pen?",'我能借用你的笔吗？','borrow',"Can you _____ me your pen?",'你能把笔借给我吗？','lend','borrow 是自己借入；lend 是把东西借给别人。'],
 ['p04','lose','失去；丢失','loose','松的',"Do not _____ your ticket.",'不要弄丢你的票。','lose',"This shirt is too _____.",'这件衬衫太宽松了。','loose','lose 是动词；loose 在本题中是形容词，拼写多一个 o。'],
 ['p05','remember','记得','remind','提醒',"I _____ his name.",'我记得他的名字。','remember',"Please _____ me to call him.",'请提醒我给他打电话。','remind','remember 表示自己记得；remind 常用 remind someone to do something。'],
 ['p06','study','学习；研究','learn','学会；学习',"The researchers _____ changes in the weather.",'研究人员研究天气变化。','study',"I want to _____ how to swim.",'我想学会游泳。','learn','两词都可表示学习。这里用“研究”和“学会技能”的具体语境区分，不把它们当成所有句子中都互斥。']
];
export const PAIRS=rows.map(([id,a,am,b,bm,sa,ca,aa,sb,cb,ab,note])=>({id,words:[{id:byTerm.get(a),word:a,meaning:am},{id:byTerm.get(b),word:b,meaning:bm}],questions:[{sentence:sa,chinese:ca,answer:aa},{sentence:sb,chinese:cb,answer:ab}],note}));
export const HINTS={initial:'首字母',audio:'发音提示',reveal:'完整答案',repeat:'当天已看过反馈',review:'今天已看过普通词卡'};
export function pairRef(ref){const m=/^mix:(p0[1-6]):([01])$/.exec(String(ref));if(!m)return null;return {pair:PAIRS.find(p=>p.id===m[1]),index:Number(m[2])};}
