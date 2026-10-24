import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';

function exists(p){try{return !!p && fs.existsSync(p)}catch{return false}}

export function findFFmpeg(){
  const env=process.env.FFMPEG_PATH;
  const candidates=[env,
    process.platform==='win32'?'C:\\ffmpeg\\bin\\ffmpeg.exe':null,
    process.platform==='win32'?'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe':null,
    '/usr/bin/ffmpeg','/usr/local/bin/ffmpeg','/opt/homebrew/bin/ffmpeg'
  ].filter(Boolean);
  for(const p of candidates)if(exists(p))return p;
  return 'ffmpeg';
}

export function findBrowser(){
  const env=process.env.CHROME_PATH || process.env.CHROMIUM_PATH;
  const c=[]; if(env)c.push(env);
  if(process.platform==='win32'){
    const pf=process.env['PROGRAMFILES']||'C:\\Program Files';
    const pfx=process.env['PROGRAMFILES(X86)']||'C:\\Program Files (x86)';
    const lad=process.env.LOCALAPPDATA||'';
    c.push(path.join(pf,'Google','Chrome','Application','chrome.exe'),path.join(pfx,'Google','Chrome','Application','chrome.exe'),path.join(lad,'Google','Chrome','Application','chrome.exe'),path.join(pf,'Microsoft','Edge','Application','msedge.exe'),path.join(pfx,'Microsoft','Edge','Application','msedge.exe'));
  } else if(process.platform==='darwin') {
    c.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Chromium.app/Contents/MacOS/Chromium','/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  } else {
    c.push('/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/snap/bin/chromium');
  }
  return c.find(exists)||null;
}

async function freePort(){
  return await new Promise((resolve,reject)=>{const s=net.createServer();s.unref();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});
}
function delay(ms){return new Promise(r=>setTimeout(r,ms))}
async function waitJson(url,tries=80){let last;for(let i=0;i<tries;i++){try{const r=await fetch(url);if(r.ok)return await r.json()}catch(e){last=e}await delay(100)}throw last||new Error('Timeout aguardando navegador')}

class CDP {
  constructor(wsUrl){this.ws=new WebSocket(wsUrl);this.id=0;this.pending=new Map()}
  async open(){await new Promise((res,rej)=>{this.ws.onopen=res;this.ws.onerror=rej});this.ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&this.pending.has(m.id)){const {res,rej}=this.pending.get(m.id);this.pending.delete(m.id);m.error?rej(new Error(m.error.message)):res(m.result)}};return this}
  send(method,params={}){const id=++this.id;return new Promise((res,rej)=>{this.pending.set(id,{res,rej});this.ws.send(JSON.stringify({id,method,params}))})}
  close(){try{this.ws.close()}catch{}}
}

function waitProc(proc){return new Promise((res,rej)=>{let err='';proc.stderr?.on('data',d=>err+=d);proc.on('error',rej);proc.on('close',code=>code===0?res():rej(new Error(err||`Processo encerrou com código ${code}`)))})}
function safeName(s){return String(s||'video').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60)||'video'}

export async function renderProject({project,baseUrl,outputDir,onProgress=()=>{}}){
  const browser=findBrowser(); if(!browser)throw new Error('Chrome/Chromium/Edge não encontrado. Defina CHROME_PATH.');
  const ffmpeg=findFFmpeg();
  const total=Math.max(1,Math.ceil(project.duration*project.fps));
  fs.mkdirSync(outputDir,{recursive:true});
  const filename=`${safeName(project.title)}_${project.width}x${project.height}_${project.fps}fps.mp4`;
  const output=path.join(outputDir,filename);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'quadrojs-'));
  const port=await freePort();
  const url=`${baseUrl}/app/render.html`;
  const args=[`--remote-debugging-port=${port}`,`--user-data-dir=${tmp}`,'--headless=new','--hide-scrollbars','--disable-extensions','--disable-background-networking','--disable-sync','--no-first-run','--no-default-browser-check','--disable-dev-shm-usage',`--window-size=${project.width},${project.height}`,'about:blank'];
  if(process.platform!=='win32')args.push('--no-sandbox');
  const chrome=spawn(browser,args,{stdio:['ignore','ignore','ignore']});
  let cdp, ff;
  try{
    onProgress(0.01,'Inicializando Chromium…');
    const targets=await waitJson(`http://127.0.0.1:${port}/json/list`);
    let page=targets.find(t=>t.type==='page');
    if(!page){await delay(250);const t2=await waitJson(`http://127.0.0.1:${port}/json/list`);page=t2.find(t=>t.type==='page')}
    if(!page)throw new Error('Não foi possível localizar a página de renderização.');
    cdp=await new CDP(page.webSocketDebuggerUrl).open();
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate',{url});
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:project.width,height:project.height,deviceScaleFactor:1,mobile:false,screenWidth:project.width,screenHeight:project.height});
    // Aguarda módulos JS.
    for(let i=0;i<100;i++){const r=await cdp.send('Runtime.evaluate',{expression:'Boolean(window.__ready)',returnByValue:true});if(r.result?.value)break;await delay(60);if(i===99)throw new Error('Timeout carregando o renderizador.')}
    const pj=JSON.stringify(project).replace(/</g,'\\u003c');
    await cdp.send('Runtime.evaluate',{expression:`window.__setProject(${pj})`,awaitPromise:true,returnByValue:true});

    onProgress(0.02,'Abrindo FFmpeg…');
    ff=spawn(ffmpeg,['-y','-hide_banner','-loglevel','error','-f','image2pipe','-framerate',String(project.fps),'-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:['pipe','ignore','pipe']});
    let ffErr='';ff.stderr.on('data',d=>ffErr+=d.toString());

    for(let frame=0;frame<total;frame++){
      await cdp.send('Runtime.evaluate',{expression:`window.__renderAt(${frame})`,awaitPromise:true,returnByValue:true});
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
      const buf=Buffer.from(shot.data,'base64');
      if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
      if(frame%Math.max(1,Math.floor(project.fps/2))===0 || frame===total-1){const p=(frame+1)/total;onProgress(.02+p*.96,`Quadro ${frame+1}/${total} · ${(p*100).toFixed(1)}%`)}
    }
    ff.stdin.end();
    await new Promise((resolve,reject)=>{ff.on('close',code=>code===0?resolve():reject(new Error(ffErr||`FFmpeg encerrou com código ${code}`)));ff.on('error',reject)});
    onProgress(1,'Concluído');
    return {output,filename,totalFrames:total};
  } finally {
    try{cdp?.close()}catch{};try{chrome.kill('SIGKILL')}catch{};try{if(ff&&!ff.killed)ff.kill('SIGKILL')}catch{};try{fs.rmSync(tmp,{recursive:true,force:true})}catch{}
  }
}
