# S03 — Tarefas

Fonte canónica,2026-10-21. T004–T007 DONE tecnicamente após aprovação dos respetivos planos e evidências reais. Revisão integrada T007:440 testes PASS, gates aplicáveis e documentação verificados; sem IA. Sprint DONE após «pode usar» ao encerramento/commit; commit principal `604c45a29e78b5fb4d705ca4be95cbf77c1bc942`, registado posteriormente, sem push/merge.

| ID | Título preservado | Trilha | Prioridade | Estado | Dependências/escopo proposto | Referência |
|---|---|---|---|---|---|---|
| S03-T004 | Aprovar curadoria, proveniência, direitos e SR-001 | A/C | Alta | DONE | Aceite/admissão do capítulo/aviso/hashes/fixture reais e direitos por operação; SR-001 original preservada, limite semântico explícito | [Plano T004](tasks/S03-T004-curation.md), [SPEC](SPEC.md) |
| S03-T005 | Implementar Source, SourceExcerpt e associações | A | Alta | DONE | T004 DONE/plano aprovado, Domain/regras verificados, mutação nova100%; associações explicitamente adiadas no recorte aprovado | [Plano T005](tasks/S03-T005-domain.md) |
| S03-T006 | Integrar ingestão e pesquisa textual PostgreSQL | B | Alta | DONE | Plano/refinamento aprovados; Application/Prisma/ingestão/pesquisa/HTTP e gates aplicáveis comprovados | [Plano T006](tasks/S03-T006-integration.md), [TEST_REPORT](TEST_REPORT.md) |
| S03-T007 | Verificar evidência real, cobertura e gates | C | Alta | DONE | Plano aprovado; percurso composto real, CI local com hash, gates e documentação verificados; execução remota NOT_RUN | [Plano T007](tasks/S03-T007-verification.md), [TEST_REPORT](TEST_REPORT.md) |

Histórico: T004 BACKLOG → BLOCKED na preparação; «vai enfrente» aprovou pacote/plano, depois READY → IN_PROGRESS → REVIEW → DONE por admissão real. T005 READY → IN_PROGRESS ao RED. Não marcar READY antes dessas aprovações; posterior obtenção/inspeção do corpus precede T005. Uma tarefa por vez, sem subagentes.

Títulos/IDs preservados; recorte de associações expressamente aprovado, sem atribuir DONE a parte ausente. S02-T006/T007 continuam no seu backlog, sem nova sprint/data. IDs001–003 históricos em [HISTORY](../../roadmap/HISTORY.md).

T006: novo «vai enfrente» aceitou plano/refinamento sem GIN; READY → IN_PROGRESS → REVIEW → DONE técnico, com RED/GREEN/refactor,439 regressões e gate de mutação completo99,09%. Não equivale a encerramento da sprint nem execução T007.

T007: «aprovado, e veja que alterei o .env, podes usar e adaptar o que precisares tambem» aceita plano e configuração local; BLOCKED → READY → IN_PROGRESS → REVIEW → DONE técnico,440 regressões e mutação99,09%. Sprint IN_PROGRESS → REVIEW; encerramento/commit aguardam aprovação final e pergunta obrigatória. Uma tarefa de cada vez, sem subagentes.

Encerramento posterior em2026-10-21: «pode usar» após relatório/revisão final e pergunta obrigatória; S03 REVIEW → DONE, commit aprovado. T004–T007 permanecem DONE; S04/push/merge não autorizados.
