import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dictionaryCandidates} from '../lib/vocabulary.mjs';
import {WORDS} from '../dist/data.js';
const root=new URL('../',import.meta.url);
const upstream='bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b';
const input=new URL('.local/dictionary/ecdict.csv',root);
const bytes=await readFile(input),text=bytes.toString('utf8');
const sourceDigest=createHash('sha256').update(bytes).digest('hex');
if(sourceDigest!=='1a6947e04785db63613a92e14903cdae7954f7e84860b10e68e5c7cbb3f9c3cf')throw new Error('Dictionary does not match the pinned source SHA-256. Existing files have not changed.');
const core=WORDS.slice(0,1036),count=6000-core.length;
const selected=dictionaryCandidates(text,core.map(w=>w.word)).slice(0,count);
if(selected.length!==count)throw new Error(`Not enough eligible words: ${selected.length}/${count}`);
const words=selected.map((w,i)=>({...w,id:'w'+(core.length+i+1),topic:w.rank<=5000?'常用词扩展':'阅读词扩展'}));
// Published IDs are immutable; rebuilding must never silently remap progress.
for(const old of WORDS.slice(1036)){const next=words.find(w=>w.id===old.id);if(!next||old.word!==next.word)throw new Error('Rebuild would remap an existing word: '+old.id);}
const provenance={name:'ECDICT',license:'MIT',commit:upstream,url:`https://github.com/skywind3000/ECDICT/tree/${upstream}`,sha256:createHash('sha256').update(bytes).digest('hex'),selection:'Lowercase headwords; exam-tagged entries; rank <=18000; no inflected lemma forms; English and Chinese definitions required. Sorted by upstream rank, then headword.',coreCount:core.length,extensionCount:words.length,total:core.length+words.length};
provenance.licenseText=await readFile(new URL('third-party/ECDICT-LICENSE.txt',root),'utf8');
await writeFile(new URL('dist/vocabulary-dictionary.js',root),'// ECDICT subset. MIT license is reproduced in DICTIONARY_INFO and third-party/ECDICT-LICENSE.txt.\nexport const DICTIONARY_INFO = '+JSON.stringify(provenance)+';\nexport const DICTIONARY_WORDS = '+JSON.stringify(words)+';\n');
await writeFile(new URL('dist/vocabulary-source.json',root),JSON.stringify(provenance,null,2)+'\n');
await mkdir(new URL('third-party/',root),{recursive:true});
console.log(JSON.stringify({total:provenance.total,extension:words.length,bytes:Buffer.byteLength(JSON.stringify(words)),first:words.slice(0,5).map(w=>w.word),last:words.at(-1).word}));
