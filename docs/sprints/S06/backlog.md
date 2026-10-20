# S06 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S06-T001 | Aprovar FQ-001, contexto e persistência de perguntas | A/B/C | Alta (proposta) | BACKLOG | S05-T003 | [FQ-001](../../specs/free-questions.md); [SH-001](../../specs/study-history.md) |
| S06-T002 | Implementar perguntas e associação ao estudo/histórico | A/B | Média (proposta) | BLOCKED | S06-T001 | [FQ-001](../../specs/free-questions.md), contrato HTTP pendente |
| S06-T003 | Validar continuidade contextual e novas evidências em integração | B/A | Média (proposta) | BLOCKED | S06-T002 | [FQ-001](../../specs/free-questions.md); [SR-001](../../specs/source-retrieval.md) |

## Impedimentos e aprovação
- S06-T002: FQ-001, retenção e contrato por aprovar.
- S06-T003: Fluxo integrado e critérios específicos ainda não disponíveis.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
