import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createMaterialService} from '../lib/materials.mjs';

test('private PDF serving is limited to catalogue filenames and never exposes private configuration',async t=>{
 const directory=await mkdtemp(path.join(tmpdir(),'yan-material-test-'));
 t.after(()=>rm(directory,{recursive:true,force:true}));
 await writeFile(path.join(directory,'example.pdf'),'%PDF-1.4\nTest fixture');
 await writeFile(path.join(directory,'ai.json'),'private-test-config');
 const serve=createMaterialService({directory,resources:[{id:'pdf1',download:{file:'example.pdf'}},{id:'unsafe',download:{file:'../ai.json'}}],hosts:new Set(['localhost:4173'])});
 async function call(url,method='GET',host='localhost:4173'){
  const res={status:null,body:null,writeHead(status,headers){this.status=status;this.headers=headers;return this;},end(body){this.body=body;}};
  const handled=await serve({method,headers:{host}},res,url);return {...res,handled};
 }
 assert.deepEqual(JSON.parse((await call('/api/materials/status')).body).files.map(x=>x.id),['pdf1']);
 assert.equal((await call('/materials/example.pdf')).headers['Content-Type'],'application/pdf');
 assert.equal((await call('/materials/example.pdf','HEAD')).body,undefined);
 assert.equal((await call('/materials/../ai.json')).status,404);
 assert.equal((await call('/materials/ai.json')).status,404);
 assert.equal((await call('/materials/example.pdf','POST')).status,405);
 assert.equal((await call('/materials/example.pdf','GET','evil.example')).status,403);
 assert.equal((await call('/api/ai/status')).handled,false);
 await writeFile(path.join(directory,'example.pdf'),'<html>not a PDF</html>');
 assert.equal((await call('/materials/example.pdf')).status,404);
 assert.deepEqual(JSON.parse((await call('/api/materials/status')).body).files,[]);
});
