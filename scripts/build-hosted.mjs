import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {preparePages} from './prepare-pages.mjs';
const arg=name=>{const at=process.argv.indexOf(name);return at<0?null:process.argv[at+1];};
const source=path.resolve(arg('--source')||fileURLToPath(new URL('../',import.meta.url)));
const output=path.resolve(arg('--out')||path.join(source,'.hosted-output'));
if(output===source||output===path.join(source,'dist'))throw new Error('Use a separate hosting output directory; frontend source must be preserved.');
const manifestPath=path.resolve(arg('--manifest')||path.join(source,'.openai/hosting.json'));
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
if(!manifest.project_id||!manifest.capabilities?.includes('mcp')||manifest.static)throw new Error('Hosted build requires this private Site’s worker manifest with MCP capability.');
const built=await preparePages(source),assets={};
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.mp3':'audio/mpeg','.txt':'text/plain; charset=utf-8','.wav':'audio/wav','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json; charset=utf-8'};
for(const file of [...built.files,'sw.js']){
 const bytes=await readFile(path.join(built.output,file)),binary=['.png','.wav','.mp3'].includes(path.extname(file));let content=binary?bytes.toString('base64'):bytes.toString('utf8');
 if(file==='index.html')content=content.replace('content="static"','content="hosted"');
 assets[file]=[types[path.extname(file)]||'application/octet-stream',content,binary];
}
const hash=createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0,24);
assets['sw.js'][1]=assets['sw.js'][1].replace(/const BUILD = '[^']+';/,`const BUILD = 'hosted-${hash}';`);
const {WORDS}=await import(pathToFileURL(path.join(source,'dist/data.js'))),{LIBRARY}=await import(pathToFileURL(path.join(source,'dist/library-data.js')));
const mcp=await readFile(path.join(source,'lib/learning-mcp.mjs'),'utf8'),worker=await readFile(path.join(source,'hosting/worker.mjs'),'utf8');
const bundle=mcp+'\nconst PUBLIC_WORDS='+JSON.stringify(WORDS)+';\nconst PUBLIC_MATERIALS='+JSON.stringify(LIBRARY)+';\nconst PUBLIC_ASSETS='+JSON.stringify(assets)+';\n'+worker;
await mkdir(path.join(output,'server'),{recursive:true});await mkdir(path.join(output,'.openai'),{recursive:true});
await writeFile(path.join(output,'server/index.js'),bundle);await writeFile(path.join(output,'.openai/hosting.json'),JSON.stringify(manifest,null,2));
const module=await import('data:text/javascript;base64,'+Buffer.from(bundle).toString('base64'));if(typeof module.default?.fetch!=='function')throw new Error('Invalid hosted worker.');
console.log(`Built private MCP worker with ${Object.keys(assets).length} public assets. No private credentials or snapshots included.`);
