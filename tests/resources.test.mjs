import test from 'node:test';
import assert from 'node:assert/strict';
import { RESOURCES, RESOURCE_CATEGORIES } from '../dist/resources-data.js';
import { DOWNLOADS, MAX_PDF_BYTES, checkPdfUrl, fetchPdf, validatePdf } from '../scripts/download-materials.mjs';

test('curated resources have unique IDs and safe official link metadata',()=>{
  assert.ok(RESOURCES.length >= 50);
  assert.equal(new Set(RESOURCES.map(x=>x.id)).size,RESOURCES.length);
  assert.equal(new Set(DOWNLOADS.map(x=>x.download.file)).size,DOWNLOADS.length);
  for(const item of RESOURCES){
    assert.ok(RESOURCE_CATEGORIES.includes(item.category));
    for(const name of ['id','title','provider','description','level','access']) assert.ok(typeof item[name] === 'string' && item[name].length);
    assert.equal(new URL(item.url).protocol,'https:');
    if(item.download){ checkPdfUrl(item.download.url); assert.match(item.download.file,/^[a-z0-9-]+\.pdf$/); }
    if(item.category === 'TED' || item.id.startsWith('tv-')) assert.equal(item.download,undefined);
  }
});
test('PDF fetch rejects HTML, oversized responses, and non-approved redirects',async()=>{
  const url=DOWNLOADS[0].download.url;
  await assert.rejects(()=>fetchPdf(url,async()=>new Response('<html>not a PDF</html>')),/Invalid/);
  await assert.rejects(()=>fetchPdf(url,async()=>new Response('x',{headers:{'content-length':String(MAX_PDF_BYTES+1)}})),/size limit/);
  await assert.rejects(()=>fetchPdf(url,async()=>new Response(null,{status:302,headers:{location:'https://example.com/book.pdf'}})),/approved/);
  assert.throws(()=>checkPdfUrl('https://ielts.org.evil.invalid/book.pdf'),/approved/);
  assert.throws(()=>checkPdfUrl('https://ielts.org:8443/book.pdf'),/approved/);
});
test('PDF download preserves valid bytes without extracting or rewriting the source',async()=>{
  const bytes=Buffer.from('%PDF-1.7\n'+ 'x'.repeat(110));
  const result=await fetchPdf(DOWNLOADS[0].download.url,async()=>new Response(bytes));
  assert.deepEqual(result,bytes);
  assert.equal(validatePdf(result),result);
});
