# S02 — Cânone Bíblico: corpus, domínio e parser

Estado: DONE com escopo reduzido em2026-10-21. Encerramento e adiamento do restante aprovados pelo utilizador: «termina, o que falta vou adicionar depois». Esta decisão substitui o escopo integral anterior apenas para o fecho da S02; requisitos e contratos futuros permanecem documentados, sem implementação presumida.

Entregue: corpus Bíblia Livre/porbr2018 admitido e rastreável; fixtures autênticas; Translation, Book, Chapter, Verse, PassageReference e parser estrutural puros. T004/T005 DONE. Evidência:152 testes PASS, estática/build/tooling aprovados, linhas100%, branches96,62%, mutação global97,21%/Domain98,91%.

Adiado para o utilizador retomar depois: T006 (migração/importação, Application/consultas/navegação/API bíblica) e T007 (aceitação integrada desses comportamentos). Continuam BACKLOG, sem sprint/data futura atribuída, sem PASS de trabalho não executado. Domínio puro não confirma existência de uma passagem no banco.

[PLAN e decisão de escopo](PLAN.md) · [SPEC](SPEC.md) · [TASKS](TASKS.md) · [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md) · [TEST_REPORT](TEST_REPORT.md) · [REVIEW](REVIEW.md).

Commit principal S02 realizado: `c0c24b9f48aba7926dea05207a7263a97b7fc7b0`, `feat(sprint-02): implement biblical canon`, autorizado por «se terminou pode finalizar e ir para a proxima» em2026-10-21. Hash registado posteriormente, sem autorreferência ao commit deste registo. O mesmo pedido autoriza continuar para a preparação S03 após o commit, com contratos/planos detalhados sujeitos a aprovação própria. Sem push/merge. Este encerramento não fornece a integração bíblica de que funcionalidades futuras possam precisar; rever essas dependências no próximo planeamento.

Pergunta de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
