import * as E from './engine.js';

function rndFor(seed){return E.mulberry32((seed>>>0)||1)}
function text(ctx,txt,x,y,size,color,alpha=1,align='center'){
  if(!txt)return;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=`600 ${Math.max(12,size)}px system-ui, sans-serif`;ctx.fillText(txt,x,y);ctx.restore();
}
function drawSky(ctx,p,t,night=false){
  const w=ctx.canvas.width,h=ctx.canvas.height;const g=ctx.createLinearGradient(0,0,0,h);
  if(night){g.addColorStop(0,'#050819');g.addColorStop(1,'#15233b')} else {g.addColorStop(0,p.cyan);g.addColorStop(.48,E.rgbToCss(E.mixColor(p.cyan,p.bg,.72)));g.addColorStop(1,p.bg)}
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  if(!night){E.ellipse(ctx,w*.78,h*.16,Math.min(w,h)*.07,Math.min(w,h)*.07,p.yellow,null,0,0,.75)}
}
function drawCloud(ctx,x,y,s,p,a=.3){for(const [dx,dy,r] of [[0,0,1],[.8,-.1,.75],[-.8,.05,.68],[.2,-.45,.65]])E.ellipse(ctx,x+dx*s,y+dy*s,s*r,s*r*.58,p.bg,null,0,0,a)}
function drawMountain(ctx,x,y,w,h,p,alpha=.45){E.poly(ctx,[[x-w/2,y],[x-w*.08,y-h],[x+w/2,y]],E.rgbToCss(E.mixColor(p.ink,p.cyan,.35),alpha),null,0,alpha)}
function drawGrass(ctx,seed,t,p){const w=ctx.canvas.width,h=ctx.canvas.height,r=rndFor(seed);ctx.save();ctx.strokeStyle=p.ink;ctx.globalAlpha=.35;ctx.lineWidth=Math.max(1,w*.0012);for(let i=0;i<170;i++){const x=r()*w,y=h*(.72+r()*.3),len=h*(.015+r()*.04),sway=Math.sin(t*1.7+i)*w*.0025;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+sway,y-len*.55,x+sway*1.4,y-len);ctx.stroke()}ctx.restore()}
function drawFlower(ctx,x,y,s,p,t,seed=1){
  const bend=Math.sin(t*1.4+seed)*s*.08;E.line(ctx,x,y,x+bend,y-s*2.2,p.ink,Math.max(1,s*.08),.55);
  for(let k=0;k<7;k++){const a=k/7*E.TAU+t*.02;E.ellipse(ctx,x+bend+Math.cos(a)*s*.62,y-s*2.2+Math.sin(a)*s*.62,s*.42,s*.2,k%2?p.magenta:p.warm,p.ink,Math.max(.5,s*.04),a,.85)}
  E.ellipse(ctx,x+bend,y-s*2.2,s*.35,s*.35,p.yellow,p.ink,Math.max(.5,s*.04),0,.95)
}
function drawBee(ctx,x,y,s,t,p,seed=1,rot=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);const beat=Math.sin(t*32+seed)*.48;
  for(const side of [-1,1]){ctx.save();ctx.rotate(side*(.55+beat*.55));E.ellipse(ctx,side*s*.48,-s*.45,s*.6,s*.9,'rgba(238,247,255,.26)',p.ink,Math.max(.5,s*.05),side*.35,.8);ctx.restore()}
  E.ellipse(ctx,0,0,s*.55,s*.85,p.yellow,p.ink,Math.max(1,s*.08),0,1);
  for(let i=-2;i<=2;i++)E.line(ctx,-s*.5,i*s*.27,s*.5,i*s*.27,p.ink,Math.max(1,s*.08),.75);
  E.ellipse(ctx,0,-s*.78,s*.48,s*.45,p.ink,p.ink,Math.max(.5,s*.04),0,.9);
  E.ellipse(ctx,-s*.22,-s*.88,s*.12,s*.13,p.magenta,null,0,0,.9);E.ellipse(ctx,s*.22,-s*.88,s*.12,s*.13,p.magenta,null,0,0,.9);
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*s*.18,-s*1.08);ctx.quadraticCurveTo(side*s*.55,-s*1.45,side*s*.7,-s*1.65);ctx.strokeStyle=p.ink;ctx.lineWidth=Math.max(.5,s*.05);ctx.stroke()}
  ctx.restore();
}
function drawHive(ctx,x,y,s,p,t){
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=p.ink;ctx.lineWidth=Math.max(1,s*.025);for(let row=-3;row<=3;row++){for(let col=-3;col<=3;col++){const xx=(col+(row%2)*.5)*s*.24,yy=row*s*.21;const rr=s*.14;ctx.beginPath();for(let k=0;k<6;k++){const a=E.TAU*k/6;const px=xx+Math.cos(a)*rr,py=yy+Math.sin(a)*rr;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fillStyle=(row+col)%3===0?p.yellow:E.rgbToCss(E.mixColor(p.yellow,p.warm,.45),.92);ctx.fill();ctx.stroke()}}
  ctx.globalAlpha=.85;E.ellipse(ctx,0,s*.2,s*.18,s*.1,p.ink,null,0,0,1);ctx.restore();
}
function drawBird(ctx,x,y,s,t,p,seed){const flap=Math.sin(t*5+seed)*s*.2;ctx.save();ctx.strokeStyle=p.ink;ctx.lineWidth=Math.max(1,s*.08);ctx.beginPath();ctx.moveTo(x-s,y);ctx.quadraticCurveTo(x-s*.4,y-flap,x,y);ctx.quadraticCurveTo(x+s*.4,y-flap,x+s,y);ctx.stroke();ctx.restore()}
function drawFish(ctx,x,y,s,t,p,seed){ctx.save();ctx.translate(x,y);const wob=Math.sin(t*4+seed)*.15;ctx.rotate(wob);E.ellipse(ctx,0,0,s,s*.5,p.cyan,p.ink,Math.max(1,s*.05),0,.8);E.poly(ctx,[[s*.75,0],[s*1.35,-s*.45],[s*1.35,s*.45]],p.magenta,p.ink,Math.max(1,s*.05),.8);E.ellipse(ctx,-s*.55,-s*.1,s*.08,s*.08,p.ink,null,0);ctx.restore()}
function drawTree(ctx,x,y,s,p,t,seed){const sway=Math.sin(t*.9+seed)*s*.03;E.roundedRect(ctx,x-s*.09,y-s*1.5,s*.18,s*1.5,s*.06,p.warm,p.ink,Math.max(1,s*.03));for(let i=0;i<10;i++){const a=i/10*E.TAU+seed;E.ellipse(ctx,x+sway+Math.cos(a)*s*.45,y-s*1.5+Math.sin(a)*s*.3,s*.38,s*.28,i%2?p.cyan:p.yellow,p.ink,Math.max(.5,s*.02),a,.65)}}
function drawStars(ctx,seed,p,t,count=100){const w=ctx.canvas.width,h=ctx.canvas.height,r=rndFor(seed);for(let i=0;i<count;i++){const x=r()*w,y=r()*h*.84,rr=(.5+r()*2.5)*(w/720);E.ellipse(ctx,x,y,rr,rr,p.ink,null,0,0,.3+.7*(.5+.5*Math.sin(t*1.8+i)))} }
function drawCity(ctx,seed,p,t){const w=ctx.canvas.width,h=ctx.canvas.height,r=rndFor(seed);for(let i=0,x=0;x<w;i++){const bw=w*(.04+r()*.09),bh=h*(.16+r()*.38),yy=h*.78-bh;E.roundedRect(ctx,x,yy,bw,bh,Math.max(1,w*.004),i%2?p.ink:E.rgbToCss(E.mixColor(p.ink,p.cyan,.3)),null);for(let wy=yy+h*.025;wy<yy+bh-h*.02;wy+=h*.032)for(let wx=x+w*.012;wx<x+bw-w*.01;wx+=w*.026)if(r()>.55)E.roundedRect(ctx,wx,wy,w*.008,h*.008,1,p.yellow,null);x+=bw+w*.008}ctx.save();ctx.strokeStyle=p.cyan;ctx.globalAlpha=.2;for(let y=h*.79;y<h;y+=h*.035)E.line(ctx,0,y,w,y,p.cyan,1,.15);ctx.restore()}
function drawWater(ctx,seed,p,t){const w=ctx.canvas.width,h=ctx.canvas.height;drawSky(ctx,p,t,false);const g=ctx.createLinearGradient(0,h*.46,0,h);g.addColorStop(0,E.rgbToCss(E.mixColor(p.cyan,p.bg,.2)));g.addColorStop(1,E.rgbToCss(E.mixColor(p.cyan,p.ink,.4)));ctx.fillStyle=g;ctx.fillRect(0,h*.46,w,h*.54);for(let j=0;j<36;j++){const y=h*(.5+j*.014);for(let i=0;i<7;i++){const x=(i/7*w+(j%2)*w*.05+Math.sin(t*.7+j)*w*.02)%w;E.line(ctx,x,y,x+w*.08,y,p.ink,Math.max(1,w*.001),.08+.14*(j/36))}}}
function drawMeadow(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;drawSky(ctx,p,t,false);drawMountain(ctx,w*.22,h*.55,w*.8,h*.26,p,.24);drawMountain(ctx,w*.72,h*.56,w*.9,h*.18,p,.16);ctx.fillStyle=E.rgbToCss(E.mixColor(p.cyan,p.yellow,.55));ctx.fillRect(0,h*.58,w,h*.42);drawGrass(ctx,seed,t,p);const r=rndFor(seed+2);const n=scene.entities?.find(e=>e.type==='flower')?.count||30;for(let i=0;i<n;i++){const s=(5+r()*12)*(w/720);drawFlower(ctx,r()*w,h*(.68+r()*.3),s,p,t,i)}const bn=scene.entities?.find(e=>e.type==='bee')?.count||Math.max(2,Math.round(5+u*7));for(let i=0;i<bn;i++){const a=t*(.35+.05*(i%4))+i*1.7;const x=w*(.5+.38*Math.sin(a*.7+i)),y=h*(.35+.18*Math.sin(a*1.2+i*.3));drawBee(ctx,x,y,(8+(i%4)*2)*(w/720),t,p,seed+i,.4*Math.sin(a*.5))}for(let i=0;i<3;i++)drawCloud(ctx,w*(.2+i*.3)+Math.sin(t*.08+i)*w*.05,h*(.14+i*.04),w*.055,p,.28)}
function drawSwarm(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;drawSky(ctx,p,t,false);ctx.fillStyle=E.rgbToCss(E.mixColor(p.cyan,p.yellow,.58));ctx.fillRect(0,h*.72,w,h*.28);const count=scene.entities?.find(e=>e.type==='bee')?.count||22;for(let i=0;i<count;i++){const a=i/count*E.TAU+t*(.18+(i%5)*.01);const r=w*(.15+.23*E.hash2(i,seed,4));const cx=w*.5+Math.sin(t*.2)*w*.06,cy=h*.48+Math.cos(t*.17)*h*.03;drawBee(ctx,cx+Math.cos(a*1.3+i)*r,cy+Math.sin(a*.9+i*.4)*r*.72,(5+(i%5))*(w/720),t,p,seed+i,a*.2)}E.vignette(ctx,.1)}
function drawMacro(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;E.clear(ctx,p.bg);const bee=scene.entities?.some(e=>e.type==='bee');if(bee){ctx.save();ctx.translate(w*.5,h*.54);const z=E.lerp(4.2,7.5,E.easeInOut(u));drawBee(ctx,Math.sin(t*.4)*w*.02,0,z*(w/720),t,p,seed,.15*Math.sin(t*.3));ctx.restore();for(let i=0;i<35;i++){const a=i/35*E.TAU;E.line(ctx,w*.5,h*.54,w*.5+Math.cos(a)*w*.46,h*.54+Math.sin(a)*w*.46,p.ink,1,.04)}}else{E.drawHexField(ctx,w*.5,h*.52,w*.43,h*.34,Math.max(9,w*.018),p,t,seed)}E.halftone(ctx,0,0,w,h,{spacing:Math.max(8,w*.02),radius:Math.max(.5,w*.001),color:'rgba(0,0,0,.08)',seed});E.vignette(ctx,.22)}
function drawHiveScene(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;E.clear(ctx,p.bg);E.drawBlueprintGrid(ctx,p,Math.max(30,w*.06));drawHive(ctx,w*.5,h*.52,Math.min(w,h)*.42,p,t);for(let i=0;i<10;i++){const a=t*.35+i*.9;drawBee(ctx,w*.5+Math.cos(a)*w*.32,h*.5+Math.sin(a*1.2)*h*.22,6*(w/720),t,p,seed+i,a)}E.drawPaper(ctx,seed,.025);E.vignette(ctx,.18)}
function drawForest(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;drawSky(ctx,p,t,scene.kind==='night');ctx.fillStyle=E.rgbToCss(E.mixColor(p.cyan,p.ink,.55));ctx.fillRect(0,h*.68,w,h*.32);for(let i=0;i<13;i++){const x=(i+.4)/13*w+Math.sin(t*.1+i)*w*.01;drawTree(ctx,x,h*.78,(35+(i%5)*9)*(w/720),p,t,seed+i)}for(let i=0;i<5;i++)drawBird(ctx,w*(.12+i*.18)+Math.sin(t*.18+i)*w*.04,h*(.25+.03*i),10*(w/720),t,p,seed+i)}
function drawSpace(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;E.clear(ctx,'#030510');drawStars(ctx,seed,p,t,140);const r=Math.min(w,h)*.18;E.ellipse(ctx,w*.52,h*.48,r,r,E.rgbToCss(E.mixColor(p.cyan,p.magenta,.45)),p.ink,Math.max(1,w*.002),0,.9);ctx.save();ctx.strokeStyle=p.yellow;ctx.lineWidth=Math.max(1,w*.002);ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(w*.52,h*.48,r*1.8,r*.55,-.25,0,E.TAU);ctx.stroke();ctx.restore();for(let i=0;i<5;i++){const a=t*.1+i*1.3;E.ellipse(ctx,w*.52+Math.cos(a)*r*2.1,h*.48+Math.sin(a)*r*.8,3+i*(w/720),3+i*(w/720),p.yellow,null,0,0,.8)}E.vignette(ctx,.3)}
function drawBlueprint(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;E.clear(ctx,'#08142a');E.drawBlueprintGrid(ctx,{...p,ink:'#dcecff'},Math.max(32,w*.055));ctx.save();ctx.translate(w/2,h/2);ctx.rotate(.08*Math.sin(t*.3));ctx.strokeStyle=p.cyan;ctx.lineWidth=Math.max(1,w*.002);for(let i=0;i<9;i++){ctx.beginPath();ctx.arc(0,0,w*(.08+i*.035),0,E.TAU*(.45+.5*u));ctx.stroke()}ctx.restore();E.drawHexField(ctx,w*.5,h*.52,w*.22,h*.18,Math.max(10,w*.02),{...p,bg:'#08142a',ink:'#dcecff'},t,seed);text(ctx,scene.label,w*.5,h*.14,w*.034,'#dcecff',.8)}
function drawAbstract(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;E.clear(ctx,p.bg);for(let i=0;i<58;i++){const a=i/58*E.TAU+t*.12;const r=(i/58)*Math.min(w,h)*.48;const x=w*.5+Math.cos(a*2.2)*r,y=h*.5+Math.sin(a*1.7)*r;const c=i%3===0?p.magenta:i%3===1?p.cyan:p.yellow;E.ellipse(ctx,x,y,(3+i%8)*(w/720),(2+i%5)*(w/720),c,p.ink,Math.max(.4,w*.0008),a,.25+.55*u)}E.drawPaper(ctx,seed,.04);E.vignette(ctx,.15)}
function drawMicroscopic(ctx,scene,t,u,p,seed){E.clear(ctx,p.bg);E.drawCellField(ctx,t*.4,seed,p,1.6);const w=ctx.canvas.width,h=ctx.canvas.height;for(let i=0;i<8;i++){const a=i/8*E.TAU+t*.15;E.ellipse(ctx,w*.5+Math.cos(a)*w*.25,h*.52+Math.sin(a)*h*.18,w*.018,w*.018,p.magenta,null,0,0,.5)}E.vignette(ctx,.18)}
function drawWaterScene(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;drawWater(ctx,seed,p,t);const fish=scene.entities?.find(e=>e.type==='fish')?.count||8;for(let i=0;i<fish;i++){const x=((t*.04*w+i*w/fish*1.3)%(w*1.2))-w*.1,y=h*(.58+.32*E.hash2(i,seed));drawFish(ctx,x,y,(8+(i%5)*3)*(w/720),t,p,seed+i)}E.vignette(ctx,.12)}
function drawCityScene(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;drawSky(ctx,p,t,true);drawStars(ctx,seed,p,t,55);drawCity(ctx,seed,p,t);for(let i=0;i<5;i++){const x=(t*.06*w+i*w*.27)%(w*1.3)-w*.1;E.line(ctx,x,h*.86,x+w*.12,h*.86,p.magenta,Math.max(2,w*.003),.5)}E.vignette(ctx,.2)}
function drawBotanical(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;E.clear(ctx,p.bg);const r=rndFor(seed);for(let i=0;i<38;i++){const x=r()*w,y=h*(.35+r()*.64),s=(8+r()*18)*(w/720);drawFlower(ctx,x,y,s,p,t,i)}E.halftone(ctx,0,0,w,h,{spacing:Math.max(9,w*.019),radius:Math.max(.6,w*.0013),color:'rgba(0,0,0,.08)',seed});E.drawPaper(ctx,seed,.05)}
function drawLandscape(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;drawSky(ctx,p,t,false);for(let i=0;i<4;i++)drawMountain(ctx,w*(.1+i*.28)+Math.sin(t*.06+i)*w*.03,h*(.6+i*.015),w*.75,h*(.18+.03*i),p,.12+.05*i);ctx.fillStyle=E.rgbToCss(E.mixColor(p.cyan,p.yellow,.55));ctx.fillRect(0,h*.68,w,h*.32);drawGrass(ctx,seed,t,p);E.vignette(ctx,.1)}
function drawNight(ctx,scene,t,u,p,seed){const w=ctx.canvas.width,h=ctx.canvas.height;drawSky(ctx,p,t,true);drawStars(ctx,seed,p,t,95);E.ellipse(ctx,w*.78,h*.18,w*.055,w*.055,p.ink,null,0,0,.75);for(let i=0;i<6;i++)drawBird(ctx,w*(.12+i*.14),h*(.34+.02*(i%3)),8*(w/720),t*.5,p,seed+i);E.vignette(ctx,.25)}
function drawTitleScene(ctx,scene,t,u,p,seed,project){const w=ctx.canvas.width,h=ctx.canvas.height;drawLandscape(ctx,scene,t,u,p,seed);ctx.save();ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(0,0,w,h);ctx.restore();text(ctx,project.filmPlan?.title||project.prompt||project.title,w*.5,h*.48,w*.052,p.ink,E.smooth(Math.min(1,u*3)));if(scene.caption)text(ctx,scene.caption,w*.5,h*.56,w*.024,p.ink,.75)}

export function drawSceneDSL(ctx,t,u,project,scene,index=0){
  const p=E.palettes[scene.palette||project.filmPlan?.palette||project.palette]||E.palettes.riso;const seed=(project.seed||1)+index*9973;const kind=scene.kind||'abstract';
  if(kind==='title')drawTitleScene(ctx,scene,t,u,p,seed,project);
  else if(kind==='meadow')drawMeadow(ctx,scene,t,u,p,seed);
  else if(kind==='swarm')drawSwarm(ctx,scene,t,u,p,seed);
  else if(kind==='macro')drawMacro(ctx,scene,t,u,p,seed);
  else if(kind==='hive')drawHiveScene(ctx,scene,t,u,p,seed);
  else if(kind==='forest')drawForest(ctx,scene,t,u,p,seed);
  else if(kind==='space')drawSpace(ctx,scene,t,u,p,seed);
  else if(kind==='blueprint')drawBlueprint(ctx,scene,t,u,p,seed);
  else if(kind==='microscopic')drawMicroscopic(ctx,scene,t,u,p,seed);
  else if(kind==='water')drawWaterScene(ctx,scene,t,u,p,seed);
  else if(kind==='city')drawCityScene(ctx,scene,t,u,p,seed);
  else if(kind==='botanical')drawBotanical(ctx,scene,t,u,p,seed);
  else if(kind==='landscape')drawLandscape(ctx,scene,t,u,p,seed);
  else if(kind==='night')drawNight(ctx,scene,t,u,p,seed);
  else drawAbstract(ctx,scene,t,u,p,seed);
  if(project.showGuides){ctx.save();ctx.strokeStyle='rgba(255,30,30,.28)';ctx.lineWidth=Math.max(1,ctx.canvas.width*.0015);ctx.strokeRect(ctx.canvas.width*.05,ctx.canvas.height*.05,ctx.canvas.width*.9,ctx.canvas.height*.9);ctx.restore()}
}
