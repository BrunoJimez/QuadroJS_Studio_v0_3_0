# QuadroJS Studio v0.3.0 — Cinema Director

Aplicativo local para transformar uma frase em um **filme procedural desenhado por JavaScript Canvas**, com direção narrativa por IA local, continuidade entre planos, áudio opcional e exportação MP4 para YouTube, Instagram e TikTok.

Exemplo:

> Lobos correndo em um campo aberto

Na v0.3 o prompt deixa de ser apenas uma sugestão visual. Ele passa a gerar um **contrato de assunto** que acompanha o filme inteiro. O sistema identifica protagonista, ação, ambiente, elementos obrigatórios, bíblia visual, tipos de plano, câmeras, continuidade e timeline. Um storyboard de outro prompt é considerado inválido e não pode ser exportado.

## Principais mudanças da v0.3

### Correção do bug de contexto persistente

A v0.2 podia exibir elementos do filme anterior por três motivos: entidades específicas podiam ser filtradas, alguns cenários tinham animais implícitos e o preview antigo permanecia válido enquanto o prompt mudava.

A v0.3 corrige os três níveis:

- assinatura (`promptFingerprint`) em cada filme;
- contrato de assunto criado novamente a cada geração;
- limpeza explícita de storyboard/código/relatório anteriores antes da IA trabalhar;
- edição do prompt invalida imediatamente o preview anterior;
- exportação recusa storyboard cuja assinatura não corresponde ao prompt atual;
- ambientes não inventam mais espécies: um campo não cria abelhas, uma floresta não cria pássaros etc.;
- vocabulário de entidades ampliado, incluindo lobo, raposa, cão, felinos, cavalo, cervo, urso, coelho, aves, peixes, humanos, robôs e outros.

### Cinema Director

O modo **Estúdio** passa por uma cadeia inspirada em pipelines profissionais de animação procedural:

```text
prompt
  ↓
Subject Contract
  ↓
Visual Art Bible
  ↓
Cinematic Storyboard
  ↓
Continuity Contract
  ↓
Procedural Scene Engine
  ↓
Hero/Special Shot Code (quando necessário)
  ↓
Quality Gates
  ↓
preview / áudio / exportação
```

O storyboard agora trabalha com tipos de plano, entre eles: abertura no herói, establishing, tracking, macro de textura, blueprint, transformação de silhueta, passagem de tempo, pull-back, população/coluna, snap zoom, match cut, montagem e closing loop.

### Continuidade

Cada plano pode transportar para o seguinte:

- posição do protagonista;
- direção/facing;
- escala;
- ação;
- enquadramento;
- geometria para match cuts;
- progressão narrativa.

Transições `dissolve` são compostas a partir dos dois frames, em vez de apenas trocar o cenário. O protagonista é desenhado em cadência semelhante a animação “on twos”, enquanto a câmera pode permanecer suave.

### Anatomia procedural

A v0.3 não reduz todos os animais ao mesmo símbolo. O runtime contém famílias procedurais próprias para:

- canídeos — lobo, raposa e cão;
- felinos — gato, tigre e leão;
- ungulados — cavalo, cervo, vaca, ovelha e cabra;
- urso;
- coelho;
- abelhas/insetos;
- borboletas;
- aves;
- peixes/cetáceos;
- humano;
- robô;
- fallback genérico.

O lobo, por exemplo, possui tronco, cabeça, focinho, orelhas, cauda, pernas articuladas, ciclo de corrida, hachuras de pelo, sombra e variação determinística por seed.

### Art Bible

O plano guarda uma bíblia visual com:

- estilo;
- paleta;
- linguagem de linha;
- textura;
- iluminação;
- gramática de câmera;
- desenho canônico do herói;
- desenho do ambiente;
- regras de continuidade.

Isso reduz a sensação de “vários vídeos diferentes colados” e mantém identidade visual ao longo do filme.

## IA local

A IA continua 100% local e sem API paga. O backend principal é Ollama, com suporte também a servidor llama.cpp. Se nenhum backend responder, existe um planejador procedural de emergência — agora também sujeito ao contrato do prompt, portanto sem reutilizar espécies anteriores.

O recomendador automático de modelo permanece baseado em RAM/VRAM. O programa não baixa modelos grandes sem confirmação.

## Modos de geração

- **Estúdio — recomendado**: direção, crítica do storyboard, continuidade e código especial apenas para planos em que ele agrega valor.
- **Híbrido**: IA planeja tudo e escreve algumas cenas-chave.
- **Rápido / DSL**: IA gera o plano; o runtime interno desenha as cenas.
- **Código total — experimental**: tenta gerar JavaScript específico para todos os planos.

Para personagens recorrentes, Estúdio prefere a anatomia procedural canônica. Isso evita que um modelo pequeno redesenhe o lobo de maneira diferente a cada corte.

## Quality Gates

Antes de marcar o filme como pronto, o sistema audita:

- assinatura do prompt atual;
- presença da art bible;
- continuidade do herói;
- variedade de tipos de plano;
- variedade de câmera;
- duração exata;
- presença indevida de outra espécie como protagonista.

O painel exibe o resultado dessa auditoria no storyboard.

## Exportação

Presets disponíveis:

- YouTube 720p — 1280×720;
- YouTube 1080p — 1920×1080;
- YouTube 2K/QHD — 2560×1440;
- YouTube 4K/UHD — 3840×2160;
- YouTube Shorts — 1080×1920;
- Instagram Reels — 1080×1920;
- Instagram quadrado — 1080×1080;
- TikTok — 1080×1920;
- resolução personalizada.

FPS: 24, 30 ou 60. O exportador usa `h264_nvenc` quando GPU NVIDIA + encoder FFmpeg estão realmente disponíveis; caso contrário usa `libx264`.

## Áudio

Mantém os três fluxos:

1. trilha procedural local a 48 kHz estéreo;
2. música/áudio fornecido pelo usuário;
3. filme mudo.

Os SFX procedurais também passaram a respeitar estritamente o assunto da cena. Um filme de lobos não recebe automaticamente zumbido de abelha.

## Windows — instalação

Primeira instalação:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup_windows.ps1
```

ou execute `install_windows.bat`.

Depois:

```bat
start.bat
```

O servidor fica em `127.0.0.1` e abre a interface local.

## Testes

```powershell
node test.mjs
node tools-check.mjs
```

A regressão principal desta versão cria primeiro um filme de abelhas e depois um filme de **lobos correndo em um campo aberto**. O segundo precisa conter `wolf`, conter zero `bee`, fechar exatamente a duração e invalidar qualquer plano com assinatura antiga.

## Relação com `kuhnhomeuk-cell/procedural-film`

O repositório foi usado como referência arquitetural, não copiado como produto. A análise mostrou que sua qualidade vem menos de um único efeito visual e mais do processo: art bible, shot grammar, arquivos densos por tomada, continuidade geométrica, determinismo, contact sheets, gates e ondas de crítica.

A v0.3 traz esses princípios para uma aplicação de usuário final e IA local. Ela é um avanço grande sobre a v0.2, mas **não é apresentada como paridade visual total** com o filme de referência. Chegar àquela densidade em todos os assuntos exigirá ampliar continuamente a biblioteca anatômica, o catálogo de planos e, principalmente, adicionar crítica visual multimodal frame a frame.

Leia também `ARQUITETURA_CINEMATOGRAFICA.md` e `VALIDACAO.md`.
