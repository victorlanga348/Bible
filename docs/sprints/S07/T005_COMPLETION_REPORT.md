# S07-T005 — Revisão de referências cruzadas

Estado: DONE técnico2026-10-29. Fonte de produto3b95fc22843b232aa41ea136ae2d56507ffacd01; regressões/harness2ec7918874ebbe29afb32fa738cddf92624e6d0a. CI40827091922 com oito jobs SUCCESS; todos os gates aplicáveis da tarefa aprovados. [Plano e decisões anteriores à implementação](tasks/S07-T005-cross-references.md), [SPEC](SPEC.md).

## Resultado e limites

Quatro operações privadas permitem criar, ler, listar por sobreposição de qualquer extremo e eliminar interpretações entre passagens reais. Classificação pessoal explícita, tipos/leituras coerentes, fundamento e1..4spans reais; persistência guarda metadados/digests/offsets, sem texto das citações. Entrega revalida identidade, integridade e direitos atuais. Owner vem exclusivamente do JWT; proprietário diferente é404. Erros técnicos503 sanitizados, sem causa/SQL/dados pessoais no HTTP ou log. Paginação por data/id e consultas sempre filtradas por owner/edição/intervalo. Nenhuma inferência ou validação teológica automática.

## Evidência

TDD original: domínio47RED→GREEN; paginação3; repositório13; Application18; HTTP19. Falha inicial de helper e ausência da tabela são verificações técnicas preservadas, não RED de comportamento. Migração8/17constraints reais PASS. Testes afetados originais117PASS; regressões de mutação136PASS/7suites,174/174linhas e137/139branches. Regressões adicionais exercitam comportamento já correto e não são apresentadas como RED retroativo. Typecheck/lint/build/arquitetura e83tooling locais PASS. Comandos/logs e falhas originais constam do [relatório](TEST_REPORT.md).

Foundation da CI atual:1976testes/90suites PASS;83tooling PASS;2026/2026linhas100%,1406/1436branches97,91%,2801/2815statements99,50%,496/497functions99,79%. Artefacto backend-quality12877515792, ZIP337598bytes/SHA2564c70f8ed57435e778a2e921f8e1243f14f05fa5a04a95957191c62d9e4a11e40 verificado. Mutações atuais PASS:5758mutantes,3730Killed56Timeout412Survived1560CompileError, zero RuntimeError/NoCoverage; global90,1858027632% e IA89,4138232721%. Recorte relações+paginação89,8734177215%. Agregado SHAfa62cc5ae0b1be9a3cd28984ac3a601de1e427d7571cacab6f34e4486b04748c,95fontes conferidas contra2ec7918. [Revisão de sobreviventes e lacunas S08](MUTATION_REVIEW.md).

A CI anterior40818184684/fonte3b95fc2 falhou corretamente no agregado: seis NoCoverage nos adapters;5758mutantes,3637Killed63Timeout492Survived1560CompileError6NoCoverage, zero RuntimeError. Nenhum score aprovado dessa execução. Regressões posteriores exercitam falhas PostgreSQL reais de Canon/Source, spans persistidos incoerentes, identidade/locators, limites exatos, validações negativas antes de I/O e contratos/logs seguros. Os doubles locais novos são apenas recusas antes de ports; não substituem PostgreSQL/HTTP reais.

Seed completo4a34ddb/CI40695319164/SHAfdc6e0d331a24d195d69cd952b65d0c7f13ab6d9f01953b07c89607a5f37c86d e partições inteiras da execução falhada são entradas incrementais autenticadas; não se misturam IDs nem se transfere aprovação. Fingerprint conhecido21ficheirosc6075e2dde3212ecd1608cd37206a10c6b191004cff015337b59687f98b7700b. Algoritmo, escopo, limiares e gates integrais mantidos. Brutos anteriores preservados sem reclassificação manual.

## Prova nativa e preservação

PG16.14/bible_db, oito migrações aplicadas. Backup custom externo ao Git/OneDrive1417675bytes/SHA030c7d79a61b6dbc94f94206c70e5766299faadf77ade9beb0fc115e3b4cbf3e, pg_restore--list válido; restauração real é tarefa futura S08. Wrapper inicial da migração ficou BLOCKED após Prisma exit0: snapshot canon_verse excedeu statement_timeout2s, confirmado em log do servidor. Original preservado; prazo de produto não alterado. Auditoria independente da migração/preservação PASS, checksum202610290001_cross_reference=6d445ed2932f7b2af4d690e7d859c14d38930bfe76d8206b07ec0c926c2f76b0. [Causa e correção](../../megabrain/errors/ERR-0023-native-snapshot-timeout.md).

HTTP real GEN2:7→GEN2:22, thematic-parallel/textual, dois spans literais de Josefo0..220/584..934. Ambos extremos, GET, owner404, DELETE, citações/atribuição/direitos e cleanup comprovados. Raw imutável reports/s07-cross-reference-local-dKzt9O/report.json continua REVIEW, SHAee8772c8db9aa7e85d0a1bd6434f1799862d14e12883b0ea503aefe12868925e. Revisão semântica separada PASS, SHAfae54d996bc17cc6824c2b4614c618dfa61c3f06bc9a6c89e442e6397b379d32: texto canónico e fonte reais conferidos; interpretação temática limitada do mesmo relato, sem testemunho independente/alegação profética ou factual automática. Decisão de curadoria pertence ao agente delegado.

Snapshots anteriores/posteriores idênticos para todos os registos prévios:66livros1189capítulos31102versos,2fontes8excerpts5links,14estudos15versões, zero análises/conversas; nova cross_reference vazia após limpeza só do recurso técnico criado. Nenhum fixture importado, segredo versionado ou modelo iniciado. Produto src/prisma/admissions/package byte-idêntico3b95fc2 após regressões; prova nativa reutilizada por identidade, sem repetição desnecessária.

## Auditoria modular e gates

Domain puro; Application usa ports próprios; adapters chamam somente CanonLibrary/SourceLibrary públicos. Repositório Prisma lê/escreve apenas cross_reference; sem FK/SQL externo. JSON persistido é revalidado contra as colunas indexadas antes da entrega. Módulo e HTTP reais compostos na aplicação. Nenhuma dependência ou serviço novo. README/contratos/especificação descrevem a função e os limites.

Gates1/2/3/4/5 aprovados com evidências acima; gate6 não aplicável à funcionalidade sem IA, sem alegar avaliação teológica automática. Gate7 PASS: node backend/reports/check-completion-docs.cjs em2026-10-29T06:30:49.836Z,12Markdown85links, zero missing/secretHits/whitespace/prohibited/staged. T005 DONE técnico por autorização vigente, T006 READY para plano/TDD próprios. A S07 ainda não está encerrada.

Pergunta de auditoria: **Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?** Resposta da revisão: nenhuma mudança de produto conhecida omitida; o fecho documental e a auditoria acompanham este incremento. Autorização vigente permite executar o fecho sem nova pergunta ao utilizador.
