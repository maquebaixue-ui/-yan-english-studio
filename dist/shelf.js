import {RESOURCES} from './resources-data.js';

export function createShelf({esc,head,button,toast,download,refresh}) {
 let category='全部',query='',offlineOnly=false,local=[],checked=false,checking=false,error='';
 const categories=['全部','雅思官方','TED','情景剧与美剧','基础英语'];
 async function check(){
  if(checking)return;checking=true;error='';
  try{const response=await fetch('./api/materials/status');if(!response.ok)throw new Error();const data=await response.json();if(!Array.isArray(data.files))throw new Error();local=data.files.map(x=>x.id);}
  catch{local=[];error='此地址无法检查本机 PDF。用项目启动脚本打开后再试；官方入口仍然可用。';}
  finally{checked=true;checking=false;refresh();}
 }
 function page(){
  if(!checked&&!checking)queueMicrotask(check);
  const list=RESOURCES.filter(x=>(category==='全部'||x.category===category)&&(!offlineOnly||local.includes(x.id))&&`${x.title} ${x.provider} ${x.description} ${x.level}`.toLowerCase().includes(query.toLowerCase()));
  return head('A WIDER WORLD OF ENGLISH','把世界，放进学习里','官方雅思练习、TED 与生活英语。选一小段，听懂，再说出来。')+`<div class="library-hero resource-hero glass"><div><span class="pill blue">${RESOURCES.length} 个精选入口 · ${local.length} 份本机 PDF</span><h2>每天一小段，慢慢听懂。</h2><p>先做官方短练习，再选感兴趣的演讲或情景剧。<br>外部资料保留原作者与机构来源，访问条件逐项标注。</p></div><div class="library-recommend"><small>适合现在的学习节奏</small><p>基础英语 10 分钟<br>官方练习 15 分钟<br>跟读喜欢的一小段 5 分钟</p></div></div><div class="library-tools"><div class="filters">${categories.map(k=>button(k,'shelf-filter',`data-kind="${k}" aria-pressed="${category===k}"`,`filter ${category===k?'active':''}`)).join('')}</div><form id="shelf-search" class="search-form"><label class="sr-only" for="shelf-query">搜索官方和精选资料</label><input id="shelf-query" name="query" maxlength="100" value="${esc(query)}" placeholder="搜索资料、机构或话题"><button class="btn secondary" type="submit">搜索</button></form></div><div class="shelf-status"><label class="check-label"><input type="checkbox" id="shelf-offline" ${offlineOnly?'checked':''}>只看本机可离线 PDF</label>${button(checking?'正在检查…':'刷新本机文件','shelf-check',checking?'disabled':'','text-btn')}<span class="caption">${list.length} 个结果</span></div>${error?`<p class="notice" role="status">${esc(error)}</p>`:''}<div class="library-grid">${list.map(x=>`<article class="library-card glass resource-card"><div class="record-top"><span class="pill">${esc(x.category)}</span><small>${esc(x.level||'分级学习')}</small></div><h2>${esc(x.title)}</h2><p>${esc(x.description)}</p><p class="resource-source">${esc(x.provider)} · ${esc(x.access)}</p><div class="actions">${local.includes(x.id)&&x.download?`<a class="btn secondary" href="./materials/${encodeURIComponent(x.download.file)}" target="_blank" rel="noopener noreferrer">打开本机 PDF ↗</a>`:''}<a class="text-btn" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">官方来源 ↗</a></div>${x.download&&!local.includes(x.id)?'<small>可从官方链接下载；本机尚未缓存。</small>':''}</article>`).join('')||'<div class="panel glass"><p>没有匹配资料。可以取消离线筛选，或换一个关键词。</p></div>'}</div><details class="panel glass shelf-guide"><summary>离线资料、版权与使用方法</summary><p>目录保存在本地；外部视频、课程或商店需要联网，部分地区或内容可能需要账号、订阅。目录不等于内容全部已下载，也不是整套商业真题。</p><p>官方免费 PDF 仅下载到你的电脑 <code>.local/materials</code>。在项目目录运行 <code>npm run materials</code> 可补齐或重新下载，再点“刷新本机文件”。私人副本不进入 GitHub，原作者版权不改变。</p><p>TED 请在官方播放器观看、切换字幕；美剧请使用合法播放服务。已有且有权使用的音视频、SRT 或 VTT 字幕，可以去“我的影音”做逐句跟读。没有上传文件或抓取视频的步骤。</p><p>原创练习与这些外部材料分开标注；任何短练习都不自动换算 IELTS 分数。</p>${button('导出精选资源目录','shelf-download','','btn secondary')}</details>`;
 }
 function act(action,el){if(!action.startsWith('shelf-'))return false;if(action==='shelf-filter'){category=el.dataset.kind;refresh();}if(action==='shelf-check')check();if(action==='shelf-download')download('YAN-resource-catalog.json',JSON.stringify({note:'Link metadata only. Original materials retain their rights.',resources:RESOURCES},null,2));return true;}
 function submit(form,values){if(form.id!=='shelf-search')return false;query=String(values.query||'');refresh();return true;}
 function input(event){if(event.target.id==='shelf-offline'){offlineOnly=event.target.checked;refresh();}}
 return {page,act,submit,input};
}
