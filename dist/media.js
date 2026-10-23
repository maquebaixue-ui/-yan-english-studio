const NOTES_KEY='yan-english-studio:media-notes:v1';
const MAX_TEXT=2*1024*1024;
const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function parseTimestamp(value){
 const match=String(value).trim().match(/^(?:(\d{1,3}):)?(\d{1,2}):(\d{2})[.,](\d{3})$/);
 if(!match)return null;
 const hours=Number(match[1]||0),minutes=Number(match[2]),seconds=Number(match[3]);
 if(minutes>59||seconds>59)return null;
 const result=hours*3600+minutes*60+seconds+Number(match[4])/1000;
 return result<=172800?result:null;
}

export function parseSubtitles(source,format='srt'){
 if(typeof source!=='string'||source.length>MAX_TEXT)throw new Error('字幕过大，请使用 2 MB 以内的文本。');
 const text=source.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
 if(!text)throw new Error('这个字幕文件是空的。');
 if(format==='txt'){
  const paragraphs=text.split(/\n+/).map(line=>line.trim()).filter(Boolean);
  if(paragraphs.length>5000)throw new Error('文本超过 5000 行，请分成几份导入。');
  return {cues:paragraphs.map(text=>({start:null,end:null,text})),skipped:0,timed:false};
 }
 if(!['srt','vtt'].includes(format))throw new Error('请使用 SRT、VTT 或 TXT 字幕。');
 const cues=[];let skipped=0;
 for(const block of text.split(/\n\s*\n/)){
  const lines=block.split('\n');
  if(/^(WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/.test(lines[0].trim()))continue;
  const index=lines.findIndex(line=>line.includes('-->'));
  if(index<0){skipped++;continue;}
  const timing=lines[index].trim().match(/^(\S+)\s+-->\s+(\S+)(?:\s+.*)?$/);
  const start=timing?parseTimestamp(timing[1]):null,end=timing?parseTimestamp(timing[2]):null;
  const content=lines.slice(index+1).join('\n').trim();
  if(start===null||end===null||end<=start||!content){skipped++;continue;}
  // Subtitle content is always text, including any HTML or WebVTT formatting tags.
  cues.push({start,end,text:content});
  if(cues.length>5000)throw new Error('字幕超过 5000 句，请分成几份导入。');
 }
 if(!cues.length)throw new Error('没有找到有效时间轴。请检查 SRT / VTT 格式，或改用 TXT。');
 cues.sort((a,b)=>a.start-b.start||a.end-b.end);
 return {cues,skipped,timed:true};
}

function clock(seconds){
 if(!Number.isFinite(seconds))return '—';
 const total=Math.max(0,Math.floor(seconds)),h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;
 return `${h?h+':':''}${h?String(m).padStart(2,'0'):m}:${String(s).padStart(2,'0')}`;
}

export function renderSubtitleCues(cues){
 return cues.map((cue,index)=>`<li class="media-cue" data-cue="${index}">${cue.start===null?'<span class="caption">文本</span>':`<button type="button" class="text-btn" data-action="media-cue" data-index="${index}" aria-label="跳到 ${clock(cue.start)}">${clock(cue.start)}</button>`}<p style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeText(cue.text)}</p></li>`).join('');
}

export function validateMediaNotes(value){
 if(!value||value.version!==1||value.kind!=='YAN-media-notes'||!Array.isArray(value.notes)||value.notes.length>200)throw new Error('不是有效的 YAN 媒体笔记备份。');
 const seen=new Set();
 const notes=value.notes.map(note=>{
  if(!note||typeof note.id!=='string'||!note.id||note.id.length>100||seen.has(note.id)||typeof note.text!=='string'||!note.text.trim()||note.text.length>6000||typeof note.title!=='string'||note.title.length>240||typeof note.updatedAt!=='string'||!Number.isFinite(Date.parse(note.updatedAt))||!(note.at===null||typeof note.at==='number'&&Number.isFinite(note.at)&&note.at>=0&&note.at<=172800))throw new Error('笔记内容不完整或超出长度限制。');
  seen.add(note.id);
  return {id:note.id,title:note.title,text:note.text,at:note.at,updatedAt:note.updatedAt};
 });
 return {version:1,kind:'YAN-media-notes',notes};
}

export function createMedia({esc=escapeText,button,toast,download}){
 let url='',mediaName='',subtitleName='',cues=[],skipped=0,noteDraft='',notes=[],editingId=null,storageError='',a=null,b=null,loop=false,lastPosition=0,rate=1,active=-1,subVersion=0;
 const $=selector=>globalThis.document?.querySelector(selector);
 try{const saved=globalThis.localStorage?.getItem(NOTES_KEY);if(saved)notes=validateMediaNotes(JSON.parse(saved)).notes;}catch{storageError='无法读取已有媒体笔记。原始记录已保留，请检查浏览器存储后再保存。';}
 const envelope=()=>({version:1,kind:'YAN-media-notes',notes});
 function saveNotes(next){
  if(storageError)throw new Error(storageError);
  const checked=validateMediaNotes({version:1,kind:'YAN-media-notes',notes:next});
  if(!globalThis.localStorage)throw new Error('这个浏览器无法使用本地存储，请导出笔记。');
  try{localStorage.setItem(NOTES_KEY,JSON.stringify(checked));}catch{throw new Error('笔记未保存：浏览器存储不可用或已满，请先导出。');}
  notes=checked.notes;renderNotes();
 }
 function noteList(){return notes.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(note=>`<article class="notice media-note"><div class="record-top"><strong>${esc(note.title||'听看笔记')}</strong><small>${esc(note.updatedAt.slice(0,10))}${note.at===null?'':' · '+clock(note.at)}</small></div><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(note.text)}</p><div class="actions">${button('继续编辑','media-edit',`data-id="${esc(note.id)}"`,'text-btn')}${button('删除这条','media-delete',`data-id="${esc(note.id)}"`,'text-btn')}</div></article>`).join('')||'<p class="caption">把今天听懂的一句话、一个生词留下来。</p>';}
 function renderNotes(){const target=$('#media-notes');if(target)target.innerHTML=noteList();}
 function updateLoop(){const status=$('#media-loop-status');if(status)status.textContent=`A ${clock(a)} · B ${clock(b)}${loop?' · 循环中':''}`;const toggle=$('[data-action="media-loop"]');if(toggle){toggle.textContent=loop?'停止循环':'开始 A–B 循环';toggle.setAttribute('aria-pressed',String(loop));}}
 function renderCues(){const target=$('#media-cues');if(target)target.innerHTML=renderSubtitleCues(cues);const status=$('#media-sub-status');if(status)status.textContent=subtitleName?`${subtitleName} · ${cues.length} ${cues.some(c=>c.start!==null)?'句字幕':'行文本'}${skipped?` · 已跳过 ${skipped} 段无效内容`:''}`:'支持 SRT / VTT 时间轴，也可导入 TXT 对照文本。';active=-1;}
 function mount(){
  const player=$('#media-player');if(!player||player.dataset.bound)return;
  player.dataset.bound='true';player.playbackRate=rate;
  player.addEventListener('loadedmetadata',()=>{if(Number.isFinite(player.duration)&&lastPosition<player.duration)player.currentTime=lastPosition;});
  player.addEventListener('error',()=>{if(url)toast('浏览器无法播放这个文件。请尝试 MP4、WebM、MP3 或 M4A 格式。');});
  player.addEventListener('timeupdate',()=>{
   lastPosition=player.currentTime;
   if(loop&&a!==null&&b!==null&&lastPosition>=b){player.currentTime=a;lastPosition=a;}
   const index=cues.findIndex(cue=>cue.start!==null&&lastPosition>=cue.start&&lastPosition<cue.end);
   if(index!==active){$(`#media-cues [data-cue="${active}"]`)?.removeAttribute('aria-current');active=index;$(`#media-cues [data-cue="${active}"]`)?.setAttribute('aria-current','true');}
  });
  player.addEventListener('ended',()=>{if(loop&&a!==null){player.currentTime=a;player.play().catch(()=>{});}});
 }
 function page(){
  queueMicrotask(mount);
  return `<div class="page-heading"><div><div class="eyebrow">WATCH, LISTEN & REPEAT</div><h1>把喜欢的片段，慢慢听懂</h1><p class="subtext">选择你已有的音视频和字幕。文件留在当前浏览器，不上传，也不打包进开源项目。</p></div></div><div class="library-practice media-layout"><section class="panel glass"><h2>本机音视频</h2><div class="field"><label for="media-file">选择音频或视频</label><input id="media-file" type="file" accept="audio/*,video/*,.mp4,.webm,.mp3,.m4a,.wav,.ogg,.mov,.mkv"></div><p id="media-file-status" class="caption" style="overflow-wrap:anywhere">${esc(mediaName||'未选择文件。刷新页面后需要重新选择，媒体文件不会存入浏览器备份。')}</p><video id="media-player" controls playsinline preload="metadata" style="display:block;width:100%;max-height:380px;border-radius:18px;background:#1e3540" ${url?`src="${esc(url)}"`:''}></video><div class="field"><label for="media-rate">播放速度</label><select id="media-rate">${[.75,1,1.25].map(value=>`<option value="${value}" ${rate===value?'selected':''}>${value} 倍</option>`).join('')}</select></div><div class="actions">${button('把现在设为 A','media-a','','btn secondary')}${button('把现在设为 B','media-b','','btn secondary')}${button(loop?'停止循环':'开始 A–B 循环','media-loop',`aria-pressed="${loop}"`,'btn ghost')}${button('清除区间','media-clear-loop','','text-btn')}</div><p id="media-loop-status" class="caption">A ${clock(a)} · B ${clock(b)}${loop?' · 循环中':''}</p><p class="caption">先设起点 A，再设终点 B。开始循环后，会重复这一小段。格式支持取决于浏览器。</p><div class="field"><label for="media-subtitle">选择字幕 / 对照文本（2 MB 以内）</label><input id="media-subtitle" type="file" accept=".srt,.vtt,.txt,text/plain,text/vtt"></div><p id="media-sub-status" class="caption" style="overflow-wrap:anywhere">${esc(subtitleName?`${subtitleName} · ${cues.length} 句 / 行`:'支持 SRT / VTT 时间轴，也可导入 TXT 对照文本。')}</p><ol id="media-cues" class="media-cues" style="max-height:480px;overflow-y:auto;padding-left:24px">${renderSubtitleCues(cues)}</ol><p class="caption">点击时间跳到对应句子。字幕只作为文本展示；TXT 没有时间轴。</p></section><section class="panel glass"><h2>听看笔记</h2><div class="field"><label for="media-note">记下一句表达，或写写今天的收获</label><textarea id="media-note" rows="6" maxlength="6000" placeholder="原句：…\n我听到的：…\n新的表达：…">${esc(noteDraft)}</textarea></div><div class="actions">${button(editingId?'保存修改':'保存笔记','media-save-note')}${button('另写一条','media-new-note','','btn ghost')}${button('导出全部笔记','media-export-notes','','btn secondary')}</div><p class="caption">最多保存 200 条。笔记单独保存在这个浏览器，需单独导出；不包含音视频和字幕文件。</p>${storageError?`<p role="alert" class="notice warm">${esc(storageError)}</p>`:''}<details><summary>导入媒体笔记备份</summary><div class="field"><label for="media-import-notes">选择 YAN 媒体笔记 JSON</label><input id="media-import-notes" type="file" accept=".json,application/json"></div><p class="caption">合并已有笔记；相同 ID 保留本机版本。</p></details><div id="media-notes">${noteList()}</div><div class="notice"><strong>试试 10 分钟听看练习</strong><p>先不看字幕听一段 → 用 A–B 重听一句 → 对照字幕 → 跟读两遍 → 留下一条笔记。</p><p>此处没有预置美剧正片。可从资料入口访问官方内容，或使用你有权使用的本机文件。</p></div></section></div>`;
 }
 function act(action,el){
  if(!action.startsWith('media-'))return false;
  try{
   const player=$('#media-player');
   if(['media-a','media-b','media-loop','media-cue'].includes(action)&&(!player||!url||!Number.isFinite(player.duration)))throw new Error('请先选择可播放的音视频，等待加载完成。');
   if(action==='media-a'){a=player.currentTime;b=null;loop=false;updateLoop();}
   if(action==='media-b'){if(a===null||player.currentTime<=a+.15)throw new Error('先设置 A，再把播放位置移动到 A 之后设置 B。');b=player.currentTime;updateLoop();}
   if(action==='media-loop'){if(a===null||b===null||b>player.duration+.1)throw new Error('请先设置这个文件内的起点 A 和终点 B。');loop=!loop;updateLoop();if(loop){player.currentTime=a;player.play().catch(()=>toast('请点播放器的播放按钮。'));}}
   if(action==='media-clear-loop'){a=null;b=null;loop=false;updateLoop();}
   if(action==='media-cue'){const cue=cues[Number(el.dataset.index)];if(!cue||cue.start===null||cue.start>=player.duration)throw new Error('这句字幕超出了当前媒体时长，请检查字幕是否匹配。');loop=false;updateLoop();player.currentTime=cue.start;player.play().catch(()=>toast('已定位到这句，请点播放。'));}
   if(action==='media-save-note'){
    noteDraft=$('#media-note')?.value||noteDraft;if(!noteDraft.trim())throw new Error('先写下一句话，再保存。');
    const previous=notes.find(n=>n.id===editingId),note={id:previous?.id||globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2),title:previous?.title||(mediaName||subtitleName||'听看笔记').slice(0,240),text:noteDraft.trim(),at:previous?previous.at:(url?Math.min(lastPosition,172800):null),updatedAt:new Date().toISOString()};
    const next=notes.filter(n=>n.id!==note.id);next.push(note);saveNotes(next);editingId=note.id;const save=$('[data-action="media-save-note"]');if(save)save.textContent='保存修改';toast('笔记已保存在本浏览器。');
   }
   if(action==='media-new-note'){editingId=null;noteDraft='';if($('#media-note')){$('#media-note').value='';$('#media-note').focus();}const save=$('[data-action="media-save-note"]');if(save)save.textContent='保存笔记';}
   if(action==='media-edit'){const note=notes.find(n=>n.id===el.dataset.id);if(note){editingId=note.id;noteDraft=note.text;$('#media-note').value=noteDraft;$('#media-note').focus();const save=$('[data-action="media-save-note"]');if(save)save.textContent='保存修改';}}
   if(action==='media-delete'){saveNotes(notes.filter(n=>n.id!==el.dataset.id));if(editingId===el.dataset.id){editingId=null;const save=$('[data-action="media-save-note"]');if(save)save.textContent='保存笔记';}toast('笔记已删除；编辑框中的文字仍保留。');}
   if(action==='media-export-notes'){const data={...envelope(),notes:notes.slice()};if(noteDraft.trim()&&!notes.some(n=>n.text===noteDraft.trim())){if(data.notes.length>=200)throw new Error('已有 200 条笔记。请先保存或复制当前草稿，再导出。');data.notes.push({id:globalThis.crypto?.randomUUID?.()||'draft-'+Date.now(),title:(mediaName||subtitleName||'未保存的听看笔记').slice(0,240),text:noteDraft.trim(),at:url?Math.min(lastPosition,172800):null,updatedAt:new Date().toISOString()});}download('YAN-media-notes-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2));toast('已导出笔记（含当前草稿）。音视频和字幕仍是你自己的文件。');}
  }catch(error){toast(error.message);}
  return true;
 }
 async function input(event){
  const el=event.target;
  if(el.id==='media-note'){noteDraft=el.value;return;}
  if(el.id==='media-rate'){rate=Number(el.value);if(![.75,1,1.25].includes(rate))rate=1;const player=$('#media-player');if(player)player.playbackRate=rate;return;}
  if(event.type!=='change'||!['media-file','media-subtitle','media-import-notes'].includes(el.id))return;
  const file=el.files?.[0];if(!file)return;
  try{
   if(el.id==='media-file'){
    if(!/^(audio|video)\//.test(file.type)&&! /\.(mp4|webm|mp3|m4a|wav|ogg|oga|ogv|mov|mkv|aac|flac)$/i.test(file.name))throw new Error('请选择音频或视频文件。');
    const player=$('#media-player');player?.pause();if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(file);mediaName=file.name;lastPosition=0;a=null;b=null;loop=false;active=-1;
    if(player){player.src=url;player.load();player.playbackRate=rate;}const status=$('#media-file-status');if(status)status.textContent=mediaName;updateLoop();toast('已打开本机文件，没有上传。');
   }
   if(el.id==='media-subtitle'){
    if(file.size>MAX_TEXT)throw new Error('字幕超过 2 MB，请分成较短的文件。');
    const format=file.name.split('.').pop().toLowerCase(),version=++subVersion;const text=await file.text();if(version!==subVersion)return;
    const parsed=parseSubtitles(text,format);cues=parsed.cues;skipped=parsed.skipped;subtitleName=file.name;renderCues();toast(`已载入 ${cues.length} 句 / 行文本。`);
   }
   if(el.id==='media-import-notes'){
    if(file.size>8*1024*1024)throw new Error('笔记备份不能超过 8 MB。');
    const loaded=validateMediaNotes(JSON.parse(await file.text())),ids=new Set(notes.map(n=>n.id)),fresh=loaded.notes.filter(n=>!ids.has(n.id));saveNotes([...notes,...fresh]);toast(`已合并 ${fresh.length} 条笔记。`);
   }
  }catch(error){toast(error instanceof SyntaxError?'无法读取 JSON 笔记备份。':error.message);}
  finally{el.value='';}
 }
 function pause(){const player=$('#media-player');if(player){lastPosition=player.currentTime;player.pause();}}
 function reset(){pause();subVersion++;if(url)URL.revokeObjectURL(url);url='';mediaName='';subtitleName='';cues=[];a=null;b=null;loop=false;lastPosition=0;active=-1;}
 return {page,act,input,reset,pause};
}
