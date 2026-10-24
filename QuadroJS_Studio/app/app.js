import { defaultProject, drawProject, timelineFor } from '../runtime/scenes.js';

const $=s=>document.querySelector(s);
const canvas=$('#canvas'), ctx=canvas.getContext('2d');
let project=loadProject();
const defaultCode=defaultProject().customCode;
let playing=false, playStart=0, playOffset=0, raf=0, exportPoll=null;

const els={
 title:$('#title'),seed:$('#seed'),width:$('#width'),height:$('#height'),fps:$('#fps'),duration:$('#duration'),palette:$('#palette'),mode:$('#mode'),guides:$('#guides'),
 play:$('#play'),restart:$('#restart'),scrub:$('#scrub'),time:$('#time'),scene:$('#scene'),frame:$('#frame'),timeline:$('#timeline'),code:$('#code'),resetCode:$('#resetCode'),
 export:$('#export'),exportWebm:$('#exportWebm'),progressBar:$('#progressBar'),exportInfo:$('#exportInfo'),status:$('#status'),canvasLabel:$('#canvasLabel')
};

function loadProject(){
  try{const raw=localStorage.getItem('quadrojs-project');return raw?{...defaultProject(),...JSON.parse(raw)}:defaultProject();}catch{return defaultProject();}
}
function save(){localStorage.setItem('quadrojs-project',JSON.stringify(project));}
function syncInputs(){for(const k of ['title','seed','width','height','fps','duration','palette','mode'])els[k].value=project[k];els.guides.checked=!!project.showGuides;els.code.value=project.customCode;resizeCanvas();renderTimeline();renderAt(currentTime());}
function readInputs(){
 project.title=els.title.value||'Projeto';project.seed=Number(els.seed.value)||0;project.width=even(+els.width.value||720);project.height=even(+els.height.value||1280);project.fps=+els.fps.value||30;project.duration=Math.max(1,+els.duration.value||10);project.palette=els.palette.value;project.mode=els.mode.value;project.showGuides=els.guides.checked;project.customCode=els.code.value;save();resizeCanvas();renderTimeline();renderAt(currentTime());
}
function even(n){n=Math.round(n);return n%2?n+1:n}
function resizeCanvas(){if(canvas.width!==project.width)canvas.width=project.width;if(canvas.height!==project.height)canvas.height=project.height;els.canvasLabel.textContent=`${project.width} × ${project.height}`}
function currentTime(){return Math.max(0,Math.min(project.duration,(+els.scrub.value/1000)*project.duration))}
function setTime(t){t=((t%project.duration)+project.duration)%project.duration;els.scrub.value=Math.round(t/project.duration*1000);renderAt(t)}
function renderAt(t){const frame=Math.round(t*project.fps);const state=drawProject(ctx,t,project,frame);els.time.textContent=fmt(t);els.frame.textContent='f'+String(frame).padStart(4,'0');els.scene.textContent=state.scene?.label||state.scene?.id||'—';markScene(state.scene?.id)}
function fmt(t){const m=Math.floor(t/60),s=t-m*60;return `${String(m).padStart(2,'0')}:${s.toFixed(3).padStart(6,'0')}`}
function renderTimeline(){
 els.timeline.innerHTML=''; if(project.mode==='custom'){const d=document.createElement('div');d.className='seg';d.style.flex='1';d.dataset.id='custom';d.innerHTML='<span>Script personalizado</span>';els.timeline.appendChild(d);return}
 for(const s of timelineFor(project)){const d=document.createElement('div');d.className='seg';d.dataset.id=s.id;d.style.flex=String(s.end-s.start);d.title=`${s.label} · ${(s.end-s.start).toFixed(2)} s`;d.innerHTML=`<span>${s.label}</span>`;d.onclick=()=>{pause();setTime(s.start+.001)};els.timeline.appendChild(d)}
}
function markScene(id){for(const n of els.timeline.children)n.classList.toggle('active',n.dataset.id===id)}
function loop(ts){if(!playing)return;const t=playOffset+(ts-playStart)/1000;if(t>=project.duration){playStart=ts;playOffset=0;setTime(0)}else setTime(t);raf=requestAnimationFrame(loop)}
function play(){if(playing)return;playing=true;playOffset=currentTime();playStart=performance.now();els.play.textContent='❚❚ Pausar';raf=requestAnimationFrame(loop)}
function pause(){playing=false;cancelAnimationFrame(raf);els.play.textContent='▶ Reproduzir'}

for(const k of ['title','seed','width','height','fps','duration','palette','mode','guides'])els[k].addEventListener('change',readInputs);
els.code.addEventListener('input',()=>{project.customCode=els.code.value;save();if(project.mode==='custom')renderAt(currentTime())});
els.scrub.addEventListener('input',()=>{pause();renderAt(currentTime())});
els.play.onclick=()=>playing?pause():play();els.restart.onclick=()=>{pause();setTime(0)};els.resetCode.onclick=()=>{els.code.value=defaultCode;project.customCode=defaultCode;save();renderAt(currentTime())};

els.export.onclick=async()=>{
 pause();readInputs();els.export.disabled=true;els.exportInfo.textContent='Iniciando renderizador…';els.progressBar.style.width='0%';els.status.textContent='Renderizando';
 try{
  const r=await fetch('/api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(project)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Falha ao iniciar exportação');
  const job=data.job; exportPoll=setInterval(async()=>{
    try{const s=await (await fetch('/api/job/'+job)).json();const pct=Math.round((s.progress||0)*100);els.progressBar.style.width=pct+'%';els.exportInfo.textContent=s.message||`${pct}%`;
      if(s.state==='done'){clearInterval(exportPoll);els.export.disabled=false;els.status.textContent='Concluído';els.progressBar.style.width='100%';els.exportInfo.innerHTML=`Concluído: <a href="${s.download}" target="_blank">baixar ${s.file}</a>`}
      if(s.state==='error'){clearInterval(exportPoll);els.export.disabled=false;els.status.textContent='Erro';els.exportInfo.textContent=s.error||'Falha na exportação'}
    }catch{}
  },650);
 }catch(err){els.export.disabled=false;els.status.textContent='Erro';els.exportInfo.textContent=err.message}
};



els.exportWebm.onclick=async()=>{
 pause();readInputs();
 if(!window.MediaRecorder || !canvas.captureStream){els.exportInfo.textContent='Este navegador não oferece MediaRecorder/captureStream.';return}
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
 if(!mime){els.exportInfo.textContent='Nenhum codec WebM compatível foi encontrado.';return}
 els.exportWebm.disabled=true;els.export.disabled=true;els.status.textContent='Gravando WebM';els.exportInfo.textContent='Gravação em tempo real iniciada…';els.progressBar.style.width='0%';
 const chunks=[];const stream=canvas.captureStream(project.fps);const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.max(2_000_000,Math.min(30_000_000,project.width*project.height*project.fps*.12))});
 rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
 rec.onerror=e=>{els.exportInfo.textContent='Erro no MediaRecorder: '+(e.error?.message||e.message||e.type)};
 const done=new Promise(resolve=>rec.onstop=resolve);
 rec.start(500); const start=performance.now();
 await new Promise(resolve=>{
   const step=now=>{const t=(now-start)/1000;const clamped=Math.min(project.duration,t);els.scrub.value=Math.round(clamped/project.duration*1000);renderAt(clamped);els.progressBar.style.width=Math.min(100,clamped/project.duration*100)+'%';
     if(t<project.duration)requestAnimationFrame(step);else resolve();};requestAnimationFrame(step);
 });
 await new Promise(r=>setTimeout(r,80));rec.stop();await done;
 const blob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download=(project.title||'quadrojs').replace(/[^\w-]+/g,'_')+'_'+project.width+'x'+project.height+'.webm';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 els.progressBar.style.width='100%';els.exportInfo.textContent='WebM gerado no navegador.';els.status.textContent='Concluído';els.exportWebm.disabled=false;els.export.disabled=false;
};

syncInputs();
