# Sprints — Backend Bíblia App

Ciclo canónico S00–S08 do pedido mestre, consolidado com aprovação documental em 2026-10-20. Aprovação do planeamento não aprova execução das sprints futuras.
Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação. Uma tarefa aprovada de cada vez; sem subagentes/paralelismo implícito.

| Sprint | Objetivo | Estado | Dependência |
|---|---|---|---|
| [S00](S00/README.md) | Governança e Planeamento | DONE | Antecedente DOC-0001 |
| [S01](S01/README.md) | Fundação Técnica | DONE | S00 encerrada; validação local e aprovação final/commit recebidas em 2026-10-21 |
| [S02](S02/README.md) | Cânone: corpus, domínio e parser | DONE | Encerramento com escopo reduzido aprovado; T004/T005 entregues, T006/T007 adiadas, commit PENDING |
| [S03](S03/README.md) | Biblioteca de Fontes | BACKLOG | Rever impacto da integração bíblica adiada e commit S02; nova aprovação de S03 |
| [S04](S04/README.md) | Motor de Estudos | BACKLOG | S03 encerrada |
| [S05](S05/README.md) | IA e RAG | BACKLOG | S04 encerrada |
| [S06](S06/README.md) | Conversas Contextuais | BACKLOG | S05 encerrada |
| [S07](S07/README.md) | Referências Cruzadas e Workspace | BACKLOG | S06 encerrada |
| [S08](S08/README.md) | Hardening e Release | BACKLOG | S07 encerrada |

Transição S01 REVIEW → DONE em 2026-10-21, após aprovação do utilizador: «segunda sprint aprovada, continue com a proxima apos o commit». Autoriza commit S01 e continuação para S02 depois dele; contratos/dados/cânone da S02 não são aprovados por inferência. Sem push/merge autorizado.

S02 BACKLOG → BLOCKED em 2026-10-21: preparação S02-T004 realizada depois do commit principal S01 `1702cc0`; decisões de entrada em falta identificadas. Nenhuma transição READY/IN_PROGRESS de implementação é presumida. Desbloqueio exige cânone/edição/direitos, contratos e planos aprovados; não transferir as aprovações S01 para S02.

S02 BLOCKED → READY → IN_PROGRESS em 2026-10-21 após «ok» à SPEC v0.2/recorte/plano T005 e verificação real do corpus/aviso/fixture. T004 DONE antes de iniciar T005; T006/T007 continuam dependentes dos seus planos e predecessoras. A aprovação atual não autoriza encerramento/commit S02.

## Identidade e fontes

S02 IN_PROGRESS → REVIEW → DONE no recorte corpus/domínio/parser em2026-10-21 por «termina, o que falta vou adicionar depois». T006/T007 BLOCKED → BACKLOG, retiradas do escopo de fecho e preservadas para adição posterior pelo utilizador. Gates do incremento entregue verificados no relatório/revisão; integração/API adiadas continuam NOT_RUN. Commit PENDING, sem push/merge ou S03 autorizados.

S02-T005 READY → IN_PROGRESS → REVIEW → DONE técnico em 2026-10-21: TDD/gates e revisão documentados,152 testes e mutação válida97,21%. Naquele momento T006 estava BLOCKED e o fecho ainda não fora aprovado; a decisão posterior está registada a seguir.
Cada sprint tem PLAN.md, TASKS.md, ACCEPTANCE_CRITERIA.md, TEST_REPORT.md, REVIEW.md; README define estado de sprint e TASKS estados das tarefas. Entradas scope/backlog/acceptance preservam navegação e apontam para a fonte única.
IDs Sxx-Txxx únicos/nunca reutilizados. IDs antigos/temas/estados estão em [HISTORY](../roadmap/HISTORY.md); frontend adiado e S09 histórico fora deste ciclo. Não converter histórico em execução aprovada.
Tarefas detalhadas usam [template](../tasks/template.md) e docs/sprints/Sxx/tasks com índice quando existir. Aprovação da sprint não aprova automaticamente spec, contratos, versões ou plano da tarefa.

## Transições
BACKLOG: refinamento sem entrada aprovada; READY: sprint/spec/contratos/plano aprovados e dependências satisfeitas; IN_PROGRESS: tarefa READY iniciada; BLOCKED: impedimento com causa/desbloqueio; REVIEW: execução em revisão; DONE: todos os gates aplicáveis e critérios demonstrados.
Fluxo BACKLOG → READY → IN_PROGRESS → REVIEW → DONE. Impedimento conhecido leva a BLOCKED; volta a READY apenas com prova de desbloqueio. Falha de revisão volta a IN_PROGRESS se correção autorizada, senão BLOCKED. Não marcar DONE só por escrever código.

## Ciclo obrigatório
Inspecionar Git/docs/ADRs/MegaBrain/skills; apresentar PLAN com tarefas, riscos, dependências, alternativas, critérios e validação; obter aprovação explícita; executar tarefa a tarefa e TDD; validar cada critério realmente; produzir TEST_REPORT e REVIEW; corrigir falhas ou pedir ação externa; aguardar aprovação de encerramento/commit.
Depois de aprovação final, commitar apenas ficheiros da sprint em feat/biblia-backend, registar hash/contexto sem autorreferência impossível. Não fazer merge/push nem iniciar seguinte sem autorização própria. Sprint permanece REVIEW até encerramento aprovado.
Estados de execução: PASS/FAIL/BLOCKED/NOT_RUN com aplicabilidade/motivo separados. Gates obrigatórios pendentes/bloqueados impedem DONE. Sem testes/credenciais não declarar PASS.
Pergunta de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
Ver [governança](../documentation-governance.md), [gates](../quality/quality-gates.md), [roadmap](../roadmap/master-plan.md) e [dependências](../roadmap/dependencies.md).
