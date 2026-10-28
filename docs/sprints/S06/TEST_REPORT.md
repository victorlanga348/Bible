# S06 — Relatório de testes

## T006 — falha real C01v1 e correção versionada em validação

Fonte743d110/CI40686183795: foundation PASS; partes0/4/5 falharam (sem gate aceite).0falhou no dry-run por PID588 ainda visível imediatamente após disconnect do cliente AI; recorrência ERR-0011, teste alinhado à observação já existente2s/10ms exigindo zero, sem alterar timeout/produto.4/5 concluíram análise mas falharam no ledger porque Stryker atualizou a fonte de histórico fora do escopo. Correção RED1→GREEN23 permite fonte histórica intacta ou fonte atual exatamente igual ao inventário atual de nome conhecido, rotulando esta como updated-out-of-scope sem usar seus estados como evidência. Todas as fontes/mutantes atuais continuam obrigatórias no agregado. Brutos/entradas permanecem intactos; falhas não são PASS.

NativeC01v1 executado uma vez: T01PASS84426ms/T02PASS70725ms/T03FAIL62305ms, terceira pergunta sobre inserção de espírito/alma citou Eve. Raw reports/ai-conversation-local-2rAkLT/report.json SHAaa59464df2d9f03c85c5454c395970f79e883d07b0ce9c32702bbd4ecff7b863; auditoria s06-native-verify-2a54ca69-8a60-495f-82fa-f0b00d4bd7c1.json: preservação PASS,7estudos8versões/0análises0conversas, fontes/corpus íntegros e recursos fechados. Dois acertos não compensam o terceiro; resultado permanece FAIL. Não atribuir causa exclusiva a idioma/quantização sem prova.

Migração dev aditiva7PASS: backup custom pg_dump16 e pg_restore--list estruturais fora do Git/OneDrive, relatório s06-native-migrate-420a6006-ea76-43d6-a48b-6cc093c174ce.json; hashes de todas as tabelas anteriores preservados. Restore efetivo reservado para S08, não presumido. Nenhuma alteração a .env/modelos/perfil/fontes/cânone.

Formato questions-v2 decidido/documentado antes de código: distingue perguntas anteriores e pergunta atual em inglês, mesmos2anteriores/1000bytes/500bytes/input, sem respostas históricas no modelo. contextVersion guardado/exposto por turno; ausência legada=v1, leitura usa versão original sem reescrever/responder outra vez. Corpus/modelos/promptv6/expectativas intactos, v1FAIL conservado; C01 novo é regressão versionada, C02–C04 ainda não observados. RED1FAIL53PASS→GREEN54, depois55unidades; integração42/3suitesPASS34,622s incluindo legado v1 e shutdown; HTTP21PASS35,031s; lint/actionlint PASS, typecheck/build final em execução. Prova nativa v2 aindaNOT_RUN, sem encerrar T006/T007/S06. Total planeado de aceite9turnos, mais3tentativas v1falhadas preservadas, não nove chamadas totais.

## T006 — checkpoint de integração2026-10-28

Após fecho T005f619a9d, plano T006/SPEC fixados antes do código. Schema: verificação executável inicial14FAIL por tabela inexistente (configuração, não RED de negócio); migração aditiva202610280001_ai_conversation aplicada somente em biblia_test após guard/identidade;14PASS4,833s nas constraints reais, sem FK para módulos alheios. Desenvolvimento ainda com6migrações neste checkpoint, nenhuma limpeza/dado nativo alterado.

Repositório: RED13falhas por operações não implementadas→GREEN13→16PASS10,852s,100%linhas/branches/statements/functions no recorte. INSERT/UPDATE cancelados após início real por trigger+sequência e rollback, concorrência realCAS, metadata owner/estudo/versão/data imutáveis, duplicate causeP2002, eliminação transacional/rollback e proteção contra seleção vazia. Application: RED15→GREEN15→24PASS32,764s/100%recorte, Study/Source/PG/vector reais, protocolo do modelo explicitamente double. Histórico sem gerar, contexto registrado, owner404, restrição atual, análise apagada, conflito PG com barreira só de escalonamento, cancelamento/compensação/falhas SQL. Falha controlada de compensação deixou análise privada órfã e503 esperado, sem turno confirmado; risco documentado para recuperação S08, não false PASS de limpeza.

HTTP: RED21pela ausência das rotas→GREEN21PASS28,225s com Nest/JWT/Supertest e protocolos técnicos identificados. Contratos/400/401/404/409/422/503/504/Swagger,3turnos, capacidade20, fontes revogadas, GET sem modelo e client disconnect real. Warning de timer próprio não encerrado foi corrigido; apenas caso afetado repetido1PASS8,168s sem warning,20filtrados não são gate global. Lint apontou throw em finally do helper de teste; extraída limpeza guardada, sem comportamento de produto alterado. Typecheck/build/9arquitetura PASS; lint final após corrigir globals CJS via globalThis e tooling78/78PASS19,396s. Logs s06-t006-{schema-before-migration,schema-after-migration,generate,migrate-test,store-red,store-green,store-coverage,application-red,application-green,application-coverage,http-red,http-green,http-abort-final,typecheck,architecture,lint-final,build,proof-red,proof-green,tooling,native-lint-final}.log preservados em reports.

Runner nativo C01 aprovado antes das chamadas, finalizador RED2→GREEN3incluindo CLIguard, sem modelo/DB nos testes técnicos. Comando real ai:verify:conversations criado somente após script/guard executáveis. C01três chamadas nativas aindaNOT_RUN; T007 incorpora originais por digest/fonte idêntica e executa seis turnos C02–C04 ainda não observados, total9 sem retake. Nenhuma expectativa no pedido de modelo. T006 IN_PROGRESS, CI integral/cobertura/mutação atual e prova nativa/semântica pendentes; T007dependente. Seed completo atualizado de S05para artefacto integral T005cc157ea/CI40670440360, SHAe7504b95… já verificado/strictPASS, mesma compatibilidade c742…; algoritmo/limiares/estados não mudaram. Não usar score da baseline como resultado do código novo.

Estado vigente2026-10-28: T005 DONE técnico após CI40670440360/cc157ea,1759testes75tooling/100%linhas97,82%branches/mutação90,37%global89,59%AI98,28%domínio/zeroRuntimeError+NoCoverage. [Fecho T005](T005_COMPLETION_REPORT.md) reúne digests/327sobreviventes (324históricos+3guards revistos). Auditoria documental antes de commit; T006 READY/T007dependente, S06 IN_PROGRESS. Entradas seguintes históricas.

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

Fecho T005: auditoria documental PASS2026-10-28T10:23:54.126Z14Markdown/80links/zero missing,secretHits,whitespace,prohibited,staged. Agente revê/encerra sob delegação vigente; Gate4/6 não aplicáveis ao domínio novo, não PASS de persistência ou IA S06. Fonte/gates/sobreviventes/digests em T005_COMPLETION_REPORT.

Checkpoint contextov2:55unitPASS,42integration/3suitesPASS34,622s,21HTTPPASS35,031s,79toolingPASS9,313s,typecheck/build/lint/actionlintPASS; auditoria antes decommit. Typecheck detetou undefined explícito incompatível com exactOptionalPropertyTypes num fixture legado; corrigido para ausência real da propriedade, conforme JSON. Nenhuma prova nativa v2 executada ainda.
