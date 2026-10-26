/* COCO-SSD runs in this worker. Only bundled model GETs leave the worker;
   image pixels arrive by transferable buffer and are never sent over HTTP. */
let detector,loading;
async function loadLocalWorld(){
 if(detector)return detector;
 if(!loading)loading=(async()=>{
  importScripts(new URL('./vendor/world/tf.min.js',self.location.href).href,new URL('./vendor/world/coco-ssd.min.js',self.location.href).href);
  await tf.setBackend('cpu');await tf.ready();
  detector=await cocoSsd.load({base:'lite_mobilenet_v2',modelUrl:new URL('./models/world/model.json',self.location.href).href});return detector;
 })().catch(e=>{loading=null;throw e;});
 return loading;
}
let active=false;
self.onmessage=async({data:m})=>{
 if(active){self.postMessage({id:m.id,error:'上一张照片还在本地分析，请稍候。'});return;}
 active=true;let input;
 try{
  const model=await loadLocalWorld();
  if(m.type==='load'){self.postMessage({id:m.id,ready:true});return;}
  if(m.type!=='detect'||!Number.isInteger(m.width)||!Number.isInteger(m.height)||m.width<1||m.height<1||Math.max(m.width,m.height)>640||!(m.pixels instanceof ArrayBuffer)||m.pixels.byteLength!==m.width*m.height*4)throw new Error('Invalid pixel input');
  const rgba=new Uint8ClampedArray(m.pixels),rgb=new Uint8Array(m.width*m.height*3);
  for(let i=0,j=0;i<rgba.length;i+=4){rgb[j++]=rgba[i];rgb[j++]=rgba[i+1];rgb[j++]=rgba[i+2];}
  input=tf.tensor3d(rgb,[m.height,m.width,3],'int32');const predictions=await model.detect(input,12,.55);
  self.postMessage({id:m.id,predictions,width:m.width,height:m.height});
 }catch(e){self.postMessage({id:m.id,error:detector?'本地识别没有完成，请换一张照片重试。':'本地模型暂未准备好。请联网刷新、等待离线资源完成后重试；不会改用收费接口。'});}
 finally{input?.dispose();active=false;}
};
