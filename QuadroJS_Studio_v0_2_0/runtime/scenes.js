import * as E from './engine.js';
import { drawSceneDSL } from './generic.js';

const BASE_TIMELINE = [
  {id:'origin', label:'Origem', duration:2.4},
  {id:'capsule', label:'Blueprint', duration:2.6},
  {id:'emergence', label:'Emergência', duration:2.6},
  {id:'facet', label:'Olho facetado', duration:2.5},
  {id:'adult', label:'Adulto', duration:2.8},
  {id:'pair', label:'Par', duration:2.6}
];

function sceneOrigin(ctx,t,u,p,seed){
  E.clear(ctx,p.bg); E.drawCellField(ctx,t,seed,p,1.35); const w=ctx.canvas.width,h=ctx.canvas.height;
  const pulse=.96+.04*Math.sin(t*3); E.ellipse(ctx,w*.5,h*.58,w*.21*pulse,w*.145*pulse,p.warm,p.ink,Math.max(2,w*.004),-.18,.92);
  E.ellipse(ctx,w*.46,h*.55,w*.05,w*.05,p.magenta,p.ink,Math.max(1,w*.002),0,.85);
  E.registrationGhost(ctx,(c)=>E.ellipse(ctx,w*.5,h*.58,w*.21,w*.145,null,c,Math.max(1,w*.002),-.18,.7),p,Math.max(1,w*.003),.18);
  E.hatch(ctx,w*.28,h*.43,w*.44,h*.30,Math.max(6,w*.012),-.42,'rgba(30,20,20,.15)',1);
  E.drawTitle(ctx,'MICROCOSMO','cinema procedural — quadro a quadro em JavaScript',p,E.smooth(Math.min(u*4,1)));
  E.drawPaper(ctx,seed+3,.08); E.vignette(ctx,.11);
}
function sceneCapsule(ctx,t,u,p,seed){
  E.clear(ctx,p.bg); E.drawBlueprintGrid(ctx,p,Math.max(28,ctx.canvas.width*.06)); const w=ctx.canvas.width,h=ctx.canvas.height;
  const x=w*.5,y=h*.55,rx=w*.19,ry=h*.28;ctx.save();ctx.translate(x,y);ctx.rotate(-.23+.06*Math.sin(t*.7));
  E.ellipse(ctx,0,0,rx,ry,'rgba(255,255,255,.015)',p.ink,Math.max(2,w*.003),0,1);ctx.save();ctx.beginPath();ctx.ellipse(0,0,rx*.93,ry*.93,0,0,E.TAU);ctx.clip();
  E.halftone(ctx,-rx,-ry,rx*2,ry*2,{spacing:Math.max(5,w*.012),radius:Math.max(.8,w*.0018),color:'rgba(220,235,255,.5)',seed,wobble:2});
  for(let i=0;i<4;i++){const yy=-ry*.2+i*ry*.2;E.roundedRect(ctx,-rx*.72,yy,rx*1.44,ry*.10,ry*.03,i%2?p.cyan:p.magenta,null,0)}ctx.restore();ctx.restore();E.drawPaper(ctx,seed+11,.025);E.vignette(ctx,.2);
}
function sceneEmergence(ctx,t,u,p,seed){E.clear(ctx,p.bg); const w=ctx.canvas.width,h=ctx.canvas.height; E.drawCellField(ctx,t*.35,seed+19,p,1.6);const x=E.lerp(w*.18,w*.82,E.smooth(u)),y=h*.58+Math.sin(u*E.TAU*1.2)*h*.035;E.drawLarva(ctx,x,y,w*.48,w*.065,t,p,seed,-.12+.2*Math.sin(t*.8));E.drawPaper(ctx,seed+5,.06);E.vignette(ctx,.12)}
function sceneFacet(ctx,t,u,p,seed){E.clear(ctx,p.bg); const w=ctx.canvas.width,h=ctx.canvas.height;const zoom=E.lerp(.75,1.16,E.easeInOut(u));ctx.save();ctx.translate(w/2,h/2);ctx.scale(zoom,zoom);ctx.translate(-w/2,-h/2);E.drawHexField(ctx,w*.5,h*.54,w*.38,h*.32,Math.max(10,w*.022),p,t,seed);E.ellipse(ctx,w*.5,h*.54,w*.39,h*.33,null,p.ink,Math.max(2,w*.004),0,.8);ctx.restore();E.vignette(ctx,.28)}
function fruitSurface(ctx,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;ctx.save();ctx.fillStyle=p.warm;ctx.beginPath();ctx.ellipse(w*.5,h*.77,w*.65,h*.31,0,Math.PI,Math.PI*2);ctx.lineTo(w*1.15,h);ctx.lineTo(-w*.15,h);ctx.closePath();ctx.fill();E.hatch(ctx,0,h*.52,w,h*.48,Math.max(5,w*.01),-.22,'rgba(30,20,20,.14)',.8);const rnd=E.mulberry32(seed);for(let i=0;i<120;i++){const x=rnd()*w,y=h*.55+rnd()*h*.45;E.ellipse(ctx,x,y,1+rnd()*3,1+rnd()*1.5,'rgba(40,20,20,.12)',null,0,rnd(),1)}ctx.restore()}
function sceneAdult(ctx,t,u,p,seed){E.clear(ctx,p.bg);const w=ctx.canvas.width,h=ctx.canvas.height;fruitSurface(ctx,p,seed);const x=E.lerp(w*.2,w*.78,E.easeInOut(u)),y=h*.61+Math.sin(t*4)*h*.008; E.drawWingedInsect(ctx,x,y,w/720*3.2,t,p,seed,-.25+.12*Math.sin(t*.7));E.drawPaper(ctx,seed+23,.07);E.vignette(ctx,.13)}
function scenePair(ctx,t,u,p,seed){E.clear(ctx,p.bg);const w=ctx.canvas.width,h=ctx.canvas.height;fruitSurface(ctx,p,seed+1);const sep=E.lerp(w*.28,w*.08,E.smooth(Math.min(1,u*1.2))); const orbit=Math.sin(t*.8)*.08;E.drawWingedInsect(ctx,w*.5-sep,h*.63,w/720*2.8,t,p,seed,-.12-orbit);E.drawWingedInsect(ctx,w*.5+sep,h*.61,w/720*2.8,t+.18,p,seed+3,.12+orbit);E.drawPaper(ctx,seed+31,.07);E.vignette(ctx,.15)}
const SCENES={origin:sceneOrigin,capsule:sceneCapsule,emergence:sceneEmergence,facet:sceneFacet,adult:sceneAdult,pair:scenePair};

export function defaultProject(){
  return {title:'Microcosmo',prompt:'Abelhas num campo aberto de flores',width:720,height:1280,fps:30,duration:15.5,seed:42,palette:'riso',showGuides:false,mode:'ai',preset:'reels',audioMode:'generated',audioUpload:null,aiBackend:'auto',aiModel:'',generationMode:'dsl',filmPlan:null,aiScenes:{},customCode:`const {width:w,height:h}=ctx.canvas;E.clear(ctx,'#08111d');for(let i=0;i<90;i++){const a=i/90*E.TAU+t*.25;const r=i/90*Math.min(w,h)*.42;E.ellipse(ctx,w/2+Math.cos(a*3)*r,h/2+Math.sin(a*2)*r,2+i%7,2+i%7,'rgba(90,220,255,.35)')}`};
}
export function timelineFor(project){
  if(project.mode==='ai'&&project.filmPlan?.scenes?.length)return project.filmPlan.scenes;
  return E.buildTimeline(BASE_TIMELINE,project.duration);
}
let customCache=new Map();
function compile(src,key='custom'){
  const old=customCache.get(key);if(old?.src===src)return old;
  try{const fn=new Function('ctx','t','frame','project','E','scene','u','p','window','document','fetch','XMLHttpRequest','WebSocket','localStorage','navigator','process','require','globalThis',`"use strict";\n${src}`);const out={src,fn,error:null};customCache.set(key,out);return out}catch(error){const out={src,fn:null,error};customCache.set(key,out);return out}
}
function renderError(ctx,error){E.clear(ctx,'#180c0c');ctx.fillStyle='#ffd7d7';ctx.font='16px monospace';const msg=String(error?.stack||error||'Erro').split('\n');msg.slice(0,18).forEach((line,i)=>ctx.fillText(line,20,40+i*22))}
function drawAI(ctx,t,project,frame){
  const tl=timelineFor(project);const scene=E.activeScene(Math.min(t,project.duration-1e-6),tl)||tl[0];const idx=Math.max(0,tl.indexOf(scene));const u=E.sceneLocalTime(t,scene);const p=E.palettes[project.filmPlan?.palette||project.palette]||E.palettes.riso;const code=project.aiScenes?.[scene.id];
  if(code){const c=compile(code,'ai:'+scene.id);if(c.fn){try{c.fn(ctx,t,frame,project,E,scene,u,p,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined)}catch(err){drawSceneDSL(ctx,t,u,project,scene,idx)}}else drawSceneDSL(ctx,t,u,project,scene,idx)}else drawSceneDSL(ctx,t,u,project,scene,idx);
  return {scene,u,timeline:tl};
}
export function drawProject(ctx,t,project,frame=0){
  if(project.mode==='custom'){const c=compile(project.customCode||'','custom');if(c.fn){try{c.fn(ctx,t,frame,project,E,{id:'custom'},(t%project.duration)/project.duration,E.palettes[project.palette]||E.palettes.riso,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined)}catch(error){renderError(ctx,error)}}else renderError(ctx,c.error);return {scene:{id:'custom',label:'Script'},u:(t%project.duration)/project.duration,timeline:[]}}
  if(project.mode==='ai'&&project.filmPlan?.scenes?.length)return drawAI(ctx,t,project,frame);
  const p=E.palettes[project.palette]||E.palettes.riso;const tl=timelineFor(project);const scene=E.activeScene(t,tl);const u=E.sceneLocalTime(t,scene);(SCENES[scene.id]||sceneOrigin)(ctx,t,u,p,project.seed+tl.indexOf(scene)*101);return {scene,u,timeline:tl};
}
