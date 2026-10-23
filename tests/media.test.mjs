import test from 'node:test';
import assert from 'node:assert/strict';
import {parseTimestamp,parseSubtitles,renderSubtitleCues,validateMediaNotes} from '../dist/media.js';

test('subtitle timestamps reject malformed values and invalid ranges',()=>{
 assert.equal(parseTimestamp('01:02:03,456'),3723.456);
 assert.equal(parseTimestamp('02:03.456'),123.456);
 for(const value of ['00:60:00.000','00:00:60,000','-1:00.000','01:02','49:00:00.000','Infinity'])assert.equal(parseTimestamp(value),null,value);
 const parsed=parseSubtitles('1\n00:00:03,000 --> 00:00:01,000\nBackwards\n\n2\n00:00:05,000 --> 00:00:06,500\nFine\n\n3\n00:00:01,000 --> 00:00:02,000\nFirst');
 assert.equal(parsed.skipped,1);assert.deepEqual(parsed.cues.map(c=>c.text),['First','Fine']);
 assert.throws(()=>parseSubtitles('1\n00:00:01 --> 00:00:02\nBad'),/时间轴/);
});

test('SRT and WebVTT retain Unicode text and render markup as inert text',()=>{
 const parsed=parseSubtitles('\uFEFFWEBVTT\r\n\r\nNOTE comment\r\nignore me\r\n\r\nSTYLE\r\n::cue { color: red; }\r\n\r\nlabel\r\n00:01.000 --> 00:02.000 align:start\r\n<img src=x onerror=alert(1)>\r\n你好 & hello','vtt');
 assert.equal(parsed.cues.length,1);assert.equal(parsed.skipped,0);
 const html=renderSubtitleCues(parsed.cues);
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.ok(html.includes('你好 &amp; hello'));
 assert.ok(!html.includes('<img'));
 assert.ok(html.includes('data-action="media-cue"'));
});

test('plain transcript has no jump timestamps and subtitles have bounded size',()=>{
 const parsed=parseSubtitles('Hello world.\n\nHow are you?','txt');
 assert.equal(parsed.timed,false);assert.equal(parsed.cues[0].start,null);assert.equal(parsed.cues.length,2);
 assert.ok(!renderSubtitleCues(parsed.cues).includes('data-action="media-cue"'));
 assert.throws(()=>parseSubtitles('x'.repeat(2*1024*1024+1),'txt'),/过大/);
 assert.throws(()=>parseSubtitles('a\n'.repeat(5001),'txt'),/5000/);
});

test('media notes backups validate a small text-only schema',()=>{
 const note={id:'a',title:'My clip.mp4',text:'I heard a new word.',at:10.5,updatedAt:'2026-10-24T12:00:00.000Z'};
 const backup={version:1,kind:'YAN-media-notes',notes:[note]};
 assert.deepEqual(validateMediaNotes(backup),backup);
 assert.throws(()=>validateMediaNotes({...backup,notes:[note,note]}),/不完整/);
 for(const at of [-1,NaN,'12',172801])assert.throws(()=>validateMediaNotes({...backup,notes:[{...note,at}]}));
 assert.throws(()=>validateMediaNotes({...backup,notes:[{...note,text:'x'.repeat(6001)}]}));
 assert.throws(()=>validateMediaNotes({...backup,notes:Array(201).fill(note)}));
 assert.throws(()=>validateMediaNotes({version:1,kind:'study-backup',notes:[]}));
});
