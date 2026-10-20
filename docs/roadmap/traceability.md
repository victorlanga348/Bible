# Rastreabilidade e migração de referências

Estado: correspondência documental. Não renumera resultados históricos nem aprova implementação.
[DOC-0001](../tasks/DOC-0001-inicializacao-governanca.md) permanece o registo da inicialização anterior; contagens e árvore nele contidas são um retrato dessa entrega, não o inventário atual.

## IDs anteriores e tarefas novas
| Referência preservada | Tratamento | Tarefas por sprint |
|---|---|---|
| DOC-0001 | Antecedente histórico; não renumerar nem executar novamente | [S00-T001](../sprints/S00/backlog.md) |
| PLAN-001 | Refinamento distribuído por specs e respetivos fluxos | [S01-T001](../sprints/S01/backlog.md), [S04-T001](../sprints/S04/backlog.md), [S06-T001](../sprints/S06/backlog.md) |
| PLAN-002 | Contextos, invariantes e modelo | [S01-T001](../sprints/S01/backlog.md), [S01-T003](../sprints/S01/backlog.md), [S02-T001](../sprints/S02/backlog.md) |
| PLAN-003 | Acesso/retenção e contratos API | [S02-T001](../sprints/S02/backlog.md), [S06-T001](../sprints/S06/backlog.md), [S07-T001](../sprints/S07/backlog.md) |
| PLAN-004 | Fornecedor, modelos e contrato de IA | [S05-T001](../sprints/S05/backlog.md), [S05-T002](../sprints/S05/backlog.md), [S05-T003](../sprints/S05/backlog.md) |
| PLAN-005 | Cânone, versões, licenças e biblioteca | [S03-T001](../sprints/S03/backlog.md), [S03-T002](../sprints/S03/backlog.md), [S03-T003](../sprints/S03/backlog.md) |
| PLAN-006 | Harness, bootstrap e persistência real | [S01-T002](../sprints/S01/backlog.md), [S02-T002](../sprints/S02/backlog.md), [S02-T003](../sprints/S02/backlog.md) |
| PLAN-007 | Recuperação e estudo estruturado integrado | [S03-T002](../sprints/S03/backlog.md), [S04-T002](../sprints/S04/backlog.md), [S04-T003](../sprints/S04/backlog.md), [S05-T002](../sprints/S05/backlog.md), [S05-T003](../sprints/S05/backlog.md) |
| PLAN-008 | Perguntas e histórico, separados por responsabilidade | [S02-T003](../sprints/S02/backlog.md), [S06-T001](../sprints/S06/backlog.md), [S06-T002](../sprints/S06/backlog.md), [S06-T003](../sprints/S06/backlog.md) |
| PLAN-009 | Seleção, navegação e comparação | [S01-T001](../sprints/S01/backlog.md), [S04-T001](../sprints/S04/backlog.md), [S07-T001](../sprints/S07/backlog.md), [S07-T002](../sprints/S07/backlog.md) |
| PLAN-010 | Frontend, UX e integração acessível | [S07-T001](../sprints/S07/backlog.md), [S07-T002](../sprints/S07/backlog.md), [S07-T003](../sprints/S07/backlog.md) |
| PLAN-011 | Operação, deploy, segurança e recuperação | [S08-T001](../sprints/S08/backlog.md), [S09-T001](../sprints/S09/backlog.md), [S09-T002](../sprints/S09/backlog.md), [S09-T003](../sprints/S09/backlog.md) |

PLAN-* eram propostas abrangentes; a relação pode ser um-para-muitos. Não contar o mesmo trabalho como concluído nos dois sistemas.
As specs existentes que citam PLAN-* continuam resolvidas pelo [backlog de entrada](../tasks/backlog.md); manter esses IDs até revisão própria das specs.

## Produto, specs e sprints
| Requisitos | Referência | Planeamento responsável |
|---|---|---|
| PRD-01 e PRD-04 | Seleção/comparação ainda a refinar; SS-001 parcialmente | S01, S04, S07 |
| PRD-02, PRD-03, PRD-05, PRD-09 | SS-001 e BR-01 a BR-08 | S01, S04, S05 |
| PRD-06 | FQ-001 | S06 |
| PRD-07 e PRD-10 | SR-001 e política de fontes/licenças | S03, S05 |
| PRD-08 | SH-001 | S02, S06, S07 |
| PRD-11 | Estados, acessibilidade e recuperação por fluxo | S07, S08, S09 |
| BR-01 a BR-12 | Regras e avaliação epistemológica | Transversal, verificadas nos fluxos afetados |

Specs: [SS-001](../specs/structured-study.md), [FQ-001](../specs/free-questions.md), [SR-001](../specs/source-retrieval.md), [SH-001](../specs/study-history.md).
Todas continuam em rascunho; associação a uma sprint não altera o seu estado.
O [roadmap de produto](../product/roadmap.md) preserva R0–R6 e aponta para o planeamento atual.
