import os from 'node:os';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { findBrowser, findFFmpeg } from './exporter.mjs';

function run(cmd,args=[],opts={}){
  try{return execFileSync(cmd,args,{encoding:'utf8',stdio:['ignore','pipe','ignore'],timeout:opts.timeout||5000}).trim()}catch{return ''}
}
function commandExists(cmd){
  const r=spawnSync(process.platform==='win32'?'where':'which',[cmd],{encoding:'utf8'});
  return r.status===0;
}
function parseNvidia(){
  const out=run('nvidia-smi',['--query-gpu=name,memory.total,driver_version','--format=csv,noheader,nounits']);
  if(!out)return [];
  return out.split(/\r?\n/).filter(Boolean).map((line,i)=>{
    const parts=line.split(',').map(s=>s.trim());
    return {index:i,vendor:'NVIDIA',name:parts[0]||'NVIDIA GPU',vramMB:Number(parts[1])||0,driver:parts[2]||''};
  });
}
function parseWindowsGpus(){
  if(process.platform!=='win32')return [];
  const script=`Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM,DriverVersion | ConvertTo-Json -Compress`;
  const out=run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-Command',script]);
  if(!out)return [];
  try{
    const raw=JSON.parse(out);const arr=Array.isArray(raw)?raw:[raw];
    return arr.filter(Boolean).map((g,i)=>({index:i,vendor:/nvidia/i.test(g.Name)?'NVIDIA':/amd|radeon/i.test(g.Name)?'AMD':/intel/i.test(g.Name)?'Intel':'Other',name:g.Name||'GPU',vramMB:Number(g.AdapterRAM)>0?Math.round(Number(g.AdapterRAM)/1048576):0,driver:g.DriverVersion||''}));
  }catch{return []}
}
function mergeGpus(primary,secondary){
  if(primary.length)return primary.map((g,i)=>{
    const x=secondary.find(s=>s.name && g.name && (s.name.includes(g.name)||g.name.includes(s.name)))||secondary[i];
    return {...x,...g,vramMB:g.vramMB||x?.vramMB||0};
  });
  return secondary;
}
export function recommendModel(hw){
  const vram=Math.max(0,...(hw.gpus||[]).map(g=>g.vramMB||0));
  const ramGB=hw.ramGB||0;
  if(vram>=22000 && ramGB>=32) return {model:'qwen3-coder:30b',tier:'pro',reason:'GPU com cerca de 24 GB ou mais e RAM suficiente para um modelo de código maior.'};
  if(vram>=7000 && ramGB>=14) return {model:'qwen3.5:9b',tier:'balanced',reason:'Bom equilíbrio para 8 GB de VRAM: planejamento, JSON estruturado e geração moderada de código.'};
  if(vram>=3500 || ramGB>=12) return {model:'qwen3.5:4b',tier:'light',reason:'Modelo compacto para máquinas intermediárias.'};
  if(ramGB>=8) return {model:'qwen3.5:2b',tier:'low',reason:'Modelo leve para CPU/GPUs pequenas.'};
  return {model:'qwen3.5:0.8b',tier:'minimum',reason:'Modo mínimo para máquinas com pouca memória; a gramática procedural compensa limitações do modelo.'};
}
export function detectHardware(){
  const nvidia=parseNvidia();
  const win=parseWindowsGpus();
  const gpus=mergeGpus(nvidia,win);
  const hw={
    platform:process.platform,
    arch:process.arch,
    os:`${os.type()} ${os.release()}`,
    cpu:os.cpus()?.[0]?.model||'CPU desconhecida',
    cpuThreads:os.cpus()?.length||1,
    ramGB:Math.round(os.totalmem()/1073741824*10)/10,
    freeRamGB:Math.round(os.freemem()/1073741824*10)/10,
    gpus,
    ffmpeg:findFFmpeg(),
    browser:findBrowser(),
    node:process.version,
    ollama:commandExists('ollama'),
    llamaCpp:commandExists(process.platform==='win32'?'llama-server.exe':'llama-server') || commandExists('llama-server'),
    winget:process.platform==='win32'&&commandExists('winget')
  };
  hw.recommendation=recommendModel(hw);
  return hw;
}

export function ffmpegEncoders(){
  const ff=findFFmpeg();
  const out=run(ff,['-hide_banner','-encoders'],{timeout:8000});
  const names=['h264_nvenc','h264_qsv','h264_amf','libx264'];
  return names.filter(n=>new RegExp(`\\b${n}\\b`).test(out));
}
