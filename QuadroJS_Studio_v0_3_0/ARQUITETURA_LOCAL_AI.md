# Arquitetura — Prompt → Filme Procedural Local

## 1. O que foi observado no projeto `procedural-film`

O repositório de referência organiza a produção como um pipeline de agente: brief, setup, pesquisa, art bible, storyboard, timeline, stub pass, cenas independentes, música, ondas de crítica, gate e render. O runtime mantém o frame determinístico: a cena é função do tempo e não deve carregar estado imprevisível entre quadros. O projeto também possui checagens para aleatoriedade, timeline, custo, safe area e mídia externa.

Esse desenho é forte, mas pressupõe um agente muito capaz e um grande volume de geração de código. Para um aplicativo local em hardware de consumidor, o QuadroJS adota uma versão híbrida.

## 2. Pipeline QuadroJS

### Hardware Profiler

Detecta CPU, RAM, GPU/VRAM, Node, FFmpeg, navegador, Ollama e llama.cpp. Recomenda um modelo adequado.

### Narrative Director

Recebe a frase e a duração. Produz JSON estrito com título, logline, atos, BPM, tonalidade, paleta e lista de planos. A duração dos planos é renormalizada matematicamente para fechar exatamente o tempo solicitado.

### Procedural Scene Grammar

O storyboard usa uma taxonomia limitada de `kind` e `entities`. Isso permite que um modelo pequeno gere direção criativa sem precisar escrever centenas de linhas de JS para cada plano.

### Hero Scene Coder

No modo híbrido, planos marcados como `hero` podem receber código JavaScript específico escrito pelo modelo local. O código passa por regras de segurança/determinismo e, se falhar, o runtime volta automaticamente à gramática DSL.

### Audio Director

O plano define BPM, tonalidade, energia e SFX. Um sintetizador local gera a trilha sem arquivos externos. O usuário também pode fornecer um áudio ou escolher silêncio.

### Renderer

Cada frame usa `t = frame / fps`. O Chromium desenha o Canvas e o FFmpeg codifica. A mesma seed + projeto + versão do motor reproduzem o mesmo filme.

## 3. Por que o modelo híbrido é melhor para filmes de 2–3 minutos

Um filme de 30 s no repositório de referência possui dezenas de planos curtos. Escalar a mesma densidade para 3 min pode exigir dezenas de arquivos grandes gerados por agente. Um modelo local de 4B/9B consegue planejar a narrativa, mas gerar e revisar dezenas de cenas de 1000+ linhas é caro e frágil.

A gramática procedural reduz esse custo: o modelo escolhe composição, movimento, entidades, câmera e ritmo; o motor executa padrões já testados. A geração de código fica reservada aos planos onde realmente acrescenta qualidade.

## 4. Evolução sugerida

1. v0.2 — IA local + storyboard + DSL + hero-code + áudio procedural.
2. v0.3 — critic agent local, contact sheets e reparo automático de cenas.
3. v0.4 — WebGL/WebGPU, layers, blur, partículas GPU e câmera 2.5D.
4. v0.5 — integração opcional ACE-Step para trilhas neurais e TTS local.
5. v0.6 — empacotamento desktop assinado e gerenciador de modelos/componentes.
6. v1.0 — agente multiestágio local com pesquisa opcional, art bible, consistency bible e render distribuído.
