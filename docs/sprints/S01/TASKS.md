# S01 — Tarefas

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S01-T004 | Aprovar contratos técnicos, matriz de versões e isolamento | B/C | Alta (proposta) | BACKLOG | aprovações e EXT-002; S00 encerrada | [PLAN](PLAN.md) |
| S01-T005 | Preparar toolchain, harness e fiscalização arquitetural | B/C | Alta (proposta) | BLOCKED | S01-T004 | [PLAN](PLAN.md) |
| S01-T006 | Compor NestJS, configuração, OpenAPI, erros e logging | B | Alta (proposta) | BLOCKED | S01-T005 | [PLAN](PLAN.md) |
| S01-T007 | Implementar persistência técnica e migrações reais | B | Alta (proposta) | BLOCKED | S01-T006; EXT-002 | [PLAN](PLAN.md) |
| S01-T008 | Verificar HTTP real, cobertura, mutação e CI | C | Alta (proposta) | BLOCKED | S01-T007 | [PLAN](PLAN.md) |
| S01-T009 | Consolidar evidências e solicitar revisão | C | Alta (proposta) | BLOCKED | S01-T008 | [PLAN](PLAN.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
