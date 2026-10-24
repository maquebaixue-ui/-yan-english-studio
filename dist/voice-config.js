export const VOICES=[['M2','男声 ②'],['M4','男声 ④'],['M5','男声 ⑤'],['device','设备语音']];
export const VOICE_KEY='yan-voice-choice-v1',PACK_KEY='yan-voice-enabled-v1',PACK_CACHE='yan-natural-voice-pack-v1';
export const MODEL_BASE='https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46/';
export const ORT_BASE='https://unpkg.com/onnxruntime-web@1.30.0/dist/';
export const PACK_FILES=[...['duration_predictor.onnx','text_encoder.onnx','vector_estimator.onnx','vocoder.onnx','tts.json','unicode_indexer.json'].map(n=>MODEL_BASE+'onnx/'+n),...['M2','M4','M5'].map(n=>MODEL_BASE+'voice_styles/'+n+'.json'),...['ort.wasm.min.mjs','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'].map(n=>ORT_BASE+n)];
export const STARTER_WORDS=['study','learn','practice','repeat','remember','forget','understand','explain','answer','question','mistake','correct','improve','progress','goal','plan','focus','review','sentence','meaning'];
export const validVoice=value=>VOICES.some(([id])=>id===value);
export function getVoice(storage){try{const v=(storage||globalThis.localStorage)?.getItem(VOICE_KEY);return validVoice(v)?v:'M2';}catch{return 'M2';}}
export function hasPack(storage){try{return (storage||globalThis.localStorage)?.getItem(PACK_KEY)==='1';}catch{return false;}}
export function recordingPath(text,voice=getVoice()){
 if(!validVoice(voice)||voice==='device')return null;
 const index=STARTER_WORDS.indexOf(String(text).trim().toLowerCase());
 return index<0?null:`./audio/voices/${voice}-w${String(index+1).padStart(3,'0')}.mp3`;
}
export const listeningPath=(id,voice=getVoice())=>`./audio/voices/${voice==='device'?'M2':voice}-${/^l0[1-4]$/.test(id)?id:'l01'}.mp3`;
