# S05 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S05-T001 | Aprovar fornecedor/modelos, contrato e avaliação da IA | B/A | Alta (proposta) | BACKLOG | S04-T003 | [Fornecedor](../../integrations/llm-provider.md); [avaliação](../../ai/evaluation.md) |
| S05-T002 | Implementar adapter real e validação de respostas | A/B | Média (proposta) | BLOCKED | S05-T001 | [SS-001](../../specs/structured-study.md); contrato de IA pendente |
| S05-T003 | Executar integração real e avaliações de fundamentação | B/A | Média (proposta) | BLOCKED | S05-T002 | [Avaliação](../../ai/evaluation.md); [fontes/citações](../../ai/grounding-and-citations.md) |

## Impedimentos e aprovação
- S05-T002: Fornecedor, contrato, dados e orçamento por aprovar.
- S05-T003: Adapter, corpus/rubrica e critérios de avaliação ainda não disponíveis/aprovados.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
