import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { renderProject, findBrowser, findFFmpeg } from './core/exporter.mjs';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const OUTPUT=path.join(ROOT,'output');
fs.mkdirSync(OUTPUT,{recursive:true});
const jobs=new Map();
let baseUrl='';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.txt':'text/plain; charset=utf-8'};
function json(res,status,obj){const b=Buffer.from(JSON.stringify(obj));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b)}
async function bodyJson(req,limit=2_000_000){return await new Promise((resolve,reject)=>{let n=0,ch=[];req.on('data',d=>{n+=d.length;if(n>limit){reject(new Error('Payload grande demais'));req.destroy();return}ch.push(d)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(ch).toString('utf8')||'{}'))}catch(e){reject(e)}});req.on('error',reject)})}
function validateProject(p){
  if(!p||typeof p!=='object')throw new Error('Projeto inválido');
  const q={...p};q.width=Math.max(240,Math.min(3840,Math.round(+q.width||720)));q.height=Math.max(240,Math.min(3840,Math.round(+q.height||1280)));if(q.width%2)q.width++;if(q.height%2)q.height++;
  q.fps=[24,30,60].includes(+q.fps)?+q.fps:30;q.duration=Math.max(1,Math.min(600,+q.duration||10));q.seed=Math.round(+q.seed||0);q.mode=q.mode==='custom'?'custom':'timeline';
  if(typeof q.customCode!=='string')q.customCode='';if(q.customCode.length>300_000)throw new Error('Script personalizado excede 300 KB.');
  if(q.duration*q.fps>36_000)throw new Error('Projeto excede o limite de 36.000 quadros desta versão.');
  return q;
}
function startJob(project){
  const id=Math.random().toString(36).slice(2,10)+Date.now().toString(36);const job={id,state:'queued',progress:0,message:'Na fila'};jobs.set(id,job);
  setImmediate(async()=>{try{job.state='running';const out=await renderProject({project,baseUrl,outputDir:OUTPUT,onProgress:(progress,message)=>{job.progress=progress;job.message=message}});Object.assign(job,{state:'done',progress:1,message:'Concluído',file:out.filename,download:'/output/'+encodeURIComponent(out.filename),frames:out.totalFrames});}catch(e){Object.assign(job,{state:'error',error:String(e?.stack||e),message:'Falha na exportação'})}});
  return job;
}

const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,baseUrl||'http://127.0.0.1');
  try{
    if(req.method==='GET'&&u.pathname==='/api/status')return json(res,200,{ok:true,browser:findBrowser(),ffmpeg:findFFmpeg()});
    if(req.method==='POST'&&u.pathname==='/api/export'){const p=validateProject(await bodyJson(req));const job=startJob(p);return json(res,202,{job:job.id})}
    if(req.method==='GET'&&u.pathname.startsWith('/api/job/')){const id=u.pathname.split('/').pop();const j=jobs.get(id);return j?json(res,200,j):json(res,404,{error:'Job não encontrado'})}
    if(req.method==='GET'&&u.pathname==='/'){res.writeHead(302,{Location:'/app/index.html'});return res.end()}
    let rel=decodeURIComponent(u.pathname).replace(/^\/+/, '');
    const abs=path.resolve(ROOT,rel);if(!abs.startsWith(ROOT+path.sep)&&abs!==ROOT){res.writeHead(403);return res.end('Forbidden')}
    if(!fs.existsSync(abs)||!fs.statSync(abs).isFile()){res.writeHead(404);return res.end('Not found')}
    const stat=fs.statSync(abs);res.writeHead(200,{'Content-Type':mime[path.extname(abs).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':rel.startsWith('output/')?'public, max-age=3600':'no-cache'});fs.createReadStream(abs).pipe(res);
  }catch(e){json(res,500,{error:e.message||String(e)})}
});

server.listen(0,'127.0.0.1',()=>{
  const port=server.address().port;baseUrl=`http://127.0.0.1:${port}`;
  console.log('\nQuadroJS Studio v0.1.0');
  console.log('-----------------------');
  console.log('Interface:',baseUrl);
  console.log('Browser de render:',findBrowser()||'NÃO ENCONTRADO');
  console.log('FFmpeg:',findFFmpeg());
  console.log('\nPressione Ctrl+C para encerrar.\n');
  openBrowser(baseUrl);
});

function openBrowser(url){
  try{
    if(process.platform==='win32')spawn('cmd',['/c','start','',url],{detached:true,stdio:'ignore'}).unref();
    else if(process.platform==='darwin')spawn('open',[url],{detached:true,stdio:'ignore'}).unref();
    else spawn('xdg-open',[url],{detached:true,stdio:'ignore'}).unref();
  }catch{}
}
