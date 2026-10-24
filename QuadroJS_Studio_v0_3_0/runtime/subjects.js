import * as E from './engine.js';

function colorSet(p,bible={}){
  const c=bible?.heroDesign?.colors||[];
  return {dark:c[0]||'#3d3832',mid:c[1]||'#75695d',light:c[2]||'#c8b89f',accent:c[3]||p.warm,ink:p.ink};
}
function furStroke(ctx,x1,y1,x2,y2,c,w=.8,a=.28){E.line(ctx,x1,y1,x2,y2,c,w,a)}
function gait(t,seed=0,speed=1){const a=t*E.TAU*speed+seed*.137;return {a,s:Math.sin(a),c:Math.cos(a),s2:Math.sin(a+Math.PI),c2:Math.cos(a+Math.PI)}}
function leg(ctx,x,y,len,phase,dir,c,ink,lw){
  const hipX=x,hipY=y;const kneeX=x+dir*len*(.12+.15*Math.sin(phase)),kneeY=y+len*.48;const footX=x+dir*len*(.3*Math.sin(phase)),footY=y+len*(.88+.06*Math.cos(phase));
  ctx.save();ctx.strokeStyle=ink;ctx.lineWidth=lw;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(hipX,hipY);ctx.quadraticCurveTo(kneeX,kneeY,footX,footY);ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=Math.max(1,lw*.55);ctx.beginPath();ctx.moveTo(hipX,hipY);ctx.quadraticCurveTo(kneeX,kneeY,footX,footY);ctx.stroke();ctx.restore();
}
function canine(ctx,{x,y,s,t,seed,p,bible,facing='right',action='running',alpha=1,type='wolf'}){
  const C=colorSet(p,bible),dir=facing==='left'?-1:1,g=gait(t,seed,/run|corr/i.test(action)?2.4:1.1);ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(dir*s,s);
  const run=/run|corr|sprint|galo/i.test(action);const bob=run?Math.sin(g.a*2)*2.2:Math.sin(g.a)*1.2;ctx.translate(0,bob);
  // shadow
  E.ellipse(ctx,-4,29,48,8,'rgba(20,18,15,.12)',null,0,0,.8);
  // tail, behind body
  ctx.save();ctx.strokeStyle=C.ink;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-38,-1);ctx.quadraticCurveTo(-62,-14+g.s*4,-72,4+g.c*4);ctx.stroke();ctx.strokeStyle=C.mid;ctx.lineWidth=4.6;ctx.stroke();ctx.restore();
  // far legs
  leg(ctx,-24,11,35,g.a+Math.PI,C.mid,C.ink,5);leg(ctx,22,10,36,g.a,C.mid,C.ink,5);
  // body silhouette
  E.ellipse(ctx,-7,-5,39,20,C.mid,C.ink,2.2,-.03,.98);E.ellipse(ctx,22,-10,22,20,C.dark,C.ink,2.1,.08,.98);
  // chest tuft
  E.poly(ctx,[[25,-3],[33,7],[28,18],[19,9]],C.light,C.ink,1.4,.8);
  // near legs
  leg(ctx,-18,10,38,g.a,C.light,C.ink,5.4);leg(ctx,27,8,39,g.a+Math.PI,C.light,C.ink,5.4);
  // neck + head
  E.ellipse(ctx,31,-22,17,19,C.mid,C.ink,2,-.12,.98);E.ellipse(ctx,43,-31,19,14,C.mid,C.ink,2,.04,.98);E.ellipse(ctx,58,-27,12,8,C.light,C.ink,1.7,.02,.98);E.ellipse(ctx,68,-27,4.6,4,p.ink,p.ink,1,0,1);
  // ears
  E.poly(ctx,[[30,-42],[34,-62],[42,-43]],C.dark,C.ink,1.5,.98);E.poly(ctx,[[43,-42],[51,-59],[53,-38]],C.dark,C.ink,1.5,.98);
  // eye + cheek
  E.ellipse(ctx,48,-34,2.6,2.2,p.yellow,C.ink,.7,0,1);furStroke(ctx,39,-24,50,-20,C.ink,1,.4);
  // fur planes
  for(let i=0;i<13;i++){const xx=-35+i*5.5,yy=-12+Math.sin(i*.9)*5;furStroke(ctx,xx,yy,xx+8,yy+3,C.light,.9,.24)}
  for(let i=0;i<6;i++){const a=i/6*E.TAU;furStroke(ctx,25+Math.cos(a)*11,-16+Math.sin(a)*11,29+Math.cos(a)*15,-15+Math.sin(a)*14,C.ink,.8,.18)}
  if(type==='fox'){ctx.save();ctx.globalAlpha=.72;E.ellipse(ctx,-8,-6,35,18,'#b9663d',null,0,-.03,1);E.ellipse(ctx,54,-26,9,6,'#efe2c7',null,0,0,1);ctx.restore()}
  if(type==='dog'){ctx.save();ctx.globalAlpha=.35;E.ellipse(ctx,-3,-7,24,13,p.warm,null,0,.1,1);ctx.restore()}
  ctx.restore();
}
function feline(ctx,{x,y,s,t,seed,p,bible,facing='right',action='moving',alpha=1,type='cat'}){
  const C=colorSet(p,bible),dir=facing==='left'?-1:1,g=gait(t,seed,/run|corr/i.test(action)?2.2:.9);ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(dir*s,s);ctx.translate(0,Math.sin(g.a*2)*1.5);
  ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-37,-7);ctx.bezierCurveTo(-63,-28,-69,-1,-78,-21);ctx.stroke();
  leg(ctx,-22,9,34,g.a,C.mid,C.ink,4.8);leg(ctx,23,9,35,g.a+Math.PI,C.mid,C.ink,4.8);E.ellipse(ctx,-6,-5,39,18,C.mid,C.ink,2,-.04,.98);leg(ctx,-17,9,35,g.a+Math.PI,C.light,C.ink,5);leg(ctx,28,7,36,g.a,C.light,C.ink,5);
  E.ellipse(ctx,36,-21,17,16,C.mid,C.ink,2,0,.98);E.ellipse(ctx,52,-23,12,10,C.light,C.ink,1.5,0,.98);E.poly(ctx,[[27,-35],[31,-52],[39,-35]],C.dark,C.ink,1.3);E.poly(ctx,[[40,-35],[48,-50],[50,-31]],C.dark,C.ink,1.3);E.ellipse(ctx,46,-26,2.4,2,p.yellow,p.ink,.5);E.ellipse(ctx,61,-22,3,2,p.ink,null,0);
  if(type==='tiger'||type==='lion'){for(let i=0;i<8;i++)furStroke(ctx,-30+i*8,-16,-23+i*8,-3,C.ink,1.2,.35)}if(type==='lion'){for(let i=0;i<13;i++){const a=i/13*E.TAU;E.ellipse(ctx,34+Math.cos(a)*20,-21+Math.sin(a)*20,7,12,C.dark,null,0,a,.55)}}ctx.restore();
}
function ungulate(ctx,{x,y,s,t,seed,p,bible,facing='right',action='running',alpha=1,type='horse'}){
  const C=colorSet(p,bible),dir=facing==='left'?-1:1,g=gait(t,seed,/run|corr|gallop|galop/i.test(action)?2.7:1);ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(dir*s,s);ctx.translate(0,Math.sin(g.a*2)*2.2);
  E.ellipse(ctx,-5,28,51,8,'rgba(20,18,15,.11)',null,0);leg(ctx,-26,9,48,g.a,C.dark,C.ink,5);leg(ctx,23,8,49,g.a+Math.PI,C.dark,C.ink,5);E.ellipse(ctx,-4,-5,43,22,C.mid,C.ink,2.1,-.02,.98);
  ctx.save();ctx.translate(27,-11);ctx.rotate(-.48);E.roundedRect(ctx,-7,-4,14,42,7,C.mid,C.ink,1.8);ctx.restore();E.ellipse(ctx,48,-38,18,12,C.mid,C.ink,1.8,.1,.98);E.ellipse(ctx,62,-34,13,7,C.light,C.ink,1.4,.05,.98);E.ellipse(ctx,71,-33,3.2,2.5,p.ink,null,0);
  E.poly(ctx,[[39,-48],[42,-61],[47,-46]],C.dark,C.ink,1.3);E.poly(ctx,[[51,-47],[57,-58],[58,-42]],C.dark,C.ink,1.3);E.ellipse(ctx,54,-40,2.2,2,p.yellow,p.ink,.5);
  leg(ctx,-18,10,50,g.a+Math.PI,C.light,C.ink,5.5);leg(ctx,31,6,50,g.a,C.light,C.ink,5.5);
  ctx.save();ctx.strokeStyle=C.dark;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-41,-8);ctx.quadraticCurveTo(-65,-5+g.s*6,-75,14);ctx.stroke();ctx.restore();
  if(type==='deer'){ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(46,-49);ctx.lineTo(44+side*7,-68);ctx.lineTo(39+side*11,-78);ctx.moveTo(43+side*5,-65);ctx.lineTo(35+side*12,-68);ctx.stroke()}}
  ctx.restore();
}
function bear(ctx,o){const C=colorSet(o.p,o.bible),dir=o.facing==='left'?-1:1,g=gait(o.t,o.seed,1.5);ctx.save();ctx.globalAlpha=o.alpha??1;ctx.translate(o.x,o.y);ctx.scale(dir*o.s,o.s);ctx.translate(0,Math.sin(g.a)*1.5);leg(ctx,-25,8,30,g.a,C.dark,C.ink,7);leg(ctx,25,8,30,g.a+Math.PI,C.dark,C.ink,7);E.ellipse(ctx,-2,-5,47,26,C.dark,C.ink,2.4);E.ellipse(ctx,38,-19,20,17,C.mid,C.ink,2);E.ellipse(ctx,55,-17,12,8,C.light,C.ink,1.5);E.ellipse(ctx,64,-16,4,3,o.p.ink,null,0);E.ellipse(ctx,30,-33,6,6,C.mid,C.ink,1);E.ellipse(ctx,47,-33,6,6,C.mid,C.ink,1);E.ellipse(ctx,47,-23,2.5,2,o.p.yellow,o.p.ink,.5);leg(ctx,-17,9,32,g.a+Math.PI,C.mid,C.ink,7.5);leg(ctx,30,7,32,g.a,C.mid,C.ink,7.5);ctx.restore()}
function rabbit(ctx,o){const C=colorSet(o.p,o.bible),dir=o.facing==='left'?-1:1,g=gait(o.t,o.seed,2);ctx.save();ctx.globalAlpha=o.alpha??1;ctx.translate(o.x,o.y);ctx.scale(dir*o.s,o.s);const hop=Math.max(0,Math.sin(g.a))*12;ctx.translate(0,-hop);E.ellipse(ctx,-6,2,27,17,C.mid,C.ink,1.8);E.ellipse(ctx,19,-10,14,13,C.light,C.ink,1.5);E.ellipse(ctx,20,-31,5,21,C.light,C.ink,1.2,-.18);E.ellipse(ctx,30,-30,5,20,C.light,C.ink,1.2,.12);E.ellipse(ctx,28,-13,2.4,2,o.p.yellow,o.p.ink,.5);E.ellipse(ctx,-31,-2,7,7,C.light,C.ink,1);ctx.restore()}
function bee(ctx,{x,y,s,t,seed,p,facing='right',alpha=1}){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(facing==='left'?-s:s,s);const beat=Math.sin(t*30+seed)*.45;for(const side of [-1,1]){ctx.save();ctx.rotate(side*(.5+beat*.55));E.ellipse(ctx,side*6,-8,7,13,'rgba(235,245,250,.30)',p.ink,.7,side*.35,.75);ctx.restore()}E.ellipse(ctx,0,2,7,12,p.yellow,p.ink,1,0,1);for(let yy=-4;yy<9;yy+=4)E.line(ctx,-6,yy,6,yy,p.ink,1,.65);E.ellipse(ctx,0,-9,6,5,p.ink,p.ink,.6);ctx.restore()}
function butterfly(ctx,{x,y,s,t,seed,p,facing='right',alpha=1}){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(facing==='left'?-s:s,s);const flap=.55+.4*Math.sin(t*13+seed);for(const side of [-1,1]){ctx.save();ctx.scale(flap,1);E.ellipse(ctx,side*9,-6,10,16,side<0?p.magenta:p.warm,p.ink,.8,side*.3,.82);E.ellipse(ctx,side*7,9,8,11,p.yellow,p.ink,.8,side*.2,.75);ctx.restore()}E.ellipse(ctx,0,2,2.8,14,p.ink,p.ink,.5);ctx.restore()}
function bird(ctx,{x,y,s,t,seed,p,facing='right',alpha=1}){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(facing==='left'?-s:s,s);const flap=Math.sin(t*7+seed);E.ellipse(ctx,0,0,14,7,p.warm,p.ink,1);E.poly(ctx,[[12,-1],[22,-5],[19,4]],p.yellow,p.ink,.8);for(const side of [-1,1]){ctx.save();ctx.rotate(side*flap*.5);E.poly(ctx,[[0,0],[side*18,-4],[side*7,9]],p.cyan,p.ink,.8,.8);ctx.restore()}ctx.restore()}
function fish(ctx,{x,y,s,t,seed,p,facing='right',alpha=1}){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(facing==='left'?-s:s,s);const wob=Math.sin(t*5+seed)*.08;ctx.rotate(wob);E.ellipse(ctx,0,0,16,8,p.cyan,p.ink,1);E.poly(ctx,[[-14,0],[-25,-8],[-25,8]],p.magenta,p.ink,.8);E.ellipse(ctx,9,-2,1.6,1.6,p.ink,null,0);ctx.restore()}
function human(ctx,{x,y,s,t,seed,p,facing='right',action='moving',alpha=1}){const g=gait(t,seed,/run|corr/i.test(action)?2:1);ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(facing==='left'?-s:s,s);E.ellipse(ctx,0,-37,7,8,p.warm,p.ink,1);E.roundedRect(ctx,-7,-28,14,26,6,p.cyan,p.ink,1);leg(ctx,-4,-4,28,g.a,p.ink,p.ink,3);leg(ctx,4,-4,28,g.a+Math.PI,p.ink,p.ink,3);E.line(ctx,-6,-20,-18,-7+g.s*8,p.ink,3,.9);E.line(ctx,6,-20,18,-7-g.s*8,p.ink,3,.9);ctx.restore()}
function robot(ctx,o){const {p}=o;ctx.save();ctx.globalAlpha=o.alpha??1;ctx.translate(o.x,o.y);ctx.scale((o.facing==='left'?-1:1)*o.s,o.s);const g=gait(o.t,o.seed,1.5);E.roundedRect(ctx,-16,-26,32,35,5,p.cyan,p.ink,1.5);E.roundedRect(ctx,-12,-48,24,20,4,p.bg,p.ink,1.5);E.ellipse(ctx,-5,-39,2,2,p.magenta,null,0);E.ellipse(ctx,5,-39,2,2,p.magenta,null,0);leg(ctx,-9,7,28,g.a,p.cyan,p.ink,4);leg(ctx,9,7,28,g.a+Math.PI,p.cyan,p.ink,4);ctx.restore()}
function genericAnimal(ctx,o){canine(ctx,{...o,type:'wolf'})}

export function drawSubject(ctx,type,opts){const o={alpha:1,action:'moving',facing:'right',s:1,seed:1,...opts,ctx};switch(type){case'wolf':return canine(ctx,{...o,type:'wolf'});case'fox':return canine(ctx,{...o,type:'fox'});case'dog':return canine(ctx,{...o,type:'dog'});case'cat':case'tiger':case'lion':return feline(ctx,{...o,type});case'horse':case'deer':case'cow':case'sheep':case'goat':return ungulate(ctx,{...o,type});case'bear':return bear(ctx,o);case'rabbit':return rabbit(ctx,o);case'bee':case'insect':case'dragonfly':return bee(ctx,o);case'butterfly':return butterfly(ctx,o);case'bird':return bird(ctx,o);case'fish':case'whale':case'dolphin':return fish(ctx,o);case'human':return human(ctx,o);case'robot':return robot(ctx,o);default:return genericAnimal(ctx,o)}}

export function subjectBaseScale(type,w,h,shot='medium'){
  const unit=Math.min(w,h)/720;let k={macro:5.4,close:4.0,medium:2.65,wide:1.55,extreme_wide:.88}[shot]||2.65;
  if(['bee','butterfly','bird','fish','insect','dragonfly'].includes(type))k*=3.1;
  if(['human','robot'].includes(type))k*=1.25;if(type==='elephant')k*=1.1;return unit*k;
}
