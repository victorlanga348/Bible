# Documentação do Bíblia App

Fonte normativa e estado real de um backend ainda não implementado. S00 documental DONE: relatório, encerramento e commit aprovados pelo «sim» do utilizador em 2026-10-20. S01 não iniciada; specs em rascunho não autorizam comportamento.

## Entrada
[PRD](PRD.md), [linguagem](glossary.md), [regras](product/business-rules.md), [governança](documentation-governance.md), [stack](architecture/stack.md), [arquitetura](architecture/README.md), [ADRs](architecture/adr/README.md).
[Estado operacional](megabrain/agent-context/project-state.md), [sprints S00–S08](sprints/README.md), [roadmap](roadmap/README.md), [ações externas](external-actions/README.md).

## Fontes por responsabilidade
| Área | Fonte |
|---|---|
| Produto/regras/fontes | [Produto](product/README.md), [biblioteca](biblical-library/README.md) |
| Domínio/arquitetura/modelo | [Contextos](architecture/bounded-contexts.md), [modelo](architecture/data-model.md), [dependências](architecture/dependency-rules.md), [glossário](glossary.md) |
| API e integrações | [Contratos](integrations/api-contracts.md), [integrações](integrations/README.md) |
| IA | [Orquestração/qualidade](ai/README.md) |
| Testes/gates | [Qualidade](quality/README.md) |
| Tarefas/planeamento | [Template](tasks/template.md), [entrada](tasks/README.md), [sprints](sprints/README.md), [rastreabilidade](roadmap/traceability.md) |
| Operação e segurança | [Operações](operations/README.md), [auditorias](audits/README.md), [ações externas](external-actions/REQUIRED_ACTIONS.md) |
| Memória | [MegaBrain](megabrain/README.md) |
| UI adiada | [Design](design/README.md), [páginas](pages/README.md), [componentes](components/README.md), [copy](copywriting/README.md) |

Cada sprint: PLAN/TASKS/ACCEPTANCE_CRITERIA/TEST_REPORT/REVIEW. Fontes existentes são reutilizadas, sem domain/api/development ou segunda árvore de sprints concorrente. TASKS define estado das tarefas, README da sprint define estado da sprint.
Histórico: [DOC-0001](tasks/DOC-0001-inicializacao-governanca.md), [S00-T001](sprints/S00/tasks/S00-T001-atualizacao-governanca.md), [roadmap anterior](roadmap/HISTORY.md).
