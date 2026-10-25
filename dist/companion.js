import {COMPANION_MODES,COMPANION_TONES,companionChoice} from './companion-options.js';
// Chat data is deliberately separate from IELTS progress and never auto-attached to tutoring.
export const CHAT_STORAGE_KEY='yan-english-studio:companion:v1';
export const CHAT_BACKUP_LIMIT=1024*1024;
const MAX_MESSAGES=200,MAX_CONTENT=4000,MAX_TOTAL=160000;


export function parseChatBackup(text) {
 if(typeof text!=='string'||new TextEncoder().encode(text).length>CHAT_BACKUP_LIMIT)throw new Error('聊天备份不能超过 1 MB。');
 let raw;try{raw=JSON.parse(text);}catch{throw new Error('聊天备份不是有效的 JSON。');}
 if(!raw||raw.type!=='YAN-companion'||raw.version!==1||!Array.isArray(raw.messages)||raw.messages.length>MAX_MESSAGES||raw.messages.length%2)throw new Error('请选择 YAN 陪伴对话备份，最多 100 轮完整问答。');
 let total=0;
 const messages=raw.messages.map((entry,i)=>{
  if(!entry||typeof entry!=='object'||Array.isArray(entry)||Object.keys(entry).some(k=>!['role','content'].includes(k))||entry.role!==(i%2?'assistant':'user')||typeof entry.content!=='string'||!entry.content.trim()||entry.content.length>MAX_CONTENT)throw new Error('备份包含无效的消息、角色或不完整问答，未导入。');
  total+=entry.content.length;
  return {role:entry.role,content:entry.content};
 });
 if(total>MAX_TOTAL)throw new Error('聊天备份文字过多，请使用较小的备份。');
 return messages;
}

export function recentChatContext(messages) {
 // Keep complete turns, newest first, then restore chronological order.
 const result=[];let size=0;
 for(let i=messages.length-2;i>=0&&result.length<12;i-=2){
  const pair=messages.slice(i,i+2),length=pair.reduce((sum,m)=>sum+m.content.length,0);
  if(pair.length!==2||size+length>12000)break;
  result.unshift(...pair.map(m=>({role:m.role,content:m.content})));size+=length;
 }
 return result;
}

function boundTranscript(messages) {
 let size=messages.reduce((sum,m)=>sum+m.content.length,0);
 while(messages.length>MAX_MESSAGES||size>MAX_TOTAL){size-=messages[0].content.length+messages[1].content.length;messages.splice(0,2);}
 return messages;
}

export function createCompanion({esc,button,toast,refresh,api,getStatus,download}) {
 let companionMode='chat',companionTone='warm',proposedDraft='',lastTopic=-1;
 let messages=[],draft='',corrections=false,persistent=false,allowRemote=false,busy=false,error='',controller=null,pending='',lastModel='',importPreview=null,clearConfirm=false,generation=0,storageOpen=false,preservedRaw=null,preservedExported=false,scrollNext=false;
 const storage=()=>globalThis.localStorage;
 const backup=()=>JSON.stringify({type:'YAN-companion',version:1,exportedAt:new Date().toISOString(),messages},null,2);
 try{const saved=storage()?.getItem(CHAT_STORAGE_KEY);if(saved){preservedRaw=saved;messages=parseChatBackup(saved);persistent=true;preservedRaw=null;scrollNext=true;}}catch{error='已保存的聊天暂时无法读取；原文件未删除。请在聊天保存与备份中导出原始副本，再决定是否重建保存。';storageOpen=true;}
 function persist(){if(!persistent||preservedRaw!==null)return;try{storage().setItem(CHAT_STORAGE_KEY,backup());}catch{error='浏览器未能保存这次对话。请先导出聊天备份，避免关闭后丢失。';}}
 function compose(text){if(draft.trim()&&draft.trim()!==text.trim()){proposedDraft=text;}else{draft=text;proposedDraft='';}error='';refresh();}
 function page(){
  const choice=companionChoice(companionMode,companionTone),starters=choice.mode.starters;
  const status=getStatus(),remote=['compatible','chatgpt'].includes(status?.provider)&&(!status.browser||status.keyConfigured),unconfigured=status?.browser&&!status.keyConfigured,context=recentChatContext(messages);
  if(scrollNext){scrollNext=false;queueMicrotask(()=>{const log=globalThis.document?.querySelector('.companion-log');if(log)log.scrollTop=log.scrollHeight;});}
  return `<section class="panel glass companion-panel" aria-labelledby="companion-title"><div class="panel-head"><div><span class="eyebrow">A LITTLE COMPANY</span><h2 id="companion-title">今天，想怎么一起待一会儿？</h2></div><span class="pill blue">AI 陪伴 · 非真人</span></div><p class="body-copy">聊点小事，演一段小剧场，或者一起猜个词。想认真学、想歇一会儿，都可以。</p><div class="companion-modes" role="group" aria-label="陪伴玩法">${Object.entries(COMPANION_MODES).map(([id,m])=>button(`<span aria-hidden="true">${m.mark}</span><strong>${m.label}</strong><small>${m.description}</small>`,'chat-mode',`data-mode="${id}" aria-pressed="${companionMode===id}" ${busy?'disabled':''}`,`companion-mode ${companionMode===id?'active':''}`)).join('')}</div><div class="companion-personality"><div class="field"><label for="chat-tone">今天的聊天风格</label><select id="chat-tone" ${busy?'disabled':''}>${Object.entries(COMPANION_TONES).map(([id,t])=>`<option value="${id}" ${companionTone===id?'selected':''}>${t.label}</option>`).join('')}</select></div><p>${choice.tone.description}</p>${button('抽个话题 ✧','chat-draw',busy?'disabled':'','btn secondary')}</div><p class="caption companion-mode-note">${choice.mode.label} · ${choice.mode.description} 玩法和风格在当前页面生效。</p><div class="companion-starters actions">${starters.map(([label],i)=>button(label,'chat-starter',`data-index="${i}" ${busy?'disabled':''}`,'btn secondary')).join('')}</div><div class="companion-log" role="log" aria-label="陪伴对话" aria-live="polite">${messages.length?messages.slice(-40).map(m=>`<article class="chat-message chat-${m.role}"><small>${m.role==='user'?'你':'YAN · AI'}</small><div>${esc(m.content)}</div></article>`).join(''):'<div class="companion-empty"><p>不用想一个完美的开场。选个玩法，或者直接说一句。</p><small>连接模型后才会产生 AI 回复。聊天不计入学习任务完成量。</small></div>'}${pending?`<article class="chat-message chat-user"><small>你 · 正在发送</small><div>${esc(pending)}</div></article><p class="caption" role="status">AI 正在生成回复，可以随时取消。</p>`:''}</div>${messages.length>40?'<p class="caption">页面展示最近 20 轮；导出包含当前保留的全部对话。</p>':''}${messages.length?`<div class="companion-followups actions" role="group" aria-label="接着聊">${choice.mode.followups.map(([label],i)=>button(label,'chat-followup',`data-index="${i}" ${busy?'disabled':''}`,'btn ghost')).join('')}</div>`:''}${proposedDraft?`<div class="notice companion-draft" role="status"><p>你刚才写的话还在。要换成这个开场吗？</p><blockquote>${esc(proposedDraft)}</blockquote><div class="actions">${button('用这个开场','chat-use-draft',busy?'disabled':'','btn secondary')}${button('保留我写的','chat-keep-draft',busy?'disabled':'','btn ghost')}</div></div>`:''}<form id="chat-form"><div class="field"><label for="chat-text">想对学习伙伴说些什么？</label><textarea id="chat-text" name="text" rows="3" maxlength="2000" required ${busy?'disabled':''} placeholder="比如：今天总是拼错单词，有一点泄气。">${esc(draft)}</textarea></div><label class="check-label"><input id="chat-corrections" type="checkbox" ${corrections?'checked':''} ${busy?'disabled':''}>聊天时，温和指出一处重要英语错误</label><p class="caption">${unconfigured?'请先在顶部“手机 API 连接”填写设置。':remote?`本次发言和最近 ${context.length/2} 轮对话会发送到 ${esc(status.baseUrl)}，可能使用已有 API 额度。`:'本地模式只把本次发言和最近对话发给电脑上的 Ollama。'}最多附带最近 6 轮、12000 字符的聊天；不会附带学习记录、文件或题库。</p>${remote?`<label class="check-label"><input id="chat-remote" type="checkbox" ${allowRemote?'checked':''} ${busy?'disabled':''}>允许将本次发言和上述最近对话发送到此 API</label>`:''}<div class="actions"><button class="btn" type="submit" ${busy?'disabled':''}>${busy?'正在陪你想一想…':'发送对话'}</button>${busy?button('取消对话请求','chat-cancel','','btn secondary'):''}</div></form>${error?`<p class="notice warm" role="alert">${esc(error)}</p>`:''}${lastModel?`<p class="caption">上次回复来自 ${esc(lastModel)}。AI 可能理解错；可以随时纠正它。</p>`:''}<details class="companion-storage" ${storageOpen||importPreview||clearConfirm?'open':''}><summary>聊天保存与备份 · ${persistent?'已保存到此浏览器':'当前页面内存'}</summary>${preservedRaw!==null?`<div class="notice warm"><p>检测到无法读取的旧副本。${preservedExported?'已发起原始副本下载；勾选保存将用当前聊天重建此浏览器的副本。':'启用保存前，请先导出原始副本。'}</p>${button('导出原始保留副本','chat-export-preserved','','btn secondary')}</div>`:''}<label class="check-label"><input id="chat-persist" type="checkbox" ${persistent?'checked':''} ${busy?'disabled':''}>在这个浏览器保存聊天，关闭网页后继续</label><p class="caption">默认不跨刷新保存。开启后只保留在此浏览器，最多 100 轮或 160000 字符；超过时移除最早完整问答。关闭保存会删除浏览器中的聊天副本，当前页面仍可继续。聊天需要单独导出，不包含在学习进度备份里。</p><div class="actions">${button('导出聊天备份','chat-export',!messages.length||busy?'disabled':'','btn secondary')}${button('清空聊天','chat-clear',!messages.length||busy?'disabled':'','btn ghost')}</div><div class="field"><label for="chat-import">导入聊天备份（JSON，最多 1 MB）</label><input id="chat-import" type="file" accept="application/json,.json" ${busy?'disabled':''}></div>${importPreview?`<div class="notice"><p>备份包含 ${importPreview.length/2} 轮问答。确认后会替换当前聊天${persistent?'和此浏览器的保存副本':''}。</p><div class="actions">${button('确认替换聊天','chat-import-confirm','','btn secondary')}${button('取消导入','chat-import-cancel','','btn ghost')}</div></div>`:''}${clearConfirm?`<div class="notice warm"><p>清空当前聊天${persistent?'及浏览器保存副本':''}？需要保留时，请先导出。</p><div class="actions">${button('确认清空聊天','chat-clear-confirm','','btn secondary')}${button('保留聊天','chat-clear-cancel','','btn ghost')}</div></div>`:''}</details></section>`;
 }
 function act(action,el){
  if(!action.startsWith('chat-'))return false;
  if(action==='chat-cancel'){controller?.abort();return true;}
  if(busy)return true;
  if(action==='chat-export-preserved'&&preservedRaw!==null){download('YAN-companion-preserved-original.txt',preservedRaw);preservedExported=true;storageOpen=true;refresh();}
  if(action==='chat-mode'){const id=el.dataset.mode;if(Object.hasOwn(COMPANION_MODES,id)){companionMode=id;lastTopic=-1;proposedDraft='';refresh();}}
  if(action==='chat-starter'||action==='chat-followup'){const list=COMPANION_MODES[companionMode][action==='chat-starter'?'starters':'followups'],text=list[Number(el.dataset.index)]?.[1];if(text)compose(text);}
  if(action==='chat-draw'){const topics=COMPANION_MODES[companionMode].topics;const offset=1+Math.floor(Math.random()*(topics.length-1));lastTopic=(lastTopic+offset)%topics.length;compose(topics[lastTopic]);}
  if(action==='chat-use-draft'&&proposedDraft){draft=proposedDraft;proposedDraft='';refresh();}
  if(action==='chat-keep-draft'){proposedDraft='';refresh();}
  if(action==='chat-export'&&messages.length)download('YAN-companion-'+new Date().toISOString().slice(0,10)+'.json',backup());
  if(action==='chat-clear'){clearConfirm=true;importPreview=null;storageOpen=true;refresh();}
  if(action==='chat-clear-cancel'){clearConfirm=false;refresh();}
  if(action==='chat-clear-confirm'){
   try{if(preservedRaw===null)storage()?.removeItem(CHAT_STORAGE_KEY);}catch{error='浏览器阻止了删除，聊天尚未清空。请检查存储权限。';refresh();return true;}
   messages=[];draft='';proposedDraft='';lastModel='';error='';clearConfirm=false;persist();refresh();toast('聊天已清空。');
  }
  if(action==='chat-import-cancel'){importPreview=null;refresh();}
  if(action==='chat-import-confirm'&&importPreview){messages=importPreview;importPreview=null;clearConfirm=false;draft='';proposedDraft='';error='';lastModel='';scrollNext=true;persist();refresh();toast('聊天已导入；不会自动发送给模型。');}
  return true;
 }
 async function submit(form,values){
  if(form.id!=='chat-form')return false;
  if(busy)return true;
  draft=String(values.text||'');error='';const status=getStatus();
  try{
   if(!draft.trim()||draft.length>2000)throw new Error('请写下 1–2000 字符的话。');
   if(!status)throw new Error('请先用上方“检查连接”连接本地模型或已有 API。');
   if(status.browser&&!status.keyConfigured)throw new Error('请先在顶部“手机 API 连接”填写地址、模型和密钥。');
   if(status.provider==='ollama'&&status.status!=='ready')throw new Error('本地模型尚未就绪，请先连接 Ollama。没有连接时不会生成聊天回复。');
   if(status.provider!=='ollama'&&!allowRemote)throw new Error('请先允许将本次发言和最近对话发送到已配置 API。');
   proposedDraft='';const text=draft.trim(),history=recentChatContext(messages),requestGeneration=++generation;
   busy=true;pending=text;controller=new AbortController();importPreview=null;clearConfirm=false;scrollNext=true;refresh();
   try{
    const output=await api('tutor',{task:'companion',text,history,corrections,allowRemote,companionMode,companionTone},controller.signal);
    if(requestGeneration!==generation)return true;
    if(typeof output?.answer!=='string'||!output.answer.trim())throw new Error('模型没有返回文字。你写的话仍在输入框中，可以稍后重试。');
    messages=boundTranscript([...messages,{role:'user',content:text},{role:'assistant',content:output.answer.slice(0,MAX_CONTENT)}]);
    draft='';lastModel=output.model||'所选模型';scrollNext=true;persist();
   }catch(e){if(requestGeneration===generation)error=e.name==='AbortError'?'对话请求已取消，没有添加 AI 回复。':e.message;}
   finally{if(requestGeneration===generation){busy=false;pending='';controller=null;allowRemote=false;refresh();}}
  }catch(e){error=e.message;allowRemote=false;refresh();}
  return true;
 }
 async function input(event){
  const el=event.target;
  if(el.id==='chat-text')draft=el.value;
  if(el.id==='chat-tone'&&!busy&&Object.hasOwn(COMPANION_TONES,el.value)){companionTone=el.value;refresh();}
  if(el.id==='chat-corrections')corrections=el.checked;
  if(el.id==='chat-remote')allowRemote=el.checked;
  if(el.id==='chat-persist'&&!busy){
   storageOpen=true;
   try{if(el.checked){if(preservedRaw!==null&&!preservedExported)throw new Error('旧副本尚未导出，已阻止覆盖。请先点击“导出原始保留副本”。');storage().setItem(CHAT_STORAGE_KEY,backup());persistent=true;preservedRaw=null;}else{if(preservedRaw===null)storage().removeItem(CHAT_STORAGE_KEY);persistent=false;}error='';}catch(e){error=e.message.includes('旧副本')?e.message:'无法修改聊天保存设置，请检查浏览器存储权限。';}
   refresh();
  }
  if(el.id==='chat-import'&&!busy&&event.type==='change'){
   const file=el.files?.[0];if(!file)return;
   storageOpen=true;
   try{if(file.size>CHAT_BACKUP_LIMIT)throw new Error('聊天备份不能超过 1 MB。');importPreview=parseChatBackup(await file.text());clearConfirm=false;error='';}catch(e){error=e.message;importPreview=null;}
   refresh();
  }
 }
 function reset(){generation++;controller?.abort();controller=null;busy=false;pending='';draft='';proposedDraft='';error='';allowRemote=false;importPreview=null;clearConfirm=false;}
 return {page,act,submit,input,reset};
}
