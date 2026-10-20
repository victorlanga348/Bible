# S08 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S08-T001 | Aprovar cenários ponta a ponta, ambiente e dados | A/B/C | Alta (proposta) | BACKLOG | S07-T003 | [Specs](../../specs/README.md); plano ponta a ponta a aprovar |
| S08-T002 | Executar percursos reais e tratar defeitos por TDD | A/B/C | Média (proposta) | BLOCKED | S08-T001 | [SS-001](../../specs/structured-study.md), [FQ-001](../../specs/free-questions.md), [SR-001](../../specs/source-retrieval.md), [SH-001](../../specs/study-history.md) |
| S08-T003 | Consolidar evidências e regressões ponta a ponta | A/B/C | Média (proposta) | BACKLOG | S08-T002 | [Gates](../../quality/quality-gates.md); critérios de S08 |

## Impedimentos e aprovação
- S08-T002: Fluxos, ambientes, dados e plano de integração ainda não aprovados/disponíveis.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
