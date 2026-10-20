# S02 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S02-T001 | Aprovar modelo, acesso, retenção e contratos de persistência/histórico | A/B/C | Alta (proposta) | BACKLOG | S01-T003 | [SH-001](../../specs/study-history.md); [modelo](../../architecture/data-model.md); [API](../../integrations/api-contracts.md) |
| S02-T002 | Preparar NestJS, Prisma, PostgreSQL e migrações reais | A | Média (proposta) | BLOCKED | S02-T001 | Spec técnica de bootstrap a aprovar; [ambientes](../../operations/environments.md) |
| S02-T003 | Implementar repositórios e HTTP de histórico aprovados | A/B | Média (proposta) | BLOCKED | S02-T002 | [SH-001](../../specs/study-history.md) e contratos HTTP ainda não aprovados |

## Impedimentos e aprovação
- S02-T002: Modelo, versões, dependências, plano e contratos necessários pendentes.
- S02-T003: SH-001, política de acesso e contratos HTTP por aprovar.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
