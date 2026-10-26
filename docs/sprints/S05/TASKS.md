# S05 — Tarefas

Estado vigente2026-10-26: IN_PROGRESS, S05-T004 READY→IN_PROGRESS, depois de S04 encerrada/publicada90241d5. Plano/decisões preparatórias registados antes de instalar; execução delegada sem nova permissão. T005/T006/T007 permanecem BLOCKED nas predecessoras. Texto de S00 seguinte histórico.

Transição vigente após provas/revisão/auditoria documental: T004 IN_PROGRESS→REVIEW→DONE delegado; T005 BLOCKED→READY. Só T005 poderá ficar ativa depois do seu plano concreto, sem tarefa/agente paralelo. Viabilidade v6dez casos/perfil cf125651… não é implementação nem gate integrado S05; T006/T007 mantêm dependências.

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S05-T004 | Aprovar fornecedor, modelos, embeddings, orçamento e rubrica | A/B/C | Alta | DONE | S04 encerrada90241d5; protocolo/pgvector/desenvolvimento/10casos/perfil/contratos/direitos/auditorias reais | [Ficha](tasks/S05-T004-feasibility-contracts.md) |
| S05-T005 | Implementar ports, adapter real, limites e falhas | B | Alta | READY | S05-T004 DONE, plano próprio antes de código | [PLAN](PLAN.md) |
| S05-T006 | Integrar pgvector, recuperação e citações verificáveis | B | Alta (proposta) | BLOCKED | S05-T005 | [PLAN](PLAN.md) |
| S05-T007 | Executar integração real, avaliações e gates | C | Alta (proposta) | BLOCKED | S05-T006; credenciais autorizadas | [PLAN](PLAN.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
