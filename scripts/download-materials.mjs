/** Download only the publisher PDFs explicitly listed in our curated catalog.
 * Copies stay in the git-ignored .local/materials folder for personal study.
 * This is not a video scraper or a mechanism for redistributing third-party works.
 */
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { RESOURCES } from '../dist/resources-data.js';

export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export const PDF_HOSTS = new Set(['ielts.org','takeielts.britishcouncil.org','www.britishcouncil.vn','www.cambridgeenglish.org','learnenglish.britishcouncil.org','downloads.bbc.co.uk']);
export const MATERIALS_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../.local/materials');
export const DOWNLOADS = RESOURCES.filter(item => item.download);

export function checkPdfUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || !PDF_HOSTS.has(url.hostname) || url.username || url.password || url.port || url.search || url.hash || !url.pathname.toLowerCase().endsWith('.pdf')) throw new Error('Download URL is not on the approved PDF list');
  return url.href;
}
export function validatePdf(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 100 || buffer.length > MAX_PDF_BYTES || buffer.subarray(0,5).toString('ascii') !== '%PDF-') throw new Error('Invalid or oversized PDF');
  return buffer;
}
export async function fetchPdf(url, fetcher = fetch) {
  let target = checkPdfUrl(url);
  const signal = AbortSignal.timeout(45000);
  for (let redirects = 0; redirects <= 4; redirects++) {
    const response = await fetcher(target, { redirect: 'manual', signal, headers: { Accept: 'application/pdf' } });
    if ([301,302,303,307,308].includes(response.status)) {
      const next = response.headers.get('location');
      await response.body?.cancel();
      if (!next || redirects === 4) throw new Error('Too many redirects');
      target = checkPdfUrl(new URL(next,target).href);
      continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error(`Publisher returned HTTP ${response.status}`); }
    const advertisedSize = Number(response.headers.get('content-length') || 0);
    if (advertisedSize > MAX_PDF_BYTES) { await response.body?.cancel(); throw new Error('PDF exceeds size limit'); }
    if (!response.body) throw new Error('Empty PDF response');
    const reader = response.body.getReader();
    const chunks = []; let size = 0;
    try {
      while (true) {
        const {done,value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_PDF_BYTES) throw new Error('PDF exceeds size limit');
        chunks.push(Buffer.from(value));
      }
    } catch(error) { await reader.cancel().catch(()=>{}); throw error; }
    return validatePdf(Buffer.concat(chunks));
  }
  throw new Error('Download did not complete');
}
export async function downloadMaterials({ ids, fetcher = fetch, directory = MATERIALS_DIRECTORY, log = console.log } = {}) {
  const selected = ids?.length ? DOWNLOADS.filter(item => ids.includes(item.id)) : DOWNLOADS;
  if (ids?.some(id => !DOWNLOADS.some(item=>item.id === id))) throw new Error('Unknown material ID');
  await mkdir(directory, {recursive:true});
  const entries=[]; const failed=[];
  for (const item of selected) {
    const {url,file} = item.download;
    if (!/^[a-z0-9-]+\.pdf$/.test(file)) throw new Error('Unsafe filename in catalog');
    checkPdfUrl(url);
    const target = resolve(directory,file);
    try {
      let data, cached = false;
      try { data=validatePdf(await readFile(target)); cached=true; } catch { data=await fetchPdf(url,fetcher); }
      if (!cached) { await writeFile(`${target}.part`,data); await rename(`${target}.part`,target); }
      const info={id:item.id,file,url,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),checkedAt:new Date().toISOString()};
      entries.push(info);
      log(`${cached?'CACHED':'SAVED'} ${file} (${data.length} bytes)`);
    } catch (error) {
      failed.push({id:item.id,file,error:error.message});
      log(`FAILED ${file}: ${error.message}`);
    }
  }
  // This manifest describes this invocation, not a signed publisher checksum.
  const result={checkedAt:new Date().toISOString(),notice:'Personal study copies. Original copyrights remain with publishers. SHA-256 identifies local bytes, not publisher authenticity.',entries,failed};
  await writeFile(resolve(directory,'manifest.json'),JSON.stringify(result,null,2));
  log(`Result: ${entries.length} ready, ${failed.length} failed. Folder: ${directory}`);
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args=process.argv.slice(2);
  if (args.length && args[0] !== '--only') { console.error('Usage: node scripts/download-materials.mjs [--only catalog-id ...]'); process.exitCode=1; }
  else {
    try { const result=await downloadMaterials({ids:args.slice(1)}); if(result.failed.length) process.exitCode=1; }
    catch(error) { console.error(error.message); process.exitCode=1; }
  }
}
