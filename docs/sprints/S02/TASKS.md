# S02 — Tarefas

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S02-T004 | Aprovar cânone, licenças, parser e contratos HTTP | A/C | Alta (proposta) | BACKLOG | S01 encerrada; EXT-003 | [PLAN](PLAN.md) |
| S02-T005 | Implementar Book, Chapter, Verse, Translation e referências | A | Alta (proposta) | BLOCKED | S02-T004 | [PLAN](PLAN.md) |
| S02-T006 | Integrar importação autorizada, consulta e navegação | B | Alta (proposta) | BLOCKED | S02-T005 | [PLAN](PLAN.md) |
| S02-T007 | Verificar API e passagens reais, gates e relatório | C | Alta (proposta) | BLOCKED | S02-T006 | [PLAN](PLAN.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
