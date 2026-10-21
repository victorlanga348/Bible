# S02 — Tarefas

Fonte canónica, atualizada em2026-10-21. Sprint DONE com escopo reduzido a T004/T005 por decisão explícita: «termina, o que falta vou adicionar depois». SPEC v0.2/recorte/contratos/plano T005 já tinham sido aprovados; revisão de escopo para encerramento registada no PLAN/SPEC. Commit principal `c0c24b9f48aba7926dea05207a7263a97b7fc7b0` realizado após «se terminou pode finalizar e ir para a proxima»; preparação S03 autorizada depois dele, sem push/merge.

Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação. Responsável pela execução/revisão técnica: agente executor; aprovador: utilizador. Uma tarefa por vez.

| ID | Título | Trilha | Prioridade | Estado | Dependências e disposição | Referência |
|---|---|---|---|---|---|---|
| S02-T004 | Aprovar cânone, licenças, parser e contratos HTTP | A/C | Alta | DONE | «ok» à SPEC v0.2; corpus/aviso/catálogo/fixture reais verificados; EXT-003 resolvida para snapshot/usos | [Ficha](tasks/S02-T004-canon-contracts.md), [SPEC](SPEC.md) |
| S02-T005 | Implementar Book, Chapter, Verse, Translation e referências | A | Alta | DONE | T004 satisfeita; RED/GREEN/regressão152, estática/tooling/cobertura/mutação aprovados | [Ficha](tasks/S02-T005-domain.md), [evidências](TEST_REPORT.md) |
| S02-T006 | Integrar importação autorizada, consulta e navegação | B | A rever na retoma | BACKLOG | Adiada e retirada do escopo de fecho pelo utilizador; T005 satisfeita; plano proposto preservado, sem aprovação de execução | [Plano preservado](tasks/S02-T006-integration.md) |
| S02-T007 | Verificar API e passagens reais, gates e relatório | C | A rever na retoma | BACKLOG | Adiada com T006; depende da implementação real dela; plano detalhado ainda não preparado/aprovado | [Plano original](PLAN.md) |

T006/T007 não estão DONE, canceladas ou transferidas automaticamente para outra sprint. Os IDs/significados são preservados; o utilizador irá adicioná-las depois. Antes de retomar, rever escopo/contratos/plano/dependências e verificar gates reais. O fecho documental da entrega atual foi realizado no REVIEW/TEST_REPORT e não equivale à aceitação HTTP futura de T007.

Histórico de estados: T004/T005 concluídas; T006/T007 BLOCKED antes da decisão de adiamento → BACKLOG fora do escopo de encerramento em2026-10-21. Sprint IN_PROGRESS → REVIEW → DONE no recorte aprovado, com os gates pertinentes satisfeitos. Nenhum critério futuro foi convertido em PASS.

Estados de tarefa e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE e PASS/FAIL/BLOCKED/NOT_RUN. IDs001–003 anteriores preservados no [histórico](../../roadmap/HISTORY.md), sem backlog concorrente.
