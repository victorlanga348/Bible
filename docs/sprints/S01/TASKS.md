# S01 — Tarefas

Fonte canónica. Sprint DONE em 2026-10-21. Execução técnica local concluída e revisão/escolhas técnicas/encerramento/commit aprovados pelo utilizador: «segunda sprint aprovada, continue com a proxima apos o commit». Início/execução autorizados em 2026-10-20, Docker Desktop local escolhido e orientação para criar backend/. Todos os gates aplicáveis cumpridos; seis tarefas abaixo DONE.
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S01-T004 | Aprovar contratos técnicos, matriz de versões e isolamento | B/C | Alta | DONE | S00 encerrada/commitada; execução autorizada; escolhas SPEC aceites na revisão final | [SPEC](SPEC.md) |
| S01-T005 | Preparar toolchain, harness e fiscalização arquitetural | B/C | Alta | DONE | Ferramentas instaladas; 13 checks aprovados; descoberta OneDrive corrigida e Stryker/Jest reais comprovados | [TEST_REPORT](TEST_REPORT.md) |
| S01-T006 | Compor NestJS, configuração, OpenAPI, erros e logging | B | Alta | DONE | Configuração e HTTP reais executados; revisão técnica aceite | [TEST_REPORT](TEST_REPORT.md) |
| S01-T007 | Implementar persistência técnica e migrações reais | B | Alta | DONE | PostgreSQL real, migração reaplicada após tmpfs recriado e sete integrações aprovadas | [TEST_REPORT](TEST_REPORT.md) |
| S01-T008 | Verificar HTTP real, cobertura, mutação e CI | C | Alta | DONE | 60 testes Jest aprovados; mutação integral95,93% analisada; workflow configurado, execução remota NOT_RUN | [TEST_REPORT](TEST_REPORT.md) |
| S01-T009 | Consolidar evidências e solicitar revisão | C | Alta | DONE | Documentação/relatório/revisão sincronizados; checks executados e aceitação final recebida | [REVIEW](REVIEW.md) |

BLOCKED identifica uma dependência ainda não satisfeita; REVIEW não equivale a DONE nem a aprovação de encerramento/commit. Sem implementação de sprints posteriores.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
