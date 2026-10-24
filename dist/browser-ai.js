import {buildTutorMessages} from './ai-prompts.js';

export const API_STORAGE_KEY='yan-english-studio:browser-api:v1';
export function validateBrowserConfig(raw,previous={}){
 let url;try{url=new URL(String(raw.baseUrl||'').trim());}catch{throw new Error('请填写完整的 HTTPS API 地址。');}
 if(url.href.length>2048||url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error('API 地址需使用 HTTPS，不能包含账号、查询参数或 #。');
 const host=url.hostname.toLowerCase();
 if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.includes(':')||/^\d+\.\d+\.\d+\.\d+$/.test(host))throw new Error('手机直连请填写服务商的公开 HTTPS 域名，不能填写本机或局域网 IP。');
 const baseUrl=url.href.replace(/\/+$/,'').replace(/\/chat\/completions$/,'');
 const model=String(raw.model||'').trim();
 if(!model||model.length>160||/[\r\n]/.test(model))throw new Error('请填写服务商实际提供的模型名称。');
 // Never reuse a secret when the destination changes, including a path change.
 const apiKey=String(raw.apiKey||(previous.baseUrl===baseUrl?previous.apiKey:'')||'').trim();
 if(!apiKey||apiKey.length>4096||/[\r\n]/.test(apiKey))throw new Error('请填写这个 API 地址的有效密钥；更换地址需要重新填写。');
 return {baseUrl,model,apiKey};
}

async function readAnswer(response){
 if(!response.ok){
  const error=new Error(response.status===401||response.status===403?'API 拒绝认证，请检查密钥和模型权限。':response.status===429?'API 使用额度或请求频率已达限制，请稍后再试。':`API 返回 HTTP ${response.status}。请检查地址、模型名称和服务商状态。`);
  await response.body?.cancel().catch(()=>{});throw error;
 }
 if(!response.body)throw new Error('API 没有返回可读取的内容。');
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024)throw new Error('API 返回内容过大，请缩短问题后重试。');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 let result;try{result=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Error('API 返回的格式无法读取，需要兼容聊天接口。');}
 const answer=result?.choices?.[0]?.message?.content;
 if(typeof answer!=='string'||!answer.trim())throw new Error('模型没有返回文字，请检查模型是否支持聊天。');
 return answer;
}

export function createBrowserAI({storage=()=>globalThis.localStorage,fetcher=(...args)=>fetch(...args)}={}){
 let config=null,persistent=false,active=false,message='填写你已有的 API。保存设置不会发送请求；发送一句话后才会验证生成结果。';
 try{const saved=storage()?.getItem(API_STORAGE_KEY);if(saved){const raw=JSON.parse(saved);config=validateBrowserConfig(raw);persistent=true;message='已读取这台设备的 API 设置，尚未验证本次连接。';}}catch{message='此浏览器的 API 设置暂时无法读取，请重新填写或移除设置。';}
 const status=()=>({provider:'compatible',browser:true,status:config?'unverified':'unconfigured',model:config?.model||'',baseUrl:config?.baseUrl||'',keyConfigured:!!config?.apiKey,persistent,message});
 function save(raw){
  if(active)throw new Error('请等本次 AI 请求结束或取消后，再修改连接。');
  const next=validateBrowserConfig(raw,config),remember=raw.remember==='on'||raw.remember===true;
  try{if(remember)storage().setItem(API_STORAGE_KEY,JSON.stringify(next));else storage()?.removeItem(API_STORAGE_KEY);}catch{throw new Error('浏览器无法更新保存设置，当前连接未更改。请检查网站存储权限。');}
  config=next;persistent=remember;message='设置已就绪，尚未验证生成。勾选发送许可后，可以发一句“你好”试试。';return status();
 }
 function forget(){
  if(active)throw new Error('请等本次 AI 请求结束或取消后，再移除连接。');
  try{storage()?.removeItem(API_STORAGE_KEY);}catch{throw new Error('浏览器阻止了删除，请在浏览器的网站设置中清除 API 副本。');}
  config=null;persistent=false;message='已移除此设备的 API 连接，学习记录和聊天未删除。';return status();
 }
 async function request(input,signal){
  if(!config)throw new Error('先在“手机 API 连接”中填写地址、模型和密钥。');
  if(input.allowRemote!==true)throw new Error('请先允许将本次文本发送到已配置 API。');
  if(active)throw new Error('已有一条 AI 请求正在处理，请稍后再试。');
  const messages=buildTutorMessages(input),snapshot={...config},controller=new AbortController();let timedOut=false;
  const abort=()=>controller.abort();if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},180000);active=true;
  try{
   const response=await fetcher(snapshot.baseUrl+'/chat/completions',{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json',Authorization:'Bearer '+snapshot.apiKey},body:JSON.stringify({model:snapshot.model,messages,stream:false}),signal:controller.signal});
   const answer=await readAnswer(response);message='最近一次请求已成功收到模型回复。';
   return {answer:answer.slice(0,input.task==='companion'?4000:24000),model:snapshot.model,provider:'compatible',label:input.task==='companion'?'AI 陪伴对话 · 非真人':'AI 学习建议 · 非官方评分'};
  }catch(error){
   message=controller.signal.aborted?'最近一次请求已取消或超时。':'最近一次请求未成功，请查看提示并重试。';
   if(timedOut)throw new Error('等待回复超过 3 分钟，请稍后重试。');
   if(controller.signal.aborted)throw new DOMException('请求已取消。','AbortError');
   if(error instanceof TypeError)throw new Error('未能直连 API：可能是网络、地址或服务商不允许网页跨域（CORS）。请确认该接口允许本站来源；网页不能绕过此限制。');
   throw error;
  }finally{active=false;clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
 return {status,save,forget,request};
}
