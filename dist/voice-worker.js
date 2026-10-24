// Local Supertonic inference. English text never leaves this worker.
// Model: Supertonic 3 (OpenRAIL-M). Runtime: ONNX Runtime Web (MIT).
import {MODEL_BASE,ORT_BASE,PACK_FILES,PACK_CACHE,validVoice} from './voice-config.js';
let ort,models,cfg,indexer,styles={},chain=Promise.resolve();
const emit=(id,type,detail={})=>postMessage({id,type,...detail});
async function cached(url,id){
 const cache=await caches.open(PACK_CACHE);let response=await cache.match(url);
 if(!response){
  const fresh=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer'});
  if(!fresh.ok||fresh.type==='opaque')throw Error('语音资源下载失败，请检查网络后重试。');
  let count=0,lastReport=0;const reader=fresh.body.getReader();
  const body=new ReadableStream({async pull(controller){const {value,done}=await reader.read();if(done){controller.close();return;}count+=value.byteLength;if(Date.now()-lastReport>300){lastReport=Date.now();emit(id,'progress',{message:`下载 ${url.split('/').at(-1)} · ${(count/1048576).toFixed(1)} MB`});}controller.enqueue(value);},cancel(){return reader.cancel();}});
  await cache.put(url,new Response(body,{headers:fresh.headers}));response=await cache.match(url);
 }
 return response;
}
async function load(id){
 if(models)return;
 for(let i=0;i<PACK_FILES.length;i++){emit(id,'progress',{message:`准备免费语音包 ${i+1}/${PACK_FILES.length} · 首次约 400 MB`});await cached(PACK_FILES[i],id);}
 const bytes=async url=>(await cached(url,id)).arrayBuffer(),json=async url=>(await cached(url,id)).json();
 const moduleURL=URL.createObjectURL(new Blob([await bytes(ORT_BASE+'ort.wasm.min.mjs')],{type:'text/javascript'}));
 const factoryURL=URL.createObjectURL(new Blob([await bytes(ORT_BASE+'ort-wasm-simd-threaded.mjs')],{type:'text/javascript'}));
 try{
  ort=await import(moduleURL);ort.env.wasm.numThreads=1;ort.env.wasm.proxy=false;
  ort.env.wasm.wasmPaths={mjs:factoryURL};ort.env.wasm.wasmBinary=new Uint8Array(await bytes(ORT_BASE+'ort-wasm-simd-threaded.wasm'));
  cfg=await json(MODEL_BASE+'onnx/tts.json');indexer=await json(MODEL_BASE+'onnx/unicode_indexer.json');
  const sessions=[];
  try{for(const name of ['duration_predictor','text_encoder','vector_estimator','vocoder']){emit(id,'progress',{message:'正在手机本地准备声音…'});sessions.push(await ort.InferenceSession.create(await bytes(MODEL_BASE+'onnx/'+name+'.onnx'),{executionProviders:['wasm'],graphOptimizationLevel:'all'}));}}
  catch(error){await Promise.allSettled(sessions.map(s=>s.release()));throw error;}
  for(const name of ['M2','M4','M5']){const data=await json(MODEL_BASE+'voice_styles/'+name+'.json');styles[name]={ttl:new ort.Tensor('float32',Float32Array.from(data.style_ttl.data.flat(Infinity)),data.style_ttl.dims),dp:new ort.Tensor('float32',Float32Array.from(data.style_dp.data.flat(Infinity)),data.style_dp.dims)};}
  models=sessions;
 }finally{URL.revokeObjectURL(moduleURL);URL.revokeObjectURL(factoryURL);}
}
const tensor=(data,dims)=>new ort.Tensor('float32',data,dims);
function wavFile(data,rate){const b=new ArrayBuffer(44+data.length*2),v=new DataView(b);const str=(at,s)=>[...s].forEach((c,i)=>v.setUint8(at+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,b.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,data.length*2,true);for(let i=0;i<data.length;i++)v.setInt16(44+2*i,Math.max(-1,Math.min(1,data[i]))*32767,true);return b;}
async function synthesize(raw,voice){
 if(typeof raw!=='string'||raw.length>300||!raw.trim()||!validVoice(voice)||voice==='device')throw Error('请选择有效男声，并每次朗读不超过 300 个字符。');
 const text='<en>'+raw.normalize('NFKD').replace(/[’‘]/g,"'").replace(/[—–]/g,'-').trim()+(/[.!?]$/.test(raw.trim())?'':'.')+'</en>';
 const ids=new ort.Tensor('int64',BigInt64Array.from([...text].map(c=>BigInt(indexer[c.charCodeAt(0)]??-1))),[1,text.length]);
 const mask=tensor(new Float32Array(text.length).fill(1),[1,1,text.length]);
 const [dp,enc,est,voc]=models,style=styles[voice],held=[ids,mask];
 try{
  const duration=await dp.run({text_ids:ids,text_mask:mask,style_dp:style.dp});held.push(...Object.values(duration));
  const seconds=Number(Object.values(duration)[0].data[0]);if(!Number.isFinite(seconds)||seconds<=0||seconds>45)throw Error('这段内容过长，请分句朗读。');
  const encoded=await enc.run({text_ids:ids,text_mask:mask,style_ttl:style.ttl});held.push(...Object.values(encoded));
  const chunk=cfg.ae.base_chunk_size*cfg.ttl.chunk_compress_factor,length=Math.ceil(Math.floor(seconds*cfg.ae.sample_rate)/chunk),dim=cfg.ttl.latent_dim*cfg.ttl.chunk_compress_factor;
  const random=Float32Array.from({length:dim*length},()=>Math.sqrt(-2*Math.log(Math.max(.0001,Math.random())))*Math.cos(2*Math.PI*Math.random()));
  const latentMask=tensor(new Float32Array(length).fill(1),[1,1,length]),total=tensor(new Float32Array([8]),[1]);held.push(latentMask,total);
  let latent=tensor(random,[1,dim,length]);
  try{for(let i=0;i<8;i++){const step=tensor(new Float32Array([i]),[1]);let output;try{output=await est.run({noisy_latent:latent,text_emb:Object.values(encoded)[0],style_ttl:style.ttl,text_mask:mask,latent_mask:latentMask,current_step:step,total_step:total});}finally{step.dispose();}latent.dispose();latent=Object.values(output)[0];}
   const result=await voc.run({latent});held.push(...Object.values(result));const data=Object.values(result)[0].data.subarray(0,Math.floor(seconds*cfg.ae.sample_rate));
   if(!data.every(Number.isFinite))throw Error('声音生成未完成，请重试。');return wavFile(data,cfg.ae.sample_rate);
  }finally{latent.dispose();}
 }finally{for(const t of held)t.dispose();}
}
onmessage=({data})=>{chain=chain.then(async()=>{try{await load(data.id);if(data.type==='load')emit(data.id,'ready');else{const buffer=await synthesize(data.text,data.voice);postMessage({id:data.id,type:'audio',buffer},[buffer]);}}catch(error){console.error('Local voice preparation failed:',String(error));emit(data.id,'error',{message:'免费语音暂未准备好。请用 Wi-Fi 重试；设备内存不足时可继续用设备语音。'});}});};
