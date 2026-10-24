import { detectHardware, ffmpegEncoders } from './core/hardware.mjs';
import { detectAI } from './core/ai.mjs';
import { chooseVideoEncoder } from './core/exporter.mjs';
const h=detectHardware(),a=await detectAI();
console.log('QuadroJS Studio v0.3.0 — diagnóstico');
console.log('Node:',h.node);console.log('SO:',h.os,h.arch);console.log('CPU:',h.cpu,'| threads:',h.cpuThreads);console.log('RAM:',h.ramGB,'GB');console.log('GPUs:',h.gpus.length?h.gpus:'não identificadas');console.log('Browser:',h.browser||'NÃO ENCONTRADO');console.log('FFmpeg:',h.ffmpeg);console.log('Encoders H.264:',ffmpegEncoders());console.log('Encoder selecionado:',chooseVideoEncoder());console.log('Ollama:',a.ollama,'| llama.cpp:',a.llamaCpp);console.log('Modelos locais:',a.models);console.log('Recomendado:',a.recommended);
