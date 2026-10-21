# Dependências do backend

Ordem: S00 → S01 → S02 → S03 → S04 → S05 → S06 → S07 → S08. Encerramento aprovado e commit da anterior precedem nova autorização. S09/frontend não são dependências deste ciclo.

Decisão de2026-10-21: S02 encerrada com escopo reduzido por «termina, o que falta vou adicionar depois». T006/T007 ficam BACKLOG fora desse fecho, sem sprint futura atribuída; suas arestas abaixo são preservadas para retoma, não tarefas ativas ou satisfeitas. S03 permanece BACKLOG; rever impacto da ausência de integração bíblica antes da sua aprovação, com commit principal S02 c0c24b9 já realizado e continuação para preparação autorizada.

| Tarefa ativa | Predecessoras diretas (IDs) | Fonte |
|---|---|---|
| S00-T001 | Nenhuma | [S00](../sprints/S00/TASKS.md) |
| S00-T002 | S00-T001 | [S00](../sprints/S00/TASKS.md) |
| S00-T003 | S00-T002 | [S00](../sprints/S00/TASKS.md) |
| S00-T004 | S00-T003 | [S00](../sprints/S00/TASKS.md) |
| S00-T005 | S00-T004 | [S00](../sprints/S00/TASKS.md) |
| S00-T006 | S00-T005 | [S00](../sprints/S00/TASKS.md) |
| S00-T007 | S00-T006 | [S00](../sprints/S00/TASKS.md) |
| S01-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S01](../sprints/S01/TASKS.md) |
| S01-T005 | S01-T004 | [S01](../sprints/S01/TASKS.md) |
| S01-T006 | S01-T005 | [S01](../sprints/S01/TASKS.md) |
| S01-T007 | S01-T006 | [S01](../sprints/S01/TASKS.md) |
| S01-T008 | S01-T007 | [S01](../sprints/S01/TASKS.md) |
| S01-T009 | S01-T008 | [S01](../sprints/S01/TASKS.md) |
| S02-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S02](../sprints/S02/TASKS.md) |
| S02-T005 | S02-T004 | [S02](../sprints/S02/TASKS.md) |
| S02-T006 | S02-T005 | [S02](../sprints/S02/TASKS.md) |
| S02-T007 | S02-T006 | [S02](../sprints/S02/TASKS.md) |
| S03-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S03](../sprints/S03/TASKS.md) |
| S03-T005 | S03-T004 | [S03](../sprints/S03/TASKS.md) |
| S03-T006 | S03-T005 | [S03](../sprints/S03/TASKS.md) |
| S03-T007 | S03-T006 | [S03](../sprints/S03/TASKS.md) |
| S04-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S04](../sprints/S04/TASKS.md) |
| S04-T005 | S04-T004 | [S04](../sprints/S04/TASKS.md) |
| S04-T006 | S04-T005 | [S04](../sprints/S04/TASKS.md) |
| S04-T007 | S04-T006 | [S04](../sprints/S04/TASKS.md) |
| S05-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S05](../sprints/S05/TASKS.md) |
| S05-T005 | S05-T004 | [S05](../sprints/S05/TASKS.md) |
| S05-T006 | S05-T005 | [S05](../sprints/S05/TASKS.md) |
| S05-T007 | S05-T006 | [S05](../sprints/S05/TASKS.md) |
| S06-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S06](../sprints/S06/TASKS.md) |
| S06-T005 | S06-T004 | [S06](../sprints/S06/TASKS.md) |
| S06-T006 | S06-T005 | [S06](../sprints/S06/TASKS.md) |
| S06-T007 | S06-T006 | [S06](../sprints/S06/TASKS.md) |
| S07-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S07](../sprints/S07/TASKS.md) |
| S07-T005 | S07-T004 | [S07](../sprints/S07/TASKS.md) |
| S07-T006 | S07-T005 | [S07](../sprints/S07/TASKS.md) |
| S07-T007 | S07-T006 | [S07](../sprints/S07/TASKS.md) |
| S08-T004 | Nenhuma tarefa da mesma sprint; depende da sprint anterior encerrada | [S08](../sprints/S08/TASKS.md) |
| S08-T005 | S08-T004 | [S08](../sprints/S08/TASKS.md) |
| S08-T006 | S08-T005 | [S08](../sprints/S08/TASKS.md) |
| S08-T007 | S08-T006 | [S08](../sprints/S08/TASKS.md) |

A tabela lista arestas de tarefa; dependências de sprint/aprovação/serviço ficam no PLAN/TASKS e em [ações externas](../external-actions/REQUIRED_ACTIONS.md). Contratos não aprovados bloqueiam implementação. Dados, ambiente e credenciais obrigatórios não se substituem por fakes.
S04 não depende de S05 para geração determinística. IDs antigos não participam neste grafo ativo, exceto antecedente S00-T001; estão preservados em [HISTORY](HISTORY.md).
