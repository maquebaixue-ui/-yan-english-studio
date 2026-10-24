import {WORDS} from './data.js';
import * as C from './core.js';
import * as L from './learning-core.js';
import {createSpeech} from './speech.js';
export function createLearning({esc,head,button,icon,getState,commit,render,go,toast,stopAudio}){
 let session=null;const speech=createSpeech({toast});
 const date=()=>C.today(),day=()=>getState().learning?.days[date()]||{dictation:[],transform:[],use:[]};
 const labels={spell:'拼写巩固',listen:'声音辨认',use:'句子应用',grammar:'句型变换',review:'先复习，再向前'};
 function wordStatus(id){return `<div class="dimension-tags">${L.dimensions(getState(),id).map(d=>`<span class="dimension-tag ${d.lastCorrect?'done':''}"><strong>${d.label}</strong> ${d.status}${d.attempts?` · ${d.correct}/${d.attempts}`:''}</span>`).join('')}</div><p class="caption">分别记录，不推断其他能力。“会用”来自例句填空，不代表自由表达已掌握。</p>`;}
 function dashboard(){const p=L.makePlan(getState()),d=day(),tasks=[['dictation','听写与辨义',p.dictation],['transform','句型变换',p.transform],['use','例句应用',p.use]];
  return `<section class="panel glass adaptive-panel"><div class="panel-head"><div><span class="eyebrow">ONE STEP THAT FITS YOU</span><h2>今天，多照顾一下${labels[p.focus]}</h2></div><span class="pill">建议约 10–15 分钟</span></div><p>${esc(p.reason)}</p><div class="training-goals">${tasks.map(([key,label,ids])=>`<div><strong>${ids.filter(id=>d[key].includes(id)).length} / ${ids.length}</strong><span>${label}</span></div>`).join('')}</div><div class="actions">${button('打开今日专项','learn-home')}${button('先做听写','learn-start','data-mode="dictation"','btn secondary')}</div><p class="caption">专项是额外建议，不替代原有每日 20 词。完成情况按实际作答记录；重试不重复增加任务进度。</p></section>`;
 }
 function start(mode,id){stopAudio();speech.stop();commit(s=>L.startPlan(s));const p=L.makePlan(getState()),done=day()[mode]||[];
  const ids=id?[id]:p[mode].filter(x=>!done.includes(x));
  session={mode,ids,index:0,result:null,answer:'',meaning:null,played:false,date:date()};go('practice');
 }
 function view(){
  if(session?.date!==date())session=null;
  if(!session)return head('SMALL PRACTICE, REAL PROGRESS','让认识的，慢慢变成会用的','听一听、写一写，再把单词放回句子。原创练习 · 非雅思真题。')+dashboard()+`<div class="mode-grid">${[['dictation','听写与辨义','先辨认声音的意思，再检查拼写。两项分别记录。'],['transform','句型变换','24 道原创短练习，集中练习时态、否定句和疑问句。'],['use','例句应用','根据中文和上下文填词，让单词回到句子里。']].map(([mode,title,text])=>`<section class="panel glass"><h2>${title}</h2><p>${text}</p>${button('开始练习','learn-start',`data-mode="${mode}"`)} ${button('再练今日整组','learn-repeat',`data-mode="${mode}"`,'text-btn')}</section>`).join('')}</div><section class="panel glass"><h2>今天学过的词，各自走到哪一步？</h2><p class="caption">“未练”是真实的空白，不会根据旧背词记录虚构听力或应用成绩。</p>${[...new Set([...(getState().days[date()]?.wordDone||[]),...Object.keys(getState().learning?.words||{})])].slice(0,12).map(id=>`<div class="dimension-row"><strong lang="en">${esc(WORDS.find(w=>w.id===id).word)}</strong>${wordStatus(id)}</div>`).join('')||'<p>完成一次背词、听写或例句练习，这里就会留下记录。</p>'}</section>`;
  const s=session;
  if(s.index>=s.ids.length)return head('A LITTLE WIN','这组练习，已经留下脚印。','结果已保存，答错的内容会留在错题本。')+`<section class="panel glass"><p>${s.ids.length?'本次练习已完成。':'今日这项建议已完成，可以练其他项目，或主动重练。'}</p>${button('返回专项训练','learn-exit')}${button('查看错题本','go-mistakes','','btn secondary')}</section>`;
  const id=s.ids[s.index],w=WORDS.find(w=>w.id===id),q=L.TRANSFORMS.find(q=>q.id===id),top=`<div class="exercise-toolbar">${button('← 专项训练','learn-exit','','text-btn')}<span>${s.index+1} / ${s.ids.length}</span></div>`;
  let body='';
  if(s.mode==='dictation'){
   const options=meaningOptions(w);
   body=`<h2>先听声音，再选意思</h2><p>不急着看英文，先让耳朵试一试。</p><div class="actions">${button(icon('volume')+' 播放单词','learn-listen')}${button('慢速再听','learn-listen','data-slow="true"','btn secondary')}${button('停止','learn-stop','','btn ghost')}</div><p class="caption" data-speech-status role="status">点击后使用设备英语语音，部分声音需要联网。</p><form id="learning-form"><fieldset class="quiz-question"><legend>你听到的词是什么意思？</legend>${options.map((text,i)=>`<label class="quiz-option"><input type="radio" name="meaning" value="${i}" required ${s.meaning===i?'checked':''} ${s.result?'disabled':''}><span>${esc(text)}</span></label>`).join('')}</fieldset><div class="field"><label for="learning-answer">把听到的英文写下来</label><input id="learning-answer" name="answer" lang="en" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="100" value="${esc(s.answer)}" ${s.result?'disabled':''}></div>${s.result?'':`<p class="caption">${s.played?'听不清可以重播。拼不出时可以留空，再看解析。':'请先点播放；若无声音，可以稍后再做，不计为错误。'}</p><button class="btn" type="submit">检查意思与拼写</button>`}</form>${s.result?`<div class="feedback"><strong lang="en">${esc(w.word)}</strong><p>${esc(w.meaning)}</p><p>听音辨义：${s.result.heard?'✓ 答对':'待巩固'} · 拼写：${s.result.spelled?'✓ 答对':'待巩固'}</p><p>你的拼写：${esc(s.answer||'（未填写）')}<br>参考拼写：${esc(w.word)}</p></div>${wordStatus(id)}`:''}`;
  }else if(s.mode==='transform'){
   body=`<span class="pill">${esc(q.topic)}</span><h2>换一种方式，说这句话</h2><p class="training-sentence" lang="en">${esc(q.sentence)}</p><p>${esc(q.prompt)}</p>${answerForm('写出完整英文句子',s)}${s.result?`<div class="feedback ${s.result.correct?'':'wrong'}"><strong>${s.result.correct?'✓ 结构正确':'对照一下，再试一次'}</strong><p lang="en">${esc(q.answer)}</p><p>${esc(q.explanation)}</p><p class="caption">按本题指定句型核对；接受所列缩写、大小写与句末标点变化，不是开放式 AI 评分。</p></div>`:''}`;
  }else {
   body=`<h2>把熟悉的词，放回句子</h2><p class="training-sentence" lang="en">${esc(L.cloze(w))}</p><p>${esc(w.translation)}</p><p class="caption">提示：${esc(w.meaning)}。本题核对当前所学卡片的目标词；其他同义表达不在自动核对范围内。</p>${answerForm('填入一个合适的单词',s)}${s.result?`<div class="feedback ${s.result.correct?'':'wrong'}"><strong>${s.result.correct?'✓ 这次用对了':'再看一次原句'}</strong><p lang="en">${esc(w.example)}</p><p>参考单词：${esc(w.word)}</p></div>${wordStatus(id)}`:''}`;
  }
  return top+`<section class="panel glass training-card">${body}${s.result?`<div class="actions">${button('下一题','learn-next')}${button('遮住答案再试','learn-retry','','btn secondary')}</div>`:''}<p class="caption">YAN 原创学习示例 · 非官方 IELTS 题目。离开后可从今日未完成任务继续。</p></section>`;
 }
 function answerForm(label,s){return `<form id="learning-form"><div class="field"><label for="learning-answer">${label}</label><input id="learning-answer" name="answer" lang="en" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="300" required value="${esc(s.answer)}" ${s.result?'disabled':''}></div>${s.result?'':'<button class="btn" type="submit">检查答案</button>'}</form>`;}
 function meaningOptions(w){const distractors=[['n. 苹果','苹果'],['n. 医院','医院'],['n. 山','山'],['n. 河流','河流'],['n. 厨房','厨房'],['n. 火车','火车'],['adj. 寒冷的','寒冷'],['v. 游泳','游泳']].filter(([text,key])=>!w.meaning.includes(key)).slice(0,2).map(([text])=>text);const options=[w.meaning,...distractors],shift=Number(w.id.slice(1))%3;return options.slice(shift).concat(options.slice(0,shift));}
 function act(action,el){
  if(!action.startsWith('learn-'))return false;
  if(action==='learn-home'){session=null;stopAudio();go('practice');}
  if(action==='learn-start')start(el.dataset.mode,el.dataset.id);
  if(action==='learn-repeat'){start(el.dataset.mode);session.ids=[...L.makePlan(getState())[el.dataset.mode]];render();}
  if(action==='learn-exit'){session=null;speech.stop();render();}
  if(action==='learn-stop')speech.stop();
  if(action==='learn-listen'&&session?.mode==='dictation'){const w=WORDS.find(w=>w.id===session.ids[session.index]);stopAudio();if(speech.speak(w.word,{rate:el.dataset.slow ? 0.75 : 1})){session.played=true;const hint=document.querySelector('#learning-form .caption');if(hint)hint.textContent='听不清可以重播。拼不出时可以留空，再看解析。';}}
  if(action==='learn-next'&&session?.result){speech.stop();session.index++;session.result=null;session.answer='';session.meaning=null;session.played=false;render();window.scrollTo(0,0);}
  if(action==='learn-retry'&&session?.result){session.result=null;session.answer='';session.meaning=null;session.played=false;render();}
  return true;
 }
 function submit(form,values){if(form.id!=='learning-form')return false;
  try{if(!session||session.result)return true;if(session.date!==date())throw new Error('日期已变化，请返回专项训练重新开始。');const id=session.ids[session.index];session.answer=values.answer||'';
   if(session.mode==='dictation'){if(!session.played)throw new Error('请先播放并听一遍；没有声音时可稍后再练。');session.meaning=values.meaning===undefined?null:Number(values.meaning);session.result=commit(s=>L.answerDictation(s,id,session.meaning,meaningOptions(WORDS.find(w=>w.id===id)),session.answer));}
   if(session.mode==='transform')session.result={correct:commit(s=>L.answerTransform(s,id,session.answer))};
   if(session.mode==='use')session.result={correct:commit(s=>L.answerUse(s,id,session.answer))};
   speech.stop();render();
  }catch(e){toast(e.message);}return true;
 }
 return {view,act,submit,dashboard,wordStatus,start,reset(){speech.stop();session=null;},leave(){speech.stop();}};
}
