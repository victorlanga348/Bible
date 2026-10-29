# Documentação do Bíblia App

Estado2026-10-29: backend S00–S08 tecnicamente verificado para uso pessoal local; [fecho S08](sprints/S08/T007_COMPLETION_REPORT.md), [operação](operations/README.md) e [estado breve](megabrain/agent-context/project-state.md). Auditoria documental final PASS; registos anteriores abaixo são históricos.

Estado histórico2026-10-22: [execução integral autorizada](roadmap/completion-execution.md), sem pausas por novas permissões. [S02 integral](sprints/S02/README.md) concluída tecnicamente:551 testes, mutação padrão95,87% local/95,41% CI, fontes conferidas e auditoria final. S00/S01/S03 também concluídas; S04 é a próxima execução autorizada, com planos preparados e sem código entregue. S04–S08 ainda não estão concluídas. A linha de2026-10-21 a seguir preserva o fecho reduzido anterior.



Fonte normativa e estado real. S00/S01 DONE e commitadas; [S02](sprints/S02/README.md) DONE com escopo reduzido a corpus/domínio/parser por decisão do utilizador, principal `c0c24b9`; integração/API bíblica e IA continuam futuras. [S03](sprints/S03/README.md) DONE, T004–T007 DONE tecnicamente: biblioteca independente com importação/pesquisa/HTTP reais no alvo de teste, revisão integrada e CI local com original verificado. Resultados atuais e limites no [TEST_REPORT](sprints/S03/TEST_REPORT.md). [T007](sprints/S03/tasks/S03-T007-verification.md) aprovada/concluída; encerramento/commit S03 aprovados pelo «pode usar» após revisão final, sem push/merge.

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
