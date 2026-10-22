# Erros relevantes

| ID | Estado | Área/tarefa |
|---|---|---|
| [ERR-0001](ERR-0001-s01-toolchain.md) | Causas corrigidas; regressões60/60, tooling13/13 e mutação integral95,93%; limites no relatório S01 | Toolchain, descoberta OneDrive e fiscalização arquitetural, S01-T005/T006/T008 |
| [ERR-0002](ERR-0002-stryker-report-collision.md) | Resolvido: paths distintos, JSON/cache válidos, dry run152 e mutação97,21% | Cache/relatório Stryker concorrentes, S02-T005 |
| [ERR-0003](ERR-0003-source-permission-null.md) | Resolvido: migração corretiva e15 testes reais de constraints aprovados | JSON null/CHECK de permissões, S03-T006 |
| [ERR-0004](ERR-0004-nest-composition-exit.md) | Resolvido: propagação/guardas exit-abort e gate final aprovados | Bootstrap Nest/process termination, S03-T006 |
| [ERR-0005](ERR-0005-test-cleanup-isolation.md) | Recorrente no CI22/10: ciclo de locks/FK demonstrado; correção em validação, gate pendente | Isolamento da limpeza de teste/RuntimeError, S03-T006 e retoma S02 |
| [ERR-0006](ERR-0006-static-mutation-cache.md) | Resolvido: force/ensaio isolado e confirmação do escopo completo | Cache estático/reavaliação causal, S03-T006 |
| [ERR-0007](ERR-0007-github-actions-context.md) | Definição corrigida/actionlint PASS; execução remota a acompanhar | Contexto de expressões GitHub Actions/porta PostgreSQL, retoma S02/CI |
| [ERR-0008](ERR-0008-fresh-report-directory.md) | Harness cria reports; prova em diretório novo/CI a acompanhar | mkdtemp/clone limpo, bootstrap dos testes |
| [ERR-0009](ERR-0009-mutation-ci-runtime.md) | Limite90min/cache configurados, actionlint PASS; confirmação remota pendente | Mutação integral cancelada pelo limite40min do CI |
| [ERR-0010](ERR-0010-database-deadline-race.md) | RED2→GREEN2 e regressão3 PASS; gates integrais pendentes | Ligação/leitura do cliente e cancelamento SQL em corrida |
| [ERR-0011](ERR-0011-shutdown-observation.md) | Observação tardia reproduzida13/60, limitada a59,94ms; teste em validação | pg_stat_activity após fechamento do pool |
Usar [Error Report](../templates/error-report.md) e nomes `ERR-0001-descricao-curta.md`.

Antes de criar, pesquisar sintomas, módulo e causa nos registos existentes. Se for recorrência do mesmo erro, atualizar o registo e a cronologia em vez de duplicar.
Estados: aberto, resolvido ou recorrente. Uma solução só é confirmada com evidência e regressão aplicável.
Manter um índice de ID, título, estado, módulo e tarefa quando houver registos.
