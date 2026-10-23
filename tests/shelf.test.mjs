import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createShelf} from '../dist/shelf.js';
import {RESOURCES} from '../dist/resources-data.js';

const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function makeShelf(){return createShelf({esc,head:()=>'',button:(label,action)=>`<button data-action="${action}">${label}</button>`,toast:()=>{},download:()=>{},refresh:()=>{}});}

test('public resource shelf never probes a local server, including stale control events',async()=>{
 const oldFetch=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw new Error('No local server on public hosting');};
 try{
  const shelf=makeShelf();let page=shelf.page();
  shelf.act('shelf-check',{});shelf.input({target:{id:'shelf-offline',checked:true}});
  await new Promise(resolve=>setImmediate(resolve));
  page=shelf.page();assert.equal(calls,0);assert.doesNotMatch(page,/id="shelf-offline"|data-action="shelf-check"|打开本机 PDF|\.\/materials\//);
  assert.ok(page.includes(`>${RESOURCES.length} 个结果<`));assert.match(page,/32 份原创练习与讲义/);
 }finally{globalThis.fetch=oldFetch;}
});

test('public resource shelf links every PDF directly to its publisher and labels online availability',()=>{
 const page=makeShelf().page();
 for(const resource of RESOURCES.filter(x=>x.download)){
  assert.ok(page.includes(`href="${esc(resource.download.url)}"`),resource.id);
  assert.ok(page.includes(`href="${esc(resource.url)}"`),`${resource.id}: source retained`);
 }
 assert.match(page,/官方 PDF 需联网打开，未缓存在此应用中/);
 assert.match(page,/外部网页或视频需联网，未缓存在此应用中/);
 assert.doesNotMatch(page,/npm run materials|\.local\/materials/);
});
