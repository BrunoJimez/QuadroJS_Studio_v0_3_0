import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as E from './runtime/engine.js';
import { defaultProject, timelineFor } from './runtime/scenes.js';
import { fallbackPlan, promptFingerprint, qualityAudit, normalizePlan } from './core/ai.mjs';
import { renderProceduralAudio } from './core/audio.mjs';

const p=defaultProject();p.mode='timeline';const tl=timelineFor(p);assert.equal(tl.length,6);assert.ok(Math.abs(tl.at(-1).end-p.duration)<1e-9);
assert.equal(E.clamp(-1),0);assert.equal(E.clamp(2),1);const r1=E.mulberry32(42),r2=E.mulberry32(42);for(let i=0;i<20;i++)assert.equal(r1(),r2());

const bee=fallbackPlan({prompt:'Abelhas num campo aberto de flores',duration:12,audioMode:'generated',maxScenes:8});assert.ok(bee.scenes.some(s=>s.entities.some(e=>e.type==='bee')));assert.equal(bee.promptFingerprint,promptFingerprint('Abelhas num campo aberto de flores'));
const wolf=fallbackPlan({prompt:'Lobos correndo em um campo aberto',duration:12,audioMode:'generated',maxScenes:8});assert.equal(wolf.subject.primary,'wolf');assert.ok(wolf.scenes.some(s=>s.entities.some(e=>e.type==='wolf')));assert.ok(!wolf.scenes.some(s=>s.entities.some(e=>e.type==='bee')),'Lobos não podem herdar abelhas');assert.ok(Math.abs(wolf.scenes.reduce((s,x)=>s+x.duration,0)-12)<1e-8);
const audit=qualityAudit(wolf,'Lobos correndo em um campo aberto');assert.equal(audit.gates.freshPrompt,true);assert.equal(audit.gates.durationClosed,true);
const stale={...defaultProject(),prompt:'Lobos correndo em um campo aberto',filmPlan:bee,mode:'ai'};assert.equal(timelineFor(stale).length,0,'Plano com assinatura antiga deve ser invalidado');

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qjs-test-'));const ap={...defaultProject(),prompt:'Lobos correndo em um campo aberto',duration:1,filmPlan:fallbackPlan({prompt:'Lobos correndo em um campo aberto',duration:1,audioMode:'generated',maxScenes:6})};const wav=renderProceduralAudio({project:ap,outputDir:tmp});const b=fs.readFileSync(wav);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');assert.ok(b.length>190000);fs.rmSync(tmp,{recursive:true,force:true});
console.log('OK v0.3: prompt isolation, wolf/no-bee regression, determinism, timeline, quality gates and audio validated.');
