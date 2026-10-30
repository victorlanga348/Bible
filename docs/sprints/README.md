# Sprints — Backend Bíblia App

Estado2026-10-29: S00–S07 DONE técnico sob autorização integral; [fecho S07](S07/T007_COMPLETION_REPORT.md), CI40900841329 oito SUCCESS/provas nativas/revisões PASS. S08 DONE técnico/T004–T007 DONE/gates/recuperação/auditoria PASS, uma tarefa por vez/sem agentes. [Retoma breve](../megabrain/agent-context/project-state.md).

| Sprint | Objetivo | Estado | Dependência/aceite |
|---|---|---|---|
| [S00](S00/README.md) | Governança e planeamento | DONE | Consolidação documental aprovada |
| [S01](S01/README.md) | Fundação técnica | DONE | Gates e encerramento aprovados |
| [S02](S02/README.md) | Cânone e integração bíblica | DONE | Inclui T006/T007 retomadas e corpus nativo real |
| [S03](S03/README.md) | Biblioteca de fontes | DONE | Corpus/curadoria/pesquisa/HTTP reais |
| [S04](S04/README.md) | Estudos estruturados privados | DONE | CI40338249693/907testes/gates/revisão |
| [S05](S05/README.md) | IA e RAG | DONE | T004–T007; CI40660972664/1706testes/14casos e revisão semântica PASS |
| [S06](S06/README.md) | Conversas contextuais | DONE | Nove turnos nativos/semântica e sete gates aplicáveis demonstrados |
| [S07](S07/README.md) | Referências cruzadas e workspace | DONE | S06 concluída |
| [S08](S08/README.md) | Hardening e release | DONE | Gates/recuperação reais/auditoria final PASS; release pessoal local |
| [S09](S09/README.md) | Frontend da Plataforma de Investigação Bíblica | DONE | S08 e autorização formal do frontend |

Cada sprint mantém PLAN, TASKS, ACCEPTANCE_CRITERIA, TEST_REPORT e REVIEW. README da sprint é fonte do estado da sprint; TASKS dos estados das tarefas. Fontes normativas em /docs, ADRs aceites e autorização vigente do AGENTS; histórico não substitui normas/estado atual.

Fluxo: BACKLOG→READY→IN_PROGRESS→REVIEW→DONE; BLOCKED exige causa e prova de desbloqueio. DONE somente com critérios e sete gates aplicáveis demonstrados. PASS/FAIL/BLOCKED/NOT_RUN são resultados de execução, não estados de tarefa. Gate obrigatório pendente impede fecho.

Antes de cada tarefa identificar Sxx-Txxx, consultar apenas docs/MegaBrain pertinentes e fixar contratos/decisões/plano/dependências antes de código. Manter TDD RED→GREEN→REFACTOR e provas reais; testes afetados durante implementação, gates completos nos marcos. Uma tarefa/branch feat/biblia-backend, sem subagentes; main preservada. Autorizações/decisões delegadas não dispensam requisitos, direitos ou qualidade.

Fichas pelo [template](../tasks/template.md); IDs nunca reutilizados, legados em [HISTORY](../roadmap/HISTORY.md). Entradas scope/backlog/acceptance apontam às fontes canónicas. Fecho inclui docs/README/ADRs/MegaBrain/roadmap, revisão e auditoria da pergunta: **Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?** A autorização integral dispensa interromper para repetição de permissão.
