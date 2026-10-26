// Combined with the audited public app shell and read-only MCP implementation at build time.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const snapshotKey=id=>'learning/'+encodeURIComponent(id)+'.json';
const visionActive=new Set();
const visionLimit=createVisionLimiter();
async function bodyText(request,max){const reader=request.body?.getReader();if(!reader)throw new Error('请求内容为空。');let bytes=0;const chunks=[];try{while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>max)throw new Error('本次分享内容过大。');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}const all=new Uint8Array(bytes);let at=0;for(const value of chunks){all.set(value,at);at+=value.length;}return new TextDecoder().decode(all);}
export default {async fetch(request,env){
 try{
  const url=new URL(request.url),user=request.headers.get('oai-authenticated-user-id');
  const readSnapshot=async id=>{const file=await env.BUCKET?.get(snapshotKey(id));return file?JSON.parse(await file.text()):null;};
  if(url.pathname.startsWith('/api/vision/')){
   if(!user)return json({error:'请先登录这个私有学习站点。'},401);
   const configuredVision=visionConfig(env),config=configuredVision?.provider==='compatible'?configuredVision:null;
   if(request.method==='GET'&&url.pathname==='/api/vision/status')return json(visionStatus(config));
   if(request.method!=='POST'||url.pathname!=='/api/vision/scan')return json({error:'接口不存在。'},404);
   if(request.headers.get('origin')!==url.origin||request.headers.get('x-yan-client')!=='1'||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'照片请求来源不匹配。'},403);
   if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'照片请求需为 JSON。'},415);
   if(!config)return json({error:'站点尚未配置服务端视觉接口。请在站点运行设置配置视觉模型；密钥不能填入此页面。'},503);
   if(visionActive.has(user))return json({error:'上一张照片仍在识别，请稍候。'},429);
   visionActive.add(user);
   try{
    const raw=JSON.parse(await bodyText(request,1250000));validateWorldImage(raw);visionLimit(user);
    // Durable per-user count. This and the in-isolate lock are cost guards, not a billing cap.
    if(!env.BUCKET)return json({error:'扫描限额存储尚未配置。'},503);
    const day=new Date().toISOString().slice(0,10),key='vision-limits/'+encodeURIComponent(user)+'.json',saved=await env.BUCKET.get(key),old=saved?JSON.parse(await saved.text()):{},count=old.day===day?old.count:0;
    if(count>=30)return json({error:'今日扫描已达 30 次，明天再探索；收藏与复习仍可使用。'},429);
    if(old.last&&Date.now()-old.last<10000)return json({error:'请间隔至少 10 秒再扫描。'},429);
    await env.BUCKET.put(key,JSON.stringify({day,count:count+1,last:Date.now()}));
    const result=await requestVision(config,raw,{signal:AbortSignal.timeout(60000)});return json(result);
   }catch(e){return json({error:e.status?e.message:e.name==='TimeoutError'||e.name==='AbortError'?'识别已超时，请重试。':'这次识别未完成，请重试或更换视觉模型。'},e.status||502);}finally{visionActive.delete(user);}
  }
  if(url.pathname==='/mcp'){
   if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST'}});
   if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return json({error:'JSON required'},415);
   if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Origin not allowed'},403);
   let message;try{message=JSON.parse(await bodyText(request,65536));}catch{return json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}},400);}
   const rpc=createLearningMcp({words:PUBLIC_WORDS,materials:PUBLIC_MATERIALS,readSnapshot}),result=await rpc(message,user);
   return result===null?new Response(null,{status:202}):json(result);
  }
  if(url.pathname.startsWith('/api/connections/')){
   if(!user)return json({error:'请先在这个私有学习站点登录 ChatGPT。'},401);
   if(request.method==='GET'&&url.pathname==='/api/connections/status'){const shared=await readSnapshot(user);return json({account:request.headers.get('oai-authenticated-user-email')||'已登录用户',mcpUrl:new URL('/mcp',url).href,sharedDate:shared?.date||null,identityOnly:true});}
   if(!['POST','DELETE'].includes(request.method)||url.pathname!=='/api/connections/snapshot')return json({error:'接口不存在。'},404);
   if(request.headers.get('origin')!==url.origin||request.headers.get('x-yan-client')!=='1'||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'分享请求来源不匹配。'},403);
   if(!env.BUCKET)return json({error:'私有分享存储尚未配置。'},503);
   if(request.method==='DELETE'){await env.BUCKET.delete(snapshotKey(user));return json({removed:true});}
   if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({error:'分享内容需为 JSON。'},415);
   const snapshot=validateSharedSnapshot(JSON.parse(await bodyText(request,512*1024)));
   await env.BUCKET.put(snapshotKey(user),JSON.stringify(snapshot),{httpMetadata:{contentType:'application/json'}});return json({shared:true,date:snapshot.date});
  }
  if(url.pathname.startsWith('/api/'))return json({error:'这个私有站点只提供登录身份和 MCP 分享，不提供 ChatGPT 额度生成服务。请使用已有 API 或本机授权。'},404);
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});
  const name=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1)),asset=PUBLIC_ASSETS[name];
  if(!asset)return new Response('Not found',{status:404});
  const [type,data,binary]=asset,bytes=binary?Uint8Array.from(atob(data),x=>x.charCodeAt(0)):data;
  return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
 }catch{return json({error:'操作未完成。请检查分享内容或稍后重试，原有学习记录仍在浏览器。'},400);}
}};
