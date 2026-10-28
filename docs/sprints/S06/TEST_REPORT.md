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

### T005 — evitar recomputação por rebalanceamento

Inventário real209mutantes novos deslocou63ficheiros/2657mutantes anteriores entre caches de partes. CI40666810452/7ac3538 foundation PASS1755testes79suites/70tooling/100%linhas97,82%branches; mutação ainda em curso, sem score aceite. Melhoria decidida antes de código na ficha T005: seed inteiro fixo do relatório completo61a9429/CI40660972664, ZIP oficial pinado por run/name e SHA do mutation.json verificado antes de uso. Seletor compara fontes/assinaturas/estados válidos e usa o relatório inteiro com maior cobertura da parte, local em empate; nunca combina IDs nem altera estados. Guarda cache substituído/digests/ledger. Stryker10 instalado confrontado: incremental-differ.js identifica casos por arquivo/nome/posição/conteúdo, não id administrativo; valida mudanças e testes novos normalmente. Gate agregado exige todos os mutantes atuais/limiares/zero erros de evidência, independentemente do seed.

RED três novos testes de seleção; GREEN20/20 nesse arquivo, tooling73/73PASS7,297s, lint/actionlint PASS. Logs reports/s06-t005-cache-{red,green,lint}.log e tooling.log. Nenhuma mudança adicional de src/testes de produto; gates locais de domínio já válidos, não repetidos. Nova CI do harness é necessária para prova real de reutilização e resultado atual, não apenas contagem estimada. Não aceitar relatório da baseline como resultado da revisão nova.

### T005 — falha real do agregador e correção do histórico

CI40668143255/429c5bc teve foundation SUCCESS, seis análises SUCCESS e mutation-gate FAIL por ficheiros extra. Stryker conservou histórico do seed fora de mutate: bruto da parte4 tinha83ficheiros,14atuais/69históricos. Todos os69 foram confrontados localmente com o seed por fonte/assinaturas/estados; nenhuma alteração, bruto preservado. Artefacto12808066038 ZIP3278774bytes SHA472ef8e60cde0611595cc799ab135967f0ec54336ad459d3960b3c93ca88695f. Parte1 comprovou782/782reutilizados após dry-run real. Run anterior40666810452 foi cancelado via API202 somente após substituição autorizada; nenhuma CI incompleta ganhou PASS.

Correção decidida na ficha: guardar entrada usada antes de Stryker e bruto final intocados, derivar fragmento exatamente do mutate só após verificar histórico, com ledger/SHA; agregador lê fragmentos e exige o mesmo inventário integral atual. RED2→GREEN22, lint/actionlint PASS; tooling completo em execução. Ponte para os seis caches429c5bc sob harness c742… idêntico evita repetir entradas atuais válidas, sem herdar PASS do agregador falhado.

Diagnóstico do domínio novo:209mutantes156Killed35CompileError18Survived/89,6552%, não gate integral. Revisão dos18 detetou lacunas de fronteira UUID, tipo/null, tempo entre turnos, contexto válido de dois anteriores e asserts negativos mascarados por omittedTurns incorreto. Fortalecidos sem alterar src:53/53PASS1,893s; novas verificações são regressões de mutação, não RED retroativo de comportamento já implementado. Saídas anteriores preservadas. Nova CI determinará o score/gate efetivo e sobreviventes finais; T005 ainda IN_PROGRESS/T006 dependente. [Lição confirmada](../../megabrain/pitfalls/PITFALL-0002-incremental-report-history.md).

Validação final da correção: tooling75/75PASS8,578s, typecheck/lint/actionlint PASS; auditoria documental2026-10-28T10:13:07.913Z PASS10ficheiros/12links/zero missing,segredos,whitespace,prohibited,staged. Logs s06-t005-{scope-tooling,final-typecheck,final-lint,cache-scope-red,cache-scope-green}.log. Commit de checkpoint antes da nova CI; produto byte-idêntico7ac3538.
