# QuadroJS Studio v0.3.0 — validação

## Regressão do bug relatado

O teste automatizado executa dois assuntos distintos em sequência e verifica isolamento semântico. No caso crítico:

- prompt: `Lobos correndo em um campo aberto`;
- subject primary: `wolf`;
- existem entidades `wolf` no storyboard;
- não existe nenhuma entidade `bee`;
- a timeline fecha exatamente a duração solicitada;
- um plano cuja `promptFingerprint` pertence a outro prompt não é aceito pelo preview.

O backend também foi exercitado pela API com esse prompt. Sem Ollama disponível neste ambiente, o fallback gerou seis planos, manteve `wolf` como herói, zero abelhas e aprovou os gates de prompt, art bible, continuidade, variedade e duração.

## Testes executados

- `node --check` em todos os arquivos `.js` e `.mjs`;
- `node test.mjs`;
- inicialização real do servidor;
- `/api/status`;
- geração real via `/api/generate`;
- áudio WAV procedural;
- validação de stale plan/prompt.

## Limitação do ambiente de desenvolvimento

O Chromium headless deste ambiente hospedado não conclui a inicialização necessária nem para uma página mínima, reproduzindo a limitação observada durante o desenvolvimento da v0.2. Por isso o MP4 completo não foi revalidado aqui de ponta a ponta.

O caminho de exportação Chromium + FFmpeg foi preservado e endurecido com a checagem de prompt. Como a v0.2 já foi confirmada pelo usuário como funcional em seu Windows, a validação prática recomendada da v0.3 é inicialmente um clipe curto em 720p e depois os presets maiores.

## Comando

```powershell
node test.mjs
node tools-check.mjs
```
