import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as E from './runtime/engine.js';
import { defaultProject, timelineFor } from './runtime/scenes.js';
import { fallbackPlan } from './core/ai.mjs';
import { renderProceduralAudio } from './core/audio.mjs';

const p=defaultProject();p.mode='timeline';const tl=timelineFor(p);assert.equal(tl.length,6);assert.ok(Math.abs(tl.at(-1).end-p.duration)<1e-9);assert.equal(E.clamp(-1),0);assert.equal(E.clamp(2),1);const r1=E.mulberry32(42),r2=E.mulberry32(42);for(let i=0;i<20;i++)assert.equal(r1(),r2());for(const x of [0,.2,.5,.9,1])assert.ok(E.smooth(x)>=0&&E.smooth(x)<=1);
const plan=fallbackPlan({prompt:'Abelhas num campo aberto de flores',duration:12,audioMode:'generated',maxScenes:8});assert.ok(plan.scenes.length>=6);assert.ok(Math.abs(plan.scenes.reduce((s,x)=>s+x.duration,0)-12)<1e-8);assert.equal(plan.scenes.at(-1).end,12);assert.ok(plan.scenes.some(s=>s.entities.some(e=>e.type==='bee')));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qjs-test-'));const ap={...defaultProject(),duration:1,filmPlan:fallbackPlan({prompt:'Abelhas',duration:1,audioMode:'generated',maxScenes:6})};const wav=renderProceduralAudio({project:ap,outputDir:tmp});const b=fs.readFileSync(wav);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');assert.ok(b.length>190000);fs.rmSync(tmp,{recursive:true,force:true});
console.log('OK: determinismo, timeline, narrativa fallback e áudio procedural validados.');
