import {test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
import{VOICES,getVoice,recordingPath,listeningPath,PACK_FILES}from'../dist/voice-config.js';
import{createSpeech}from'../dist/speech.js';
test('selected three male voices have exact distinct recordings, validated preferences and fixed download origins',()=>{
 assert.deepEqual(VOICES.map(v=>v[0]),['M2','M4','M5','device']);assert.equal(getVoice({getItem:()=>null}),'M2');assert.equal(getVoice({getItem:()=>'<script>'}),'M2');assert.equal(getVoice({getItem(){throw Error();}}),'M2');
 for(const v of ['M2','M4','M5']){assert.equal(recordingPath(' STUDY ',v),`./audio/voices/${v}-w001.mp3`);assert.equal(listeningPath('l04',v),`./audio/voices/${v}-l04.mp3`);}
 assert.equal(recordingPath('unknown','M2'),null);assert.equal(recordingPath('study','device'),null);assert.equal(recordingPath('study','../../x'),null);
 assert.ok(PACK_FILES.every(u=>/^https:\/\/(huggingface.co|unpkg.com)\//.test(u)));
});
test('recording playback stops stale events and does not require speech engine or API',async()=>{
 const players=[],status=[],toast=[];class Audio{constructor(src){this.src=src;players.push(this);}play(){return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){}load(){}}
 const speech=createSpeech({toast:t=>toast.push(t),env:{Audio,document:{querySelectorAll:()=>[{set textContent(value){status.push(value);}}]}}});
 let started=0;speech.speak('study',{onstart:()=>started++});const first=players[0];assert.match(first.src,/M2-w001.mp3$/);first.onplaying();assert.equal(started,1);
 speech.speak('review',{rate:.75});assert.equal(first.paused,true);assert.equal(players[1].playbackRate,.75);first.onerror();assert.deepEqual(toast,[]);speech.stop();assert.equal(players[1].paused,true);
});
test('every selected listening, preview and starter word recording ships as a nonempty MP3',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../dist/audio/voices/source.json',import.meta.url)));
 assert.equal(manifest.files.length,75);assert.deepEqual(manifest.voices,['M2','M4','M5']);
 for(const f of manifest.files){const b=await readFile(new URL('../dist/audio/voices/'+f.file,import.meta.url));assert.equal(b.length,f.bytes);assert.ok(f.seconds>.1);assert.ok(b.length>1000);assert.equal(b[0],255);}
});
