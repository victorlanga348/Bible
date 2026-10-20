# Dependências de sprints e tarefas

Estado: sequência proposta; dependência cumprida não substitui aprovações nem gates.
Responsáveis técnicos, datas e versões ainda não designados.

## Ordem entre sprints
S00 → S01 → S02 → S03 → S04 → S05 → S06 → S07 → S08 → S09.
A entrada numa sprint depende também da aprovação de encerramento da anterior, não apenas da última tarefa DONE.
Esta é uma baseline conservadora. Sobreposição ou reordenação exige plano e aprovação; não autoriza paralelismo implícito.

## Relações entre tarefas
| Tarefa | Predecessoras diretas | Backlog de referência |
|---|---|---|
| S00-T001 | Nenhuma tarefa anterior | [S00](../sprints/S00/backlog.md) |
| S01-T001 | S00-T001 | [S01](../sprints/S01/backlog.md) |
| S01-T002 | S01-T001 | [S01](../sprints/S01/backlog.md) |
| S01-T003 | S01-T002 | [S01](../sprints/S01/backlog.md) |
| S02-T001 | S01-T003 | [S02](../sprints/S02/backlog.md) |
| S02-T002 | S02-T001 | [S02](../sprints/S02/backlog.md) |
| S02-T003 | S02-T002 | [S02](../sprints/S02/backlog.md) |
| S03-T001 | S02-T003 | [S03](../sprints/S03/backlog.md) |
| S03-T002 | S03-T001 | [S03](../sprints/S03/backlog.md) |
| S03-T003 | S03-T002 | [S03](../sprints/S03/backlog.md) |
| S04-T001 | S03-T003 | [S04](../sprints/S04/backlog.md) |
| S04-T002 | S04-T001 | [S04](../sprints/S04/backlog.md) |
| S04-T003 | S04-T002 | [S04](../sprints/S04/backlog.md) |
| S05-T001 | S04-T003 | [S05](../sprints/S05/backlog.md) |
| S05-T002 | S05-T001 | [S05](../sprints/S05/backlog.md) |
| S05-T003 | S05-T002 | [S05](../sprints/S05/backlog.md) |
| S06-T001 | S05-T003 | [S06](../sprints/S06/backlog.md) |
| S06-T002 | S06-T001 | [S06](../sprints/S06/backlog.md) |
| S06-T003 | S06-T002 | [S06](../sprints/S06/backlog.md) |
| S07-T001 | S06-T003 | [S07](../sprints/S07/backlog.md) |
| S07-T002 | S07-T001 | [S07](../sprints/S07/backlog.md) |
| S07-T003 | S07-T002 | [S07](../sprints/S07/backlog.md) |
| S08-T001 | S07-T003 | [S08](../sprints/S08/backlog.md) |
| S08-T002 | S08-T001 | [S08](../sprints/S08/backlog.md) |
| S08-T003 | S08-T002 | [S08](../sprints/S08/backlog.md) |
| S09-T001 | S08-T003 | [S09](../sprints/S09/backlog.md) |
| S09-T002 | S09-T001 | [S09](../sprints/S09/backlog.md) |
| S09-T003 | S09-T002 | [S09](../sprints/S09/backlog.md) |

Estas relações são de trabalho, não aprovações. Estados efetivos pertencem aos backlogs; todas as predecessoras precisam de evidência antes de READY.

## Bloqueios externos
- Specs e contratos em rascunho impedem implementação dependente.
- DEC-07/08: versões, harness e compatibilidade StrykerJS antes de código sujeito a esses gates.
- DEC-04/10: acesso, retenção e dados enviados antes de persistência/exposição/chamadas correspondentes.
- DEC-03/06/09: recuperação, cânone, edições e licenças antes de ingestão/uso dependente.
- DEC-02: fornecedor/modelos antes do adapter real em S05.
- DEC-01: frontend antes da implementação de UI.
- DEC-05: infraestrutura antes de deploy/operação no ambiente escolhido.
Decisão necessária a uma tarefa anterior deve ser antecipada por revisão aprovada do plano, sem criar dependência circular nem esperar que um contrato inventado a resolva.

## Regras de revisão
Ao adicionar dependência, verificar existência do ID e ausência de ciclos; atualizar backlog, README/escopo da sprint e este mapa.
Não bloquear retroativamente a governança de S00 por ferramentas de uma aplicação ainda inexistente.
S04 não depende da execução futura de S05 para o seu escopo de ports; não pode afirmar geração integrada. S05 depende dos contratos preparados em S04.
