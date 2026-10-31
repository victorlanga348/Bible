# ERR-0028 — Citação longa escondia o botão de fechar

Confirmado2026-10-31/S10-T003. SourcesView/primitive Dialog. Browser preview real, catálogo e citações autênticos de PG2848.

Sintoma: abrir o primeiro parágrafo longo fazia o diálogo centrado exceder a altura disponível; o botão Fechar ficava fora do viewport em desktop e mobile. RED2FAIL antes da correção, incluindo timeout15s com outside viewport. Não era problema de SQL/dados/harness.

Causa: conteúdo do Dialog não tinha altura máxima nem scroll interno; o hash extenso também precisava de quebra na largura pequena. Correção mínima: max-height calc(100dvh - 2rem), overflow-y-auto no conteúdo comum, break-all no hash da fonte. Texto/direitos/hash não alterados.

GREEN2PASS/1,1min no preview real, desktop6,1s/mobile7,0s: abertura, citação/hash/direitos, bounds dentro do viewport, fechar, filtro vazio e retorno. Capturas revistas. Log s10-t003-source-dialog-green.log; global265testes/cobertura e lint PASS. Mutação atual continua gate separado.

Lição: testar textos autênticos longos e ambos os viewports; montagem jsdom não comprova acesso aos controlos na geometria real.
