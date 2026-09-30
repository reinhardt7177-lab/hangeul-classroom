import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=fs.existsSync(path.join(here,'dist','index.html'))?path.join(here,'dist'):path.join(here,'수업앱');
const port=Number(process.env.PORT)||4198;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.mp4':'video/mp4'};
http.createServer((req,res)=>{let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 if(p==='/classroom-addresses'){
  if(!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)){res.writeHead(403);res.end();return;}
  const addresses=Object.entries(os.networkInterfaces()).flatMap(([name,items])=>(items||[]).filter(n=>n.family==='IPv4'&&!n.internal&&/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(n.address)).map(n=>({name,url:`http://${n.address}:${port}/`})));
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({addresses}));return;
 }
 const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return}
  const type=types[path.extname(file)]||'application/octet-stream',size=data.length;
  // Safari (Mac, iPad) plays video only when the server answers byte ranges with 206.
  const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range||'');
  if(range&&(range[1]||range[2])){
   const start=range[1]===''?Math.max(0,size-Number(range[2])):Number(range[1]);
   const end=range[1]===''||range[2]===''?size-1:Math.min(Number(range[2]),size-1);
   if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return}
   res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1,'Accept-Ranges':'bytes','Cache-Control':'no-store'});res.end(data.subarray(start,end+1));return;
  }
  res.writeHead(200,{'Content-Type':type,'Accept-Ranges':'bytes','Cache-Control':'no-store'});res.end(data)})}).listen(port,'0.0.0.0',()=>console.log(`Local: http://localhost:${port}`));
