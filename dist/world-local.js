import {localObjectCards} from './world-local-data.js';
export function createLocalWorld({env=globalThis,onChange=()=>{}}={}){
 let worker=null,sequence=0,ready=false,preparing=null,loading=false,message='免费本地识别 · 首次准备约 6 MB 模型与运行库。',jobs=new Map();
 const state=()=>({ready,loading,message});
 function reset(reason='本地分析已停止，可以重试。'){
  worker?.terminate();worker=null;ready=false;preparing=null;loading=false;message=reason;
  for(const job of jobs.values()){clearTimeout(job.timer);job.reject(new Error(reason));}jobs.clear();onChange();
 }
 function request(type,body={},transfer=[]){
  return new Promise((resolve,reject)=>{
   if(!env.Worker){reject(new Error('当前浏览器不支持本地识别，请用安卓 Chrome / Edge 重试。'));return;}
   if(!worker){worker=new env.Worker(new URL('./world-local-worker.js',import.meta.url));worker.onmessage=({data:r})=>{const job=jobs.get(r.id);if(!job)return;jobs.delete(r.id);clearTimeout(job.timer);r.error?job.reject(new Error(r.error)):job.resolve(r);};worker.onerror=()=>reset('本地识别资源无法运行，请联网刷新后在 Chrome / Edge 重试。');}
   const id=++sequence,timer=setTimeout(()=>reset('本地分析超时。请换一张简单照片，或在性能更好的设备重试。'),type==='load'?120000:90000);jobs.set(id,{resolve,reject,timer});worker.postMessage({id,type,...body},transfer);
  });
 }
 async function prepare(){
  if(ready)return;if(preparing)return preparing;
  loading=true;message='正在这台设备准备模型，首次可能需要一点时间…';onChange();
  preparing=request('load').then(()=>{ready=true;message='本地模型已就绪 · 照片不上传 · 无需 API Key。';}).catch(e=>{message=e.message;throw e;}).finally(()=>{loading=false;preparing=null;onChange();});return preparing;
 }
 async function detect(photo,signal){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  const abort=()=>reset('本地分析已取消。');signal?.addEventListener('abort',abort,{once:true});let bitmap,canvas;
  try{
   await prepare();if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
   const base64=photo.image.split(',')[1],bytes=Uint8Array.from(env.atob(base64),c=>c.charCodeAt(0));bitmap=await env.createImageBitmap(new Blob([bytes],{type:'image/jpeg'}));
   const ratio=Math.min(1,640/Math.max(bitmap.width,bitmap.height)),width=Math.max(1,Math.round(bitmap.width*ratio)),height=Math.max(1,Math.round(bitmap.height*ratio));canvas=env.document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('浏览器无法读取照片，请用 Chrome / Edge 重试。');ctx.drawImage(bitmap,0,0,width,height);const pixels=ctx.getImageData(0,0,width,height).data;
   if(signal?.aborted)throw new DOMException('Cancelled','AbortError');const r=await request('detect',{width,height,pixels:pixels.buffer},[pixels.buffer]);return localObjectCards(r.predictions,r.width,r.height);
  }finally{signal?.removeEventListener('abort',abort);bitmap?.close();if(canvas)canvas.width=canvas.height=1;}
 }
 return {state,prepare,detect,cancel:()=>reset(),dispose:()=>{if(worker||jobs.size)reset('本地模型按需准备，照片不上传。');}};
}
