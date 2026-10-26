import {WORDS,DICTIONARY_INFO} from './data.js';
const PAGE_SIZE=12;
export function findVocabulary(query='',bank='all',words=WORDS){
 const q=query.trim().toLowerCase();
 const filtered=words.filter(w=>(bank==='all'||(bank==='world'?w.source==='world':bank==='dictionary'?w.source==='ecdict':w.source!=='ecdict'&&w.source!=='world'))&&(!q||w.word.includes(q)||w.meaning.includes(q)));
 return q?filtered.sort((a,b)=>Number(b.word===q)-Number(a.word===q)||Number(b.word.startsWith(q))-Number(a.word.startsWith(q))):filtered;
}
export function wordDetails(word,esc){
 if(word.example)return `${word.source==='world'?'<p class="caption">看见英语 · '+(word.origin==='local'?'本地检测与模板学习卡':'AI 生成场景词卡')+'，请核对。</p>':''}<div class="example"><div class="en" lang="en">${esc(word.example)}</div><div class="zh">${esc(word.translation)}</div></div>`;
 const labels={p:'过去式',d:'过去分词',i:'现在分词','3':'第三人称单数',s:'复数',r:'比较级',t:'最高级'};
 const forms=String(word.forms||'').split('/').map(part=>{const [type,value]=part.split(':');return labels[type]&&value?`${labels[type]} ${value}`:'';}).filter(Boolean);
 return `<div class="example"><span class="pill">ECDICT 词典释义</span><div class="en dictionary-definition" lang="en">${esc(word.definition)}</div>${forms.length?`<p class="caption">${esc(forms.join(' · '))}</p>`:''}<p class="caption">此扩展条目暂无核验例句。上方为英语释义，不能当作例句背诵。</p></div>`;
}
export function createVocabularyShelf({esc,button,render,open,getWords=()=>WORDS}){
 let query='',bank='all',page=0;
 function view(){
  const matches=findVocabulary(query,bank,getWords()),pages=Math.max(1,Math.ceil(matches.length/PAGE_SIZE));page=Math.min(page,pages-1);
  return `<section class="panel glass vocabulary-shelf" aria-labelledby="vocabulary-shelf-title"><div class="panel-head"><div><span class="eyebrow">FIND YOUR NEXT WORD</span><h2 id="vocabulary-shelf-title">想学哪个，找一找</h2></div><span class="pill blue">${getWords().length.toLocaleString('en')} 个独立词</span></div><p class="caption">1,036 张原创例句卡 + 4,964 个开源词典条目。自主练习会安排复习，不增加每日20个新词的任务量。</p><form id="vocabulary-search" class="vocabulary-search"><div class="field"><label for="vocabulary-query">英文或中文关键词</label><input id="vocabulary-query" name="query" maxlength="80" value="${esc(query)}" placeholder="例如：suggest / 建议 / 交通"></div><div class="field"><label for="vocabulary-bank">词库范围</label><select id="vocabulary-bank" name="bank">${[['all','全部词库'],['world','身边的英语 · AI 场景卡'],['core','原创例句卡 · 1,036'],['dictionary','新增词典条目 · 4,964']].map(([key,name])=>`<option value="${key}" ${bank===key?'selected':''}>${name}</option>`).join('')}</select></div><button class="btn secondary" type="submit">查找单词</button></form><p class="caption" role="status">找到 ${matches.length} 个词 · 第 ${page+1} / ${pages} 页</p><div class="library-grid vocabulary-results">${matches.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).map(w=>`<article class="library-card glass"><details><summary><strong lang="en">${esc(w.word)}</strong><span>${w.phonetic?esc(w.phonetic):esc(w.topic)}</span></summary><p class="vocabulary-meaning">${esc(w.meaning)}</p>${wordDetails(w,esc)}${button('练这个词','vocab-open',`data-id="${w.id}"`,'btn secondary')}</details></article>`).join('')||'<p>没有匹配词，试试更短的英文或中文。</p>'}</div><div class="actions vocabulary-pages">${button('上一页','vocab-prev',page===0?'disabled':'','btn ghost')}${button('下一页','vocab-next',page===pages-1?'disabled':'','btn ghost')}${button('看看新增词','vocab-extension','','text-btn')}</div><details class="vocabulary-source"><summary>词库来源与内容说明</summary><p>原创例句卡为项目 AI 辅助编写；扩展条目来自 ECDICT 的固定版本，保留其中文与英语释义、音标和可用词形。按上游词频及考试标签筛选，不是官方 IELTS 词表或等级认证。词典释义可能包含较少使用的含义，可结合实际语境核对。</p><p><a href="${esc(DICTIONARY_INFO.url)}" target="_blank" rel="noopener noreferrer">查看来源版本 ↗</a> · MIT License · 词库与归属信息可离线读取。</p><pre>${esc(DICTIONARY_INFO.licenseText)}</pre></details></section>`;
 }
 function act(action,el){
  if(!action.startsWith('vocab-'))return false;
  if(action==='vocab-open'){open(el.dataset.id);return true;}
  if(action==='vocab-prev')page=Math.max(0,page-1);
  if(action==='vocab-next')page++;
  if(action==='vocab-extension'){bank='dictionary';query='';page=0;}
  render();globalThis.document?.querySelector('.vocabulary-shelf')?.scrollIntoView({block:'start'});return true;
 }
 function submit(form,values){if(form.id!=='vocabulary-search')return false;query=String(values.query||'').trim().slice(0,80);bank=['core','dictionary','world'].includes(values.bank)?values.bank:'all';page=0;render();globalThis.document?.querySelector('.vocabulary-shelf')?.scrollIntoView({block:'start'});return true;}
 return {view,act,submit};
}
