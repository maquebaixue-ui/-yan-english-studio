import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export async function verifyPages(baseUrl,expectedWorker,{attempts=8,delayMs=5000,fetchImpl=fetch,report=console.log}={}){
 const base=new URL(baseUrl);base.hash='';base.search='';
 if(!['https:','http:'].includes(base.protocol)||!base.pathname.endsWith('/'))throw new Error('Expected the public app directory URL.');
 let failure='';
 for(let attempt=1;attempt<=attempts;attempt++){
  try{
   const read=async file=>{const response=await fetchImpl(new URL(file,base),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error(`${file||'index'}: HTTP ${response.status}`);return response.text();};
   const html=await read('');
   if(!html.includes('YAN English Studio')||!html.includes('src="./app.js"'))throw new Error('Public page is not the learning app.');
   const manifest=JSON.parse(await read('manifest.webmanifest'));
   if(new URL(manifest.scope,base).href!==base.href)throw new Error('Manifest scope does not match the public app.');
   if(await read('sw.js')!==expectedWorker)throw new Error('Public files have not reached the newly built release.');
   report(`Verified public learning app: ${base.href}`);return;
  }catch(error){failure=error.message;report(`Public check ${attempt}/${attempts}: ${failure}`);}
  if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,delayMs));
 }
 throw new Error(`Deployment is not publicly usable: ${failure}`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(!process.env.YAN_PAGES_URL)throw new Error('YAN_PAGES_URL is required.');
 await verifyPages(process.env.YAN_PAGES_URL,await readFile(new URL('../.pages/sw.js',import.meta.url),'utf8'));
}
