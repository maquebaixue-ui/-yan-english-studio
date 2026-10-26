import {WORDS} from './data.js';
import {WORLD_LIMIT,worldId,cleanWorldCard} from './world-core.js';
export const freshWorld=()=>({words:[],collection:[]});
export const wordsFor=s=>s?.world?.words?.length?[...WORDS,...s.world.words]:WORDS;
export const worldWord=(card,id)=>({id,word:card.word,phonetic:card.ipa,meaning:card.meaning,example:card.example,translation:card.translation,source:'world',topic:'身边的英语',level:'探索词',expression:card.expression,expressionTranslation:card.expressionTranslation,...(card.origin==='local'?{origin:'local'}:{})});
export function collectWorld(s,raw,scene,date){
 const card=cleanWorldCard(raw),world=s.world??=freshWorld(),existing=WORDS.find(w=>w.word.toLowerCase()===card.word),id=existing?.id||worldId(card.word);
 if(world.collection.some(x=>x.id===id))return {id,added:false};
 if(world.collection.length>=WORLD_LIMIT)throw new Error('探索手册已达 500 词，请先导出备份。');
 const item={...card,id,scene:String(scene||'').slice(0,120),foundAt:date};
 if(!existing)world.words.push(worldWord(card,id));
 world.collection.unshift(item);
 // Collection schedules the first recall, without fabricating study completion.
 if(!s.cards[id])s.cards[id]={stage:0,due:date,lastRating:'fuzzy',reps:0,lapses:0};
 if(s.days[date]&&!s.days[date].reviewIds.includes(id)&&s.cards[id].due<=date)s.days[date].reviewIds.push(id);
 return {id,added:true};
}
export function validateWorld(raw,{date,fail}){
 if(raw===undefined)return freshWorld();
 if(!raw||!Array.isArray(raw.words)||!Array.isArray(raw.collection)||raw.collection.length>WORLD_LIMIT||raw.words.length>WORLD_LIMIT)fail();
 const out=freshWorld(),seen=new Set();
 try{for(const item of raw.collection){const card=cleanWorldCard(item),existing=WORDS.find(w=>w.word.toLowerCase()===card.word),id=existing?.id||worldId(card.word);if(item.id!==id||seen.has(id)||typeof item.scene!=='string'||item.scene.length>120)fail();seen.add(id);out.collection.push({...card,id,scene:item.scene,foundAt:date(item.foundAt)});if(!existing)out.words.push(worldWord(card,id));}
  if(raw.words.length!==out.words.length)fail();
  for(const word of raw.words){const match=out.words.find(x=>x.id===word.id);if(!match||Object.keys(match).some(k=>word[k]!==match[k]))fail();}
  if(new Set(raw.words.map(w=>w.id)).size!==raw.words.length)fail();
 }catch{fail();}
 return out;
}
