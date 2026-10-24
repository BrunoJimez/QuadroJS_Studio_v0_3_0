# Arquitetura cinematográfica — QuadroJS Studio v0.3.0

## 1. Princípio

O filme não é uma lista de imagens. É uma função determinística de tempo, projeto e seed. A IA local decide intenção e estrutura; o runtime controla identidade visual, anatomia, continuidade e renderização.

## 2. Subject Contract

A primeira passagem interpreta somente o prompt atual e produz um contrato imutável durante a geração:

- protagonista primário;
- ação;
- ambiente;
- elementos obrigatórios;
- elementos proibidos/alienígenas ao assunto;
- tom e foco narrativo.

O contrato é acompanhado por `promptFingerprint`. Um plano sem a mesma assinatura é stale e não participa de preview/exportação.

## 3. Art Bible

O diretor cria uma bíblia de estilo única para o filme. Cenas não inventam individualmente novas paletas ou um novo desenho do protagonista. A mesma identidade atravessa todos os cortes.

## 4. Shot Grammar

Em vez de selecionar apenas “campo”, “floresta” ou “cidade”, o storyboard seleciona também a função cinematográfica do plano: estabelecer, acompanhar, revelar, ampliar, transformar, explicar, comprimir tempo, ligar duas formas ou fechar o loop.

Isso separa **onde a cena acontece** de **por que aquele plano existe**.

## 5. Continuidade

Cada tomada recebe um contrato de entrada/saída. O runtime pode interpolar posição, escala e direção do herói e manter elementos de match cut em coordenadas de tela. O corte deixa de ser uma reinicialização completa da composição.

## 6. Anatomia canônica

Personagens recorrentes são desenhados pelo runtime determinístico sempre que houver uma família anatômica conhecida. A IA não redesenha o personagem do zero em cada cena. Isso é deliberado: consistência supera criatividade local de um único plano.

Planos especiais podem receber JavaScript da IA após validação.

## 7. Modo Estúdio

O modo Estúdio executa:

1. subject analysis;
2. storyboard/director pass;
3. critic rewrite;
4. segunda crítica quando qualidade alta;
5. normalização e continuity pass;
6. seleção de planos especiais;
7. geração opcional de código autoral;
8. quality gates.

## 8. Quality Gates

Os gates atuais são estruturais/semânticos. Eles não afirmam beleza visual. A próxima camada desejável é um Visual Critic multimodal local: renderizar contact sheets, entregar os frames a um modelo de visão local e regenerar somente os planos abaixo do limiar.

## 9. Por que isso se aproxima do procedural-film

A principal lição do projeto de referência é que qualidade não nasce de “um prompt → um canvas”. Ela nasce de contratos fortes entre arte, storyboard, shot, tempo e revisão. A v0.3 aplica essa filosofia sem exigir um agente remoto ou API paga.
