import fs from 'node:fs';
import path from 'node:path';

function clamp(v,a=-1,b=1){return Math.max(a,Math.min(b,v))}
function noteHz(midi){return 440*Math.pow(2,(midi-69)/12)}
function hash(n){return ((Math.sin(n*12.9898+78.233)*43758.5453)%1+1)%1}
function keyRoot(key='A minor'){
  const m=String(key).match(/^([A-G])([#b]?)/i);if(!m)return 57;
  const map={C:60,D:62,E:64,F:65,G:67,A:69,B:71};let n=map[m[1].toUpperCase()]||69;if(m[2]==='#')n++;if(m[2]==='b')n--;return n-12;
}
function addSine(buf,sr,start,dur,freq,amp,pan=0,decay=3){
  const i0=Math.max(0,Math.floor(start*sr)),i1=Math.min(buf.L.length,Math.ceil((start+dur)*sr));
  for(let i=i0;i<i1;i++){const x=(i/sr-start)/dur;const env=Math.pow(Math.max(0,1-x),decay);const v=Math.sin((i/sr-start)*Math.PI*2*freq)*amp*env;buf.L[i]+=v*(1-pan*.5);buf.R[i]+=v*(1+pan*.5)}
}
function addNoise(buf,sr,start,dur,amp,seed=1,pan=0){
  const i0=Math.max(0,Math.floor(start*sr)),i1=Math.min(buf.L.length,Math.ceil((start+dur)*sr));
  let s=seed|0;for(let i=i0;i<i1;i++){s=(Math.imul(s,1664525)+1013904223)|0;const r=((s>>>0)/4294967296)*2-1;const x=(i/sr-start)/dur;const env=Math.sin(Math.PI*Math.max(0,Math.min(1,x)));const v=r*amp*env;buf.L[i]+=v*(1-pan*.5);buf.R[i]+=v*(1+pan*.5)}
}
function writeWav(file,L,R,sr=48000){
  const n=L.length;const data=Buffer.alloc(n*4);for(let i=0;i<n;i++){data.writeInt16LE(Math.round(clamp(L[i]) * 32767),i*4);data.writeInt16LE(Math.round(clamp(R[i]) * 32767),i*4+2)}
  const h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(36+data.length,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(2,22);h.writeUInt32LE(sr,24);h.writeUInt32LE(sr*4,28);h.writeUInt16LE(4,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(data.length,40);fs.writeFileSync(file,Buffer.concat([h,data]));
}
export function renderProceduralAudio({project,outputDir}){
  const plan=project.filmPlan||{};const duration=Math.max(1,Number(project.duration)||30);const sr=48000,n=Math.ceil(duration*sr);const buf={L:new Float32Array(n),R:new Float32Array(n)};
  const bpm=Math.max(60,Math.min(180,Number(plan.bpm)||112));const beat=60/bpm;const root=keyRoot(plan.key);const minor=/minor|menor/i.test(plan.key||'');const scale=minor?[0,3,5,7,10]:[0,4,5,7,9];
  // pulso e baixo
  for(let t=0,k=0;t<duration;t+=beat,k++){
    addSine(buf,sr,t,.24,54+(k%4===0?0:3),.12,0,5);
    if(k%2===0)addSine(buf,sr,t,.9,noteHz(root-12+(k%4===0?0:7)),.075,0,1.7);
    const nn=root+scale[(k*3)%scale.length]+12*(k%8>5?1:0);addSine(buf,sr,t+beat*.5,beat*.65,noteHz(nn),.035,(hash(k)-.5)*.7,2.2);
  }
  // pads muito leves por compasso
  for(let t=0,b=0;t<duration;t+=beat*4,b++){
    const chord=[0,minor?3:4,7];for(let j=0;j<3;j++)addSine(buf,sr,t,Math.min(beat*4,duration-t),noteHz(root+chord[j]),.018,(j-1)*.35,.35);
  }
  // SFX orientados pelo storyboard
  for(const s of plan.scenes||[]){
    const st=Number(s.start)||0,en=Number(s.end)||st+(Number(s.duration)||2),mid=(st+en)/2;const names=(s.audio?.sfx||[]).join(' ').toLowerCase();
    if(/buzz|abelh|bee/.test(names)||s.entities?.some(e=>e.type==='bee')){for(let q=0;q<Math.max(1,Math.floor((en-st)*2));q++)addSine(buf,sr,st+q*.5,.35,155+hash(q+st)*70,.018,(hash(q*9)-.5),3)}
    if(/wind|vento/.test(names))addNoise(buf,sr,st,en-st,.012,Math.floor(st*99+17));
    if(s.hero)addSine(buf,sr,Math.max(0,mid-.08),.8,noteHz(root+24),.07,0,4);
  }
  // fade global e limitador simples
  const fade=Math.min(sr*.6,n/4);for(let i=0;i<n;i++){let g=1;if(i<fade)g=i/fade;if(i>n-fade)g=Math.min(g,(n-i)/fade);buf.L[i]=Math.tanh(buf.L[i]*1.4)*.72*g;buf.R[i]=Math.tanh(buf.R[i]*1.4)*.72*g}
  fs.mkdirSync(outputDir,{recursive:true});const file=path.join(outputDir,`audio_${Date.now().toString(36)}.wav`);writeWav(file,buf.L,buf.R,sr);return file;
}
