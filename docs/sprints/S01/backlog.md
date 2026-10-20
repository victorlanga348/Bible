# S01 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S01-T001 | Refinar e aprovar regras, contextos e specs de domínio | B | Alta (proposta) | BACKLOG | S00-T001 | [Regras](../../product/business-rules.md); [specs](../../specs/README.md) em rascunho |
| S01-T002 | Validar toolchain e compatibilidade de StrykerJS | A/B | Média (proposta) | BLOCKED | S01-T001 | Spec técnica a aprovar; [mutação](../../quality/mutation-testing.md) |
| S01-T003 | Implementar invariantes e políticas de domínio aprovadas | B | Média (proposta) | BLOCKED | S01-T002 | Spec de domínio detalhada a aprovar; [metodologia](../../product/study-methodology.md) |

## Impedimentos e aprovação
- S01-T002: Versões, dependências e plano técnico ainda não aprovados.
- S01-T003: Specs, contratos internos, plano e harness ainda não aprovados/validados.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
