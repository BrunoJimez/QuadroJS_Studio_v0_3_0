# QuadroJS Studio v0.2.0 — Local AI Procedural Film

Aplicativo local para transformar uma frase em um **filme procedural desenhado por JavaScript Canvas**, com planejamento narrativo por IA local, duração definida pelo usuário, trilha procedural opcional e exportação MP4 para YouTube, Instagram e TikTok.

Exemplo de entrada:

> Abelhas num campo aberto de flores

O programa constrói um storyboard, divide a duração em planos, gera movimento procedural e renderiza cada quadro. O modo padrão não precisa de imagens ou vídeos de origem.

## O que a v0.2 adiciona

- entrada em linguagem natural → roteiro/storyboard;
- IA 100% local via **Ollama** ou servidor **llama.cpp**;
- fallback sem IA: o programa continua funcionando com uma gramática procedural própria;
- recomendação automática de modelo baseada em RAM e VRAM;
- modos de geração:
  - **Rápida / DSL**: a IA planeja e o motor desenha;
  - **Híbrida**: a IA escreve JavaScript apenas para planos-chave;
  - **Máxima**: a IA tenta escrever todas as cenas (mais lenta e experimental);
- export presets:
  - YouTube 720p — 1280×720;
  - YouTube 1080p — 1920×1080;
  - YouTube 2K/QHD — 2560×1440;
  - YouTube 4K/UHD — 3840×2160;
  - YouTube Shorts — 1080×1920;
  - Instagram Reels — 1080×1920;
  - Instagram quadrado — 1080×1080;
  - TikTok — 1080×1920;
- 24, 30 e 60 fps;
- duração entre 5 s e 10 min (render limitado a 36.000 quadros por execução nesta versão);
- áudio:
  - trilha procedural gerada a partir de BPM, tonalidade, energia e cues do roteiro;
  - arquivo de áudio fornecido pelo usuário;
  - mudo;
- exportador H.264 determinístico;
- NVENC usado automaticamente quando há GPU NVIDIA **e** o encoder está disponível no FFmpeg;
- fallback `libx264` em qualquer máquina compatível;
- seed determinística;
- validação estática para código JavaScript produzido pela IA.

## Windows — instalação recomendada

Execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup_windows.ps1
```

ou dê dois cliques em `install_windows.bat`.

O assistente verifica/instala com `winget`, quando necessário:

- Node.js LTS;
- FFmpeg;
- Ollama;
- Chrome apenas se Chrome/Edge não estiverem disponíveis.

Depois ele mede RAM/VRAM e recomenda um modelo local. O download do modelo só é feito após confirmação do usuário.

### Faixas de modelo usadas pelo recomendador

| Hardware aproximado | Modelo padrão |
|---|---|
| memória muito limitada | `qwen3.5:0.8b` |
| ≥ 8 GB RAM | `qwen3.5:2b` |
| ≥ 12 GB RAM ou ~4 GB VRAM | `qwen3.5:4b` |
| ~8 GB VRAM + ≥14 GB RAM | `qwen3.5:9b` |
| ~24 GB VRAM + ≥32 GB RAM | `qwen3-coder:30b` |

A seleção é conservadora. O contexto e a geração de código também consomem memória.

## Executar

Windows:

```bat
start.bat
```

ou:

```powershell
node server.mjs
```

O servidor fica preso a `127.0.0.1` e abre a interface local no navegador.

## Fluxo interno

```text
frase do usuário
      ↓
hardware profiler
      ↓
modelo local adequado
      ↓
Narrative Director (JSON)
      ↓
storyboard / acts / beat grid
      ↓
Procedural Scene Grammar ─────→ Canvas 2D
      │
      └── Hero Scene Coder (opcional) → JS validado → Canvas 2D
      ↓
frame n = n / fps
      ↓
Chromium headless
      ↓
FFmpeg H.264 (NVENC/libx264)
      ↓
trilha procedural | áudio do usuário | silêncio
      ↓
MP4 final
```

## Segurança e determinismo

Código de cena gerado pela IA é rejeitado quando contém chamadas como `fetch`, `XMLHttpRequest`, `WebSocket`, `window`, `document`, `globalThis`, `eval`, `Function`, `require`, `process`, `Date`, `performance.now` ou `Math.random`.

Isso **não é um sandbox formal**. O modo de código gerado deve continuar sendo tratado como experimental. A estratégia padrão/mais segura é o modo DSL, no qual a IA entrega JSON e o motor executa apenas primitivas próprias.

## Áudio procedural

A trilha interna é sintetizada localmente a 48 kHz estéreo. O roteiro fornece BPM, tonalidade, curva de energia e efeitos; o motor gera pulso, baixo, pads, motivos e SFX simples. Nenhuma API é necessária.

A arquitetura também foi preparada para um backend futuro de música neural local (por exemplo ACE-Step), mas **ACE-Step ainda não está integrado nesta v0.2**.

## Limitações atuais

- a gramática visual genérica já cobre paisagem, campo, enxame, macro, colmeia, floresta, água, cidade, espaço, microscopia, blueprint, botânica, noite e abstrações, com primitivas para abelhas, flores e outros elementos; assuntos muito específicos ficam melhores no modo híbrido/código;
- modelos locais pequenos não têm a capacidade de agentes de fronteira. A qualidade aumenta muito em hardware forte;
- 4K de vários minutos é suportado como configuração, mas é computacionalmente caro porque cada quadro é realmente desenhado e capturado;
- o exportador headless depende do Chromium funcionar corretamente na máquina;
- nesta sessão de desenvolvimento, o Chromium headless do ambiente hospedado não concluiu o teste de render completo. O motor, a narrativa, o áudio e a sintaxe dos módulos foram testados separadamente.

## Testes

```powershell
node test.mjs
node tools-check.mjs
```

`test.mjs` valida o motor determinístico, timeline, fallback de narrativa e áudio WAV. `tools-check.mjs` mostra hardware, navegador, FFmpeg, encoder e estado da IA local.

## Relação com `procedural-film`

O projeto foi estudado como referência arquitetural. O repositório de referência usa um agente que pesquisa o assunto, cria art bible/storyboard, escreve uma cena JavaScript por plano, executa gates de determinismo/custo e sintetiza música em Web Audio. O QuadroJS Studio segue a mesma ideia geral de **filme como programa**, mas implementa um pipeline próprio voltado a usuário final e IA local.

O objetivo não é copiar o filme da borboleta nem depender do Claude: é transformar a técnica em um aplicativo desktop/local reutilizável.
