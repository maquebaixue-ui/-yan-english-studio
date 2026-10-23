import {readFile,stat,open} from 'node:fs/promises';
import path from 'node:path';

// Only the public catalogue's fixed PDF filenames can be served. Private AI
// configuration and user media are never reachable through this handler.
export function createMaterialService({directory,resources,hosts}){
 const entries=resources.filter(x=>x.download&&/^[a-zA-Z0-9_-]+\.pdf$/.test(x.download.file));
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 const json=(res,status,data)=>res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8'}).end(JSON.stringify(data));
 return async(req,res,pathname)=>{
  if(pathname!=='/api/materials/status'&&!pathname.startsWith('/materials/'))return false;
  if(!hosts.has(req.headers.host)||req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`){json(res,403,{error:'请使用项目的本机或局域网网址。'});return true;}
  if(!['GET','HEAD'].includes(req.method)){json(res,405,{error:'只支持读取资料。'});return true;}
  if(pathname==='/api/materials/status'){
   const files=(await Promise.all(entries.map(async x=>{let file;try{file=await open(path.join(directory,x.download.file),'r');const info=await file.stat();if(!info.isFile()||info.size<=5||info.size>32*1024*1024)return null;const header=Buffer.alloc(5);await file.read(header,0,5,0);return header.toString()==='%PDF-'?{id:x.id,bytes:info.size}:null;}catch{return null;}finally{await file?.close().catch(()=>{});}}))).filter(Boolean);
   json(res,200,{files});return true;
  }
  const item=entries.find(x=>pathname===`/materials/${x.download.file}`);
  if(!item){json(res,404,{error:'没有此资料。'});return true;}
  try{
   const file=path.join(directory,item.download.file),info=await stat(file);
   if(!info.isFile()||info.size>32*1024*1024)throw new Error();
   const data=await readFile(file);if(data.subarray(0,5).toString()!=='%PDF-')throw new Error();
   res.writeHead(200,{...headers,'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${item.download.file}"`,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
  }catch{json(res,404,{error:'本机没有这份 PDF，请运行 npm run materials 或从官方来源下载。'});}
  return true;
 };
}
