# S06 — Tarefas

Estado2026-10-28: S06 IN_PROGRESS; S05 satisfeita1b19623. T004 IN_PROGRESS→REVIEW→DONE documental após auditoria, [SPEC](SPEC.md) aceite pelo agente delegado antes de código. T005 READY para domínio/contexto, T006/T007 dependentes. Nenhum teste/implementação S06 presumido PASS. Entradas seguintes históricas.

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S06-T004 | Aprovar FQ-001, contexto, acesso e retenção | A/C | Alta (proposta) | DONE | S05 encerrada; EXT-005 | [SPEC](SPEC.md) |
| S06-T005 | Implementar conversas, mensagens e controlo de contexto | A | Alta (proposta) | READY | S06-T004 | [Ficha](tasks/S06-T005-conversation-domain.md) |
| S06-T006 | Integrar perguntas livres, persistência e evidências | B | Alta (proposta) | BLOCKED | S06-T005 | [PLAN](PLAN.md) |
| S06-T007 | Verificar conversas reais, referências e gates | C | Alta (proposta) | BLOCKED | S06-T006; EXT-001 | [PLAN](PLAN.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
