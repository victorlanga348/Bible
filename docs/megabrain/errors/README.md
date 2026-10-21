# Erros relevantes

| ID | Estado | Área/tarefa |
|---|---|---|
| [ERR-0001](ERR-0001-s01-toolchain.md) | Causas corrigidas; regressões60/60, tooling13/13 e mutação integral95,93%; limites no relatório S01 | Toolchain, descoberta OneDrive e fiscalização arquitetural, S01-T005/T006/T008 |
| [ERR-0002](ERR-0002-stryker-report-collision.md) | Resolvido: paths distintos, JSON/cache válidos, dry run152 e mutação97,21% | Cache/relatório Stryker concorrentes, S02-T005 |
| [ERR-0003](ERR-0003-source-permission-null.md) | Resolvido: migração corretiva e15 testes reais de constraints aprovados | JSON null/CHECK de permissões, S03-T006 |
| [ERR-0004](ERR-0004-nest-composition-exit.md) | Resolvido: propagação/guardas exit-abort e gate final aprovados | Bootstrap Nest/process termination, S03-T006 |
| [ERR-0005](ERR-0005-test-cleanup-isolation.md) | Resolvido: lock/teardown,439 regressões e gate final aprovados | Isolamento da limpeza de teste/RuntimeError, S03-T006 |
| [ERR-0006](ERR-0006-static-mutation-cache.md) | Resolvido: force/ensaio isolado e confirmação do escopo completo | Cache estático/reavaliação causal, S03-T006 |
Usar [Error Report](../templates/error-report.md) e nomes `ERR-0001-descricao-curta.md`.

Antes de criar, pesquisar sintomas, módulo e causa nos registos existentes. Se for recorrência do mesmo erro, atualizar o registo e a cronologia em vez de duplicar.
Estados: aberto, resolvido ou recorrente. Uma solução só é confirmada com evidência e regressão aplicável.
Manter um índice de ID, título, estado, módulo e tarefa quando houver registos.
