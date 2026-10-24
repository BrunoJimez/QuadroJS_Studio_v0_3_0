# Changelog

## 0.3.0 — Cinema Director

### Correções críticas
- Corrigido vazamento de tema entre gerações (ex.: lobos recebendo abelhas do filme anterior).
- `promptFingerprint` vincula storyboard ao prompt que o criou.
- Trocar o texto do prompt invalida imediatamente plano, código de cenas e relatório anteriores.
- O servidor limpa explicitamente o estado cinematográfico antes de iniciar uma nova geração.
- A exportação recusa storyboard de outro prompt.
- Removidos animais implícitos dos cenários genéricos.
- Vocabulário expandido para lobos e outras famílias de animais.

### Direção cinematográfica
- Novo Subject Contract antes do storyboard.
- Art Bible gerada por filme.
- Novo catálogo de shot types cinematográficos.
- Contrato de continuidade por posição, facing, escala e ação.
- Gates de assunto, art bible, continuidade, variedade e duração.
- Modo Estúdio como padrão, com passagens de direção/crítica.
- Código autoral da IA priorizado para planos especiais em vez de redesenhar arbitrariamente o herói em todos os cortes.

### Render procedural
- Novo `runtime/subjects.js` com anatomias procedurais por família.
- Canídeos com ciclo de corrida articulado e hachuras de pelo.
- Câmeras tracking, push, pull, pan, tilt, orbit, handheld, crane e snap-zoom.
- Movimento de personagens em cadência “on twos”.
- Dissolve verdadeiro por composição de dois frames.
- Suporte a macro, population column, montage, match cut e continuidade de herói.
- Ambientes mais densos em camadas, sem introduzir espécies não pedidas.

### Áudio
- SFX agora dependem somente das entidades/ambiente atuais.
- Passos e acentos para canídeos/ungulados; vento e água orientados pelo cenário.

### Interface/diagnóstico
- LocalStorage isolado para v0.3.
- Storyboard mostra subject contract, art bible, shot type, câmera e quality gates.
- Diagnóstico exibe modelos de visão detectados quando disponíveis.

## 0.2.0 — Local AI Director
- Prompt → storyboard com Ollama/llama.cpp e fallback.
- Perfil de hardware e recomendação adaptativa de modelo.
- Export presets, áudio procedural, upload de áudio, mudo e NVENC/libx264.

## 0.1.0
- Canvas 2D procedural determinístico.
- Preview e timeline.
- Script personalizado.
- Exportação Chromium + FFmpeg.
