// Shared, bounded schema for untrusted vision output. No images or keys in cards.
export const WORLD_LIMIT=500;
export const WORLD_IMAGE_LIMIT=1200000;
export function worldTerm(value){
 if(typeof value!=='string')throw new Error('识别词语格式无效。');
 const term=value.trim().toLowerCase().replace(/\s+/g,' ');
 if(!/^[a-z]+(?:[ '-][a-z]+)*$/.test(term)||term.length>60)throw new Error('识别词语需为简短英文词或词组。');
 return term;
}
export function worldId(term){return 'world:'+encodeURIComponent(worldTerm(term));}
const worldText=(v,max,optional=false)=>{if(optional&&(v===undefined||v===null))return '';if(typeof v!=='string'||v.length>max||!optional&&!v.trim()||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw new Error('识别卡片内容不完整，请重试。');return v.trim();};
export function cleanWorldCard(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('识别卡片格式无效。');
 return {word:worldTerm(raw.word),ipa:worldText(raw.ipa,100,true),meaning:worldText(raw.meaning,200),example:worldText(raw.example,350),translation:worldText(raw.translation,350),expression:worldText(raw.expression,350),expressionTranslation:worldText(raw.expressionTranslation,350)};
}
export function parseWorldResult(raw){
 if(typeof raw==='string'){if(raw.length>24000)throw new Error('识别结果过大，请换一个简单场景。');try{raw=JSON.parse(raw.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{throw new Error('模型没有返回可用的识别卡片，请重试或更换视觉模型。');}}
 if(!raw||typeof raw!=='object'||!Array.isArray(raw.items)||raw.items.length>5)throw new Error('识别结果格式无效，请重试。');
 const scene=worldText(raw.scene,120,true),seen=new Set(),items=[];
 for(const item of raw.items){const card=cleanWorldCard(item);if(seen.has(card.word))continue;seen.add(card.word);
  let point=null;if(item.point!==null&&item.point!==undefined){if(!Array.isArray(item.point)||item.point.length!==2||item.point.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>1))throw new Error('物品位置格式无效，请重新扫描。');point=[...item.point];}
  items.push({...card,point});
 }
 return {scene,items};
}
export function validateWorldImage(raw){
 if(!raw||raw.consent!==true)throw new Error('请先允许发送这张照片进行识别。');
 const image=raw.image;
 if(typeof image!=='string'||image.length>WORLD_IMAGE_LIMIT||!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image)||!image.startsWith('data:image/jpeg;base64,/9j/'))throw new Error('请重新拍摄或上传图片，压缩后的 JPEG 须小于 900 KB。');
 if(!Number.isInteger(raw.width)||!Number.isInteger(raw.height)||raw.width<1||raw.height<1||Math.max(raw.width,raw.height)>1280)throw new Error('照片尺寸无效，请重新拍摄。');
 return {image,width:raw.width,height:raw.height};
}
// Coordinates are relative to the uncropped photo, rendered with object-fit:contain.
// Keep labels apart; a short leader points back to the model's estimated position.
export function layoutWorldLabels(items,width=350,height=450){
 const placed=[];return items.map((item,index)=>{
  const p=item.point,anchor=p?{x:p[0]*width,y:p[1]*height}:null;
  let x=Math.max(60,Math.min(width-60,anchor?.x??width/2)),y=Math.max(25,Math.min(height-25,anchor?.y??(index+1)*height/(items.length+1)));
  for(let n=0;n<12&&placed.some(q=>Math.abs(q.x-x)<125&&Math.abs(q.y-y)<48);n++)y=25+((y+52-25)%(Math.max(1,height-50)));
  placed.push({x,y});return {x:x/width,y:y/height,anchor:anchor?{x:anchor.x/width,y:anchor.y/height}:null};
 });
}
