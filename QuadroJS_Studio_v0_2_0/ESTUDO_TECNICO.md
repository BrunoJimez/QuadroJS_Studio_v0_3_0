# Estudo técnico — cinema procedural em JavaScript

## Material analisado

O vídeo de referência fornecido tem aproximadamente 27,12 s, 720×1280, 30 fps, 810 quadros, H.264 com áudio AAC. A versão enviada inclui a sobreposição editorial do perfil que republicou o conteúdo.

A sequência visual apresenta, entre outros elementos:

- inseto adulto construído por formas vetoriais, linhas finas e transparências;
- cenas “blueprint” em fundo escuro com pontos, grade e anotações geométricas;
- organismo/larva composto por segmentos deformáveis;
- texturas de tecido/células geradas por repetição de polígonos;
- macro de olho composto baseado em mosaico de células/hexágonos;
- materiais de papel, hachuras, pontilhado e ruído visual;
- movimentos contínuos obtidos por interpolação, senoides, curvas e parâmetros no tempo;
- cortes entre cenas radicalmente diferentes, mas coerentes pela paleta e pela linguagem gráfica.

## O que torna a técnica interessante

O arquivo visual não precisa armazenar um bitmap para cada quadro. Em vez disso, guarda regras. Uma cena pode ser descrita como uma função do tempo:

```js
function draw(ctx, t, frame, project, E) {
  // desenha o quadro correspondente a t
}
```

Com a mesma semente e os mesmos parâmetros, o quadro pode ser reconstruído. Isso torna a animação editável e reprodutível: trocar uma cor, uma curva de movimento ou um parâmetro e renderizar novamente produz uma nova versão sem regravar filmagem.

## Evidência pública consultada

Postagens indexadas de Kevin Ngo afirmam que cada quadro foi desenhado em JavaScript e registram a verificação de que o HTML não continha mídia embutida, apenas canvas e scripts. Fontes secundárias recentes descrevem abordagens derivadas com Canvas, Web Audio, exportação MP4 e ausência de assets de mídia.

Referências de consulta:

- Kevin Ngo / X (conteúdo indexado por espelhos de busca)
- Ryan Porter, “Procedural Film: Movies Drawn in Code”, Anthus, 2026-09-23
- projeto aberto `procedural-film`, GitHub, 2026

## Arquitetura adotada no QuadroJS Studio

O QuadroJS Studio separa quatro responsabilidades:

1. **Motor matemático** — easing, ruído, PRNG determinístico, interpolação e primitivas vetoriais.
2. **Cenas** — funções que desenham um quadro a partir de `t` e `seed`.
3. **Preview** — Canvas 2D interativo com timeline, scrubber e editor de script.
4. **Exportador** — Chromium headless desenha cada quadro em um tempo exato `t = frame / fps`; o quadro é capturado em memória e enviado ao FFmpeg por pipe para gerar H.264 MP4.

Não há necessidade de salvar milhares de PNGs temporários no disco.

## Limitações da versão 0.1.0

- O áudio procedural ainda não foi integrado ao exportador.
- A timeline pronta tem seis cenas demonstrativas; cenas arbitrárias podem ser feitas no modo Script.
- O editor ainda não possui nós visuais nem keyframes editáveis por mouse.
- Cenas muito complexas podem renderizar lentamente em 1080×1920/60 fps.

## Próximas extensões naturais

- Web Audio offline e mux de trilha sintetizada no MP4;
- sistema de layers, máscaras, câmera 2D e pós-processamento;
- editor de keyframes e curvas Bézier;
- múltiplos arquivos de cena com hot reload;
- renderização WebGL/WebGPU;
- biblioteca de estilos (riso, blueprint, gravura, anime, cyberpunk, CRT, PS1 etc.);
- agente de IA que recebe um roteiro e escreve automaticamente novas cenas JavaScript.
