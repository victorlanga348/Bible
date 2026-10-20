# S04 — Tarefas

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S04-T004 | Aprovar SS-001 e contratos determinísticos de estudo | A/C | Alta (proposta) | BACKLOG | S03 encerrada | [PLAN](PLAN.md) |
| S04-T005 | Implementar Study, StudySection, Interpretation e Evidence | A | Alta (proposta) | BLOCKED | S04-T004 | [PLAN](PLAN.md) |
| S04-T006 | Integrar construção, persistência e versões sem LLM | B | Alta (proposta) | BLOCKED | S04-T005 | [PLAN](PLAN.md) |
| S04-T007 | Verificar distinção epistemológica e gates | C | Alta (proposta) | BLOCKED | S04-T006 | [PLAN](PLAN.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
