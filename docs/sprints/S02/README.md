# S02 — Cânone Bíblico: corpus, domínio e parser

Estado atual2026-10-22: complemento integral T006/T007 DONE técnico, juntando importação/Prisma/PostgreSQL/navegação e cinco operações HTTP ao corpus/domínio/parser anteriores.551 testes PASS/31 suites,100% linhas/97,47% branches; mutação padrão local95,87% e CI integral95,41%, sem RuntimeError/NoCoverage. Auditoria/limites em [TEST_REPORT](TEST_REPORT.md), [MUTATION_ANALYSIS](MUTATION_ANALYSIS.md) e [REVIEW](REVIEW.md). Encerramento/commit/push delegados, hash registado posteriormente. Nenhuma nova aprovação pendente; S04 é o próximo incremento, ainda não implementado. .env preservado e banco do PC16.14 com corpus integral autêntico, separado dos testes.

## Histórico da retoma e do fecho reduzido

Estado vigente2026-10-22: IN_PROGRESS, complemento T006/T007 retomado pela autorização geral de terminar todas as sprints. T006 tem persistência/importação/consulta e cinco operações HTTP implementadas por TDD e verificadas em PostgreSQL real; gates finais em curso. Regressão atual:526 testes PASS/27 suites, incluindo confronto integral31.102 versículos e HTTP; linhas536/536=100%, branches231/238=97,05%, estática/build/tooling PASS. Mutação integral CI pendente; não há novo DONE. T007 depende do fecho técnico T006. O encerramento reduzido e adiamento de2026-10-21 abaixo são históricos e permanecem identificados pelo commit original. [Execução autorizada](../../roadmap/completion-execution.md).

Estado: DONE com escopo reduzido em2026-10-21. Encerramento e adiamento do restante aprovados pelo utilizador: «termina, o que falta vou adicionar depois». Esta decisão substitui o escopo integral anterior apenas para o fecho da S02; requisitos e contratos futuros permanecem documentados, sem implementação presumida.

Entregue: corpus Bíblia Livre/porbr2018 admitido e rastreável; fixtures autênticas; Translation, Book, Chapter, Verse, PassageReference e parser estrutural puros. T004/T005 DONE. Evidência:152 testes PASS, estática/build/tooling aprovados, linhas100%, branches96,62%, mutação global97,21%/Domain98,91%.

Adiado para o utilizador retomar depois: T006 (migração/importação, Application/consultas/navegação/API bíblica) e T007 (aceitação integrada desses comportamentos). Continuam BACKLOG, sem sprint/data futura atribuída, sem PASS de trabalho não executado. Domínio puro não confirma existência de uma passagem no banco.

[PLAN e decisão de escopo](PLAN.md) · [SPEC](SPEC.md) · [TASKS](TASKS.md) · [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md) · [TEST_REPORT](TEST_REPORT.md) · [REVIEW](REVIEW.md).

Commit principal S02 realizado: `c0c24b9f48aba7926dea05207a7263a97b7fc7b0`, `feat(sprint-02): implement biblical canon`, autorizado por «se terminou pode finalizar e ir para a proxima» em2026-10-21. Hash registado posteriormente, sem autorreferência ao commit deste registo. O mesmo pedido autoriza continuar para a preparação S03 após o commit, com contratos/planos detalhados sujeitos a aprovação própria. Sem push/merge. Este encerramento não fornece a integração bíblica de que funcionalidades futuras possam precisar; rever essas dependências no próximo planeamento.

Pergunta de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
