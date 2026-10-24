# QuadroJS Studio v0.2.0 — validação desta entrega

## Testes executados

- `node --check` em todos os módulos JavaScript/MJS do núcleo, servidor, runtime, UI e testes: **OK**.
- `node test.mjs`: **OK** para determinismo, timeline, narrativa fallback e áudio procedural.
- Diagnóstico de hardware/IA (`node tools-check.mjs`): **OK**; neste ambiente Linux sem GPU física disponível, o seletor escolheu corretamente `libx264`, embora o FFmpeg liste `h264_nvenc` entre os encoders compilados.
- API local + planejamento sem IA local: **OK**; o servidor respondeu ao diagnóstico e o fallback produziu um storyboard de 12 s com 6 planos cobrindo exatamente 0–12 s.
- Áudio procedural: **OK**; WAV PCM estéreo, 48 kHz, duração exata do filme no teste isolado.

## Limitação do ambiente de validação

O teste integral `Canvas -> Chromium headless -> frames -> FFmpeg -> MP4` não pôde ser concluído neste ambiente hospedado porque o Chromium headless disponível aqui não termina nem uma página mínima dentro do limite de execução. O renderizador e o exportador passaram pela validação sintática, mas esta entrega **não afirma** validação MP4 ponta a ponta neste host.

No Windows do usuário, use primeiro um projeto curto (5–10 s, 720p) para validar Chromium/Edge + FFmpeg + encoder. O diagnóstico do programa registra navegador, FFmpeg, GPU e encoder escolhidos, facilitando a identificação de qualquer problema.

## O que está implementado na v0.2.0

- Prompt -> storyboard estruturado por IA local (Ollama ou servidor compatível com llama.cpp) com fallback offline sem IA.
- Duração configurável e divisão automática em atos/cenas.
- Gramática procedural Canvas 2D determinística.
- Modo híbrido: gramática reutilizável + cenas hero opcionais geradas por IA local.
- Validador de código de cena com bloqueio de rede, relógio, aleatoriedade não determinística e APIs perigosas.
- Áudio procedural gerado localmente; áudio do usuário; filme mudo.
- Perfis YouTube 720p/1080p/1440p/4K, Shorts/Reels/TikTok 1080x1920, Instagram 1080x1080 e resolução personalizada.
- Exportação H.264/AAC via FFmpeg, preferindo NVENC apenas quando uma GPU NVIDIA realmente é detectada.
- Diagnóstico de CPU, RAM, GPU/VRAM, navegador, FFmpeg e IA local.
- Instalador assistido para Windows via winget e recomendação de modelo conforme hardware.

## Próximas extensões recomendadas

A geração musical neural (por exemplo, integração opcional com ACE-Step), WebGL/WebGPU para 2K/4K mais rápidos, crítica visual automatizada por frames, cache por cena, retomada de render e pacotes de estilos devem entrar em versões posteriores, mantendo o modo atual leve como fallback universal.
