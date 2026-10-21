# ERR-0005 — Limpeza de testes sem serialização com escritas em curso

Data:2026-10-21. Harness source-library, S03-T006. Estado: resolvido, isolamento/teardown e regressão439/gate final aprovados. Responsável: agente executor. Prisma7.10.1/PostgreSQL17.11/Jest30/Stryker10, somente alvo biblia_test confirmado.

## Observações e causa demonstrada

A primeira mutação terminou com13 RuntimeError: dois workers encerrados pelo Nest (ERR-0004), cinco erros de teardown por recursos não inicializados após beforeAll falhar, seis erros FK ao apagar fontes no teardown. Estes estados fizeram o gate estrito falhar;95,53% textual não foi aceite como PASS.

O cleanup anterior apagava excertos/fontes numa transação em array, sem serializar com um writer ainda em curso. Experiência real independente confirmou a lacuna: um segundo cliente insere uma fonte sem commit, a limpeza termina sem esperar, depois o writer confirma os excertos. O teste esperava bloqueio observado/zero linhas e falhou antes da correção. Isso demonstra ausência de isolamento da limpeza face ao writer; não prova um defeito interno do Prisma nem a sequência exata de cada FK no primeiro relatório. Não atribuir essa causa mais específica sem trace de statements.

## Correção e regressão

`cleanSourceTestData` usa transação interativa, lock EXCLUSIVE de ambas as tabelas próprias (pai antes de filho) e DELETEs sequenciais aguardados. Escritas já em curso terminam antes da limpeza; outras aguardam a transação. Não há TRUNCATE/CASCADE sobre outros módulos, limpeza de desenvolvimento, volume apagado ou fixture removida.

[cleanup.spec.ts](../../../backend/test/integration/source-library/cleanup.spec.ts): um caso real RED→GREEN com dois clientes/pg_stat_activity, logs reports/s03-t006-cleanup-before.log/-after.log. O cliente writer fecha em finally; falha inicial do writer também desbloqueia a espera. Guard/identidade reais precedem escrita.

Teardowns S03 verificam se Database/app chegaram a ser criados antes de fechar/limpar. Isso evita uma segunda exceção por undefined ocultar o erro original de setup; falhas de setup/teste/cleanup reais continuam a falhar, sem catch silencioso. Regressão `rtk npm run test:coverage`:438 PASS,20 suites, linhas100%/branches97,07%. Reavaliação Stryker usa a ferramenta/cache originais, sem editar estados ou excluir código.

## Prevenção

Uma suite destrutiva de cada vez no banco partilhado; concorrência apenas nos casos explicitamente controlados. Não pressupor que DELETE filho/pai dentro de transação espera por um writer invisível ainda não confirmado. Um gate de mutação rejeitado por RuntimeError exige corrigir o harness e repetir a prova, sem converter o erro em Killed manualmente.

Validação final:439 testes normais PASS; execução incremental sem argumentos voltou ao padrão completo src/**/*.ts,639 mutantes,435/439=99,08883826879271%, zero RuntimeError/NoCoverage e fontes correspondentes. Relatório/cache separados e válidos; evidência canónica no TEST_REPORT S03. O ensaio misto ambíguo não foi contado como deteção do optional chaining: repetição isolada real produziu Survived, preservado no denominador.
