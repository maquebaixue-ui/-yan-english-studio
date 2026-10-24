import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyPages} from '../scripts/verify-pages.mjs';
const base='https://example.test/-yan-english-studio/';
const options={attempts:1,delayMs:0,report:()=>{}};
function server({status=200,html='<title>YAN English Studio</title><script src="./app.js"></script>',worker='new-build',scope='./'}={}){
 return async url=>new Response(url.pathname.endsWith('sw.js')?worker:url.pathname.endsWith('manifest.webmanifest')?JSON.stringify({scope}):html,{status});
}
test('public deploy check rejects a 404 even when the deployment action succeeded',async()=>{
 await assert.rejects(verifyPages(base,'new-build',{...options,fetchImpl:server({status:404})}),/HTTP 404/);
 await assert.rejects(verifyPages(base,'new-build',{...options,fetchImpl:server({html:'There is no site here'})}),/not the learning app/);
});
test('public deploy check requires the expected worker and correct repository scope',async()=>{
 await assert.rejects(verifyPages(base,'new-build',{...options,fetchImpl:server({worker:'old-build'})}),/newly built release/);
 await assert.rejects(verifyPages(base,'new-build',{...options,fetchImpl:server({scope:'/'})}),/scope/);
});
test('public deploy check allows a delayed release to become available',async()=>{
 let calls=0;const ready=server();
 await verifyPages(base,'new-build',{...options,attempts:2,fetchImpl:async url=>++calls===1?new Response('not found',{status:404}):ready(url)});
 assert.equal(calls,4);
});
