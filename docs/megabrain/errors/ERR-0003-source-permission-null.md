# ERR-0003 — JSON null ultrapassava o CHECK de permissões

Data:2026-10-21. Módulo source-library, S03-T006. Estado: resolvido no PostgreSQL de teste, regressão real aprovada. Responsável: agente executor. PostgreSQL17.11/Prisma7.10.1; nenhum dado de desenvolvimento/produção alterado.

## Sintoma e causa confirmada

A matriz exige seis estados allowed/pending/denied. A primeira migração conferia presença das seis chaves e `permissions->>'operação' IN (...)`. PostgreSQL permite UNKNOWN num CHECK; JSON null produz SQL NULL em `->>`, tornando a expressão desconhecida em vez de falsa. Seis UPDATEs reais, um por operação, foram aceites indevidamente. Domain continuava a rejeitar null, mas não substitui proteção no banco.

## Correção e prova

A migração adicional `202610210002_source_permission_nulls` exige valor não nulo nas seis operações. Preserva a migração já aplicada e complementa os checks de tipo/chaves/estados. `rtk npm run db:migrate:test` confirmou alvo/identidade e aplicou a correção só em biblia_test.

Teste: [constraints.spec.ts](../../../backend/test/integration/source-library/constraints.spec.ts), executado antes e depois. `rtk npm run test:integration -- --testPathPatterns=source-library/constraints`: antes6 FAIL/9 PASS; depois os15 casos passaram na regressão completa `rtk npm run test:coverage` (377 testes). Artefactos ignorados: reports/s03-t006-constraints-before.log, -permission-migration.log, -coverage-01.log. Critério T006-AC01 e [plano](../../sprints/S03/tasks/S03-T006-integration.md).

## Lição

Presença de chave JSON não garante valor não nulo. Verificar estados nulos, ausentes, extras e desconhecidos com SQL real; não presumir que regras de domínio ou validação HTTP demonstram uma constraint SQL. Migração aplicada não é reescrita silenciosamente para corrigir esta falha.
