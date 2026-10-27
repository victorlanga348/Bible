# Erros relevantes

| ID | Estado | Área/tarefa |
|---|---|---|
| [ERR-0018](ERR-0018-profile-package-isolation.md) | Resolvido: CI40444290178 integral PASS,1038 testes e mutação91,33%, fontes/digests auditados | Perfil normativo e sandbox Stryker, S05-T005 |
| [ERR-0017](ERR-0017-protocol-fixture-newlines.md) | Resolvido: cópias LF com hashes bruto/normalizado distintos, JSON idêntico e auditoria/testes PASS | Reprodutibilidade de fixtures de protocolo Python/Windows/Git, S05-T005 |
| [ERR-0016](ERR-0016-windows-runtime-trust.md) | WinError4551/NotSigned confirmado; distribuição oficial assinada em investigação, sem alterar proteção | Runtime local, S05-T004 |
| [ERR-0015](ERR-0015-postgresql-url-routing.md) | Resolvido:76 dirigidos/907 regressões e CI40338249693/mutação corrigida verificadas, S04 encerrada | Identidade URL/opções de routing PostgreSQL, S04-T006 |
| [ERR-0014](ERR-0014-local-coverage-heap.md) | Regressão integral resolvida com limite768MB:830/45 suites PASS; tentativa512MB OOM preservada | Heap local Node/Jest, S04-T006 |
| [ERR-0001](ERR-0001-s01-toolchain.md) | Causas corrigidas; regressões60/60, tooling13/13 e mutação integral95,93%; limites no relatório S01 | Toolchain, descoberta OneDrive e fiscalização arquitetural, S01-T005/T006/T008 |
| [ERR-0002](ERR-0002-stryker-report-collision.md) | Resolvido: paths distintos, JSON/cache válidos, dry run152 e mutação97,21% | Cache/relatório Stryker concorrentes, S02-T005 |
| [ERR-0003](ERR-0003-source-permission-null.md) | Resolvido: migração corretiva e15 testes reais de constraints aprovados | JSON null/CHECK de permissões, S03-T006 |
| [ERR-0004](ERR-0004-nest-composition-exit.md) | Resolvido: propagação/guardas exit-abort e gate final aprovados | Bootstrap Nest/process termination, S03-T006 |
| [ERR-0005](ERR-0005-test-cleanup-isolation.md) | Resolvido: locks/teardown/coordenador e551 regressões; mutação local95,87%/CI95,41% sem RuntimeError | Isolamento da limpeza de teste/RuntimeError, S03-T006 e retoma S02 |
| [ERR-0006](ERR-0006-static-mutation-cache.md) | Resolvido: force/ensaio isolado e confirmação do escopo completo | Cache estático/reavaliação causal, S03-T006 |
| [ERR-0007](ERR-0007-github-actions-context.md) | Resolvido/actionlint e CI39778403173 completa PASS | Contexto de expressões GitHub Actions/porta PostgreSQL, retoma S02/CI |
| [ERR-0008](ERR-0008-fresh-report-directory.md) | Resolvido: diretório novo e CI completa PASS | mkdtemp/clone limpo, bootstrap dos testes |
| [ERR-0009](ERR-0009-mutation-ci-runtime.md) | Resolvido: CI integral72min9s dentro90min e cache guardado após PASS | Mutação integral cancelada pelo limite40min do CI |
| [ERR-0010](ERR-0010-database-deadline-race.md) | Resolvido: proxy RED/GREEN/regressão3 e551 testes/gates completos PASS | Ligação/leitura do cliente e cancelamento SQL em corrida |
| [ERR-0011](ERR-0011-shutdown-observation.md) | Resolvido: observação limitada,551 testes e retake equivalente Survived preservado no gate global | pg_stat_activity após fechamento do pool |
| [ERR-0012](ERR-0012-inherited-availability.md) | Resolvido:667 regressões e mutação própria88,98% PASS | Propriedade herdada no mapa de direitos de study, S04-T005 |
| [ERR-0013](ERR-0013-jest-global-deadline.md) | Configuração corrigida/17 tooling PASS; latência SQL distinta preservada sem causa atribuída | testTimeout global de Jest, S04-T006 |
Usar [Error Report](../templates/error-report.md) e nomes `ERR-0001-descricao-curta.md`.

Antes de criar, pesquisar sintomas, módulo e causa nos registos existentes. Se for recorrência do mesmo erro, atualizar o registo e a cronologia em vez de duplicar.
Estados: aberto, resolvido ou recorrente. Uma solução só é confirmada com evidência e regressão aplicável.
Manter um índice de ID, título, estado, módulo e tarefa quando houver registos.
