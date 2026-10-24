import { spawn } from 'node:child_process';
import { detectHardware } from './hardware.mjs';

const OLLAMA='http://127.0.0.1:11434';
const LLAMA='http://127.0.0.1:8080';

async function fetchJson(url,opts={},timeout=3000){
  const ctrl=new AbortController(); const id=setTimeout(()=>ctrl.abort(),timeout);
  try{const r=await fetch(url,{...opts,signal:ctrl.signal});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return await r.json()}finally{clearTimeout(id)}
}
export async function detectAI(){
  let ollama=false,llama=false,models=[];
  try{const j=await fetchJson(`${OLLAMA}/api/tags`,{},1800);ollama=true;models=(j.models||[]).map(m=>m.name)}catch{}
  try{await fetchJson(`${LLAMA}/health`,{},1200);llama=true}catch{}
  const hw=detectHardware();
  const visionModels=models.filter(m=>/qwen3-vl|llava|gemma3|vision/i.test(m));
  return {ollama,llamaCpp:llama,models,visionModels,recommended:hw.recommendation};
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

export function promptFingerprint(prompt){
  const s=String(prompt||'').normalize('NFKC').trim().toLowerCase(); let h=2166136261>>>0;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}
  return `p${h.toString(16).padStart(8,'0')}`;
}

export const ENTITY_TYPES=[
  'wolf','fox','dog','cat','horse','deer','bear','rabbit','lion','tiger','elephant','cow','sheep','goat',
  'bee','butterfly','dragonfly','insect','bird','fish','whale','dolphin','human','tree','flower','grass','cloud','sun','moon',
  'hive','hex','cell','orb','star','mountain','rock','water','snow','rain','fire','vehicle','building','robot','generic_animal'
];
export const SCENE_KINDS=['title','field','meadow','forest','mountain','desert','snow','water','city','space','microscopic','blueprint','abstract','night','interior','botanical'];
export const SHOT_TYPES=['cold_open','establishing','tracking','development','macro_texture','blueprint_genesis','blueprint_mechanism','silhouette_transform','time_passage','pullback_reveal','population_column','snap_zoom','match_cut','montage','closing_loop'];
const CAMERA=['static','push','pull','pan','tilt','tracking','orbit','handheld','crane','snap_zoom'];

const PT_ENTITY_PATTERNS=[
  ['wolf',/\b(lobo|lobos|wolf|wolves)\b/i],['fox',/\b(raposa|raposas|fox|foxes)\b/i],['dog',/\b(cachorro|cachorros|cão|cães|dog|dogs)\b/i],['cat',/\b(gato|gatos|cat|cats)\b/i],['horse',/\b(cavalo|cavalos|horse|horses)\b/i],['deer',/\b(cervo|cervos|veado|veados|deer)\b/i],['bear',/\b(urso|ursos|bear|bears)\b/i],['rabbit',/\b(coelho|coelhos|rabbit|rabbits)\b/i],['lion',/\b(leão|leões|lion|lions)\b/i],['tiger',/\b(tigre|tigres|tiger|tigers)\b/i],['elephant',/\b(elefante|elefantes|elephant|elephants)\b/i],
  ['bee',/\b(abelha|abelhas|bee|bees)\b/i],['butterfly',/\b(borboleta|borboletas|butterfly|butterflies)\b/i],['bird',/\b(pássaro|pássaros|ave|aves|bird|birds)\b/i],['fish',/\b(peixe|peixes|fish)\b/i],['human',/\b(homem|mulher|pessoa|pessoas|humano|human|people|person)\b/i],['robot',/\b(robô|robôs|robot|robots)\b/i]
];
function inferEntities(prompt){const out=[];for(const [type,re] of PT_ENTITY_PATTERNS)if(re.test(prompt))out.push(type);return out}
function inferEnvironment(prompt){const p=String(prompt).toLowerCase();if(/neve|snow|gelo|ice/.test(p))return 'snow';if(/deserto|desert/.test(p))return 'desert';if(/floresta|forest|woods|bosque/.test(p))return 'forest';if(/campo|field|prado|meadow|flor|flower/.test(p))return 'field';if(/montanha|mountain/.test(p))return 'mountain';if(/cidade|city|urbano|urban/.test(p))return 'city';if(/mar|oceano|rio|lago|water|ocean|sea/.test(p))return 'water';if(/espaço|space|galáxia|galaxy|estrela|star/.test(p))return 'space';return 'abstract'}
function fallbackSubject(prompt){
  const entities=inferEntities(prompt);const primary=entities[0]||'generic_animal';const env=inferEnvironment(prompt);
  return {primary,primaryLabel:primary==='generic_animal'?String(prompt).slice(0,80):primary,entityTypes:entities.length?entities:[primary],environment:env,action:/corr|run|galop/i.test(prompt)?'running':'moving',mustShow:entities.length?entities:[primary],mustNotShow:[],visualKeywords:['cinematic','hand-inked','procedural'],promptFingerprint:promptFingerprint(prompt)};
}

export async function analyzeSubject({prompt,backend='auto',model}){
  const fallback=fallbackSubject(prompt);
  const sys=`Você é um supervisor de continuidade. Analise APENAS a frase atual e devolva SOMENTE JSON. Nunca reutilize assunto de conversa anterior.\nTipos de entidade permitidos: ${ENTITY_TYPES.join(', ')}. Ambientes: ${SCENE_KINDS.join(', ')}.\nFormato: {"primary":"wolf","primaryLabel":"lobos","entityTypes":["wolf"],"environment":"field","action":"running","mustShow":["wolf","grass"],"mustNotShow":["bee"],"visualKeywords":["velocidade","vento"]}.\nSe o usuário não pediu abelhas, não inclua bee. Se não pediu um animal específico, use generic_animal. Frase atual: ${JSON.stringify(prompt)}`;
  try{
    const text=await localChat({backend,model,messages:[{role:'system',content:sys},{role:'user',content:`Extraia o contrato visual desta frase e somente desta frase: ${prompt}`}],temperature:.05,timeout:120000});
    const raw=extractJson(text);const entityTypes=(Array.isArray(raw.entityTypes)?raw.entityTypes:[]).filter(x=>ENTITY_TYPES.includes(x));
    const primary=ENTITY_TYPES.includes(raw.primary)?raw.primary:(entityTypes[0]||fallback.primary);
    const environment=SCENE_KINDS.includes(raw.environment)?raw.environment:fallback.environment;
    const contract={primary,primaryLabel:String(raw.primaryLabel||fallback.primaryLabel).slice(0,80),entityTypes:entityTypes.length?entityTypes:[primary],environment,action:String(raw.action||fallback.action).slice(0,120),mustShow:(Array.isArray(raw.mustShow)?raw.mustShow:[]).map(String).slice(0,12),mustNotShow:(Array.isArray(raw.mustNotShow)?raw.mustNotShow:[]).map(String).slice(0,12),visualKeywords:(Array.isArray(raw.visualKeywords)?raw.visualKeywords:[]).map(String).slice(0,12),promptFingerprint:promptFingerprint(prompt)};
    // A frase do usuário vence a IA em caso de conflito de espécie.
    const explicit=inferEntities(prompt);if(explicit.length){contract.primary=explicit[0];contract.entityTypes=[...new Set([...explicit,...contract.entityTypes.filter(x=>explicit.includes(x))])];contract.mustShow=[...new Set([...explicit,...contract.mustShow])];}
    return {contract,source:'local-ai'};
  }catch(err){return {contract:fallback,source:'fallback',warning:err.message}}
}

function normalizeArtBible(v={},subject={}){
  const p=Array.isArray(v.palette)?v.palette.filter(x=>/^#[0-9a-f]{6}$/i.test(x)).slice(0,7):[];
  return {style:String(v.style||'hand-inked editorial animation on textured paper').slice(0,220),palette:p.length>=4?p:['#efe3c9','#171724','#334b3f','#b54d43','#d2a737','#6b7f8f'],line:String(v.line||'variable ink line, subtle boil, dense hatching').slice(0,180),texture:String(v.texture||'paper grain, halftone, cross-hatching').slice(0,180),lighting:String(v.lighting||'graphic directional light, flat color, no photoreal gradients').slice(0,180),cameraGrammar:(Array.isArray(v.cameraGrammar)?v.cameraGrammar:[]).map(String).slice(0,8),heroDesign:{silhouette:String(v.heroDesign?.silhouette||`${subject.primaryLabel||subject.primary} recognizable in silhouette`).slice(0,220),colors:(Array.isArray(v.heroDesign?.colors)?v.heroDesign.colors:[]).filter(x=>/^#[0-9a-f]{6}$/i.test(x)).slice(0,6),marks:(Array.isArray(v.heroDesign?.marks)?v.heroDesign.marks:[]).map(String).slice(0,10)},environmentDesign:String(v.environmentDesign||`${subject.environment} with layered foreground, midground and background`).slice(0,350),continuityRules:(Array.isArray(v.continuityRules)?v.continuityRules:[]).map(String).slice(0,12)};
}

function normalizeScene(s,i,subject,prompt){
  const kind=SCENE_KINDS.includes(s.kind)?s.kind:(subject.environment==='field'?'field':subject.environment);
  const shotType=SHOT_TYPES.includes(s.shotType)?s.shotType:(i===0?'cold_open':'tracking');
  const entities=(Array.isArray(s.entities)?s.entities:[]).map(e=>({type:ENTITY_TYPES.includes(e?.type)?e.type:null,count:Math.max(1,Math.min(120,Math.round(Number(e?.count)||1))),role:['hero','support','background','environment'].includes(e?.role)?e.role:'background',id:String(e?.id||'').slice(0,60)})).filter(e=>e.type);
  // nunca introduzir automaticamente a espécie de outro filme. Se a cena tem herói, force a espécie atual.
  if((s.hero||['cold_open','tracking','development','macro_texture','population_column','closing_loop'].includes(shotType))&&!entities.some(e=>e.role==='hero'))entities.unshift({type:subject.primary,count:1,role:'hero',id:'hero'});
  return {id:`s${String(i+1).padStart(2,'0')}`,label:String(s.label||`Plano ${i+1}`).slice(0,90),duration:Math.max(.25,Number(s.duration)||2.5),kind,shotType,shot:['wide','medium','close','macro','extreme_wide'].includes(s.shot)?s.shot:'medium',description:String(s.description||prompt).slice(0,850),camera:CAMERA.includes(s.camera)?s.camera:'tracking',motion:String(s.motion||subject.action||'organic motion').slice(0,360),entities,caption:String(s.caption||'').slice(0,100),hero:!!s.hero,transitionIn:String(s.transitionIn||'cut').slice(0,40),continuity:{heroId:String(s.continuity?.heroId||'hero'),entersFrom:String(s.continuity?.entersFrom||'none'),exitsTo:String(s.continuity?.exitsTo||'none'),facing:['left','right','front','back'].includes(s.continuity?.facing)?s.continuity.facing:'right',screenXStart:Math.max(.05,Math.min(.95,Number(s.continuity?.screenXStart)||.32)),screenXEnd:Math.max(.05,Math.min(.95,Number(s.continuity?.screenXEnd)||.68)),scaleStart:Math.max(.2,Math.min(3,Number(s.continuity?.scaleStart)||1)),scaleEnd:Math.max(.2,Math.min(3,Number(s.continuity?.scaleEnd)||1))},audio:{energy:Number.isFinite(Number(s.audio?.energy))?Math.max(0,Math.min(1,Number(s.audio.energy))):.5,sfx:Array.isArray(s.audio?.sfx)?s.audio.sfx.slice(0,8).map(String):[]}};
}

export function normalizePlan(plan,{prompt,duration,audioMode,maxScenes,subject}){
  if(!plan||typeof plan!=='object')plan={};const target=Math.max(1,Number(duration)||30);subject=subject||fallbackSubject(prompt);
  plan.promptFingerprint=promptFingerprint(prompt);plan.subject={...subject,promptFingerprint:plan.promptFingerprint};
  plan.title=String(plan.title||prompt||'Filme procedural').slice(0,120);plan.logline=String(plan.logline||prompt||'').slice(0,500);plan.mood=String(plan.mood||'cinematográfico');plan.bpm=Math.max(60,Math.min(180,Number(plan.bpm)||112));plan.key=String(plan.key||'A minor');plan.palette=['riso','blueprint','nocturne','paper'].includes(plan.palette)?plan.palette:(subject.environment==='space'||subject.environment==='night'?'nocturne':'paper');plan.artBible=normalizeArtBible(plan.artBible,subject);
  let scenes=Array.isArray(plan.scenes)?plan.scenes.slice(0,maxScenes):[];if(!scenes.length)return fallbackPlan({prompt,duration,audioMode,maxScenes,subject});
  scenes=scenes.map((s,i)=>normalizeScene(s,i,subject,prompt));const raw=scenes.reduce((sum,s)=>sum+s.duration,0)||1;let cursor=0;
  scenes=scenes.map((s,i)=>{const d=Math.max(.35,s.duration/raw*target);const out={...s,duration:d,start:cursor,end:cursor+d};cursor+=d;return out});scenes.at(-1).end=target;scenes.at(-1).duration=Math.max(.35,target-scenes.at(-1).start);
  // Continuidade temporal canônica: a saída de um plano alimenta a entrada do próximo.
  for(let i=1;i<scenes.length;i++){const a=scenes[i-1],b=scenes[i];if(b.continuity.entersFrom==='previous'||b.transitionIn==='match_cut'){b.continuity.screenXStart=a.continuity.screenXEnd;b.continuity.scaleStart=a.continuity.scaleEnd;b.continuity.facing=a.continuity.facing}}
  plan.scenes=scenes;plan.duration=target;plan.acts=Array.isArray(plan.acts)?plan.acts.slice(0,6):[];plan.audio={mode:audioMode,style:String(plan.audio?.style||`${plan.mood}, cinematic procedural score`),energyCurve:Array.isArray(plan.audio?.energyCurve)?plan.audio.energyCurve.slice(0,10).map(x=>Math.max(0,Math.min(1,Number(x)||0))):[.18,.42,.82,.38]};
  return plan;
}

function planPrompt({prompt,duration,maxScenes,audioMode,subject}){
  return `Você é diretor de animação autoral, storyboard artist e motion designer. Crie um filme procedural premium, não uma sequência de cartões independentes. Retorne SOMENTE JSON válido.\n\nCONTRATO DO ASSUNTO (imutável): ${JSON.stringify(subject)}\nA espécie/objeto principal é ${subject.primary}. Não introduza qualquer espécie principal diferente e nunca use conteúdo de filmes anteriores.\n\nO filme será desenhado quadro a quadro em JavaScript Canvas 2D, sem imagens prontas. Duração exata: ${duration}s. Aproximadamente ${maxScenes} planos.\nUse scene.kind somente em ${JSON.stringify(SCENE_KINDS)}; shotType somente em ${JSON.stringify(SHOT_TYPES)}; entity.type somente em ${JSON.stringify(ENTITY_TYPES)}; camera em ${JSON.stringify(CAMERA)}.\n\nNÍVEL VISUAL: curta de festival/animação editorial premium. Cada plano precisa ter intenção cinematográfica, profundidade em camadas, movimento secundário e uma composição que sobreviva como still. Evite repetir a mesma câmera, enquadramento ou composição em planos consecutivos. Use macro, tracking, pullback, blueprint/schematic apenas quando narrativamente justificado. Planeje pelo menos dois match cuts ou handoffs geométricos em filmes >=30s.\nCONTINUIDADE: o herói mantém identidade, cores e proporções por todo o filme. continuity.screenXStart/end são frações 0..1; use entersFrom='previous' quando o movimento continuar. O campo facing deve ser coerente.\nARTE: produza artBible com style, palette (4-7 hex), line, texture, lighting, cameraGrammar, heroDesign{silhouette,colors,marks}, environmentDesign e continuityRules.\nNARRATIVA: começo forte em <=1s, desenvolvimento visual, clímax reconhecível e encerramento. Texto na tela quase zero.\n\nJSON: {"title":"...","logline":"...","mood":"...","bpm":112,"key":"A minor","palette":"paper","artBible":{...},"acts":[{"name":"...","from":0,"to":10}],"scenes":[{"label":"...","duration":3,"kind":"field","shotType":"tracking","shot":"wide|medium|close|macro|extreme_wide","description":"descrição visual concreta","camera":"tracking","motion":"coreografia","entities":[{"type":"${subject.primary}","count":3,"role":"hero","id":"hero"}],"caption":"","hero":true,"transitionIn":"cut|match_cut|dissolve","continuity":{"heroId":"hero","entersFrom":"previous|left|right|none","exitsTo":"left|right|none","facing":"left|right|front|back","screenXStart":0.25,"screenXEnd":0.72,"scaleStart":0.8,"scaleEnd":1.1},"audio":{"energy":0.5,"sfx":["wind"]}}],"audio":{"mode":"${audioMode}","style":"...","energyCurve":[0.2,0.5,0.9,0.3]}}.\nA soma das durações deve ser ${duration}.\nPREMISSA ATUAL: ${prompt}`;
}

async function criticRewrite({plan,prompt,subject,backend,model,level=1}){
  const sys=`Você é um diretor supervisor extremamente exigente. Reescreva o storyboard para elevar continuidade, variedade cinematográfica e clareza do tema, mantendo exatamente o assunto atual. Retorne SOMENTE o JSON completo revisado, sem markdown. Não mude a duração. Não introduza espécies/objetos principais ausentes do contrato. Evite planos redundantes. Garanta que o herói seja reconhecível e coerente entre os planos. Em nível ${level}, seja rigoroso com composição, match cuts, escala, câmera e arco emocional.`;
  const text=await localChat({backend,model,messages:[{role:'system',content:sys},{role:'user',content:`CONTRATO: ${JSON.stringify(subject)}\nPREMISSA: ${prompt}\nSTORYBOARD ATUAL: ${JSON.stringify(plan)}`}],temperature:.18,timeout:240000});return extractJson(text);
}

export async function planFilm({prompt,duration=30,backend='auto',model,preset='reels',audioMode='generated',quality='balanced',generationMode='studio'}){
  const maxScenes=Math.max(6,Math.min(60,Math.round(duration/(duration>120?5.5:duration>60?4.5:duration>30?3.5:2.6))));
  const subj=await analyzeSubject({prompt,backend,model});const subject=subj.contract;
  try{
    const text=await localChat({backend,model,messages:[{role:'system',content:planPrompt({prompt,duration,maxScenes,audioMode,subject})},{role:'user',content:`Realize o storyboard do filme atual: ${prompt}`}],temperature:quality==='high'?.42:.28,timeout:300000});
    let plan=normalizePlan(extractJson(text),{prompt,duration,audioMode,maxScenes,subject});
    const shouldCritic=generationMode==='studio'||quality==='high';
    if(shouldCritic){try{plan=normalizePlan(await criticRewrite({plan,prompt,subject,backend,model,level:1}),{prompt,duration,audioMode,maxScenes,subject})}catch{}}
    if(generationMode==='studio'&&quality==='high'){try{plan=normalizePlan(await criticRewrite({plan,prompt,subject,backend,model,level:2}),{prompt,duration,audioMode,maxScenes,subject})}catch{}}
    return {plan,subject,source:'local-ai',subjectSource:subj.source,warning:subj.warning};
  }catch(err){return {plan:fallbackPlan({prompt,duration,audioMode,maxScenes,subject}),subject,source:'fallback',warning:err.message||subj.warning}}
}

export function fallbackPlan({prompt,duration=30,audioMode='generated',maxScenes=10,subject}){
  const p=String(prompt||'filme procedural');subject=subject||fallbackSubject(p);const n=Math.max(6,Math.min(maxScenes,Math.max(6,Math.round(duration/3))));const env=subject.environment==='field'?'field':subject.environment;const seq=['cold_open','establishing','tracking','development','macro_texture','tracking','pullback_reveal','population_column','match_cut','tracking','snap_zoom','closing_loop'];let cursor=0;const scenes=[];
  for(let i=0;i<n;i++){
    const st=seq[Math.floor(i/(n-1)*(seq.length-1))]||'tracking';let kind=env;if(st==='macro_texture')kind='abstract';if(st==='closing_loop')kind=env;if(st==='match_cut')kind=i%2?'blueprint':env;
    const d=i===n-1?duration-cursor:duration/n;const startX=i%2?.74:.22,endX=i%2?.28:.78;const entities=[];if(!['establishing','blueprint_genesis'].includes(st))entities.push({type:subject.primary,count:st==='population_column'?Math.min(18,Math.max(3,subject.primary==='wolf'?5:12)):1,role:'hero',id:'hero'});
    if(env==='field')entities.push({type:'grass',count:60,role:'environment',id:''});
    scenes.push({id:`s${String(i+1).padStart(2,'0')}`,label:i===0?'Abertura':i===n-1?'Fecho':`${st.replaceAll('_',' ')} ${i+1}`,duration:d,start:cursor,end:cursor+d,kind,shotType:st,shot:st==='macro_texture'?'macro':st==='establishing'?'extreme_wide':i%3===0?'wide':'medium',description:`${p}. Plano ${st} com ${subject.primaryLabel} em ${env}.`,camera:st==='tracking'?'tracking':st==='pullback_reveal'?'pull':st==='snap_zoom'?'snap_zoom':st==='macro_texture'?'push':i%3===0?'push':'pan',motion:`${subject.action}; vento e movimento secundário coerente`,entities,caption:'',hero:i===0||i===Math.floor(n*.68),transitionIn:i>0&&i%5===0?'match_cut':'cut',continuity:{heroId:'hero',entersFrom:i?'previous':'left',exitsTo:i%2?'left':'right',facing:i%2?'left':'right',screenXStart:startX,screenXEnd:endX,scaleStart:st==='macro_texture'?1.7:.78,scaleEnd:st==='macro_texture'?2.4:1.05},audio:{energy:Math.min(1,.18+i/n*.78),sfx:env==='field'?['wind','grass']:['wind']}});cursor+=d;
  }
  const artBible=normalizeArtBible({style:'hand-inked cinematic editorial animation, dense layered composition',line:'variable ink contours with subtle frame boil; hatching follows form',texture:'warm paper grain, controlled halftone, cross-hatch shadows',lighting:'graphic warm key light with strong silhouettes',cameraGrammar:['tracking close to subject','locked match cuts','macro inserts','slow pullback reveal'],heroDesign:{silhouette:`recognizable ${subject.primaryLabel} silhouette with consistent proportions`,colors:['#443a32','#807161','#d4c3a8'],marks:['consistent head/body ratio','same tail/ear proportions every shot']},environmentDesign:`layered ${env}: foreground occluders, midground action plane, atmospheric background`,continuityRules:['same hero proportions throughout','screen direction only changes on motivated cut','match-cut geometry screen-fixed']},subject);
  return {promptFingerprint:promptFingerprint(p),subject:{...subject,promptFingerprint:promptFingerprint(p)},title:p.slice(0,100),logline:p,mood:'cinematic, tactile, kinetic',bpm:112,key:'A minor',palette:env==='space'||env==='night'?'nocturne':'paper',artBible,duration,acts:[{name:'Hook',from:0,to:duration*.18},{name:'Development',from:duration*.18,to:duration*.62},{name:'Climax',from:duration*.62,to:duration*.84},{name:'Resolution',from:duration*.84,to:duration}],scenes,audio:{mode:audioMode,style:'cinematic procedural score with motif tied to movement',energyCurve:[.18,.42,.86,.34]}};
}

const banned=[/\bfetch\b/i,/\bXMLHttpRequest\b/i,/\bWebSocket\b/i,/\bdocument\b/i,/\bwindow\b/i,/\bglobalThis\b/i,/\blocalStorage\b/i,/\bindexedDB\b/i,/\bnavigator\b/i,/\bprocess\b/i,/\brequire\b/i,/\bimport\s*\(/i,/\beval\s*\(/i,/\bFunction\s*\(/i,/Math\s*\.\s*random/i,/\bDate\b/i,/performance\s*\.\s*now/i];
export function validateSceneCode(code){code=String(code||'');if(code.length>90000)throw new Error('Código de cena excede 90 KB.');for(const re of banned)if(re.test(code))throw new Error(`Código rejeitado por segurança/determinismo: ${re}`);return code}

export async function generateHeroCode({scene,plan,backend='auto',model,criticNote=''}){
  const subject=plan.subject||{};const bible=plan.artBible||{};
  const p=`Escreva SOMENTE JSON válido {"code":"..."}. code é o corpo de uma função JavaScript chamada por quadro com ctx,t,frame,project,E,scene,u,p.\nPROIBIDO: window/document/fetch/eval/Function/globalThis/Date/performance/Math.random/import/require/process.\nAPI E: clear,line,ellipse,poly,roundedRect,hatch,halftone,drawPaper,drawHexField,drawCellField,drawLarva,drawWingedInsect,drawBlueprintGrid,drawTitle,vignette,registrationGhost,mulberry32,hash2,fbm,lerp,clamp,smooth,smoother,easeInOut,pingpong,palettes,TAU.\nUse dimensões relativas w/h. Determinismo absoluto com project.seed. Não use texto salvo caption curta.\nQUALIDADE: cena autoral densa com >=8 camadas visuais (fundo atmosférico, cenário distante, cenário médio, chão, sujeito, detalhes do sujeito, partículas/movimento secundário, textura/grade). Crie helpers locais para anatomia quando necessário. Sombras e hachuras devem seguir a forma. Faça a câmera indicada perceptível. Frame 0 e frame final precisam ser composições completas.\nCONTINUIDADE: respeite scene.continuity e a bíblia visual. O sujeito principal deve ser ${subject.primary}; não desenhe espécies não pedidas.\nBÍBLIA: ${JSON.stringify(bible)}\nFILME: ${plan.title}. CENA: ${JSON.stringify(scene)}. ${criticNote?`NOTA DO CRÍTICO: ${criticNote}`:''}`;
  const text=await localChat({backend,model,messages:[{role:'system',content:'Você é um animador sênior de longa-metragem especializado em Canvas 2D procedural, anatomia estilizada, câmera e motion design. Código conciso, robusto, visualmente rico e determinístico.'},{role:'user',content:p}],temperature:.28,timeout:300000});
  return validateSceneCode(extractJson(text).code);
}

export function qualityAudit(plan,prompt){
  const issues=[];const fp=promptFingerprint(prompt);if(plan?.promptFingerprint!==fp)issues.push('assinatura do prompt divergente');const scenes=plan?.scenes||[];const subject=plan?.subject?.primary;
  if(!subject)issues.push('sem sujeito principal');if(!plan?.artBible)issues.push('sem bíblia visual');
  const heroScenes=scenes.filter(s=>s.entities?.some(e=>e.role==='hero'&&e.type===subject)).length;if(heroScenes<Math.max(2,Math.floor(scenes.length*.45)))issues.push('herói pouco presente');
  const kinds=new Set(scenes.map(s=>s.shotType)).size;if(kinds<Math.min(5,scenes.length))issues.push('pouca variedade de tipos de plano');const cams=new Set(scenes.map(s=>s.camera)).size;if(cams<Math.min(4,scenes.length))issues.push('pouca variedade de câmera');
  for(const s of scenes){const alien=(s.entities||[]).find(e=>e.role==='hero'&&e.type!==subject);if(alien)issues.push(`sujeito estranho em ${s.id}: ${alien.type}`)}
  const total=scenes.reduce((a,s)=>a+Number(s.duration||0),0);if(Math.abs(total-Number(plan.duration||0))>.02)issues.push('timeline não fecha duração');
  return {ok:issues.length===0,issues,gates:{freshPrompt:plan?.promptFingerprint===fp,artBible:!!plan?.artBible,heroContinuity:heroScenes>=Math.max(2,Math.floor(scenes.length*.45)),shotVariety:kinds>=Math.min(5,scenes.length),cameraVariety:cams>=Math.min(4,scenes.length),durationClosed:Math.abs(total-Number(plan.duration||0))<=.02}};
}

export function pullOllamaModel(model,onLine=()=>{}){return new Promise((resolve,reject)=>{const child=spawn('ollama',['pull',model],{shell:process.platform==='win32'});let all='';const h=d=>{const s=d.toString();all+=s;onLine(s)};child.stdout.on('data',h);child.stderr.on('data',h);child.on('error',reject);child.on('close',c=>c===0?resolve(all):reject(new Error(`ollama pull encerrou com código ${c}`)))})}
