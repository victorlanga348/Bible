# S03 — Biblioteca de Fontes

Estado: DONE em2026-10-21. T004–T007 DONE tecnicamente, critérios e gates aplicáveis comprovados. SPEC/recorte/planos T004/T005 e depois plano/refinamento T006 foram aprovados pelos «vai enfrente»; o «aprovado» posterior aceitou o [plano T007](tasks/S03-T007-verification.md) e o uso/adaptação necessária do `.env`. S03 sucede o commit S02 c0c24b9/registo ee55c4e. Encerramento/commit aprovados pelo «pode usar», após o relatório/revisão final e a pergunta obrigatória de fechamento.

Entrega: quatro parágrafos autênticos de Josefo/Whiston/Gutenberg2848, proveniência/permissões/cobertura, Domain puro, importação guardada e atómica, duas tabelas Prisma/PostgreSQL e três rotas de catálogo/excertos/pesquisa lexical. Só biblia_test foi migrado/importado; sem GIN persistente, IA ou associação bíblica validada. S02-T006/T007 continuam adiadas.

[PLAN](PLAN.md) · [SPEC](SPEC.md) · [TASKS](TASKS.md) · [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md) · [TEST_REPORT](TEST_REPORT.md) · [REVIEW](REVIEW.md).

440 testes PASS; linhas100%/branches97,07%; mutação bruta99,08883826879271% (435/439), zero RuntimeError/NoCoverage. Typecheck/lint/build/tooling13 PASS. T007 comprovou o percurso original/manifesto/excertos/aviso → importador guardado → PostgreSQL → HTTP, sem seed direto. Detalhes de reavaliações, sobreviventes e limites no TEST_REPORT; percentagens não demonstram suporte histórico.

CI preparado para obter o original por HTTPS e conferir hash fixo antes das suites; download real e rejeição de falha/alteração verificados localmente. CI remota NOT_RUN. `.env` do utilizador validado, apenas credencial Compose de teste sincronizada; desenvolvimento não provisionado. Encerramento/commit S03 aprovados; commit principal `604c45a29e78b5fb4d705ca4be95cbf77c1bc942`, registado posteriormente; sem push/merge ou S04 autorizados.
