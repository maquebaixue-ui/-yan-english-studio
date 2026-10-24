import {mkdir,readFile,writeFile,lstat,realpath,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const PROJECT_ROOT=fileURLToPath(new URL('../',import.meta.url));
const samePath=(a,b)=>process.platform==='win32'?a.toLowerCase()===b.toLowerCase():a===b;
const contained=(parent,child)=>{const relative=path.relative(parent,child);return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);};

function publicPath(file){
 if(typeof file!=='string'||!file||file.startsWith('/')||file.includes('\\')||file.split('/').some(part=>!part||part==='.'||part==='..'||part.startsWith('.'))||!/^[-a-zA-Z0-9_./]+$/.test(file))throw new Error('Unsafe public path: '+file);
 if(!/\.(?:html|css|js|json|svg|png|wav|webmanifest)$/.test(file)||/(?:^|\/)(?:api|materials|__qa[^/]*)(?:\/|$)/.test(file))throw new Error('Not a public shell asset: '+file);
 return file;
}

// Parse only quoted literal paths. Never evaluate the service worker or execute
// array expressions while preparing a public release.
export function publicShellFiles(worker){
 const matches=[...worker.matchAll(/\bconst\s+SHELL_FILES\s*=\s*\[([\s\S]*?)\]\s*;/g)];
 if(matches.length!==1)throw new Error('Service worker public SHELL_FILES list missing or ambiguous.');
 const body=matches[0][1];let position=0;const files=[];
 while(position<body.length){
  while(/\s/.test(body[position]||'')&&position<body.length)position++;
  if(position===body.length)break;
  const quote=body[position++];
  if(quote!=="'"&&quote!=='"')throw new Error('Public file list must contain only quoted literal paths.');
  const end=body.indexOf(quote,position);
  if(end<0)throw new Error('Unterminated public path.');
  files.push(publicPath(body.slice(position,end)));position=end+1;
  while(/\s/.test(body[position]||'')&&position<body.length)position++;
  if(position===body.length)break;
  if(body[position++]!==',')throw new Error('Public file list must contain only quoted literal paths.');
 }
 if(!files.length||new Set(files).size!==files.length)throw new Error('Public file list must be nonempty and unique.');
 if(!files.includes('index.html')||!files.includes('manifest.webmanifest'))throw new Error('Public shell needs its entry page and manifest.');
 return files;
}

export async function preparePages(projectRoot=PROJECT_ROOT){
 const root=await realpath(path.resolve(projectRoot));
 const source=path.join(root,'dist'),output=path.join(root,'.pages');
 if(!(await lstat(root)).isDirectory())throw new Error('Project root must be a directory.');
 const sourceStat=await lstat(source);
 if(!sourceStat.isDirectory()||sourceStat.isSymbolicLink()||!samePath(await realpath(source),source))throw new Error('Public source must be a real project directory.');
 // Validate every input before touching any existing output. A bad allowlist or
 // missing file must not erase the last successful build.
 const worker=await readFile(path.join(source,'sw.js'),'utf8');
 const files=[...publicShellFiles(worker),'sw.js'];
 if(new Set(files).size!==files.length)throw new Error('sw.js must not be part of its own precache list.');
 const contents=new Map();
 for(const relative of files){
  const input=path.resolve(source,relative),target=path.resolve(output,relative);
  if(!contained(source,input)||!contained(output,target))throw new Error('Public file escapes its build directory.');
  const info=await lstat(input);
  if(!info.isFile()||info.isSymbolicLink()||!samePath(await realpath(input),input))throw new Error('Expected a regular, unlinked public file: '+relative);
  contents.set(relative,await readFile(input));
 }
 if(contents.get('sw.js').toString('utf8')!==worker)throw new Error('Service worker changed during preparation. Please build again.');
 // Hash the exact snapshot that will be published, including the worker source.
 // A public content edit must produce a new SW even when its developer BUILD
 // marker was not manually changed. Names and lengths make boundaries explicit.
 const digest=createHash('sha256').update('YAN public shell build v1\0');
 for(const relative of [...files].sort()){
  const data=contents.get(relative);
  digest.update(relative).update('\0').update(String(data.length)).update('\0').update(data);
 }
 const build='v1.3-'+digest.digest('hex').slice(0,24);
 const buildPattern=/\bconst\s+BUILD\s*=\s*(["'])([^"'\\\r\n]+)\1\s*;/g;
 if([...worker.matchAll(buildPattern)].length!==1)throw new Error('Service worker BUILD marker missing or ambiguous.');
 contents.set('sw.js',Buffer.from(worker.replace(buildPattern,`const BUILD = '${build}';`)));
 // The only recursive deletion is this checked, generated directory. Refuse
 // symlinks/junctions so a previous output cannot redirect cleanup elsewhere.
 if(!contained(root,output)||path.relative(root,output)!=='.pages'||samePath(root,output))throw new Error('Unsafe output directory.');
 let outputStat;
 try{outputStat=await lstat(output);}catch(error){if(error.code!=='ENOENT')throw error;}
 if(outputStat&&(!outputStat.isDirectory()||outputStat.isSymbolicLink()||!samePath(await realpath(output),output)))throw new Error('Refusing to clean an output directory that is linked or not a directory.');
 await rm(output,{recursive:true,force:true});
 await mkdir(output,{recursive:true});
 for(const relative of files){
  const target=path.join(output,relative);
  await mkdir(path.dirname(target),{recursive:true});
  await writeFile(target,contents.get(relative));
 }
 await writeFile(path.join(output,'.nojekyll'),'');
 return {output,files:[...files,'.nojekyll'],build};
}

if(process.argv[1]&&samePath(path.resolve(process.argv[1]),fileURLToPath(import.meta.url))){
 const result=await preparePages();
 console.log(`Prepared ${result.files.length} public static files in .pages (${result.build}). Private data and server files excluded.`);
}
