import * as C from './core.js';
import {parseWorldResult,cleanWorldCard,layoutWorldLabels,WORLD_IMAGE_LIMIT} from './world-core.js';
import {createSpeech} from './speech.js';
import {LOCAL_SERVICE,HOSTED_SERVICE} from './runtime.js';
import {PRIVATE_LEARNING_URL} from './connection-info.js';

export function cameraHelp(error,secure=true){
 if(!secure)return '相机需要 HTTPS。请在手机 Chrome / Edge 打开正式网址，或先上传相册照片。局域网 HTTP 地址通常不能打开相机。';
 return ({NotAllowedError:'相机权限没有打开。请点浏览器地址栏的网站权限，允许相机后重试；也可以上传照片。',NotFoundError:'没有找到可用摄像头，试试上传照片。',NotReadableError:'摄像头可能被其他应用占用，请关闭后重试，或上传照片。',OverconstrainedError:'这个摄像头不支持请求的画面，请使用默认相机或上传照片。'})[error?.name]||'相机暂时无法启动，请在 Chrome / Edge 重试，或上传照片。';
}
export async function compressWorldPhoto(source,width,height,env=globalThis){
 if(!width||!height||width*height>32000000)throw new Error('照片尺寸过大或无法读取，请选择一张较小的照片。');
 const ratio=Math.min(1,1280/Math.max(width,height)),w=Math.max(1,Math.round(width*ratio)),h=Math.max(1,Math.round(height*ratio)),canvas=env.document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('浏览器无法处理照片，请用 Chrome / Edge 重试。');ctx.drawImage(source,0,0,w,h);
 let image;for(const q of [.76,.6,.42]){image=canvas.toDataURL('image/jpeg',q);if(image.length<=WORLD_IMAGE_LIMIT)break;}
 canvas.width=canvas.height=1;if(image.length>WORLD_IMAGE_LIMIT)throw new Error('压缩后的照片仍过大，请靠近一个物品再拍。');return {image,width:w,height:h};
}
export function createWorld({esc,button,icon,getState,commit,render,route,toast,openWord,getPair=()=>'',env=globalThis,fetcher=(...args)=>fetch(...args),service=LOCAL_SERVICE||HOSTED_SERVICE}){
 let stream=null,cameraOpening=false,cameraVersion=0,photo=null,result=null,selected=null,view='explore',error='',busy=false,consent=false,controller=null,generation=0,status=null,checked=false,lastScan=0;
 const speech=createSpeech({toast,env});
 const refresh=()=>{if(route()==='world')render();};
 const stopCamera=()=>{cameraVersion++;cameraOpening=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}};
 const saved=card=>(getState().world?.collection||[]).find(x=>x.word===card.word);
 async function api(path,body,signal){
  if(!service)throw new Error('当前是静态网页版。照片识别需要带服务端的安全站点；本页不会读取聊天密钥或直连付费接口。');
  const pair=getPair(),res=await fetcher('./api/vision/'+path,{method:body?'POST':'GET',headers:{'X-Yan-Client':'1',...(pair?{'X-Yan-Pair':pair}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',credentials:'same-origin',redirect:'error',signal});
  const data=await res.json().catch(()=>{throw new Error('当前网址没有提供视觉服务，请检查部署设置。');});if(!res.ok)throw new Error(data.error||'这次识别没有完成，请重试。');return data;
 }
 async function check(){checked=true;try{status=await api('status');error='';}catch(e){status=null;error=e.message;}refresh();}
 async function startCamera(){
  if(cameraOpening||busy)return;
  stopCamera();const serial=cameraVersion;error='';photo=null;result=null;selected=null;consent=false;view='explore';
  if(!env.isSecureContext||!env.navigator?.mediaDevices?.getUserMedia){error=cameraHelp(null,!!env.isSecureContext);refresh();return;}
  cameraOpening=true;refresh();
  try{const acquired=await env.navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}},audio:false});if(serial!==cameraVersion||route()!=='world'){acquired.getTracks().forEach(t=>t.stop());return;}stream=acquired;cameraOpening=false;refresh();}
  catch(e){if(serial===cameraVersion){cameraOpening=false;error=cameraHelp(e);refresh();}}
 }
 function setPhoto(value){stopCamera();speech.stop();photo=value;result=null;selected=null;consent=false;error='';view='explore';refresh();}
 async function capture(){try{const video=env.document.querySelector('#world-camera');if(!video?.videoWidth)throw new Error('相机画面还在准备，请稍后拍摄。');setPhoto(await compressWorldPhoto(video,video.videoWidth,video.videoHeight,env));}catch(e){error=e.message;refresh();}}
 async function upload(file){
  if(busy)return;
  if(!file)return;
  const serial=++generation;error='';stopCamera();
  try{if(file.size>20*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('请选择 20 MB 以内的 JPEG、PNG 或 WebP 照片。HEIC 请先转为 JPEG。');
   const bitmap=await env.createImageBitmap(file);try{const value=await compressWorldPhoto(bitmap,bitmap.width,bitmap.height,env);if(serial===generation&&route()==='world')setPhoto(value);}finally{bitmap.close();}
  }catch(e){if(serial===generation){error=e.message||'这张照片无法读取，请换一张。';refresh();}}
 }
 async function scan(){
  if(busy||result)return;
  error='';if(!photo){error='先拍一张照片，看看今天会遇见什么。';refresh();return;}if(!consent){error='请先核对照片，勾选本次发送许可。';refresh();return;}
  if(!service||!status?.configured){error='先配置服务端视觉连接，再回来扫描；照片仍只在本页。';refresh();return;}
  if(Date.now()-lastScan<10000){error='让我们慢一点，间隔 10 秒再扫描。';refresh();return;}
  const serial=++generation,input={...photo,consent:true};busy=true;consent=false;lastScan=Date.now();controller=new AbortController();const active=controller,timer=setTimeout(()=>active.abort(),65000);refresh();
  try{const output=await api('scan',input,active.signal);if(serial!==generation||route()!=='world')return;result=parseWorldResult(output);selected=null;if(!result.items.length)error='这张照片还没有发现清楚的物品。换一个角度，或靠近一点再试试。';}
  catch(e){if(serial===generation)error=active.signal.aborted?'这次扫描已取消或超时。没有添加识别词，可以重新拍摄或稍后重试。':e.message;}
  finally{clearTimeout(timer);if(serial===generation){busy=false;controller=null;refresh();}}
 }
 function cancel(){generation++;controller?.abort();controller=null;busy=false;consent=false;error='已停止等待。本次请求若已到服务商，仍可能产生费用。';refresh();}
 function learningCard(card){if(!card)return '';const item=saved(card);return `<section class="glass world-learning" aria-labelledby="world-card-title"><div class="panel-head"><span class="pill blue">${item?'已收入探索手册':'遇见一个新表达'}</span>${button('收起','world-close','','text-btn')}</div><span class="eyebrow">A WORD FROM YOUR WORLD</span><h2 id="world-card-title" tabindex="-1" lang="en">${esc(card.word)}</h2><p class="world-ipa">${esc(card.ipa||'音标待核对')}</p><p class="world-meaning">${esc(card.meaning)}</p><div class="actions">${button(icon('volume')+' 英式发音','world-speak','data-accent="en-GB"','btn secondary')}${button(icon('volume')+' 美式发音','world-speak','data-accent="en-US"','btn secondary')}${button('停止','world-stop','','text-btn')}</div><p class="caption" data-speech-status role="status">设备英语语音 · 请开启媒体音量，部分声音需联网。</p><div class="world-example"><small>把眼前的画面，说成一句英语</small><p lang="en">${esc(card.example)}</p><span>${esc(card.translation)}</span></div><div class="world-expression"><small>口语里，也可以这样说</small><p lang="en">${esc(card.expression)}</p><span>${esc(card.expressionTranslation)}</span></div><p class="caption">AI 生成的场景学习卡，请核对物品、释义与音标；表达适用于口语练习。</p><div class="actions">${item?button('去词库练这个词 →','world-review',`data-id="${esc(item.id)}"`):button('✧ 收进我的世界','world-collect')}<a class="text-btn" href="#words">到期复习 →</a></div></section>`;}
 function collection(){const items=getState().world?.collection||[];return `<section class="glass world-journal"><span class="eyebrow">LITTLE DISCOVERIES</span><h2>世界很大，先收集身边的小事。</h2><p>已经遇见 ${items.length} 个词。收藏词进入原来的到期复习；收藏本身不算学会。</p><div class="world-stamps">${['第一个发现','收集 5 个词','收集 20 个词'].map((label,i)=>`<span class="${items.length>=[1,5,20][i]?'unlocked':''}">✧ ${label}</span>`).join('')}</div>${items.length?`<div class="world-collection">${items.map((w,i)=>`<button class="world-found" data-action="world-found" data-index="${i}"><span aria-hidden="true">✧</span><strong lang="en">${esc(w.word)}</strong><span>${esc(w.meaning)}</span><small>${esc(w.scene||'身边的发现')} · ${esc(w.foundAt)}</small></button>`).join('')}</div>`:`<div class="world-empty-journal"><span aria-hidden="true">🌱</span><p>一只杯子，一本书，一株植物。<br>你认识的世界，会一点点在这里长出来。</p>${button('去遇见第一个词','world-explore')}</div>`}</section>${thisCard()}`;}
 const thisCard=()=>learningCard(selected);
 function page(){
  const count=getState().world?.collection.length||0,items=result?.items||[],ratio=photo?photo.width/photo.height:3/4,positions=layoutWorldLabels(items,350,350/ratio);
  return `<div class="world-space"><header class="world-heading"><div><span class="eyebrow">SEE THE WORLD</span><h1>看见英语 <span aria-hidden="true">🌍</span></h1><p>你的世界里，藏着下一句英语。</p></div><span class="world-count">✧ ${count} 个发现</span></header><div class="world-tabs" role="group" aria-label="探索与收藏">${button('探索世界','world-explore',`aria-pressed="${view==='explore'}" ${busy?'disabled':''}`,'filter '+(view==='explore'?'active':''))}${button('我的探索手册 · '+count,'world-journal',`aria-pressed="${view==='journal'}" ${busy?'disabled':''}`,'filter '+(view==='journal'?'active':''))}</div>${view==='journal'?collection():`<div class="world-explore-layout"><section class="world-viewer" aria-label="探索取景器"><div class="world-frame" style="aspect-ratio:${ratio}">${photo?`<img class="world-photo" src="${photo.image}" alt="本次待识别照片，只保留在当前页面">`:stream?'<video id="world-camera" autoplay muted playsinline aria-label="实时相机预览"></video>':`<div class="world-welcome"><div class="world-orbit" aria-hidden="true"><i></i><span>✧</span></div><span class="eyebrow">PAUSE. LOOK. DISCOVER.</span><h2>今天，从眼前开始。</h2><p>把镜头对准一件小事，<br>看看它会带来什么新表达。</p>${button(cameraOpening?'等待相机权限…':'打开摄像头','world-camera',cameraOpening?'disabled':'','btn world-camera-start')}<small>也可以上传照片，慢慢探索。</small></div>`}<div class="world-view-top"><span>${busy?'正在寻找画面里的英语…':result?'发现停在这一刻':photo?'这一刻，值得看清':'从一个小物件开始'}</span>${stream?button('关闭相机','world-camera-off','','world-small'):''}</div>${stream?'<div class="world-reticle" aria-hidden="true"></div>':''}${photo&&items.length?`<svg class="world-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${positions.map(p=>p.anchor?`<line x1="${p.anchor.x*100}" y1="${p.anchor.y*100}" x2="${p.x*100}" y2="${p.y*100}"/><circle cx="${p.anchor.x*100}" cy="${p.anchor.y*100}" r=".7"/>`:'').join('')}</svg><div class="world-labels">${items.map((w,i)=>`<button class="world-label ${selected?.word===w.word?'selected':''} ${saved(w)?'collected':''}" style="left:${positions[i].x*100}%;top:${positions[i].y*100}%" data-action="world-label" data-index="${i}" aria-label="学习 ${esc(w.word)}">${saved(w)?'✧':'+'} <span lang="en">${esc(w.word)}</span></button>`).join('')}</div>`:''}${busy?'<div class="world-scanning" role="status"><span></span><p>给这一刻，找几个英语名字。</p></div>':''}</div><div class="world-controls">${stream?button('● 拍下这一刻','world-capture','','btn world-shutter'):photo?button('重新取景','world-camera',busy?'disabled':'','btn secondary'):''}${button(icon('upload')+' 上传照片','world-upload-open',busy?'disabled':'','btn secondary')}<input class="world-file" aria-label="选择一张探索照片" id="world-upload" type="file" accept="image/jpeg,image/png,image/webp" ${busy?'disabled':''}>${busy?button('取消扫描','world-cancel','','btn ghost'):photo&&!result?button(error?'重试扫描':'扫描这张照片 ✧','world-scan',!status?.configured?'disabled':'','btn'):''}</div><p class="world-stage-note">${result?'标签位置是 AI 对照片的估计。点一个词，把它变成自己的表达。':photo?'先核对照片，再发送。只分析这一张，不会自动连续扫描。':'实时预览只在设备上显示。拍下照片并确认扫描后，才会发送。'}</p></section><div class="world-side">${selected?thisCard():`<section class="glass world-invitation"><span class="eyebrow">A LITTLE QUEST</span><h2>${result?'点一个词，认识它。':'找到一件让你想停下来的东西。'}</h2><p>${result?esc(result.scene||'从画面里挑一个喜欢的词，听一听，再收进探索手册。'):'桌上的杯子、窗边的绿植、路过的书店。今天的英语，也可以从你的生活开始。'}</p><span class="world-quest-line">✧ 看见 → 听见 → 说一句 → 收集</span></section>`}${photo&&!result&&!busy?`<div class="world-consent glass"><label class="check-label"><input id="world-consent" type="checkbox" ${consent?'checked':''}>允许将这张压缩照片发送到 ${esc(status?.destination||'已配置的服务端视觉接口')} 识别</label><p class="caption">照片不会进入学习备份或 MCP。远程识别可能按服务商用量收费；每次手动扫描最多 5 个物品。请避开证件与私密画面。</p></div>`:''}<details class="glass world-connection" ${!status?.configured?'open':''}><summary>视觉连接 · ${status?.configured?esc(status.model):'尚未就绪'}</summary><p class="caption">${esc(status?.message||'需要服务端视觉模型；不会使用浏览器保存的聊天密钥。')}</p><div class="actions">${button('检查视觉连接','world-check','','text-btn')}<a href="#ai" class="text-btn">AI 连接设置 →</a></div>${!status?.configured?`<p class="caption">站点维护者需在服务端配置 VISION_BASE_URL、VISION_MODEL、VISION_API_KEY。支持图像输入的 OpenAI 兼容聊天接口，或本机 Ollama 视觉模型。</p><p class="caption">DeepSeek 官方现有视觉接口可使用 deepseek-flash；纯文本模型需换成支持图像的模型。密钥只放服务端。</p>${!service?`<a class="btn secondary" href="${esc(PRIVATE_LEARNING_URL||'https://yan-english-studio.maquebaixue.chatgpt.site/')}#world" target="_blank" rel="noopener noreferrer">打开安全服务端版本 ↗</a>`:''}`:''}</details></div></div>`}${error?`<div class="notice warm world-error" role="alert">${esc(error)}</div>`:''}<p class="caption world-footnote">收藏与复习保存在这台设备；学习备份包含探索词。MCP 只读取你预览并确认分享的学习副本。离开页面或切到后台会关闭摄像头。</p></div>`;
 }
 function mount(){const video=env.document.querySelector('#world-camera');if(video&&stream){video.srcObject=stream;video.play().catch(()=>{});}if(!checked&&service)void check();}
 function act(action,el){
  if(!action.startsWith('world-'))return false;
  if(action==='world-camera')void startCamera();
  if(action==='world-upload-open'&&!busy)env.document.querySelector('#world-upload')?.click();
  if(action==='world-camera-off'){stopCamera();refresh();}
  if(action==='world-capture')void capture();
  if(action==='world-scan')void scan();
  if(action==='world-cancel')cancel();
  if(action==='world-check')void check();
  if(action==='world-explore'){view='explore';selected=null;refresh();}
  if(action==='world-journal'){stopCamera();view='journal';selected=null;refresh();}
  if(action==='world-label'){selected=result?.items[Number(el.dataset.index)]||null;error='';refresh();env.document.querySelector('#world-card-title')?.focus({preventScroll:true});env.document.querySelector('.world-learning')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
  if(action==='world-found'){selected=getState().world?.collection[Number(el.dataset.index)]||null;refresh();env.document.querySelector('.world-learning')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
  if(action==='world-close'){selected=null;speech.stop();refresh();}
  if(action==='world-speak'&&selected)speech.speak(selected.word,{accent:el.dataset.accent,device:true});
  if(action==='world-stop')speech.stop();
  if(action==='world-collect'&&selected){try{const r=commit(s=>C.collectWorld(s,cleanWorldCard(selected),result?.scene,C.today()));toast(r.added?'✧ 收进你的世界了。下次复习，会再遇见它。':'这个词已经在探索手册里了。');refresh();env.document.querySelector('.world-label.collected')?.classList.add('just-collected');}catch(e){error=e.message;refresh();}}
  if(action==='world-review')openWord(el.dataset.id);
  return true;
 }
 function input(e){if(e.target.id==='world-consent')consent=e.target.checked;if(e.type==='change'&&e.target.id==='world-upload'){const file=e.target.files?.[0];e.target.value='';void upload(file);}}
 function leave(){stopCamera();generation++;controller?.abort();controller=null;busy=false;consent=false;photo=null;result=null;selected=null;speech.stop();}
 function hidden(){stopCamera();if(busy)cancel();refresh();}
 return {page,mount,act,input,leave,hidden,upload,scan,startCamera};
}
