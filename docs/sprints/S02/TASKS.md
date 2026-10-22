# S02 — Tarefas

Estado vigente2026-10-22: sprint IN_PROGRESS como complemento da entrega reduzida já commitada. Autorização integral posterior retoma T006/T007; não apaga o encerramento anterior nem atribui entrega anterior à API ausente. T006 IN_PROGRESS e T007 BLOCKED na predecessora; T004/T005 permanecem DONE. Sem nova aprovação pendente; ver [execução integral](../../roadmap/completion-execution.md).

Fonte canónica, atualizada em2026-10-21. Sprint DONE com escopo reduzido a T004/T005 por decisão explícita: «termina, o que falta vou adicionar depois». SPEC v0.2/recorte/contratos/plano T005 já tinham sido aprovados; revisão de escopo para encerramento registada no PLAN/SPEC. Commit principal `c0c24b9f48aba7926dea05207a7263a97b7fc7b0` realizado após «se terminou pode finalizar e ir para a proxima»; preparação S03 autorizada depois dele, sem push/merge.

Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação. Responsável pela execução/revisão técnica: agente executor; aprovador: utilizador. Uma tarefa por vez.

| ID | Título | Trilha | Prioridade | Estado | Dependências e disposição | Referência |
|---|---|---|---|---|---|---|
| S02-T004 | Aprovar cânone, licenças, parser e contratos HTTP | A/C | Alta | DONE | «ok» à SPEC v0.2; corpus/aviso/catálogo/fixture reais verificados; EXT-003 resolvida para snapshot/usos | [Ficha](tasks/S02-T004-canon-contracts.md), [SPEC](SPEC.md) |
| S02-T005 | Implementar Book, Chapter, Verse, Translation e referências | A | Alta | DONE | T004 satisfeita; RED/GREEN/regressão152, estática/tooling/cobertura/mutação aprovados | [Ficha](tasks/S02-T005-domain.md), [evidências](TEST_REPORT.md) |
| S02-T006 | Integrar importação autorizada, consulta e navegação | B | Alta | IN_PROGRESS | Retomada pela autorização geral posterior; T005/corpus satisfeitos, plano refinado em2026-10-22 | [Plano](tasks/S02-T006-integration.md) |
| S02-T007 | Verificar API e passagens reais, gates e relatório | C | Alta | BLOCKED | Dependente da implementação/provas T006 | [Plano de retoma](tasks/S02-T007-verification.md), [original](PLAN.md) |

Nota histórica do adiamento: T006/T007 não estavam DONE, canceladas ou transferidas automaticamente para outra sprint. A autorização posterior de2026-10-22 já retomou esses mesmos IDs/significados e refinou planos/dependências. O fecho reduzido anterior não equivale à aceitação HTTP integral atual; esta depende dos gates em curso.

Histórico de estados: T004/T005 concluídas; T006/T007 BLOCKED antes da decisão de adiamento → BACKLOG fora do escopo de encerramento em2026-10-21. Sprint IN_PROGRESS → REVIEW → DONE no recorte aprovado, com os gates pertinentes satisfeitos. Nenhum critério futuro foi convertido em PASS.

Estados de tarefa e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE e PASS/FAIL/BLOCKED/NOT_RUN. IDs001–003 anteriores preservados no [histórico](../../roadmap/HISTORY.md), sem backlog concorrente.
