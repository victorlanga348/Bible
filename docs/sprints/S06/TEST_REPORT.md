# S06 — Relatório de testes

## T005 — domínio/contexto, checkpoint2026-10-28

T004 publicada d7c93d1. RED `npm run test:unit -- --runTestsByPath test/unit/ai-assistant/conversation.spec.ts`:48falhas por construtor sem validação/imutabilidade e métodos não implementados, sem erro de sintaxe/ambiente. GREEN49/49após implementação e fronteira hexadecimal/owner128/versão safe. Primeiro GREEN47PASS1FAIL era asserção a um acento existente também no cabeçalho; falha preservada e asserção ajustada à ausência da linha anterior. Não houve alteração funcional para mascarar falha.

Cobertura afetada `npm run test:unit -- --runTestsByPath test/unit/ai-assistant/conversation.spec.ts --coverage --collectCoverageFrom=src/modules/ai-assistant/domain/conversation.ts --coverageDirectory=reports/s06-t005-coverage`:49PASS6,252s,44/44linhas41/41branches71/71statements18/18functions100%. É recorte próprio novo, não cobertura global. `npm run typecheck`, `npm run lint`, `npm run test:architecture`9/9 PASS; lint inicial detetou variável de fixture não usada, removida sem alterar comportamento. Logs reports/s06-t005-{conversation-red,conversation-green,conversation-green-final,coverage,typecheck,lint,lint-final,architecture}.log preservados.

Domain puro, sem banco/modelo/HTTP nesta tarefa; integração/IA são não aplicáveis aqui, não PASS de S06. Nenhuma dependência/src anterior/modelo/prompt/dados alterados. CI integral e mutação da fonte nova ainda NOT_RUN; T005 IN_PROGRESS, T006 dependente. Não herdar score S05 como gate do domínio novo. Auditoria documental antes de commit de checkpoint autorizado.

T004 documental2026-10-28: S05 encerrada1b19623; SPEC/FQ-001/SH-001/modelo/contratos/rubrica concretizados antes de código sob delegação. Nenhuma dependência/serviço/modelo novo. TDD/estática/integração/mutação/IA não aplicáveis a esta preparação sem produto, não PASS fictício. Auditoria documental antes do commit; código/testes T005–T007 NOT_RUN.

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

T004 auditoria real PASS2026-10-28T09:38:24.767Z: `node backend/reports/check-completion-docs.cjs`,15Markdown/68links,zero missing/secretHits/whitespace/prohibited/staged. Gate1 PASS autorização/dependências/contratos; Gate7 PASS conferência documental. Gates2–6 não aplicáveis a esta preparação documental pura, não são PASS de produto. Commit documental precede T005.
