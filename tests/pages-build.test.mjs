import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,copyFile,readdir,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {preparePages,publicShellFiles} from '../scripts/prepare-pages.mjs';

const project=fileURLToPath(new URL('../',import.meta.url));
const actualWorker=await readFile(path.join(project,'dist','sw.js'),'utf8');
const assets=[...publicShellFiles(actualWorker),'sw.js'];

async function fixture(t){
 const root=await mkdtemp(path.join(tmpdir(),'yan-pages-test-'));
 t.after(async()=>{
  // This root was returned by mkdtemp; only remove this exact fixture directory.
  assert.equal(path.dirname(root),tmpdir().replace(/[\\/]$/,''));
  assert.ok(path.basename(root).startsWith('yan-pages-test-'));
  await rm(root,{recursive:true,force:true});
 });
 await mkdir(path.join(root,'dist'),{recursive:true});
 for(const file of assets){const target=path.join(root,'dist',file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(project,'dist',file),target);}
 return root;
}

async function listFiles(folder,prefix=''){
 const result=[];
 for(const entry of await readdir(folder,{withFileTypes:true})){
  const relative=prefix+entry.name;
  if(entry.isDirectory())result.push(...await listFiles(path.join(folder,entry.name),relative+'/'));
  else result.push(relative);
 }
 return result.sort();
}

test('Pages build contains exactly the SW public shell, with byte-identical modules and binary icons',async t=>{
 const root=await fixture(t);
 for(const [relative,content] of [['.local/ai.json','private-api-key'],['.local/materials/test.pdf','private-pdf'],['.env','secret'],['server.mjs','private-server'],['dist/__qa.html','test-only'],['dist/old-unlisted.js','stale-source'],['dist/materials/private.pdf','private-document']]){
  const target=path.join(root,relative);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,content);
 }
 const {output,files,build}=await preparePages(root);
 assert.deepEqual(await listFiles(output),[...assets,'.nojekyll'].sort());
 assert.deepEqual([...files].sort(),[...assets,'.nojekyll'].sort());
 for(const file of assets.filter(file=>file!=='sw.js'))assert.deepEqual(await readFile(path.join(output,file)),await readFile(path.join(root,'dist',file)),file);
 assert.match(build,/^v1\.3-[a-f0-9]{24}$/);
 const sourceWorker=await readFile(path.join(root,'dist','sw.js'),'utf8');
 assert.equal(sourceWorker,actualWorker,'development worker must not be modified');
 assert.equal(await readFile(path.join(output,'sw.js'),'utf8'),sourceWorker.replace(/\bconst\s+BUILD\s*=\s*(["'])([^"'\\\r\n]+)\1\s*;/,`const BUILD = '${build}';`));
});

test('repeated builds remove stale output while preserving private source data',async t=>{
 const root=await fixture(t);const first=await preparePages(root);
 const firstWorker=await readFile(path.join(root,'.pages','sw.js'));
 await mkdir(path.join(root,'.pages','obsolete'),{recursive:true});
 await writeFile(path.join(root,'.pages','obsolete','private.json'),'must-not-publish');
 await mkdir(path.join(root,'.local'));await writeFile(path.join(root,'.local','keep.txt'),'keep');
 const second=await preparePages(root);
 assert.equal(second.build,first.build,'private data or stale output must not change the public content hash');
 assert.deepEqual(await readFile(path.join(root,'.pages','sw.js')),firstWorker);
 assert.deepEqual(await listFiles(path.join(root,'.pages')),[...assets,'.nojekyll'].sort());
 assert.equal(await readFile(path.join(root,'.local','keep.txt'),'utf8'),'keep');
});

test('malformed, executable, private and traversal allowlists are rejected without evaluation',()=>{
 for(const body of ["'index.html', fetch('/secret')","'../.local/key.json'","'/index.html'","'.local/key.json'","'api/ai.json'","'materials/private.pdf'","'__qa.html'","'index.html','index.html'","`index.html`","...['index.html']","'index.html' + '.js'"]){
  assert.throws(()=>publicShellFiles(`const SHELL_FILES = [${body}];`),/public|Public|shell|Unsafe|unique/);
 }
 assert.deepEqual(publicShellFiles('const SHELL_FILES = ["index.html", \'manifest.webmanifest\', "icons/icon-192.png",];'),['index.html','manifest.webmanifest','icons/icon-192.png']);
});

test('invalid inputs are detected before removing a previous good build',async t=>{
 const root=await fixture(t);await preparePages(root);
 await writeFile(path.join(root,'.pages','preserve.txt'),'last good build');
 await writeFile(path.join(root,'dist','sw.js'),"const SHELL_FILES = ['index.html','manifest.webmanifest','missing.js'];");
 await assert.rejects(preparePages(root),{code:'ENOENT'});
 assert.equal(await readFile(path.join(root,'.pages','preserve.txt'),'utf8'),'last good build');
});

test('output junctions or symlinks cannot redirect recursive cleanup',async t=>{
 const root=await fixture(t),elsewhere=path.join(root,'keep-outside-output');
 await mkdir(elsewhere);await writeFile(path.join(elsewhere,'sentinel.txt'),'untouched');
 try{await symlink(elsewhere,path.join(root,'.pages'),process.platform==='win32'?'junction':'dir');}
 catch(error){if(['EPERM','EACCES','ENOSYS'].includes(error.code)){t.skip('This environment cannot create directory links');return;}throw error;}
 await assert.rejects(preparePages(root),/linked|directory/);
 assert.equal(await readFile(path.join(elsewhere,'sentinel.txt'),'utf8'),'untouched');
});

test('unexpected output files are preserved instead of being recursively removed',async t=>{
 const root=await fixture(t);
 await writeFile(path.join(root,'.pages'),'not a generated directory');
 await assert.rejects(preparePages(root),/not a directory/);
 assert.equal(await readFile(path.join(root,'.pages'),'utf8'),'not a generated directory');
});

test('every public asset and SW source edit changes BUILD, and identical input is reproducible',async t=>{
 const root=await fixture(t),initial=await preparePages(root);
 const initialWorker=await readFile(path.join(initial.output,'sw.js'));
 for(const file of assets){
  const input=path.join(root,'dist',file),original=await readFile(input);
  await writeFile(input,Buffer.concat([original,Buffer.from('\n// different public bytes\n')]));
  const changed=await preparePages(root);
  assert.notEqual(changed.build,initial.build,file+' edit must change worker build');
  assert.ok((await readFile(path.join(changed.output,'sw.js'),'utf8')).includes(`const BUILD = '${changed.build}';`));
  await writeFile(input,original);
 }
 const repeated=await preparePages(root);
 assert.equal(repeated.build,initial.build);
 assert.deepEqual(await readFile(path.join(repeated.output,'sw.js')),initialWorker);
});

test('a failed install of a new generated build deletes only its new cache, keeping the previous version',async t=>{
 const root=await fixture(t),first=await preparePages(root);
 await writeFile(path.join(root,'dist','app.js'),(await readFile(path.join(root,'dist','app.js'),'utf8'))+'\n// next release\n');
 const second=await preparePages(root);
 assert.notEqual(first.build,second.build);
 const base='https://example.test/-yan-english-studio/';
 const oldName=`yan-studio-shell:${base}:${first.build}`,newName=`yan-studio-shell:${base}:${second.build}`;
 const stores=new Map([[oldName,new Map([['saved','previous offline shell']])]]),listeners={};
 const caches={
  async open(name){if(!stores.has(name))stores.set(name,new Map());return {async put(url,response){stores.get(name).set(url,response);}};},
  async delete(name){return stores.delete(name);}
 };
 const context={URL,Request,Response,caches,self:{registration:{scope:base},addEventListener(type,listener){listeners[type]=listener;}},fetch:async request=>new Response('test asset',{status:request.url.endsWith('app.js')?503:200})};
 vm.runInNewContext(await readFile(path.join(second.output,'sw.js'),'utf8'),context);
 let installation;listeners.install({waitUntil(promise){installation=promise;}});
 await assert.rejects(installation,/Incomplete public app shell/);
 assert.equal(stores.has(newName),false);
 assert.equal(stores.get(oldName).get('saved'),'previous offline shell');
});
