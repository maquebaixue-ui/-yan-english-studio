import {getVoice,hasPack,recordingPath} from './voice-config.js';
import {naturalAudio,cachedNatural,voiceSelect} from './voice-client.js';
// Pre-recorded and browser-local voices do not require a paid speech API.
export function chooseEnglishVoice(voices, accent='en-GB') {
 const english=voices.filter(v=>/^en(?:[-_]|$)/i.test(v.lang));
 return english.find(v=>v.lang.replace('_','-')===accent&&v.localService)||english.find(v=>v.lang.replace('_','-')===accent)||english.find(v=>v.localService)||english[0]||null;
}
const stops=new Set();
export function stopAllSpeech(){for(const stop of stops)stop();}
export function createSpeech({toast,env=globalThis}) {
 const synth=env.speechSynthesis;let current=null,serial=0,timer,player=null,blobURL=null;
 const message=text=>{env.document?.querySelectorAll('[data-speech-status]').forEach(el=>el.textContent=text);};
 const stop=()=>{serial++;clearTimeout(timer);current=null;synth?.cancel();if(player){player.pause();player.removeAttribute('src');player.load();player=null;}if(blobURL){env.URL.revokeObjectURL(blobURL);blobURL=null;}message('已停止。');};
 function speak(text,{rate=1,accent='en-GB',file=null,device=false,onstart=()=>{}}={}) {
  stop();const requestId=serial,choice=device?'device':getVoice(),recording=file||recordingPath(text,choice);
  function play(url){if(requestId!==serial)return;player=new env.Audio(url);player.playbackRate=rate;player.onplaying=()=>{if(requestId!==serial)return;message('正在朗读 · '+(choice==='device'?'设备语音':`男声 ${choice.slice(1)}`));onstart();};player.onended=()=>{if(requestId===serial)message('朗读完成，可以再听一遍。');};player.onerror=()=>{if(requestId===serial){message('音频未能播放，请联网重试或切换设备语音。');toast('声音暂未播放，请重试。');}};player.play().catch(()=>{if(requestId===serial)message('声音已准备好，请再点一次播放；也请检查媒体音量。');});}
  if(env.Audio&&recording){message('准备朗读…');play(recording);return true;}
  if(env.Audio&&choice!=='device'&&hasPack()){
   const cached=cachedNatural(text,choice);if(cached){blobURL=env.URL.createObjectURL(new Blob([cached],{type:'audio/wav'}));play(blobURL);return true;}
   message('正在这台设备生成声音…');naturalAudio(text,choice).then(buffer=>{if(requestId!==serial)return;blobURL=env.URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));play(blobURL);}).catch(error=>{if(requestId===serial){message(error.message);toast(error.message);}});return true;
  }
  if(!synth||!env.SpeechSynthesisUtterance){toast('此浏览器没有朗读功能。请用手机 Chrome / Edge，并启用系统英语语音。');return false;}
  const id=serial,voice=chooseEnglishVoice(synth.getVoices(),accent),utterance=new env.SpeechSynthesisUtterance(text);
  utterance.lang=voice?.lang||accent;if(voice)utterance.voice=voice;
  utterance.rate=rate;current=utterance;message('准备朗读…');
  utterance.onstart=()=>{if(id!==serial)return;clearTimeout(timer);message(`正在朗读 · 设备语音${choice!=='device'?'（此内容需先在“更多”下载免费男声包）':''} · ${rate<1?'慢速':'正常语速'}`);onstart();};
  utterance.onend=()=>{if(id!==serial)return;clearTimeout(timer);current=null;message('朗读完成，可以再听一遍。');};
  utterance.onerror=()=>{if(id!==serial)return;clearTimeout(timer);current=null;const text='未能朗读。请检查媒体音量、系统英语语音，并在 Chrome / Edge 中重试。';message(text);toast(text);};
  // Call synchronously within the tap, even while voices are still loading.
  // Android can select the requested language before getVoices() is populated.
  try{synth.resume();synth.speak(utterance);timer=setTimeout(()=>{if(id===serial&&current){message('若仍无声音，请检查媒体音量和系统英语语音后再点一次。');}},8000);return true;}catch{utterance.onerror();return false;}
 }
 stops.add(stop);synth?.getVoices(); // Warm up the asynchronous catalogue; never starts playback.
 return {speak,stop};
}
export function speechControls(word,{esc,button,icon,example=false}) {
 return `<div class="speech-controls"><div class="actions">${button(icon('volume')+' 听发音','speak-word',`data-word="${esc(word.id)}"`,'btn secondary')}${example&&word.example?button('听例句','speak-example',`data-word="${esc(word.id)}"`,'btn secondary'):''}${button('停止','speech-stop','','btn ghost')}</div><div class="speech-options">${voiceSelect()}<label>语速 <select data-speech-rate aria-label="朗读语速"><option value="1">正常</option><option value="0.75">慢速</option></select></label><label>设备口音 <select data-speech-accent aria-label="朗读口音偏好"><option value="en-GB">英式</option><option value="en-US">美式</option></select></label></div><p class="caption" data-speech-status role="status">起步 20 词可直接听男声；完整词库与例句需在「更多」下载免费语音包，未下载时用设备语音。自然男声口音固定，设备口音仅影响设备语音。</p><a class="text-btn" href="#more">试听与免费语音包 →</a></div>`;
}
