# S04 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S04-T001 | Aprovar SS-001 e contratos internos de geração/validação | B/A | Alta (proposta) | BACKLOG | S03-T003 | [SS-001](../../specs/structured-study.md); [orquestração](../../ai/orchestration.md) |
| S04-T002 | Implementar regras e casos de uso de estudo por ports | B | Média (proposta) | BLOCKED | S04-T001 | [SS-001](../../specs/structured-study.md), contratos internos pendentes |
| S04-T003 | Validar regras, fontes e persistência sem simular integração de IA | A/B | Média (proposta) | BLOCKED | S04-T002 | [SS-001](../../specs/structured-study.md); [SR-001](../../specs/source-retrieval.md) |

## Impedimentos e aprovação
- S04-T002: SS-001 e contratos de geração/validação por aprovar.
- S04-T003: Casos de uso e respetivos contratos ainda não implementados/aprovados.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
