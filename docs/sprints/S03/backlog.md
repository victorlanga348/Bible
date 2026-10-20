# S03 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S03-T001 | Aprovar cânone, edições, licenças, SR-001 e recuperação | B/A | Alta (proposta) | BACKLOG | S02-T003 | [SR-001](../../specs/source-retrieval.md); [cânone](../../biblical-library/canon-and-versions.md) |
| S03-T002 | Implementar catálogo e recuperação de fontes autorizadas | A/B | Média (proposta) | BLOCKED | S03-T001 | [SR-001](../../specs/source-retrieval.md); contrato de recuperação pendente |
| S03-T003 | Verificar proveniência, cobertura e referências em integração real | B/A | Média (proposta) | BLOCKED | S03-T002 | [SR-001](../../specs/source-retrieval.md); [fundamentação](../../ai/grounding-and-citations.md) |

## Impedimentos e aprovação
- S03-T002: Licenças, SR-001, estratégia e contrato por aprovar.
- S03-T003: Recuperação real e contrato aprovado ainda inexistentes.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
