// No API key or AI connection: use the device/browser's English speech engine.
export function chooseEnglishVoice(voices, accent='en-GB') {
 const english=voices.filter(v=>/^en(?:[-_]|$)/i.test(v.lang));
 return english.find(v=>v.lang.replace('_','-')===accent&&v.localService)||english.find(v=>v.lang.replace('_','-')===accent)||english.find(v=>v.localService)||english[0]||null;
}
export function createSpeech({toast,env=globalThis}) {
 const synth=env.speechSynthesis;let current=null,serial=0,timer;
 const message=text=>{env.document?.querySelectorAll('[data-speech-status]').forEach(el=>el.textContent=text);};
 const stop=()=>{serial++;clearTimeout(timer);current=null;synth?.cancel();message('已停止。');};
 function speak(text,{rate=1,accent='en-GB'}={}) {
  stop();if(!synth||!env.SpeechSynthesisUtterance){toast('此浏览器没有朗读功能。请用手机 Chrome / Edge，并启用系统英语语音。');return false;}
  const id=serial,voice=chooseEnglishVoice(synth.getVoices(),accent),utterance=new env.SpeechSynthesisUtterance(text);
  utterance.lang=voice?.lang||accent;if(voice)utterance.voice=voice;
  utterance.rate=rate;current=utterance;message('准备朗读…');
  utterance.onstart=()=>{if(id!==serial)return;clearTimeout(timer);message(`正在朗读 · ${rate<1?'慢速':'正常语速'}`);};
  utterance.onend=()=>{if(id!==serial)return;clearTimeout(timer);current=null;message('朗读完成，可以再听一遍。');};
  utterance.onerror=()=>{if(id!==serial)return;clearTimeout(timer);current=null;const text='未能朗读。请检查媒体音量、系统英语语音，并在 Chrome / Edge 中重试。';message(text);toast(text);};
  // Call synchronously within the tap, even while voices are still loading.
  // Android can select the requested language before getVoices() is populated.
  try{synth.resume();synth.speak(utterance);timer=setTimeout(()=>{if(id===serial&&current){message('若仍无声音，请检查媒体音量和系统英语语音后再点一次。');}},8000);return true;}catch{utterance.onerror();return false;}
 }
 synth?.getVoices(); // Warm up the asynchronous catalogue; never starts playback.
 return {speak,stop};
}
export function speechControls(word,{esc,button,icon,example=false}) {
 return `<div class="speech-controls"><div class="actions">${button(icon('volume')+' 听发音','speak-word',`data-word="${esc(word.id)}"`,'btn secondary')}${example&&word.example?button('听例句','speak-example',`data-word="${esc(word.id)}"`,'btn secondary'):''}${button('停止','speech-stop','','btn ghost')}</div><div class="speech-options"><label>语速 <select data-speech-rate aria-label="朗读语速"><option value="1">正常</option><option value="0.75">慢速</option></select></label><label>口音偏好 <select data-speech-accent aria-label="朗读口音偏好"><option value="en-GB">英式</option><option value="en-US">美式</option></select></label></div><p class="caption" data-speech-status role="status">点击就能听。实际声音取决于设备；部分声音需要联网。</p><details class="caption"><summary>没有声音？</summary><p>先调高媒体音量，使用 Chrome / Edge 打开。安卓可在系统“文字转语音”设置中启用英语声音。口音偏好不可用时会使用其他英语声音；朗读内容可能由系统语音服务处理，无需 AI 密钥。</p></details></div>`;
}
