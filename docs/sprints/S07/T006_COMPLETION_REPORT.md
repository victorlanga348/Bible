# S07-T006 — Workspace e ciclo de vida

Estado: DONE técnico2026-10-29, gates atuais aprovados e fecho delegado autorizado. Produto662c1bc55c7df46ceca5db75ff07994c26e5e358; harness6a5142e37c6f95abe44ae91f4863d995e3f2c483/CI40900841329. [Plano/TDD/decisões](tasks/S07-T006-workspace-lifecycle.md), [SPEC](SPEC.md), [ADR-0008](../../architecture/adr/ADR-0008-short-main-database-write-scope.md).

## Entrega e arquitetura

Dez operações privadas permitem recuperar estudos/conversas, criar/rever/eliminar notas pessoais por CAS, marcar/remover favoritos idempotentes e eliminar o estudo com filhos. Listas limitadas e paginação keyset; favoritos ocultos avançam pela última linha examinada. Anotações guardam versão/createdAt e revisão crescente; proprietário diferente recebe404. Eliminação active→deleting é retomável após503 e termina204 depois das fases proprietárias; relações entre passagens continuam independentes.

Capacidade opaca associa a escrita do filho à mesma transação main do guard do estudo, é revogada em finally e recusa token forjado/expirado/banco diferente. Nenhum SQL de tabela externa, Prisma em Application, segunda conexão de filho, inferência sob lock ou transação distribuída com o índice. Históricos/repositórios atravessam fachadas próprias. Composição de AI ocorre uma vez; a prova nativa confirmou a mesma instância de main Database. Nenhuma dependência nova.

## Provas atuais

TDD causal scope/lifecycle/Study/AI/notas/favoritos/histórico/HTTP e corridas reais está discriminado na ficha. Cobertura dirigida161PASS foi somente recorte; CI corrente executou2133testes/102suites83,516s e83tooling. Typecheck/lint/build/arquitetura PASS; build incluído em db:migrate:test da CI. Cobertura global2290/2290linhas100%,1564/1603branches97,56%,3228/3247statements99,41%,624/625functions99,84%. Artefacto12909088496/381551bytes/ZIP SHAa03a7a33c3a07bfd7da76850f32bd7b914a178f175fe746a0bfa972ad4e2bb0f baixado/verificado.

Gate de mutação corrente PASS nos oito jobs.6540mutantes:4174Killed65Timeout509Survived1792CompileError/zeroRuntimeError+NoCoverage. Global4239/4748=89,27969671440607%; IA2105/2370=88,81856540084388%. [Sobreviventes e lacunas explícitas S08](MUTATION_REVIEW.md). Agregado SHAe755f92db54fca6b80268fb91837ca51170df79487accd6f75c2bd1d3452e062,107fontes mutáveis conferidas contra6a5142e/inventário132fontes. ZIP12910382807/1241032bytes/SHAf212e5b12c1546c95f30aa5553e6f80cce0bf5a9bb2544cb963a8f655df3f39c verificado. Antecessor40886500327 manteve43RuntimeError e falhou corretamente: fixture workspace_note renomeada contaminou outros testes. Cliente de teste finito5s/8s e recuperação guardada corrigidos por5RED→5GREEN/26HTTPPASS. Não alterar estados brutos, limiares, operadores ou escopo. [Falha e recuperação](../../megabrain/errors/ERR-0025-interrupted-workspace-fixture.md).

Migração9 nativa aplicada2026-10-29T14:06:10.359Z/Prisma exit0. Checksum físico CRLF80b3399493090ef15f379833b4c7b23df6e9dc9c96b651b0b7f4d784255aa2b6; blob GitLFc2beeba8704a464a325b90bbf279acf286da090953386fa8cd914c73fff07908; SQL normalizado idêntico, nenhum checksum histórico modificado. Backup externo1422841bytes/SHA3faab910c8d0e5e3477f4a45fdab2bc52d0ff5eee81cb77cff9de63596d910db/pg_restore--list PASS; restauração real fica S08. Dois wrappers originais BLOCKED por snapshots2s; auditoria read-only posterior por PK PASS14tabelas/14estudosactive, sem repetir DDL ou ampliar prazo do produto.

Prova nativa raw r5T0gk permanece REVIEW, SHA cb85ea08fee35cf58c7a4160334cc8a8e7a77bf74a6dd57682147ef1f60c83c5. Cinco checks PASS: estudo privado, nota/CAS/favorito, turno nativo, nova aplicação recuperando tudo sem regenerar e eliminação pública dos filhos. Uma geração real812prompt/11completiontokens,26embeddingtokens, runtime9ff0d7e90/perfil/prompt/modelos/fontes inalterados. Revisão manual separada PASS/SHA30411ebbad39ba061aeb26a63c8d1615dbb5dfa66f76f4f3b89f10e72e968f8c: frasep1-s11/offset1904..2127 identifica diretamente o sétimo dia; atribuição, literalidade e limitações preservadas. GEN1:1 é contexto do estudo, não alegada citação do Sabbath. É prova local pessoal da nova fronteira de commit, sem ampliação de corpus ou alegação de consenso histórico.

Wrapper034bb327… SHA64b88c1ea3deb52a6297cd90f38fd6315e2ed6e575f803ca2fa69274c5ef6211 confirma14hashes main e índice1profile11chunks antes/depois iguais;14estudos15versões anteriores intactos, nenhum filho/processo/lease próprio residual. Raw anteriorSUqPbz FAIL503/d3bc43b5… permanece preservado; causa exata desconhecida. A única repetição técnica foi decidida após readiness real de ambos modelos/índice PASS sem inferência, SHA c2c6b04cd4eef0283debc4da6c6990a753ff75373ddee7e498618c5074059241. OOM local134 também preservado; limite Node512MB temporário permitiu verificações. OneDrive/serviços alheios não foram alterados.

## Gates e fecho

| Gate | Resultado corrente | Base |
|---|---|---|
| 1 | PASS | Autorização integral, SPEC/plano/ADR antes de comportamento |
| 2 | PASS | RED/GREEN causal e regressões reais na ficha |
| 3 | PASS | CI foundation/qualidade/cobertura global acima |
| 4 | PASS | PostgreSQL isolado/NestHTTP/migração nativa/auditoria e persistência real |
| 5 | PASS | Seis shards/agregado, scores e revisão acima |
| 6 | PASS no recorte local | Turno nativo e revisão separada; avaliações inalteradas anteriores por identidade |
| 7 | PASS | Auditoria2026-10-29T15:44:45.606Z/14Markdown98links, zero missing/secretHits/whitespace/prohibited/staged |

T006 encerrada tecnicamente sob autorização integral; S07 permanece IN_PROGRESS até T007 incorporar as provas imutáveis e verificar critérios de sprint sem repetir inferência já válida. Pergunta de auditoria: **Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?** Revisão do diff: nenhuma mudança de produto conhecida omitida; gaps de hardening permanecem explícitos, e o comando documental final é registado antes do commit.
