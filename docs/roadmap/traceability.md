# Rastreabilidade e evolução do roadmap

Estado2026-10-29: complemento S02-T006/T007 concluído, S00–S07 DONE/S08 DONE técnico; [fecho S08](../sprints/S08/T007_COMPLETION_REPORT.md). Frontend/S09 históricos fora deste ciclo. Correspondências abaixo preservam a migração documental, sem tarefas backend antigas por executar.

IDs anteriores não mudam de significado; títulos/trilhas/estados preservados em [HISTORY](HISTORY.md). A tabela seguinte é correspondência de trabalho, não renumeração retroativa, transferência de aprovação ou prova de execução.

Atualização2026-10-21: encerramento reduzido S02 autorizado pelo utilizador («termina, o que falta vou adicionar depois»). Correspondências para S02-T006/T007 abaixo conservam-se como trabalho adiado no BACKLOG, sem conclusão/transferência para outra sprint; só T004/T005 foram entregues. Fonte de estados: TASKS/README S02.

| Referência anterior | Destino no ciclo backend |
|---|---|
| DOC-0001 | Inicialização histórica preservada |
| S00-T001 | Tarefa histórica DONE preservada; consolidação nova S00-T002 a T007 |
| S01-T001 | S02-T004 (domínio canónico); S04-T004 (regras de estudo) |
| S01-T002 | S01-T004/S01-T005/S01-T008 (toolchain e compatibilidade) |
| S01-T003 | S02-T005; S04-T005 (invariantes por módulo) |
| S02-T001 | S01-T004 (contratos técnicos); S06-T004/S07-T004 (dados pessoais/histórico) |
| S02-T002 | S01-T006/S01-T007 (NestJS/persistência) |
| S02-T003 | S07-T006 (workspace/histórico) |
| S03-T001 | S02-T004 (cânone); S03-T004 (fontes) |
| S03-T002 | S02-T006 (importação bíblica); S03-T005/S03-T006 (biblioteca) |
| S03-T003 | S03-T007 (proveniência) |
| S04-T001 | S04-T004 |
| S04-T002 | S04-T005/S04-T006 |
| S04-T003 | S04-T007 |
| S05-T001 | S05-T004 |
| S05-T002 | S05-T005/S05-T006 |
| S05-T003 | S05-T007 |
| S06-T001 | S06-T004 |
| S06-T002 | S06-T005/S06-T006 |
| S06-T003 | S06-T007 |
| S07-T001 | Frontend adiado; contratos backend tratados em S02/S04/S07 |
| S07-T002 | Frontend adiado, fora do ciclo backend |
| S07-T003 | Frontend/acessibilidade de interface adiados |
| S08-T001 | S08-T004 |
| S08-T002 | S08-T005/S08-T006 |
| S08-T003 | S08-T007 |
| S09-T001 | S08-T004 |
| S09-T002 | S08-T005/S08-T006 |
| S09-T003 | S08-T007 |

## Referências PLAN preservadas

| ID | Intenção histórica e destino de refinamento |
|---|---|
| PLAN-001 | Specs/fluxos: S02, S04, S06 |
| PLAN-002 | Contextos/modelo: S00, S02, S04 |
| PLAN-003 | Acesso/contratos: S01, S06, S07 |
| PLAN-004 | Fornecedor/modelos/avaliações: S05 |
| PLAN-005 | Cânone/licenças/fontes: S02, S03 |
| PLAN-006 | Harness/backend/persistência: S01 |
| PLAN-007 | Recuperação/estudo: S03, S04, S05 |
| PLAN-008 | Perguntas/histórico: S06, S07 |
| PLAN-009 | Navegação/comparação/relações: S02, S04, S07 |
| PLAN-010 | Frontend/UX: adiado fora do ciclo backend |
| PLAN-011 | Operação/segurança/release: S08 |

## Requisitos e specs

PRD-01 → S02; PRD-02/03/05/09 → S04/S05; PRD-04 → S04/S07; PRD-06 → S06; PRD-07/10 → S03/S05; PRD-08 → S07; PRD-11 conserva o frontend adiado, com erros/contratos HTTP tratados no backend. BR-01 a BR-12 são transversais.
SS-001 → S04/S05; FQ-001 → S06; SR-001 → S03/S05; SH-001 → S07 e persistência contextual em S06. As [quatro specs](../specs/README.md) continuam em rascunho; nenhuma foi alterada ou aprovada por esta migração.
