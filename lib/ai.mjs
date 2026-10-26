import {readFile, mkdir, writeFile, rename} from 'node:fs/promises';
import {randomBytes, timingSafeEqual} from 'node:crypto';
import path from 'node:path';
import {visionConfig,visionStatus,requestVision,createVisionLimiter} from './vision.mjs';

import {TASKS,CHAT_LIMITS,buildTutorMessages} from '../dist/ai-prompts.js';
export {TASKS,CHAT_LIMITS,buildTutorMessages};
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
export function validateConfig(raw,previous={}) {
 if(!raw||!['ollama','compatible','chatgpt'].includes(raw.provider))throw fail('请选择本地 Ollama、兼容 API 或已授权 ChatGPT。');
 const model=String(raw.model||'').trim();
 if(!model||model.length>160||/[\r\n]/.test(model))throw fail('请填写有效的模型名称。');
 if(raw.provider==='chatgpt')return {provider:'chatgpt',model};
 if(raw.provider==='ollama') {
  if(/cloud/i.test(model))throw fail('本地模式不接受 cloud 模型，请选择已下载的本地模型。');
  return {provider:'ollama',model};
 }
 let url;try{url=new URL(raw.baseUrl);}catch{throw fail('请填写完整的 API Base URL，例如 https://服务商域名/v1。');}
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw fail('兼容 API 必须使用无账号、查询参数或片段的 HTTPS 地址。');
 const baseUrl=url.href.replace(/\/+$/,'');
 // A key is reused only for the exact same endpoint, never silently sent to a new provider.
 const apiKey=raw.clearKey?'':String(raw.apiKey||((previous.baseUrl===baseUrl)?previous.apiKey:'')||'').trim();
 if(apiKey.length>4096||/[\r\n]/.test(apiKey))throw fail('API 密钥格式无效。');
 if(!apiKey)throw fail('请输入此接口的 API 密钥；密钥仅写入本机 .local 文件夹。');
 return {provider:'compatible',model,baseUrl,apiKey};
}
export async function limitedJson(response,max=1024*1024) {
 if(!response.ok)throw fail(response.status===401?'接口拒绝认证，请检查本机配置中的密钥。':response.status===429?'接口达到使用限制，请稍后重试。':`模型服务返回 HTTP ${response.status}，请检查服务和模型配置。`,502);
 const reader=response.body.getReader();let size=0;const chunks=[];
 try {while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max)throw fail('模型返回内容过大，请缩短问题后重试。',502);chunks.push(value);}} finally {await reader.cancel().catch(()=>{});}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail('模型服务返回了无法读取的内容。',502);}
}
export async function requestTutor(config,input,fetcher=fetch,signal) {
 const messages=buildTutorMessages(input),{task}=input;
 const local=config.provider==='ollama';
 const url=local?'http://127.0.0.1:11434/api/chat':`${config.baseUrl}/chat/completions`;
 const body=local?{model:config.model,messages,stream:false,think:false,options:{num_predict:1600,num_ctx:8192}}:{model:config.model,messages,stream:false};
 const response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json',...(!local?{Authorization:`Bearer ${config.apiKey}`}:{})},body:JSON.stringify(body),redirect:'error',signal:signal||AbortSignal.timeout(180000)});
 const result=await limitedJson(response);const answer=local?result.message?.content:result.choices?.[0]?.message?.content;
 if(typeof answer!=='string'||!answer.trim())throw fail('模型没有返回文字答案，请检查模型是否支持聊天。',502);
 return {answer:answer.slice(0,task==='companion'?CHAT_LIMITS.messageCharacters:24000),model:config.model,provider:config.provider,label:task==='companion'?'AI 陪伴对话 · 非真人':'AI 学习建议 · 非官方评分'};
}
export function createAiService({directory,hosts,port,fetcher=fetch,chatgpt,visionEnv=process.env}) {
 const file=path.join(directory,'ai.json'),pairCode=randomBytes(6).toString('hex');
 let config={provider:'ollama',model:'qwen3:4b'},busy=false;
 const limitVision=createVisionLimiter();
 const ready=readFile(file,'utf8').then(data=>{config=validateConfig(JSON.parse(data));}).catch(error=>{if(error.code!=='ENOENT')console.warn('AI config could not be loaded; using local Ollama defaults.');});
 const loopback=req=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
 const equal=value=>typeof value==='string'&&value.length===pairCode.length&&timingSafeEqual(Buffer.from(value),Buffer.from(pairCode));
 function access(req){
  const host=req.headers.host;
  if(!hosts.has(host))throw fail('无法识别的访问地址。请使用启动窗口中的网址。',403);
  if(req.headers.origin&&req.headers.origin!==`http://${host}`)throw fail('仅允许同一学习网页发起请求。',403);
  if(req.headers['sec-fetch-site']==='cross-site'||req.headers['x-yan-client']!=='1')throw fail('请求来源无效。',403);
  if(!loopback(req)&&!equal(req.headers['x-yan-pair']))throw fail('请先填写电脑 AI 页面显示的本次配对码。',401);
 }
 const json=(res,status,data)=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(data));
 async function readBody(req,max=60000){const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>max)throw fail('请求过大。',413);chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail('请求不是有效的 JSON。');}}
 async function models(){const data=await limitedJson(await fetcher('http://127.0.0.1:11434/api/tags',{signal:AbortSignal.timeout(4000),redirect:'error'}));return (data.models||[]).filter(m=>typeof m.name==='string'&&!/cloud/i.test(m.name)&&!m.remote_host&&!m.remote_model).map(m=>m.name);}
 return async(req,res,pathname)=>{
  let timer,controller;
  try{
   await ready;access(req);
   if(req.method==='GET'&&pathname==='/api/vision/status')return json(res,200,visionStatus(visionConfig(visionEnv,config)));
   if(req.method==='POST'&&pathname==='/api/vision/scan'){
    if(busy)throw fail('已有一条 AI 请求正在处理，请稍后再试。',429);
    const input=await readBody(req,1250000);
    if(busy)throw fail('已有一条 AI 请求正在处理，请稍后再试。',429);
    busy=true;try{const selected=visionConfig(visionEnv,config);if(!selected)throw fail('请配置服务端视觉接口。ChatGPT 文字授权不能直接用于照片识别。',503);if(input.consent!==true)throw fail('请先允许发送这张照片。');limitVision('local');controller=new AbortController();timer=setTimeout(()=>controller.abort(),60000);const onClose=()=>controller.abort();res.on('close',onClose);try{const result=await requestVision(selected,input,{fetcher,signal:controller.signal});if(!res.destroyed)json(res,200,result);}finally{res.off('close',onClose);}}finally{busy=false;}return;
   }
   if(req.method==='GET'&&pathname==='/api/ai/status'){
    let available=[],status='unverified',message='API 已配置，尚未发送真实请求。';
    if(config.provider==='chatgpt'){const auth=await chatgpt?.status();status=auth?.connected?'authorized':'offline';message=auth?.message||'请先在电脑本机页面登录 ChatGPT。';}
    if(config.provider==='ollama')try{available=await models();status=available.includes(config.model)?'ready':'model-missing';message=status==='ready'?'本地服务可用，已找到所选模型。尚未验证生成结果。':'本地服务可用，请选择或下载一个本地模型。';}catch{status='offline';message='未检测到本机 Ollama。安装并启动 Ollama 后再刷新。';}
    return json(res,200,{provider:config.provider,model:config.model,baseUrl:config.provider==='chatgpt'?'https://api.openai.com/v1':config.baseUrl||'',keyConfigured:config.provider==='chatgpt'?status==='authorized':!!config.apiKey,models:available,status,message,canConfigure:loopback(req),...(loopback(req)?{pairCode}:{})});
   }
   if(req.method==='POST'&&pathname==='/api/ai/config'){
    if(!loopback(req))throw fail('接口设置只能在电脑的 127.0.0.1 页面修改。',403);
    if(busy)throw fail('请等待本次 AI 请求结束，再修改配置。',409);
    const input=await readBody(req);
    if(busy)throw fail('请等待本次 AI 请求结束，再修改配置。',409);
    busy=true;
    try{const next=validateConfig(input,config);await mkdir(directory,{recursive:true});await writeFile(file+'.tmp',JSON.stringify(next,null,2),{mode:0o600});await rename(file+'.tmp',file);config=next;return json(res,200,{saved:true});}finally{busy=false;}
   }
   if(req.method==='POST'&&pathname==='/api/ai/tutor'){
    if(busy)throw fail('已有一条请求正在处理，请稍后再试。',429);
    const input=await readBody(req);
    // Acquire after reading the body and before any model/configuration await.
    // Only the invocation which acquired the lock may release it.
    if(busy)throw fail('已有一条请求正在处理，请稍后再试。',429);
    busy=true;const requestConfig={...config};let onClose;
    try{
     if(requestConfig.provider!=='ollama'&&input.allowRemote!==true)throw fail('请勾选允许把本次文本发送到已配置的远程服务。');
     if(requestConfig.provider==='ollama'&&!(await models()).includes(requestConfig.model))throw fail('本地模型尚未下载或不可用，请在连接设置中检查。',503);
     controller=new AbortController();timer=setTimeout(()=>controller.abort(),180000);onClose=()=>controller.abort();res.on('close',onClose);
     const answer=requestConfig.provider==='chatgpt'?await chatgpt.request(input,requestConfig.model,controller.signal):await requestTutor(requestConfig,input,fetcher,controller.signal);if(!res.destroyed)json(res,200,answer);
    }finally{busy=false;if(onClose)res.off('close',onClose);}
    return;
   }
   json(res,404,{error:'接口不存在。'});
  }catch(error){if(!res.destroyed)json(res,error.status||503,{error:error.status?error.message:controller?.signal.aborted?'请求已取消或超过 3 分钟，请缩短文本或使用更小的模型。':'无法连接模型服务。请确认 Ollama 正在运行，或检查 API 配置和网络。'});}
  finally{clearTimeout(timer);}
 };
}
