# S07 — Relatório de testes

## T005 — checkpoint de relações2026-10-29

Domínio: RED47FAIL por Not implemented, GREEN47PASS2,183s. Janela/cursor de transporte: RED3FAIL→GREEN3PASS1,458s. Schema:17falhas por tabela inexistente são verificação de configuração, não RED de negócio; migração8aditiva202610290001_cross_reference aplicada somente em biblia_test após guard/identidade,17constraints PASS2,827s. Repositório real: RED13FAIL→GREEN13PASS2,934s; metadados/owner/paginação/overlap/DELETE/incoerência/erro SQL real. Application com CanonLibrary/SourceLibrary/Prisma reais e clock técnico explícito: primeira execução falhou por nome errado de helper, preservada como application-setup-failure e não contada como RED; corrigido import, RED18FAIL por métodos não implementados→GREEN18PASS7,013s. HTTP: RED19FAIL por rotas ausentes→GREEN19PASS22,365s, Nest/JWT/Supertest/SQL reais, contratos/owner404/400/422/503/OpenAPI e fontes revogadas.

Recorte de cobertura dos seis ficheiros/suites afetados: `npm run test -- --runTestsByPath ... --coverage --collectCoverageFrom=src/modules/cross-references/**/*.ts --collectCoverageFrom=src/presentation/pagination.ts --coverageDirectory=reports/s07-t005-coverage`,117testes/6suites PASS24,481s,174/174linhas100%,134/139branches96,40% do recorte; relatório em reports/s07-t005-coverage. Não é cobertura global atual. `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:architecture`9PASS, `npm run test:tooling`83PASS7,972s. Logs s07-t005-{domain-red,domain-green,pagination-red,pagination-green,schema-before,schema-after,generate,migrate-test,store-red,store-green,application-setup-failure,application-red,application-green,http-red,http-green,final-typecheck,lint,architecture,build,tooling,coverage}.log ignorados/preservados. Tentativa inicial de shell fora de backend recusou criação do log antes de teste; não é RED nem chamada de produto.

Seed completo de mutação4a34ddb/CI40695319164 promovido por digest verificado fdc6e0d3…;20lock/config/helpers antigos idênticos, hashFilesbaselinec742… reproduzido, nova fixture técnica compartilhada somente pelos testes novos resulta21ficheiros/c6075e2d…. Bridge somente para fingerprint conhecido; Stryker/agregado atual revalidam tudo. Candidatos antigos743 não são transferidos. Comando/script/algoritmo/limiares/escopo mantidos; tooling atual passou. CI/cobertura/mutação completas do código novo ainda NOT_RUN; não herdar score S06 como resultado desta funcionalidade nova.

Antes da prova nativa: congelada curadoria real GEN2:7→GEN2:22, anotação temática pessoal e p2-s1/p2-s4 do original admitido, spans0..220/584..934. Sem modelo/IA neste comportamento. Migração dev exige backup externo/pg_restore--list e snapshots de preservação; nenhum corpus/estudo/fonte/segredo pode ser alterado. Prova deve guardar raw antes de validar/DELETE e confirmar ambos extremos/owner/quotes/ausência final de relação própria. Prova nativa e integração dev ainda NOT_RUN; T005 IN_PROGRESS e T006 dependente.

T004 auditoria documental real PASS2026-10-29T04:01:36.848Z: `node backend/reports/check-completion-docs.cjs`,13Markdown70links, zero missing/secretHits/whitespace/prohibited/staged. Gates1/7 PASS;2–6 não aplicáveis a documentação pura. T004 DONE técnico delegado; T005 READY para plano próprio/TDD. Nenhum código de produto S07 entregue nesta preparação.

## T004 — preparação documental2026-10-29

S06 encerrada48be2f0. SPEC/ADR-0007/contratos/modelo/SH-001/regras e ficha concretizados por delegação antes de código; uma tarefa por vez. Gates1/7 exigem autorização/dependências e auditoria real de links/segredos/UTF-8/whitespace. Gates2–6 não aplicáveis à preparação documental pura, sem métricas de produto presumidas. TDD de comportamento e testes PG/HTTP/IA/mutação são das próximas tarefas e permanecem NOT_RUN. Plano inclui vantagens/alternativas/riscos, guards curtos/retomada de eliminação e critérios reais.

STATUS: NOT_RUN. Sprint não iniciada; este é o registo de prontidão documental, não um relatório de testes executados.
BRANCH: feat/biblia-backend. COMMIT: PENDING. Aprovações de execução/encerramento pendentes.

| Verificação | Estado | Evidência/limitação |
|---|---|---|
| Unitários | NOT_RUN | Implementação/suite inexistentes |
| Integração real | NOT_RUN | Ambiente e contratos a aprovar |
| E2E HTTP | NOT_RUN | Sem aplicação da sprint |
| TypeScript/ESLint/build | NOT_RUN | Scripts reais ainda inexistentes |
| Cobertura linhas/branches | NOT_RUN | Não medida; mínimos >=90% / >=85% |
| Mutation Score | NOT_RUN | Não medido; obrigatório >85% no escopo aplicável |
| Arquitetura/migrações/segredos | NOT_RUN | Verificar diff/código/ambiente da sprint |
| Avaliações de IA | NOT_RUN | Corpus/rubrica/fornecedor conforme aplicabilidade |

Critérios: todos NOT_RUN em [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md). Comandos e artefactos de aplicação: nenhum executado. RED/GREEN/REFACTOR: sem evidência; comportamento não implementado.
Quando iniciada, registar data/ambiente/revisão, comandos reais, resultados, cobertura/contagens de mutação/sobreviventes, falhas/regressões, pendências e riscos por critério. Não substituir esta ausência por PASS.
Dependências e ações: [PLAN](PLAN.md), [TASKS](TASKS.md), [ações externas](../../external-actions/REQUIRED_ACTIONS.md). Caso o serviço obrigatório continue indisponível na execução, marcar o respetivo teste/gate BLOCKED e pedir intervenção.
