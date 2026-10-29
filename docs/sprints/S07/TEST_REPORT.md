# S07 — Relatório de testes

## T005 — falha agregada preservada e regressões de mutação

CI40818184684:1957testes/89suites/83tooling e seis análises concluídas SUCCESS, mutation-gate FAIL por seis NoCoverage.5758mutantes brutos:3637Killed63Timeout492Survived1560CompileError6NoCoverage, zero RuntimeError; resultado diagnóstico, não score aprovado. Os seis estão em três caminhos de erro dos novos adapters (falha SQL Canon, falha SQL Source, span persistido incoerente), cada um com StringLiteral/ObjectLiteral não exercitados. ZIPs oficiais das seis partes baixados por MCP, SHA conferido, relatórios brutos/entradas intactos em reports/ci-40818184684-{0..5}-artifact; diagnóstico s07-initial-mutation-diagnostic.json. Nenhuma categoria/escopo/limiar foi alterada para aprovar.

Regressões acrescentadas conforme ficha antes de alterações: erros SQL reais com causa/contexto, span durável corrompido, permissão store revogada, mudança de locator/sourceId mantendo texto, limite exato1000bytes, erros HTTP400/401/404/422/503 e logging sem token/owner/rationale. Negativos de domínio agora isolam a regra correta (normalização consistente com metadados inválidos, cinco spans únicos, igualdade dos offsets, JSON null/arrays, UUID/SHA com prefixo/sufixo); recusa antes de I/O tem ports locais explícitos, sem se apresentar como integração. Primeiros80testes de regressão PASS; conjunto afetado atual136testes/7suites PASS61,671s. Recorte174/174linhas271/271statements46/46funções100%,137/139branches98,56%, em reports/s07-t005-mutation-coverage/coverage-summary.json; typecheck/lint e83tooling PASS10,384s. Estes são reforços de regras existentes, não RED retroativo nem nova prova de inferência.

`git diff --exit-code 3b95fc2 -- backend/src backend/prisma backend/admissions backend/package.json backend/package-lock.json` PASS: produto/DDL/perfil/pins iguais. Prova nativa e revisão semântica permanecem incorporáveis por digest ee8772c8…/fae54d99…, sem repetição. Workflow passa a baixar candidatos completos do run falhado fixo40818184684; metadata de revisão recente atualizada3b95fc2, mesmo seletor/threshold85/zero NoCoverage final. NoCoverage é invalidado somente na entrada de cache e deve ser exercitado pelo Stryker atual. Novo gate integral ainda NOT_RUN; T005 continua IN_PROGRESS.

## T005 — prova nativa e CI em curso

Fonte3b95fc22843b232aa41ea136ae2d56507ffacd01 publicada. CI40818184684 foundation SUCCESS:1957testes89suites/83tooling,100%linhas97,70%branches, estática/build; mutação corrente ainda em curso, sem score aprovado do código novo.

Migração dev8aplicada com Prisma exit0/finished/checksum6d445ed2… e backup custom1417675bytes/SHA030c7d79…/pg_restore--list válidos. Wrapper original s07-relations-native-migrate-5db8d508… ficou BLOCKED porque o snapshot SQL de canon_verse excedeu2s, confirmado no log PG16às04:32:16Z. Original preservado, sem mudança de prazo da aplicação/IA. Auditoria independente `node reports/s07-native-migration-preservation-audit.cjs` PASS: oito migrações concluídas/checksum correto, hashes de todos os dados anteriores idênticos aos posteriores à prova HTTP; nova cross_reference vazia. [Causa/recuperação](../../megabrain/errors/ERR-0023-native-snapshot-timeout.md).

`node reports/s07-native-relations.cjs verify` REVIEW, raw s07-cross-reference-local-dKzt9O/report.json SHAee8772c8db9aa7e85d0a1bd6434f1799862d14e12883b0ea503aefe12868925e; prova wrapperc6b98cf9… confirma todos os hashes preservados/zero relações próprias após DELETE. Estudo14/15versões, cânone/fontes/AI/conversas intactos; nenhum fixture importado/modelo chamado. Relação GEN2:7→GEN2:22, dois spans reais de Josefo0..220/584..934, GET dos dois extremos/owner404/DELETE/quotes exatas PASS. Revisão semântica separada comparou também os versículos BLIVRE reais, classificação temática pessoal/limites explícitos; resultado PASS, digest separado registado no fecho posterior. Raw continua REVIEW original. T005 continua IN_PROGRESS pelos gates de mutação/revisão atuais pendentes; T006 dependente.

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
