import { spawn } from 'node:child_process';
import { detectHardware } from './hardware.mjs';

const OLLAMA='http://127.0.0.1:11434';
const LLAMA='http://127.0.0.1:8080';

async function fetchJson(url,opts={},timeout=3000){
  const ctrl=new AbortController();const id=setTimeout(()=>ctrl.abort(),timeout);
  try{const r=await fetch(url,{...opts,signal:ctrl.signal});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return await r.json()}finally{clearTimeout(id)}
}
export async function detectAI(){
  let ollama=false,llama=false,models=[];
  try{const j=await fetchJson(`${OLLAMA}/api/tags`,{},1800);ollama=true;models=(j.models||[]).map(m=>m.name)}catch{}
  try{await fetchJson(`${LLAMA}/health`,{},1200);llama=true}catch{}
  const hw=detectHardware();
  return {ollama,llamaCpp:llama,models,recommended:hw.recommendation};
}

function extractJson(text){
  text=String(text||'').trim();
  try{return JSON.parse(text)}catch{}
  const a=text.indexOf('{'),b=text.lastIndexOf('}');
  if(a>=0&&b>a){try{return JSON.parse(text.slice(a,b+1))}catch{}}
  throw new Error('A IA não retornou JSON válido.');
}

async function ollamaChat(model,messages,{temperature=.35,timeout=180000}={}){
  const j=await fetchJson(`${OLLAMA}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,stream:false,format:'json',options:{temperature}})},timeout);
  return j.message?.content||'';
}
async function llamaChat(model,messages,{temperature=.35,timeout=180000}={}){
  const j=await fetchJson(`${LLAMA}/v1/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:model||'local-model',messages,temperature,stream:false})},timeout);
  return j.choices?.[0]?.message?.content||'';
}

export async function localChat({backend='auto',model,messages,temperature=.35,timeout=180000}){
  const s=await detectAI();
  if((backend==='auto'||backend==='ollama')&&s.ollama)return await ollamaChat(model||s.recommended.model,messages,{temperature,timeout});
  if((backend==='auto'||backend==='llama')&&s.llamaCpp)return await llamaChat(model,messages,{temperature,timeout});
  throw new Error('Nenhum servidor de IA local está ativo. Instale/inicie Ollama ou llama.cpp.');
}

const ALLOWED_KINDS=['title','meadow','swarm','macro','hive','botanical','landscape','forest','water','city','space','microscopic','blueprint','abstract','night'];
const ALLOWED_ENTITIES=['bee','flower','butterfly','insect','tree','cloud','sun','bird','fish','human','hive','hex','cell','orb','star','mountain','grass'];

export async function planFilm({prompt,duration=30,backend='auto',model,preset='reels',audioMode='generated',quality='balanced'}){
  const maxScenes=Math.max(6,Math.min(48,Math.round(duration/(duration>90?5:duration>45?4:3))));
  const system=`Você é o diretor e roteirista de um motor de cinema procedural em JavaScript Canvas. Transforme a ideia do usuário em um filme coerente. Retorne SOMENTE JSON válido, sem Markdown.\n\nRestrições: cada quadro será desenhado por código; não há imagens/vídeos externos. O motor possui uma gramática de cenas. Use apenas kind em ${JSON.stringify(ALLOWED_KINDS)} e entities[].type em ${JSON.stringify(ALLOWED_ENTITIES)}. Divida exatamente toda a duração em ${maxScenes} cenas aproximadamente, com durações de 2 a 8 s. Construa começo, desenvolvimento, clímax e encerramento. Cenas devem variar escala (establishing, medium, macro), câmera e ritmo.\n\nFormato obrigatório: {"title":"...","logline":"...","mood":"...","bpm":120,"key":"C minor","palette":"riso|blueprint|nocturne|paper","acts":[{"name":"...","from":0,"to":10}],"scenes":[{"id":"s01","label":"...","duration":3.5,"kind":"meadow","shot":"wide|medium|macro","description":"o que vemos","camera":"pan|push|orbit|static|tracking","motion":"descrição curta","entities":[{"type":"bee","count":8,"role":"hero|background"}],"caption":"","hero":false,"audio":{"energy":0.4,"sfx":["buzz","wind"]}}],"audio":{"mode":"${audioMode}","style":"descrição musical curta","energyCurve":[0.2,0.5,0.8,0.4]}}}.\nA soma de scenes[].duration deve ser ${Number(duration).toFixed(3)} segundos. Não coloque textos longos na tela. Tema solicitado: ${prompt}`;
  try{
    const text=await localChat({backend,model,messages:[{role:'system',content:system},{role:'user',content:`Crie o filme procedural: ${prompt}`}],temperature:quality==='high'?.45:.3,timeout:240000});
    const plan=normalizePlan(extractJson(text),{prompt,duration,audioMode,maxScenes});
    return {plan,source:'local-ai'};
  }catch(err){
    return {plan:fallbackPlan({prompt,duration,audioMode,maxScenes}),source:'fallback',warning:err.message};
  }
}

export function normalizePlan(plan,{prompt,duration,audioMode,maxScenes}){
  if(!plan||typeof plan!=='object')plan={};
  plan.title=String(plan.title||prompt||'Filme procedural').slice(0,120);
  plan.logline=String(plan.logline||prompt||'').slice(0,500);
  plan.mood=String(plan.mood||'cinematográfico');
  plan.bpm=Math.max(60,Math.min(180,Number(plan.bpm)||112));
  plan.key=String(plan.key||'A minor');
  plan.palette=['riso','blueprint','nocturne','paper'].includes(plan.palette)?plan.palette:'riso';
  let scenes=Array.isArray(plan.scenes)?plan.scenes.slice(0,maxScenes):[];
  if(!scenes.length)return fallbackPlan({prompt,duration,audioMode,maxScenes});
  const target=Math.max(1,Number(duration)||30);
  let raw=scenes.reduce((s,x)=>s+Math.max(.2,Number(x.duration)||1),0)||1;
  let cursor=0;
  scenes=scenes.map((s,i)=>{
    const d=Math.max(.5,(Math.max(.2,Number(s.duration)||1)/raw)*target);
    const kind=ALLOWED_KINDS.includes(s.kind)?s.kind:'abstract';
    const ents=(Array.isArray(s.entities)?s.entities:[]).filter(e=>ALLOWED_ENTITIES.includes(e?.type)).slice(0,12).map(e=>({type:e.type,count:Math.max(1,Math.min(80,Math.round(Number(e.count)||1))),role:String(e.role||'background')}));
    const out={id:`s${String(i+1).padStart(2,'0')}`,label:String(s.label||`Cena ${i+1}`).slice(0,80),duration:d,start:cursor,end:cursor+d,kind,shot:['wide','medium','macro'].includes(s.shot)?s.shot:'medium',description:String(s.description||prompt).slice(0,700),camera:String(s.camera||'static').slice(0,50),motion:String(s.motion||'movimento orgânico').slice(0,300),entities:ents,caption:String(s.caption||'').slice(0,120),hero:!!s.hero,audio:{energy:Number.isFinite(Number(s.audio?.energy))?Math.max(0,Math.min(1,Number(s.audio.energy))):.5,sfx:Array.isArray(s.audio?.sfx)?s.audio.sfx.slice(0,6).map(String):[]}};
    cursor+=d;return out;
  });
  // corrige erro acumulado no último plano
  scenes.at(-1).end=target;scenes.at(-1).duration=Math.max(.5,target-scenes.at(-1).start);
  plan.scenes=scenes;plan.duration=target;
  plan.audio={mode:audioMode,style:String(plan.audio?.style||`${plan.mood}, instrumental procedural`),energyCurve:Array.isArray(plan.audio?.energyCurve)?plan.audio.energyCurve.slice(0,8).map(x=>Math.max(0,Math.min(1,Number(x)||0))):[.25,.5,.8,.4]};
  return plan;
}

export function fallbackPlan({prompt,duration=30,audioMode='generated',maxScenes=10}){
  const p=String(prompt||'filme procedural');const low=p.toLowerCase();
  const bee=/abelh|bee/.test(low), flower=/flor|flower/.test(low), space=/espa[cç]o|space|estrela|star/.test(low), water=/mar|oceano|rio|water|ocean/.test(low), city=/cidade|city|urbano/.test(low), forest=/floresta|forest/.test(low);
  const palette=space?'nocturne':city?'blueprint':'riso';
  const kinds=bee||flower?['title','landscape','meadow','swarm','macro','botanical','hive','swarm','meadow','title']:space?['title','space','space','abstract','macro','space','blueprint','space','abstract','title']:water?['title','water','landscape','water','macro','abstract','water','night','water','title']:forest?['title','forest','landscape','forest','macro','botanical','forest','night','forest','title']:city?['title','city','blueprint','city','macro','abstract','city','night','city','title']:['title','landscape','abstract','microscopic','blueprint','abstract','macro','night','landscape','title'];
  const n=Math.max(6,Math.min(maxScenes,kinds.length));const base=duration/n;let cursor=0;
  const scenes=[];for(let i=0;i<n;i++){
    const kind=kinds[i%kinds.length];const entities=[];
    if(bee){if(kind==='swarm'||kind==='macro')entities.push({type:'bee',count:kind==='macro'?1:14,role:kind==='macro'?'hero':'background'});if(kind==='meadow'||kind==='botanical')entities.push({type:'flower',count:22,role:'background'});if(kind==='hive')entities.push({type:'hive',count:1,role:'hero'},{type:'bee',count:8,role:'background'});}
    if(space)entities.push({type:'star',count:40,role:'background'});
    const d=i===n-1?duration-cursor:base;
    scenes.push({id:`s${String(i+1).padStart(2,'0')}`,label:i===0?'Abertura':i===n-1?'Encerramento':`Plano ${i+1}`,duration:d,start:cursor,end:cursor+d,kind,shot:i%4===3?'macro':i%3===0?'wide':'medium',description:p,camera:i%3===0?'push':i%3===1?'tracking':'orbit',motion:'movimento contínuo, vento e paralaxe',entities,caption:i===0?p:'',hero:i===Math.floor(n*.65),audio:{energy:i/n,sfx:bee?['buzz','wind']:['wind']}});cursor+=d;
  }
  return {title:p.slice(0,100),logline:p,mood:'cinematográfico, orgânico e contemplativo',bpm:112,key:'A minor',palette,duration,acts:[{name:'Introdução',from:0,to:duration*.25},{name:'Descoberta',from:duration*.25,to:duration*.62},{name:'Clímax',from:duration*.62,to:duration*.84},{name:'Desfecho',from:duration*.84,to:duration}],scenes,audio:{mode:audioMode,style:'ambient cinematográfico procedural',energyCurve:[.2,.4,.8,.45]}};
}

const banned=[/\bfetch\b/i,/\bXMLHttpRequest\b/i,/\bWebSocket\b/i,/\bdocument\b/i,/\bwindow\b/i,/\bglobalThis\b/i,/\blocalStorage\b/i,/\bindexedDB\b/i,/\bnavigator\b/i,/\bprocess\b/i,/\brequire\b/i,/\bimport\s*\(/i,/\beval\s*\(/i,/\bFunction\s*\(/i,/Math\s*\.\s*random/i,/\bDate\b/i,/performance\s*\.\s*now/i];
export function validateSceneCode(code){
  code=String(code||'');
  if(code.length>50000)throw new Error('Código de cena excede 50 KB.');
  for(const re of banned)if(re.test(code))throw new Error(`Código rejeitado por regra de segurança/determinismo: ${re}`);
  return code;
}

export async function generateHeroCode({scene,plan,backend='auto',model}){
  const p=`Escreva SOMENTE JSON válido {"code":"..."}. O campo code é o corpo de uma função JavaScript chamada a cada quadro com argumentos ctx,t,frame,project,E,scene,u,p. Não use window/document/fetch/eval/Function/globalThis/Date/performance/Math.random. Não crie HTML. Tudo deve ser desenhado no Canvas 2D por ctx e pela API E.\nAPI E disponível: clear, line, ellipse, poly, roundedRect, hatch, halftone, drawPaper, drawHexField, drawCellField, drawLarva, drawWingedInsect, drawBlueprintGrid, drawTitle, vignette, registrationGhost, mulberry32, hash2, fbm, lerp, clamp, smooth, smoother, easeInOut, pingpong, palettes, TAU.\nUse dimensões relativas const w=ctx.canvas.width,h=ctx.canvas.height. Seja determinístico usando project.seed e E.mulberry32. Evite texto, exceto legenda curta se scene.caption existir. Faça uma cena rica, com fundo completo, profundidade, movimento e pelo menos 5 camadas/elementos.\nFilme: ${plan.title}. Cena: ${JSON.stringify(scene)}.`;
  const text=await localChat({backend,model,messages:[{role:'system',content:'Você é um especialista em motion graphics procedural Canvas 2D e gera código compacto, determinístico e seguro.'},{role:'user',content:p}],temperature:.25,timeout:240000});
  const obj=extractJson(text);return validateSceneCode(obj.code);
}

export function pullOllamaModel(model,onLine=()=>{}){
  return new Promise((resolve,reject)=>{
    const child=spawn('ollama',['pull',model],{shell:process.platform==='win32'});let all='';
    const h=d=>{const s=d.toString();all+=s;onLine(s)};child.stdout.on('data',h);child.stderr.on('data',h);child.on('error',reject);child.on('close',c=>c===0?resolve(all):reject(new Error(`ollama pull encerrou com código ${c}`)));
  });
}
