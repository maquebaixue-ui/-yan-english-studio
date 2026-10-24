import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chooseEnglishVoice,createSpeech} from '../dist/speech.js';
import {LIBRARY} from '../dist/library-data.js';

test('English speech accepts network voices and an initially empty Android voice catalogue',()=>{
 const remote={lang:'en-GB',localService:false},local={lang:'en-US',localService:true};
 assert.equal(chooseEnglishVoice([remote,local]),remote);
 assert.equal(chooseEnglishVoice([{lang:'zh-CN'},local]),local);
 assert.equal(chooseEnglishVoice([]),null);
 const calls=[];let errors=[];
 const synth={getVoices:()=>[],cancel(){calls.push('cancel');},resume(){},speak(u){calls.push(u);}};
 const speech=createSpeech({toast:t=>errors.push(t),env:{speechSynthesis:synth,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}}});
 assert.equal(speech.speak('study',{rate:.75}),true);
 const first=calls.at(-1);assert.equal(first.lang,'en-GB');assert.equal(first.text,'study');assert.equal(first.rate,.75);
 speech.speak('library');first.onerror();assert.equal(errors.length,0,'cancelled utterance must not show a stale error');
 calls.at(-1).onerror();assert.equal(errors.length,1);speech.stop();
});

test('all original listening lessons ship nonempty playable 16 kHz PCM WAVs',async()=>{
 for(const lesson of LIBRARY.filter(x=>x.kind==='听力')){
  const bytes=await readFile(new URL(`../dist/audio/${lesson.id}.wav`,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WAVE');
  let offset=12,format,data;
  while(offset+8<=bytes.length){const id=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4);if(id==='fmt ')format=bytes.subarray(offset+8,offset+8+size);if(id==='data')data=bytes.subarray(offset+8,offset+8+size);offset+=8+size+(size%2);}
  assert.equal(format.readUInt16LE(0),1);assert.equal(format.readUInt16LE(2),1);assert.equal(format.readUInt32LE(4),16000);assert.equal(format.readUInt16LE(14),8);
  assert.ok(data.length>16000*15);assert.ok(data.some(v=>v<110)&&data.some(v=>v>145),'audio cannot be silent');
 }
});
