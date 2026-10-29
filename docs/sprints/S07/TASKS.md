# S07 — Tarefas

Estado vigente2026-10-29: S07 IN_PROGRESS sob autorização integral, S06 encerrada48be2f0. T004 preparação de [SPEC](SPEC.md)/ADR-0007 DONE documental após auditoria real, antes de código; T005 relações, T006 workspace/lifecycle/históricos, T007 provas/gates. Agente é decisor delegado; uma tarefa por vez/sem agentes/sem novas perguntas. Nenhum gate de produto S07 presumido. Entradas seguintes históricas.

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S07-T004 | Aprovar relações, notas, favoritos, histórico e SH-001 | A/C | Alta (proposta) | DONE | S06 encerrada; EXT-005 | [PLAN](PLAN.md) |
| S07-T005 | Implementar relações entre passagens e classificação | A | Alta (proposta) | IN_PROGRESS | S07-T004 | [Ficha](tasks/S07-T005-cross-references.md) |
| S07-T006 | Integrar workspace e recuperação de estudos | B | Alta (proposta) | BLOCKED | S07-T005 | [PLAN](PLAN.md) |
| S07-T007 | Verificar navegação, persistência e gates | C | Alta (proposta) | BLOCKED | S07-T006 | [PLAN](PLAN.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
