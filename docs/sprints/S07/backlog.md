# S07 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S07-T001 | Aprovar frontend, navegação/comparação e UX acessível | C/B | Alta (proposta) | BACKLOG | S06-T003 | [Explorador](../../pages/passage-explorer.md); [espaço de estudo](../../pages/study-workspace.md); specs detalhadas pendentes |
| S07-T002 | Implementar interface e integração com API real | C | Média (proposta) | BLOCKED | S07-T001 | [Páginas](../../pages/README.md); contratos de UI/API pendentes |
| S07-T003 | Verificar estados, responsividade e acessibilidade | C/A | Média (proposta) | BLOCKED | S07-T002 | [Responsividade](../../design/responsive.md); [acessibilidade](../../audits/accessibility.md) |

## Impedimentos e aprovação
- S07-T002: Frontend, specs de UI, contratos e plano por aprovar.
- S07-T003: UI integrada e critérios/matriz de verificação por aprovar.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
