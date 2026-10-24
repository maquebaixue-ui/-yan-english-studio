import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {networkInterfaces} from 'node:os';
import {createAiService} from './lib/ai.mjs';
import {createChatGPTService} from './lib/chatgpt.mjs';
import {createMaterialService} from './lib/materials.mjs';
import {RESOURCES} from './dist/resources-data.js';
const root = path.resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const addresses=Object.values(networkInterfaces()).flat().filter(Boolean).map(x=>x.address);
const hosts=new Set(['127.0.0.1','localhost',...addresses].map(host=>`${host}:${port}`));
const chatgpt=createChatGPTService({directory:fileURLToPath(new URL('./.local/',import.meta.url)),hosts,port});
const ai=createAiService({directory:fileURLToPath(new URL('./.local/',import.meta.url)),hosts,port,chatgpt});
const materials=createMaterialService({directory:fileURLToPath(new URL('./.local/materials/',import.meta.url)),resources:RESOURCES,hosts});
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.json':'application/json; charset=utf-8'};
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(await chatgpt.handle(req,res,pathname))return;
    if(await materials(req,res,pathname))return;
    if(pathname.startsWith('/api/'))return await ai(req,res,pathname);
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) && file !== path.join(root,'index.html')) {res.writeHead(403).end();return;}
    let data = await readFile(file);
    if(file===path.join(root,'index.html'))data=Buffer.from(data.toString('utf8').replace('<meta name="yan-runtime" content="static">','<meta name="yan-runtime" content="local">'));
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}).end(req.method==='HEAD'?undefined:data);
  } catch {res.writeHead(404).end('Not found');}
});
server.listen(port,'0.0.0.0',()=>{
 const url=`http://127.0.0.1:${port}`;
 console.log(`YAN English Studio ready: ${url}`);
 for(const [name,list] of Object.entries(networkInterfaces())){
  if(/WSL|Hyper-V|Tailscale/i.test(name))continue;
  for(const entry of list||[])if(entry.family==='IPv4'&&!entry.internal)console.log(`Phone on the same Wi-Fi: http://${entry.address}:${port}`);
 }
 if(process.argv.includes('--open')&&process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'});
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Open http://127.0.0.1:${port} or close the previous server.`:error.message);process.exitCode=1;});
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
