export const TAU = Math.PI * 2;

export function clamp(v, a=0, b=1){ return Math.max(a, Math.min(b, v)); }
export function lerp(a,b,t){ return a + (b-a)*t; }
export function invLerp(a,b,v){ return a===b ? 0 : (v-a)/(b-a); }
export function smooth(t){ t=clamp(t); return t*t*(3-2*t); }
export function smoother(t){ t=clamp(t); return t*t*t*(t*(t*6-15)+10); }
export function easeInOut(t){ return 0.5 - 0.5*Math.cos(Math.PI*clamp(t)); }
export function pingpong(t){ t=((t%2)+2)%2; return t<1?t:2-t; }
export function fract(v){ return v-Math.floor(v); }

export function hash1(n){ return fract(Math.sin(n*127.1+311.7)*43758.5453123); }
export function hash2(x,y,seed=0){ return fract(Math.sin(x*127.1+y*311.7+seed*74.7)*43758.5453123); }

export function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function valueNoise(x,y,seed=0){
  const x0=Math.floor(x), y0=Math.floor(y), x1=x0+1, y1=y0+1;
  const tx=smooth(x-x0), ty=smooth(y-y0);
  const a=hash2(x0,y0,seed), b=hash2(x1,y0,seed), c=hash2(x0,y1,seed), d=hash2(x1,y1,seed);
  return lerp(lerp(a,b,tx),lerp(c,d,tx),ty);
}

export function fbm(x,y,seed=0,octaves=4){
  let sum=0, amp=0.5, freq=1, norm=0;
  for(let i=0;i<octaves;i++){
    sum += valueNoise(x*freq,y*freq,seed+i*13)*amp;
    norm += amp; amp*=0.5; freq*=2.02;
  }
  return sum/norm;
}

export function hexToRgb(hex){
  const s=hex.replace('#','').trim();
  const v=s.length===3?s.split('').map(c=>c+c).join(''):s;
  return {r:parseInt(v.slice(0,2),16),g:parseInt(v.slice(2,4),16),b:parseInt(v.slice(4,6),16)};
}
export function rgbToCss({r,g,b},a=1){ return `rgba(${r|0},${g|0},${b|0},${a})`; }
export function mixColor(a,b,t){
  a=typeof a==='string'?hexToRgb(a):a; b=typeof b==='string'?hexToRgb(b):b;
  return {r:lerp(a.r,b.r,t),g:lerp(a.g,b.g,t),b:lerp(a.b,b.b,t)};
}

export const palettes = {
  riso: {bg:'#f2e7c9', ink:'#161625', cyan:'#2fa7a0', magenta:'#d93467', yellow:'#e7b629', warm:'#d97845'},
  blueprint: {bg:'#0b1024', ink:'#dcecff', cyan:'#52d1d8', magenta:'#d95cba', yellow:'#f2df6b', warm:'#f08a78'},
  nocturne: {bg:'#06070d', ink:'#e7e9f2', cyan:'#5bd4ff', magenta:'#ff4a9a', yellow:'#ffd65a', warm:'#ff7a59'},
  paper: {bg:'#f7f2e8', ink:'#29251f', cyan:'#4f9f9d', magenta:'#bd4b64', yellow:'#d2a437', warm:'#bb6b48'}
};

export function clear(ctx, color){
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=color; ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height); ctx.restore();
}

export function withTransform(ctx, {x=0,y=0,scale=1,rot=0}={}, fn){
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.scale(scale,scale); fn(); ctx.restore();
}

export function line(ctx,x1,y1,x2,y2,color='#000',w=1,alpha=1){
  ctx.save(); ctx.globalAlpha=alpha; ctx.strokeStyle=color; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore();
}

export function ellipse(ctx,x,y,rx,ry,fill,stroke=null,w=1,rot=0,alpha=1){
  ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,TAU);
  if(fill){ctx.fillStyle=fill; ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke();} ctx.restore();
}

export function poly(ctx, pts, fill, stroke=null, w=1, alpha=1){
  if(!pts.length)return; ctx.save(); ctx.globalAlpha=alpha; ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]); ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke();} ctx.restore();
}

export function roundedRect(ctx,x,y,w,h,r,fill,stroke=null,lw=1){
  r=Math.min(r,w/2,h/2); ctx.save(); ctx.beginPath(); ctx.roundRect(x,y,w,h,r); if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();} ctx.restore();
}

export function drawPaper(ctx, seed=1, strength=0.08){
  const {width:w,height:h}=ctx.canvas; const rnd=mulberry32(seed);
  ctx.save(); ctx.globalCompositeOperation='multiply';
  for(let i=0;i<Math.floor(w*h/1800);i++){
    const x=rnd()*w,y=rnd()*h,a=rnd()*strength; ctx.fillStyle=`rgba(40,30,20,${a})`; ctx.fillRect(x,y,1+rnd()*2,1+rnd()*2);
  }
  for(let i=0;i<Math.floor(h/6);i++){
    const y=rnd()*h; ctx.strokeStyle=`rgba(80,50,30,${strength*0.22*rnd()})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,y);ctx.lineTo(w,y+rnd()*2-1);ctx.stroke();
  }
  ctx.restore();
}

export function hatch(ctx, x,y,w,h, spacing=8, angle=-0.25, color='rgba(0,0,0,.15)', lineWidth=1){
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.translate(x+w/2,y+h/2); ctx.rotate(angle); ctx.strokeStyle=color;ctx.lineWidth=lineWidth;
  const span=Math.hypot(w,h); for(let xx=-span;xx<span;xx+=spacing){ctx.beginPath();ctx.moveTo(xx,-span);ctx.lineTo(xx,span);ctx.stroke();}
  ctx.restore();
}

export function halftone(ctx, x,y,w,h, opts={}){
  const spacing=opts.spacing??8, radius=opts.radius??1.5, color=opts.color??'rgba(0,0,0,.25)', seed=opts.seed??1, wobble=opts.wobble??0;
  ctx.save(); ctx.fillStyle=color;
  for(let yy=y;yy<y+h;yy+=spacing){
    for(let xx=x;xx<x+w;xx+=spacing){
      const jx=(hash2(xx,yy,seed)-.5)*wobble, jy=(hash2(yy,xx,seed+9)-.5)*wobble;
      ctx.beginPath();ctx.arc(xx+jx,yy+jy,radius*(.6+.8*hash2(xx*0.3,yy*0.3,seed+2)),0,TAU);ctx.fill();
    }
  }
  ctx.restore();
}

export function drawHexField(ctx, cx,cy,rx,ry,size, palette, t=0, seed=1){
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,TAU); ctx.clip();
  const dx=size*1.5, dy=size*Math.sqrt(3); let row=0;
  for(let y=cy-ry-size;y<cy+ry+size;y+=dy){
    const off=(row++%2)*size*.75;
    for(let x=cx-rx-size+off;x<cx+rx+size;x+=dx){
      const n=fbm(x*.015,y*.015,seed,3); const pulse=.5+.5*Math.sin(t*2+n*6);
      const c=mixColor(palette.magenta,palette.yellow,clamp(n*.8+pulse*.15));
      ctx.beginPath();
      for(let k=0;k<6;k++){const a=TAU*k/6;const px=x+Math.cos(a)*size,py=y+Math.sin(a)*size;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();
      ctx.fillStyle=rgbToCss(c,.78);ctx.fill();ctx.strokeStyle='rgba(20,20,35,.26)';ctx.lineWidth=Math.max(.5,size*.08);ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawCellField(ctx, t, seed, palette, scale=1){
  const {width:w,height:h}=ctx.canvas; const rnd=mulberry32(seed); const cells=[];
  const count=Math.floor(44*scale);
  for(let i=0;i<count;i++){
    const x=rnd()*w,y=rnd()*h,r=(24+rnd()*54)*Math.min(w/720,h/1280); cells.push({x,y,r,phase:rnd()*TAU});
  }
  ctx.save();
  for(const c of cells){
    const rr=c.r*(.92+.08*Math.sin(t*1.4+c.phase)); const n=.5+.5*Math.sin(c.phase*2.4);
    ellipse(ctx,c.x,c.y,rr,rr*(.75+.18*n),rgbToCss(mixColor(palette.warm,palette.yellow,n),.22),palette.ink,Math.max(.7,rr*.025),c.phase*.12,.9);
    ellipse(ctx,c.x+Math.cos(c.phase)*rr*.16,c.y+Math.sin(c.phase)*rr*.12,rr*.12,rr*.09,palette.magenta,null,0,0,.35);
  }
  ctx.restore();
}

export function drawLarva(ctx, x,y,len,thickness,t,palette,seed=1,rotation=0){
  const seg=12; ctx.save(); ctx.translate(x,y);ctx.rotate(rotation);
  const pts=[]; for(let i=0;i<seg;i++){const u=i/(seg-1);pts.push([lerp(-len/2,len/2,u), Math.sin(u*TAU*1.5+t*3+i*.1)*thickness*.16]);}
  for(let i=seg-1;i>=0;i--){const u=i/(seg-1), p=pts[i], r=thickness*(.42+.48*Math.sin(Math.PI*u));
    ellipse(ctx,p[0],p[1],r*.52,r*.88,palette.bg,palette.ink,Math.max(1,thickness*.035),0,.96);
    hatch(ctx,p[0]-r*.5,p[1]-r*.7,r,r*1.4,Math.max(3,thickness*.12),-.45,`rgba(20,20,30,.16)`,.7);
  }
  for(let i=0;i<3;i++) ellipse(ctx,-len*.45+i*thickness*.15,-thickness*.2,thickness*.08,thickness*.08,palette.ink,null,0,0,.8);
  ctx.restore();
}

export function drawWingedInsect(ctx, x,y,s,t,palette,seed=1,rotation=0,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(s,s);
  const wingBeat=Math.sin(t*24+seed)*.32;
  // wings
  ctx.save();ctx.globalAlpha=.34;ctx.fillStyle=palette.ink;ctx.strokeStyle=palette.ink;ctx.lineWidth=1.2;
  for(const side of [-1,1]){
    ctx.save();ctx.rotate(side*(.55+wingBeat));ctx.beginPath();ctx.ellipse(side*10,-18,13,31,side*.35,0,TAU);ctx.fillStyle='rgba(220,235,235,.24)';ctx.fill();ctx.stroke();ctx.restore();
  }ctx.restore();
  // abdomen
  ellipse(ctx,0,18,12,25,palette.warm,palette.ink,1.6,0,.95);
  for(let yy=4;yy<36;yy+=7) line(ctx,-10,yy,10,yy,palette.ink,1,.55);
  // thorax + head
  ellipse(ctx,0,-4,13,15,'#7f5b43',palette.ink,1.5,0,.98);
  ellipse(ctx,0,-22,11,10,'#9a7458',palette.ink,1.4,0,.98);
  ellipse(ctx,-7,-24,6,7,palette.magenta,palette.ink,1,0,.95); ellipse(ctx,7,-24,6,7,palette.magenta,palette.ink,1,0,.95);
  // legs
  for(const side of [-1,1]) for(let i=0;i<3;i++){
    const yy=-4+i*7; const k=.75+i*.12; ctx.beginPath();ctx.moveTo(side*8,yy);ctx.quadraticCurveTo(side*24,yy+8,side*(28+i*3),yy+20*k);ctx.strokeStyle=palette.ink;ctx.lineWidth=1.2;ctx.stroke();
  }
  // antennae
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*4,-30);ctx.quadraticCurveTo(side*14,-40,side*18,-48);ctx.strokeStyle=palette.ink;ctx.lineWidth=1;ctx.stroke();}
  ctx.restore();
}

export function drawBlueprintGrid(ctx,palette,step=42){
  const {width:w,height:h}=ctx.canvas;ctx.save();ctx.strokeStyle='rgba(120,190,230,.08)';ctx.lineWidth=1;
  for(let x=0;x<w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.restore();
}

export function drawTitle(ctx, title, sub, palette, alpha=1){
  const {width:w,height:h}=ctx.canvas;ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';ctx.fillStyle=palette.ink;
  ctx.font=`700 ${Math.max(28,w*.055)}px system-ui, sans-serif`;ctx.fillText(title,w/2,h*.11);
  if(sub){ctx.font=`500 ${Math.max(14,w*.024)}px system-ui, sans-serif`;ctx.globalAlpha*=.7;ctx.fillText(sub,w/2,h*.145);}ctx.restore();
}

export function vignette(ctx,amount=.25){
  const {width:w,height:h}=ctx.canvas; const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.hypot(w,h)*.62);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${amount})`);ctx.save();ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();
}

export function registrationGhost(ctx, drawFn, palette, offset=2, alpha=.25){
  ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=alpha;ctx.translate(-offset,0);drawFn(palette.cyan);ctx.restore();
  ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=alpha;ctx.translate(offset,0);drawFn(palette.magenta);ctx.restore();
}

export function sceneLocalTime(globalT, scene, totalScale=1){
  return clamp((globalT-scene.start)/(scene.end-scene.start));
}

export function buildTimeline(specs, totalDuration){
  const base=specs.reduce((s,a)=>s+a.duration,0); let cursor=0;
  return specs.map(s=>{const d=s.duration/base*totalDuration;const out={...s,start:cursor,end:cursor+d};cursor+=d;return out;});
}

export function activeScene(t,timeline){
  return timeline.find((s,i)=>t>=s.start && (t<s.end || i===timeline.length-1)) || timeline[timeline.length-1];
}

export function crossfadeAlpha(u,edge=.08){
  return Math.min(smooth(clamp(u/edge)), smooth(clamp((1-u)/edge)));
}

export const API = {TAU,clamp,lerp,invLerp,smooth,smoother,easeInOut,pingpong,fract,hash1,hash2,mulberry32,valueNoise,fbm,hexToRgb,rgbToCss,mixColor,palettes,clear,withTransform,line,ellipse,poly,roundedRect,drawPaper,hatch,halftone,drawHexField,drawCellField,drawLarva,drawWingedInsect,drawBlueprintGrid,drawTitle,vignette,registrationGhost,sceneLocalTime,buildTimeline,activeScene,crossfadeAlpha};
