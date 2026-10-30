# S08 — Tarefas

Fonte canónica. Release T004–T007 DONE; S08 BLOCKED apenas no teste real Google de T008, adiado pelo utilizador. Implementação/gates automáticos PASS2026-10-30/CI41078164874. [Adenda de escopo](GOOGLE_AUTH_SPEC.md)/[relatório atual](GOOGLE_AUTH_TEST_REPORT.md). [SPEC anterior](SPEC.md) e [evidência histórica](evidence/release-verification.json).
Responsável/revisor técnico por designar; aprovador inicial: utilizador. Trilhas A domínio/regras, B infraestrutura/integrações, C qualidade/documentação.

| ID | Título | Trilha | Prioridade | Estado | Dependências | Referência |
|---|---|---|---|---|---|---|
| S08-T004 | Aprovar cenários de release, ambiente e critérios mensuráveis | A/B/C | Alta (proposta) | DONE | S07 encerrada; EXT-006 | [Ficha](tasks/S08-T004-release-scenarios.md) |
| S08-T005 | Executar auditorias, regressões reais e recuperação | B/C | Alta (proposta) | DONE | S08-T004 | [Ficha](tasks/S08-T005-hardening-recovery.md) |
| S08-T006 | Executar cobertura, mutação, segurança e avaliações IA | C | Alta (proposta) | DONE | S08-T005; EXT-001/004/005 satisfeitas localmente | [Ficha](tasks/S08-T006-final-gates.md) |
| S08-T007 | Emitir prontidão e documentação operacional | C | Alta (proposta) | DONE | S08-T006 | [Ficha](tasks/S08-T007-release-readiness.md) |
| S08-T008 | Finalizar login Google sobre o acesso local | B/C | Alta | BLOCKED | Código/gates automáticos PASS; falta consentimento e prova de conta Google real | [Ficha](tasks/S08-T008-google-login.md) |

BACKLOG: requer plano detalhado/aprovações de entrada. BLOCKED: predecessora e contrato/dados/ambiente ainda não satisfeitos; desbloquear comprovando essas condições e obtendo aprovação antes de READY. Não confundir aprovação deste planeamento com autorização para instalar/implementar.
Uma tarefa por vez. Estados e execução são distintos: BACKLOG/READY/IN_PROGRESS/BLOCKED/REVIEW/DONE para trabalho; PASS/FAIL/BLOCKED/NOT_RUN para evidência.
Os IDs 001–003 anteriores mantêm título/significado no [histórico](../../roadmap/HISTORY.md), sem execução concorrente. Fichas detalhadas pelo [template](../../tasks/template.md) antes de código.
