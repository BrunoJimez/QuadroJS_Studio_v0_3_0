import { findBrowser, findFFmpeg } from './core/exporter.mjs';
console.log('Node:', process.version);
console.log('Browser:', findBrowser() || 'NÃO ENCONTRADO');
console.log('FFmpeg:', findFFmpeg() || 'NÃO ENCONTRADO');
