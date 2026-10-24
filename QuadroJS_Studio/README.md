# QuadroJS Studio v0.1.0

Estúdio local de **cinema procedural em JavaScript**. Cada quadro é desenhado em um `<canvas>` pelo próprio código. O projeto padrão não usa imagens, vídeos ou sprites.

## Requisitos

- Node.js 22+
- Google Chrome, Chromium ou Microsoft Edge
- FFmpeg com H.264 (`libx264`)

No Windows, o programa procura automaticamente Chrome/Edge e também `C:\ffmpeg\bin\ffmpeg.exe`. É possível definir manualmente:

```powershell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$env:FFMPEG_PATH = "C:\ffmpeg\bin\ffmpeg.exe"
```

## Executar

Windows: clique em `start.bat` ou execute:

```powershell
node server.mjs
```

A interface abre no navegador. Tudo fica restrito a `127.0.0.1` (computador local).

## Como funciona

1. O preview usa Canvas 2D e tempo contínuo.
2. Na exportação, um Chromium headless renderiza o quadro `n` usando `t = n / fps`.
3. Cada quadro é capturado como PNG em memória.
4. Os PNGs são enviados diretamente ao FFmpeg por pipe, sem precisar salvar milhares de arquivos temporários.
5. O FFmpeg cria MP4 H.264/YUV420p com `faststart`.

Como alternativa, a interface também oferece **Gravar WebM no navegador**, usando `canvas.captureStream()` + `MediaRecorder`. Esse modo não usa Chromium headless nem FFmpeg, mas grava em tempo real e pode sofrer com quadros perdidos em cenas pesadas.

Esse fluxo é **determinístico**: com a mesma semente, código, FPS e parâmetros, o desenho é reproduzido no mesmo instante de cada quadro.

## Modos

### Timeline pronta
Demonstra seis cenas procedurais: campo orgânico, blueprint, emergência, macro facetado, inseto adulto e par. É um exemplo de arquitetura; não depende de mídia externa.

### Script personalizado
O código da caixa de texto é executado a cada quadro com:

```js
ctx      // CanvasRenderingContext2D
t        // tempo em segundos
frame    // índice do quadro
project  // parâmetros do projeto
E        // API do motor procedural
```

Exemplo mínimo:

```js
const {width:w, height:h} = ctx.canvas;
E.clear(ctx, '#05070d');
E.ellipse(ctx, w/2 + Math.sin(t)*100, h/2, 40, 40, '#77e0d0');
```

## API útil

- `E.ellipse`, `E.line`, `E.poly`, `E.roundedRect`
- `E.hatch`, `E.halftone`, `E.drawPaper`
- `E.valueNoise`, `E.fbm`, `E.hash2`, `E.mulberry32`
- `E.drawHexField`, `E.drawCellField`, `E.drawLarva`, `E.drawWingedInsect`
- `E.palettes.riso`, `blueprint`, `nocturne`, `paper`
- easing: `E.smooth`, `E.smoother`, `E.easeInOut`, `E.pingpong`

## Observações de desempenho

Renderizar um MP4 quadro a quadro é propositalmente mais lento que gravar o preview em tempo real, mas evita quadros perdidos e torna o resultado reprodutível. Para testar uma ideia, use 360×640/24 fps e depois exporte a versão final em 720×1280 ou 1080×1920.

## Segurança

O modo Script executa JavaScript fornecido pelo usuário **dentro da página local de renderização**. Não cole código de terceiros que você não confia.
