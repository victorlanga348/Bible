# S04 — Tarefas

## Preparação vigente — 2026-10-22

Execução delegada pela autorização integral, sem nova aprovação. Sprint IN_PROGRESS, T004/T005 DONE; T006 BLOCKED→READY→IN_PROGRESS, T007 BLOCKED em T006. [SPEC](SPEC.md)/ADR-0005 e fichas aceites pelo agente no âmbito delegado; persistência/versões/adapters/HTTP/CLI agora implementados por RED/GREEN,830 regressões PASS,100% linhas/97,94% branches e operação real no PC comprovada. Mutação integral atual pendente, sem aproveitar score T00588,98% para o novo código. [PLAN](PLAN.md) contém escopo, alternativas, riscos e validação. As disposições de S00 abaixo são históricas; a tabela seguinte contém os estados atuais dos mesmos IDs.

## Rascunho histórico de S00

Fonte canónica. Sprint BACKLOG; nenhuma tarefa de implementação autorizada. A revisão do tema em S00 não aprova spec, contratos, versões ou dependências de execução.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S04-T004 | Aprovar SS-001 e contratos determinísticos de estudo | A/C | Alta | DONE | S02 integral/S03 concluídas, contratos/ADR/JOSE e curadoria confrontados | [Ficha](tasks/S04-T004-contracts.md) |
| S04-T005 | Implementar Study, StudySection, Interpretation e Evidence | A | Alta | DONE | RED/GREEN,667 regressões PASS; mutação própria88,98%, análise preservada | [Ficha](tasks/S04-T005-domain-access.md) |
| S04-T006 | Integrar construção, persistência e versões sem LLM | B | Alta | IN_PROGRESS | T005 concluída/publicada de9d29b; contratos internos e plano antes de RED | [Ficha](tasks/S04-T006-persistence-http.md) |
| S04-T007 | Verificar distinção epistemológica e gates | C | Alta (proposta) | BLOCKED | S04-T006 | [PLAN](PLAN.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
