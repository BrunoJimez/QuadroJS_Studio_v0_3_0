import * as E from './engine.js';

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
  const x=w*.5,y=h*.55,rx=w*.19,ry=h*.28;
  ctx.save();ctx.translate(x,y);ctx.rotate(-.23+.06*Math.sin(t*.7));
  E.ellipse(ctx,0,0,rx,ry,'rgba(255,255,255,.015)',p.ink,Math.max(2,w*.003),0,1);
  ctx.save();ctx.beginPath();ctx.ellipse(0,0,rx*.93,ry*.93,0,0,E.TAU);ctx.clip();
  E.halftone(ctx,-rx,-ry,rx*2,ry*2,{spacing:Math.max(5,w*.012),radius:Math.max(.8,w*.0018),color:'rgba(220,235,255,.5)',seed,wobble:2});
  for(let i=0;i<4;i++){const yy=-ry*.2+i*ry*.2;E.roundedRect(ctx,-rx*.72,yy,rx*1.44,ry*.10,ry*.03,i%2?p.cyan:p.magenta,null,0);}
  ctx.restore();
  for(const side of [-1,1]){E.line(ctx,side*rx*.65,-ry*.92,side*rx*.95,-ry*1.18,p.ink,Math.max(1,w*.002),.8);E.ellipse(ctx,side*rx*.98,-ry*1.2,rx*.09,rx*.14,'rgba(255,255,255,.15)',p.ink,1,side*.3,.8);}
  ctx.restore();
  // annotations
  ctx.save();ctx.strokeStyle=p.magenta;ctx.globalAlpha=.55;ctx.setLineDash([8,8]);ctx.beginPath();ctx.arc(x,y,rx*1.35,0,E.TAU*u);ctx.stroke();ctx.restore();
  E.drawPaper(ctx,seed+11,.025);E.vignette(ctx,.2);
}

function sceneEmergence(ctx,t,u,p,seed){
  E.clear(ctx,p.bg); const w=ctx.canvas.width,h=ctx.canvas.height; E.drawCellField(ctx,t*.35,seed+19,p,1.6);
  const x=E.lerp(w*.18,w*.82,E.smooth(u)),y=h*.58+Math.sin(u*E.TAU*1.2)*h*.035;
  E.drawLarva(ctx,x,y,w*.48,w*.065,t,p,seed,-.12+.2*Math.sin(t*.8));
  for(let i=0;i<14;i++){const xx=(i/13)*w;E.line(ctx,xx,h*.75,xx+w*.08*Math.sin(i),h*.77,p.ink,1,.18);}
  E.drawPaper(ctx,seed+5,.06);E.vignette(ctx,.12);
}

function sceneFacet(ctx,t,u,p,seed){
  E.clear(ctx,p.bg); const w=ctx.canvas.width,h=ctx.canvas.height;
  const zoom=E.lerp(.75,1.16,E.easeInOut(u));
  ctx.save();ctx.translate(w/2,h/2);ctx.scale(zoom,zoom);ctx.translate(-w/2,-h/2);
  E.drawHexField(ctx,w*.5,h*.54,w*.38,h*.32,Math.max(10,w*.022),p,t,seed);
  E.ellipse(ctx,w*.5,h*.54,w*.39,h*.33,null,p.ink,Math.max(2,w*.004),0,.8);
  ctx.restore();
  // moving scan arc
  ctx.save();ctx.strokeStyle=p.cyan;ctx.lineWidth=Math.max(2,w*.004);ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(w*.5,h*.54,w*.45,-1.2,-1.2+u*E.TAU*1.5);ctx.stroke();ctx.restore();
  E.halftone(ctx,0,0,w,h,{spacing:Math.max(10,w*.022),radius:Math.max(.5,w*.0012),color:'rgba(0,0,0,.09)',seed:seed+4,wobble:1});E.vignette(ctx,.28);
}

function fruitSurface(ctx,p,seed){
  const w=ctx.canvas.width,h=ctx.canvas.height;ctx.save();ctx.fillStyle=p.warm;ctx.beginPath();ctx.ellipse(w*.5,h*.77,w*.65,h*.31,0,Math.PI,Math.PI*2);ctx.lineTo(w*1.15,h);ctx.lineTo(-w*.15,h);ctx.closePath();ctx.fill();
  E.hatch(ctx,0,h*.52,w,h*.48,Math.max(5,w*.01),-.22,'rgba(30,20,20,.14)',.8);
  const rnd=E.mulberry32(seed);for(let i=0;i<120;i++){const x=rnd()*w,y=h*.55+rnd()*h*.45;E.ellipse(ctx,x,y,1+rnd()*3,1+rnd()*1.5,'rgba(40,20,20,.12)',null,0,rnd(),1);}ctx.restore();
}

function sceneAdult(ctx,t,u,p,seed){
  E.clear(ctx,p.bg);const w=ctx.canvas.width,h=ctx.canvas.height;fruitSurface(ctx,p,seed);
  const x=E.lerp(w*.2,w*.78,E.easeInOut(u)),y=h*.61+Math.sin(t*4)*h*.008; const s=w/720*3.2;
  E.drawWingedInsect(ctx,x,y,s,t,p,seed,-.25+.12*Math.sin(t*.7));
  // magnifier glyph / measurement line
  E.line(ctx,w*.1,h*.2,w*.9,h*.2,p.ink,1,.25);for(let i=0;i<=10;i++)E.line(ctx,w*(.1+.08*i),h*.195,w*(.1+.08*i),h*.205,p.ink,1,.25);
  E.drawPaper(ctx,seed+23,.07);E.vignette(ctx,.13);
}

function scenePair(ctx,t,u,p,seed){
  E.clear(ctx,p.bg);const w=ctx.canvas.width,h=ctx.canvas.height;fruitSurface(ctx,p,seed+1);
  const sep=E.lerp(w*.28,w*.08,E.smooth(Math.min(1,u*1.2))); const orbit=Math.sin(t*.8)*.08;
  E.drawWingedInsect(ctx,w*.5-sep,h*.63,w/720*2.8,t,p,seed,-.12-orbit);
  E.drawWingedInsect(ctx,w*.5+sep,h*.61,w/720*2.8,t+.18,p,seed+3,.12+orbit);
  ctx.save();ctx.strokeStyle=p.magenta;ctx.lineWidth=Math.max(1,w*.002);ctx.globalAlpha=.4;ctx.beginPath();ctx.bezierCurveTo(w*.28,h*.42,w*.42,h*.30,w*.64,h*.38,w*.72,h*.52);ctx.stroke();ctx.restore();
  E.drawPaper(ctx,seed+31,.07);E.vignette(ctx,.15);
}

const SCENES={origin:sceneOrigin,capsule:sceneCapsule,emergence:sceneEmergence,facet:sceneFacet,adult:sceneAdult,pair:scenePair};

export function defaultProject(){
  return {
    title:'Microcosmo',
    width:720,
    height:1280,
    fps:30,
    duration:15.5,
    seed:42,
    palette:'riso',
    showGuides:false,
    mode:'timeline',
    customCode:`// Modo Script Personalizado\n// draw(ctx, t, frame, project, E) é chamado em cada quadro.\nconst {width:w, height:h} = ctx.canvas;\nE.clear(ctx, '#08111d');\nconst cx = w/2 + Math.sin(t*0.8)*w*0.12;\nconst cy = h/2 + Math.cos(t*0.55)*h*0.08;\nfor (let i=0;i<90;i++){\n  const a = i/90*E.TAU + t*0.25;\n  const r = (i/90)*Math.min(w,h)*0.42;\n  const x = cx + Math.cos(a*3.0)*r;\n  const y = cy + Math.sin(a*2.0)*r;\n  E.ellipse(ctx,x,y,2+(i%7),2+(i%7),'rgba(90,220,255,.35)');\n}\nE.drawWingedInsect(ctx,cx,cy,w/720*3,t,E.palettes.nocturne,project.seed,.15*Math.sin(t));`
  };
}

export function timelineFor(project){ return E.buildTimeline(BASE_TIMELINE,project.duration); }

export function drawTimelineProject(ctx,t,project){
  const p=E.palettes[project.palette]||E.palettes.riso; const timeline=timelineFor(project); const scene=E.activeScene(t,timeline); const u=E.sceneLocalTime(t,scene);
  const fn=SCENES[scene.id]||sceneOrigin; fn(ctx,t,u,p,project.seed + timeline.indexOf(scene)*101);
  if(project.showGuides){
    ctx.save();ctx.strokeStyle='rgba(255,0,0,.3)';ctx.strokeRect(ctx.canvas.width*.05,ctx.canvas.height*.05,ctx.canvas.width*.9,ctx.canvas.height*.9);ctx.restore();
  }
  return {scene,u,timeline};
}

let customCache={src:null,fn:null,error:null};
function compileCustom(src){
  if(customCache.src===src)return customCache;
  try{ customCache={src,fn:new Function('ctx','t','frame','project','E',`"use strict";\n${src}`),error:null}; }
  catch(error){customCache={src,fn:null,error};}
  return customCache;
}

export function drawProject(ctx,t,project,frame=0){
  if(project.mode==='custom'){
    const c=compileCustom(project.customCode||'');
    if(c.fn){try{c.fn(ctx,t,frame,project,E);}catch(error){renderError(ctx,error);}}
    else renderError(ctx,c.error);
    return {scene:{id:'custom',label:'Script'},u:(t%project.duration)/project.duration,timeline:[]};
  }
  return drawTimelineProject(ctx,t,project);
}

function renderError(ctx,error){
  E.clear(ctx,'#180c0c');ctx.fillStyle='#ffd7d7';ctx.font='16px monospace';ctx.textAlign='left';
  const msg=String(error?.stack||error||'Erro desconhecido').split('\n');msg.slice(0,20).forEach((line,i)=>ctx.fillText(line,20,40+i*22));
}
