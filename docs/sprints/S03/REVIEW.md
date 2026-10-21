# S03 — Revisão final da Biblioteca de Fontes

Data:2026-10-21. Sprint DONE; T004–T007 DONE tecnicamente no recorte aprovado. O «aprovado» posterior aceitou o plano T007 e uso/adaptação necessária do `.env`. Encerramento/commit S03 aprovados pelo «pode usar», após o relatório/revisão final e a pergunta obrigatória de fechamento; sem S04, push/merge ou deployment autorizados. Branch feat/biblia-backend, HEAD ee55c4e, nada staged.

Entregue e verificado: quatro parágrafos autênticos de Josefo/Whiston/Gutenberg2848, proveniência/aviso/direitos/cobertura, Domain puro, Application por ports, duas tabelas/migrações Prisma/PostgreSQL, importador de teste guardado/atómico/idempotente e três operações Nest/Zod/OpenAPI de catálogo/leitura/pesquisa lexical. A prova T007 percorre os quatro artefactos até à resposta HTTP real, sem seed direto. Bloqueios por direitos, ausência e falha real da base permanecem demonstrados na regressão.

[TEST_REPORT](TEST_REPORT.md):440 testes PASS (319 unit/67 integração/54 E2E),21 suites; linhas100%/branches97,07%; typecheck/lint/build/tooling13 PASS. Stryker completo incremental:639 mutantes,524 reutilizados/115 reavaliados,426Killed/9Timeout/4Survived/200CompileError, bruto435/439=99,08883826879271%, zero RuntimeError/NoCoverage. Sobreviventes/timeouts analisados e mantidos; Killed isoladamente97,04%. Fontes/report/cache e quatro hashes admitidos conferidos, sem novas exclusões ou dependências.

CI preparado para obter original por HTTPS e verificar hash fixo antes de testes; execução local do bloco exato demonstrou download real e rejeição de falha/alteração, com limpeza dos temporários. YAML analisado com tooling existente. CI remota NOT_RUN; só uma execução no runner comprovará o workflow completo.

`.env` do utilizador validado. Apenas BIBLE_TEST_DB_PASSWORD sincronizada com `.env.test`/base já validada para manter Compose reproduzível; demais valores preservados, sem exposição de segredos ou recriação de containers. DATABASE_URL de desenvolvimento preservada, sem migração/importação nesse alvo; readiness não atesta schema/acervo. Não foram implementados os campos adicionais Google/JWT/PostgreSQL como funcionalidades.

Gates1/2/3/4/5/7 PASS no recorte aprovado;6 NOT_RUN por não aplicabilidade sem IA. TDD de negócio T005/T006 preservado; T007 acrescenta verificação de configuração e percurso existente, sem simular novo RED. Contratos/modelo/ownership/ADRs revistos, docs/README/MegaBrain/ações/roadmap sincronizados; nenhuma decisão arquitetural nova exige ADR. Varredura de segredos conhecidos/links/diff executada, sem alegação de auditoria universal.

Limites que continuam explícitos: uma obra inglesa/quatro parágrafos, pesquisa lexical sem validação semântica de afirmações, sendToAi pending, sem GIN persistente, associações bíblicas ou IA. S02-T006/T007 continuam adiadas; desenvolvimento/acervo de produção e ampliação do corpus exigem trabalho próprio. Nenhum bloqueio local obrigatório pendente para este recorte.

Pergunta obrigatória de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

Decisão final do utilizador em2026-10-21: «pode usar», após o relatório/revisão final e a pergunta obrigatória de fechamento aprova o encerramento e o commit `feat(sprint-03): implement source library`. Pergunta apresentada na resposta final anterior; a resposta literal foi preservada, sem atribuir declaração adicional sobre alterações ausentes. Sprint REVIEW → DONE. Commit autorizado, hash a registar após criação; sem push/merge ou próxima sprint por inferência.

## Histórico da revisão técnica T006

Data:2026-10-21. T004–T006 DONE tecnicamente; sprint IN_PROGRESS. T007 aguarda aceite do seu [plano](tasks/S03-T007-verification.md). Commit S03 PENDING, encerramento/commit/push/merge não autorizados.

Biblioteca independente implementada: Application por ports próprios, adapter Prisma, duas tabelas/migrações app, leitura de artefactos admitidos e CLI guardado de teste, pesquisa lexical calculada e três rotas Nest/Zod/OpenAPI. Direitos são conferidos antes de materializar texto; o filtro403 próprio preserva a sanitização500 da HttpException403 técnica S01. Importação/rollback/idempotência/concorrência/constraints e recuperação após desconectar o importador foram comprovados no PostgreSQL real.

[TEST_REPORT](TEST_REPORT.md): 439 testes PASS; linhas100%/branches97,07%; mutação bruta99,08883826879271% (435/439), zero RuntimeError/NoCoverage. Typecheck/lint/build/tooling13 PASS. JSON/cache válidos e fontes correspondentes, padrão completo src próprio e639 mutantes conservados. Quatro sobreviventes e dez timeouts analisados; Killed isoladamente96,81%, sem depender de timeouts para ultrapassar85%. Reavaliações descartaram erros de runner/cache e uma deteção ambígua, sem editar estados manualmente ou excluir código.

Limites: uma obra inglesa/quatro parágrafos de um capítulo, sem suporte semântico automático, associação bíblica validada ou IA; sendToAi pending. Sem GIN persistente; ampliação exige rever direitos/desempenho. Só biblia_test foi migrado/importado; desenvolvimento não provisionado. Nenhuma dependência nova.

Gates1/2/3/4/5/7 PASS no recorte T006;6 NOT_RUN por não aplicabilidade sem IA. O original ignorado precisa de provisionamento por hash no runner; T007 prevê CI/revisão integrada, sem executar CI remota ou push por inferência. A sprint ainda não está em encerramento.

Pergunta de fechamento na revisão final: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

## Histórico da revisão T004/T005

Data:2026-10-21. Sprint IN_PROGRESS. SPEC v0.1/recorte/planos T004/T005 aprovados pelo «vai enfrente»; T004/T005 DONE tecnicamente. Commit S03 PENDING; sem encerramento/commit/push/merge autorizado. T006 tem plano/refinamento concreto para aprovação; T007 depende dela.

## Entrega verificada

T004: capítulo1 do Livro I de Josefo/Whiston/Gutenberg2848,4 parágrafos reais, origem/aviso/condições/hashes/localizações e fixture autêntica admitidos. Raw ignorado, fixture só de teste. Usos locais ingest/store/index/display/quote, sendToAi pending; ampliação/IA não resolvidas por inferência. Créditos/integridade/limitações documentados, sem alegação de verdade histórica ou autorização universal.

T005: Source, SourceExcerpt, SourcePermissions, erro próprio e helpers puros. Texto/metadados preservados, estado validado imutável e direitos independentes. Não afirma existência de fonte/posição, calcula hash real ou valida suporte histórico. Sem Application/Prisma/HTTP/SDK, dependência nova, port vazio ou associação bíblica fictícia.

## Evidências e gates

[TEST_REPORT](TEST_REPORT.md): RED137 por comportamento ausente → GREEN137 → regressão289 (265 unit/7 integração/17 E2E), estática/build/tooling13 aprovados. Cobertura global100% linhas/97,52% branches, Domain100%/100%. Stryker:396 mutantes,288 reutilizados/108 novos; global287/293=97,95%, Domain78/78=100%, sem sobrevivente novo. JSON/cache válidos e fontes iguais às18 relatadas;19 ficheiros instrumentados, subtipo de erro vazio não gerou operador mutável e não foi excluído.

Gates1/2/3/5/7 aprovados no recorte T005;4 não aplicável ao Domain sem infraestrutura nova (regressão técnica real passou, sem substituir prova de fontes);6 não aplicável sem IA. Seis sobreviventes/3 timeouts herdados mantidos e analisados, sem manipular denominador. Avisos de preprocessor HTML registados com execução válida; nenhuma instalação/supressão para ocultá-los.

## Pendências concretas

Ingestão, duas tabelas/migração, pesquisa lexical, catálogo/leitura e três contratos HTTP ainda NOT_RUN. [Plano T006](tasks/S03-T006-integration.md) propõe adapters reais/guard/rollback/idempotência/concorrência, schemas e filtro403 específico sem alterar S01.

Refinamento que exige aceite: um GIN automático sobre todo text indexaria também material armazenado com index pending/denied. Proposta para4 excertos é pesquisa calculada só após autorização, adiando GIN persistente; preserva contrato/ranking e custa desempenho em acervo maior. Alternativa com vetor condicionado/ciclo de revogação está explicitada no plano. Nenhuma implementação desse desenho ocorreu; SPEC v0.1 preservada com adenda proposta separada.

Associações fonte-passagem continuam adiadas por contrato real biblical-canon ausente. SR-001 original preservada; suporte semântico SR-AC05 exige avaliação própria S04/S05. Fonte única/inglês/cobertura limitada visíveis, sem texto/fixture gerados nem transferência a IA.

SPEC/PLAN/critério/tarefas, modelo/API, catálogo/ações, índices/roadmap/README/AGENTS/contexto sincronizados. ADRs e S00/S01/S02/specs originais intactos. A sprint não está pronta para encerramento; T006 precisa de aprovação do seu plano/refinamento, não de repetir o aceite de T004/T005.

Pergunta de fechamento quando houver revisão final: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
