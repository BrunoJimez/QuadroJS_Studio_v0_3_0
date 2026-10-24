import { drawProject } from '../runtime/scenes.js';
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d',{alpha:false});
let project=null;
window.__setProject=(p)=>{
  project=p;
  canvas.width=p.width;canvas.height=p.height;
  document.documentElement.style.width=p.width+'px';document.documentElement.style.height=p.height+'px';
  document.body.style.width=p.width+'px';document.body.style.height=p.height+'px';
  return true;
};
window.__renderAt=(frame)=>{
  if(!project)throw new Error('Projeto não inicializado');
  const t=frame/project.fps;
  drawProject(ctx,t,project,frame);
  return {frame,t};
};
window.__ready=true;
