# S05 — Tarefas

Tarefa ativa2026-10-27: T006 READY→IN_PROGRESS após fecho T00541d1e6a40eaadd57dd32db74ba0b13a8331d04e3 publicado/CI40471991297 com zeroRuntimeError+NoCoverage. [Ficha/plano anterior ao código](tasks/S05-T006-rag-persistence-http.md), decisões delegadas do agente; primeiro incremento de segmentação pura por TDD. T007 continua BLOCKED em T006, S05 IN_PROGRESS, sem agentes/nova permissão. Histórico seguinte preservado.

Transição vigente após provas/revisão/auditoria documental: T004 IN_PROGRESS→REVIEW→DONE delegado; T005 BLOCKED→READY. Só T005 poderá ficar ativa depois do seu plano concreto, sem tarefa/agente paralelo. Viabilidade v6dez casos/perfil cf125651… não é implementação nem gate integrado S05; T006/T007 mantêm dependências.

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S05-T004 | Aprovar fornecedor, modelos, embeddings, orçamento e rubrica | A/B/C | Alta | DONE | S04 encerrada90241d5; protocolo/pgvector/desenvolvimento/10casos/perfil/contratos/direitos/auditorias reais | [Ficha](tasks/S05-T004-feasibility-contracts.md) |
| S05-T005 | Implementar ports, adapter real, limites e falhas | B | Alta | DONE | S05-T004 DONE/9ba970a, plano registado antes de código | [Ficha](tasks/S05-T005-provider.md) |
| S05-T006 | Integrar pgvector, recuperação e citações verificáveis | B | Alta | IN_PROGRESS | S05-T005 DONE/41d1e6a/zeroNoCoverage, plano prévio | [Ficha](tasks/S05-T006-rag-persistence-http.md) |
| S05-T007 | Executar integração real, avaliações e gates | C | Alta (proposta) | BLOCKED | S05-T006; recursos locais reais já disponíveis; plano apenas preparado, sem execução | [Ficha](tasks/S05-T007-integrated-evaluation.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
