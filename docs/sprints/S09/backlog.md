# S09 — Backlog

Prioridades propostas, sem datas. Responsáveis/revisores por designar, exceto agente executor da operação documental S00-T001.
BACKLOG indica refinamento ainda não iniciado; BLOCKED identifica impedimentos conhecidos, não trabalho já executado.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Spec correspondente |
|---|---|---|---|---|---|---|
| S09-T001 | Aprovar critérios de MVP, ambiente e auditorias | A/B/C | Alta (proposta) | BACKLOG | S08-T003 | [PRD](../../PRD.md); [segurança](../../audits/security.md); [acessibilidade](../../audits/accessibility.md) |
| S09-T002 | Executar hardening, regressão e recuperação autorizados | A/B/C | Média (proposta) | BLOCKED | S09-T001 | [Auditorias](../../audits/README.md); [runbooks](../../operations/runbooks.md) |
| S09-T003 | Emitir relatório de prontidão e solicitar encerramento | Transversal | Média (proposta) | BACKLOG | S09-T002 | [Gates](../../quality/quality-gates.md); critérios de S09 |

## Impedimentos e aprovação
- S09-T002: Deploy/ambiente, critérios, planos de correção e operação por aprovar.
Specs ligadas mantêm o seu estado real; referência não significa aprovação. Spec técnica/detalhada indicada como pendente precisa de documento e aprovação antes de READY.
Antes de executar, criar ficha detalhada pelo [template](../../tasks/template.md), com critérios e plano aprovados.

## Gestão
Atualizar este backlog e a ficha da tarefa de forma consistente. Estados permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Conclusão de tarefa depende dos [sete gates](../../quality/quality-gates.md); dependências externas e aprovação de sprint continuam a aplicar-se.
Relação com IDs anteriores: [correspondência](../../roadmap/traceability.md).
