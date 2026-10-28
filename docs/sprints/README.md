# Sprints — Backend Bíblia App

Checkpoint vigente2026-10-28: S05-T006 DONE, [fecho](S05/T006_COMPLETION_REPORT.md)/CI40651025107/1706testes/global89,94%/AI88,78%/zeroRuntimeError+NoCoverage. T007 READY/14avaliações NOT_RUN; S05 IN_PROGRESS, S06–S08 autorizadas/pendentes. [Retoma breve](../megabrain/agent-context/project-state.md), [provas](S05/TEST_REPORT.md). Uma tarefa/sem agentes/nova permissão. Entradas seguintes históricas.

Checkpoint atual2026-10-27: S05-T006 IN_PROGRESS, Application/HTTP/CLI e prova nativa real publicados em7f7809508fc97d05ecb2b0efdb60ccc2aba39910. Indexação11vetores/1911tokens e análise HTTP95s/quote literal/owner/GET/DELETE PASS; regressões locais posteriores falharam por prazos, não aceites. CI40563697363 valida a fonte estável; mutação atual/14avaliações T007 continuam pendentes. Estado breve e histórico separado em [contexto](../megabrain/agent-context/project-state.md), [provas atuais](S05/TEST_REPORT.md). Uma tarefa/sem agentes/nova permissão; S00–S04 DONE, S06–S08 pendentes autorizadas.

Transição atual2026-10-27: S05-T006 READY→IN_PROGRESS depois do fecho válido T00541d1e6a e plano concreto anterior à implementação. Checkpoint Domain011c824 publicado, restante persistência/admissão/configuração em validação real; T007 BLOCKED/T006, sem fechar gates pendentes. [Ficha](S05/tasks/S05-T006-rag-persistence-http.md), [relatório](S05/TEST_REPORT.md). Uma tarefa, autorização integral vigente, sem agentes/perguntas. Histórico seguinte preservado.

Transição corrigida2026-10-27: T005 REVIEW→DONE técnico sob delegação após CI40471991297/f798f31/1200testes/100%linhas/98,03%branches/própria90,34%/zeroRuntimeError/NoCoverage. T006 BLOCKED→READY, S05 IN_PROGRESS/T007 dependente. [Fecho T005](S05/T005_COMPLETION_REPORT.md). Fecho7406a0f foi revogado e requisito zero passou a ser gate automático; não há dispensa da SPEC ou nova aprovação exigida.

Atualização2026-10-26: S04 IN_PROGRESS→REVIEW→DONE após T006/T007, revisão/auditoria e fecho delegado.907 regressões/46 suites locais e CI40338249693 PASS; mutação fonte corrigida global90,69%/recorte24 ficheiros87,71%, originais/fontes/sobreviventes conferidos. [Relatório S04](S04/TEST_REPORT.md). Próxima tarefa S05-T004, decisões/execução autorizadas sem nova permissão, predecessora satisfeita; contratos/viabilidade de IA ainda por comprovar. Uma tarefa de cada vez. Notas seguintes históricas.

Commit principal S03 criado em2026-10-21: `604c45a29e78b5fb4d705ca4be95cbf77c1bc942`,77 ficheiros selecionados, mensagem `feat(sprint-03): implement source library`. Hash registado neste incremento documental posterior; nenhuma alteração de main ou push/merge.

Ciclo canónico S00–S08 do pedido mestre, consolidado com aprovação documental em 2026-10-20. Aprovação do planeamento não aprova execução das sprints futuras.
Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação. Uma tarefa aprovada de cada vez; sem subagentes/paralelismo implícito.

| Sprint | Objetivo | Estado | Dependência |
|---|---|---|---|
| [S00](S00/README.md) | Governança e Planeamento | DONE | Antecedente DOC-0001 |
| [S01](S01/README.md) | Fundação Técnica | DONE | S00 encerrada; validação local e aprovação final/commit recebidas em 2026-10-21 |
| [S02](S02/README.md) | Cânone e integração bíblica | DONE | T006/T007 concluídas;551 testes, mutação95,87% local/95,41% CI e auditoria final; fecho reduzido c0c24b9 preservado |
| [S03](S03/README.md) | Biblioteca de Fontes | DONE | T004–T007 DONE técnico; revisão integrada/gates/CI local verificados, encerramento/commit aprovados pelo «pode usar» após revisão final |
| [S04](S04/README.md) | Motor de Estudos | DONE | T004–T007 DONE,907 testes/CI40338249693, mutação corrigida90,69%/recorte87,71%, fecho delegado |
| [S05](S05/README.md) | IA e RAG | IN_PROGRESS | T004/T005 DONE/f798f31/CI40471991297/zeroRuntimeError+NoCoverage; T006 IN_PROGRESS/011c824/T007 dependente |
| [S06](S06/README.md) | Conversas Contextuais | BACKLOG | S05 encerrada |
| [S07](S07/README.md) | Referências Cruzadas e Workspace | BACKLOG | S06 encerrada |
| [S08](S08/README.md) | Hardening e Release | BACKLOG | S07 encerrada |

Transição S01 REVIEW → DONE em 2026-10-21, após aprovação do utilizador: «segunda sprint aprovada, continue com a proxima apos o commit». Autoriza commit S01 e continuação para S02 depois dele; contratos/dados/cânone da S02 não são aprovados por inferência. Sem push/merge autorizado.

S02 BACKLOG → BLOCKED em 2026-10-21: preparação S02-T004 realizada depois do commit principal S01 `1702cc0`; decisões de entrada em falta identificadas. Nenhuma transição READY/IN_PROGRESS de implementação é presumida. Desbloqueio exige cânone/edição/direitos, contratos e planos aprovados; não transferir as aprovações S01 para S02.

S02 BLOCKED → READY → IN_PROGRESS em 2026-10-21 após «ok» à SPEC v0.2/recorte/plano T005 e verificação real do corpus/aviso/fixture. T004 DONE antes de iniciar T005; T006/T007 continuam dependentes dos seus planos e predecessoras. A aprovação atual não autoriza encerramento/commit S02.

## Identidade e fontes

S02 IN_PROGRESS → REVIEW → DONE no recorte corpus/domínio/parser em2026-10-21 por «termina, o que falta vou adicionar depois». T006/T007 BLOCKED → BACKLOG, retiradas do escopo de fecho e preservadas para adição posterior pelo utilizador. Gates do incremento entregue verificados no relatório/revisão; integração/API adiadas continuam NOT_RUN. Pedido posterior «se terminou pode finalizar e ir para a proxima» autorizou commit/continuação; principal S02 c0c24b9 realizado, preparação S03 autorizada. Sem push/merge ou execução de contratos/planos S03 ainda não aprovados.

S02-T005 READY → IN_PROGRESS → REVIEW → DONE técnico em 2026-10-21: TDD/gates e revisão documentados,152 testes e mutação válida97,21%. Naquele momento T006 estava BLOCKED e o fecho ainda não fora aprovado; a decisão posterior está registada a seguir.
Cada sprint tem PLAN.md, TASKS.md, ACCEPTANCE_CRITERIA.md, TEST_REPORT.md, REVIEW.md; README define estado de sprint e TASKS estados das tarefas. Entradas scope/backlog/acceptance preservam navegação e apontam para a fonte única.
IDs Sxx-Txxx únicos/nunca reutilizados. IDs antigos/temas/estados estão em [HISTORY](../roadmap/HISTORY.md); frontend adiado e S09 histórico fora deste ciclo. Não converter histórico em execução aprovada.
Tarefas detalhadas usam [template](../tasks/template.md) e docs/sprints/Sxx/tasks com índice quando existir. Aprovação da sprint não aprova automaticamente spec, contratos, versões ou plano da tarefa.

## Transições

S03-T006 BLOCKED → READY → IN_PROGRESS em2026-10-21: novo «vai enfrente» aceita o plano detalhado e pesquisa calculada sem GIN persistente. Uma tarefa ativa; T007/encerramento/commit continuam com aprovações próprias. Migrações/importação somente no alvo de teste guardado.

S03 BLOCKED → READY → IN_PROGRESS em2026-10-21 após «vai enfrente» à SPEC/recorte/planos T004/T005 e admissão do corpus. T004 DONE por provas de dados/curadoria; T005 iniciou RED e segue validação. T006/T007 têm planos/antecessoras próprios, sem execução ou encerramento/commit S03 autorizados.
BACKLOG: refinamento sem entrada aprovada; READY: sprint/spec/contratos/plano aprovados e dependências satisfeitas; IN_PROGRESS: tarefa READY iniciada; BLOCKED: impedimento com causa/desbloqueio; REVIEW: execução em revisão; DONE: todos os gates aplicáveis e critérios demonstrados.
Fluxo BACKLOG → READY → IN_PROGRESS → REVIEW → DONE. Impedimento conhecido leva a BLOCKED; volta a READY apenas com prova de desbloqueio. Falha de revisão volta a IN_PROGRESS se correção autorizada, senão BLOCKED. Não marcar DONE só por escrever código.

## Ciclo obrigatório
Inspecionar Git/docs/ADRs/MegaBrain/skills; apresentar PLAN com tarefas, riscos, dependências, alternativas, critérios e validação; obter aprovação explícita; executar tarefa a tarefa e TDD; validar cada critério realmente; produzir TEST_REPORT e REVIEW; corrigir falhas ou pedir ação externa; aguardar aprovação de encerramento/commit.
Depois de aprovação final, commitar apenas ficheiros da sprint em feat/biblia-backend, registar hash/contexto sem autorreferência impossível. Não fazer merge/push nem iniciar seguinte sem autorização própria. Sprint permanece REVIEW até encerramento aprovado.
Estados de execução: PASS/FAIL/BLOCKED/NOT_RUN com aplicabilidade/motivo separados. Gates obrigatórios pendentes/bloqueados impedem DONE. Sem testes/credenciais não declarar PASS.
Pergunta de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
Ver [governança](../documentation-governance.md), [gates](../quality/quality-gates.md), [roadmap](../roadmap/master-plan.md) e [dependências](../roadmap/dependencies.md).

S03 BACKLOG → BLOCKED em2026-10-21 após commit S02 c0c24b9/registo ee55c4e e pedido de continuação. PLAN/SPEC/planos T004/T005 e pesquisa de candidatas preparados; contratos/recorte/corpus ainda precisam de aceite/prova antes de código. S02-T006/T007 continuam adiadas; proposta explicita associação bíblica também adiada, sem fake de existência.

S03-T006 IN_PROGRESS → REVIEW → DONE técnico em2026-10-21: critérios/gates aplicáveis verificados,439 testes e mutação bruta99,08883826879271%, relatório/revisão/docs sincronizados. T007 continua BLOCKED no aceite do seu plano; a sprint permanece IN_PROGRESS, commit PENDING.

S03-T007 BLOCKED → READY → IN_PROGRESS em2026-10-21: «aprovado, e veja que alterei o .env, podes usar e adaptar o que precisares tambem» aceita o plano de revisão integrada/CI e uso da configuração local. T006 DONE, base de teste isolada confirmada; sem encerramento/commit S03 ou S04 autorizado nesse momento.

S03-T007 IN_PROGRESS → REVIEW → DONE técnico e S03 IN_PROGRESS → REVIEW em2026-10-21:440 regressões, estática/build/tooling13, linhas100%/branches97,07%, mutação bruta435/439=99,08883826879271%, percurso integrado/CI local e documentação verificados. Encerramento/commit S03 PENDING naquele momento até aprovação final e pergunta obrigatória; nenhuma autorização S04/push/merge.

S03 REVIEW → DONE em2026-10-21: «pode usar», após TEST_REPORT/REVIEW e pergunta obrigatória, aprova encerramento e commit da sprint. Sem autorização de S04, push/merge ou deployment. Registar hash após criação, sem autorreferência impossível.
