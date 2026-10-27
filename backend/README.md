# Backend Bíblia App

S05-T006 IN_PROGRESS: checkpoint Domain011c824 publicado (CI40482111370 ainda em mutação); admissões local-ai/test-ai próprias, configuração protegida, clientes/migrações Prisma separados e storage de análises por owner implementados por testes anteriores. Provas SQL reais:28 constraints/extensão/cosseno,11 casos de storage e lifecycle do cliente AI. Desenvolvimento continua bible_db16.14 intacto + bible_ai17.11/pgvector0.8.7 próprio; só índice dev recebeu migration ai, sem fonte/estudo importado. API/RAG/percurso real/14 avaliações integradas ainda pendentes. [Operação atual](../docs/integrations/local-ai.md), [evidência e limites](../docs/sprints/S05/TEST_REPORT.md). Nenhuma alteração .env/segredo ou dispensa de gates.

Regressão corrente PASS1441/65suites/100%linhas/98,21%branches, estática/build/38tooling/actionlint PASS. Mutação corrente ainda pendente; T006 não encerrada. Notas seguintes históricas.

S05-T005 DONE técnico corrigido: fonte f798f31/CI40471991297 PASS1200testes/100%linhas/98,03%branches/própria90,34%/global90,57% e zeroRuntimeError/NoCoverage. `test:mutation:ai-gate` exige automaticamente o requisito específico. `npm run ai:verify:local` usa modelos/runtime/key em BIBLE_AI_HOME ou %LOCALAPPDATA%/BibleAI e fonte raw admitida; loopback/autenticado/um modelo/sem segredo em argv/logs, sem correr com suites pesadas neste PC8GB. Prova real143,20s permanece válida para produção inalterada. [Fecho/limites](../docs/sprints/S05/T005_COMPLETION_REPORT.md). T006 READY/RAG/persistência/API/14casos ainda não entregues. Encerramento7406a0f foi revogado, não aceito retroativamente.

Fecho S04 verificado2026-10-26: três rotas privadas/versões/owner/direitos implementados e907 testes/46 suites locais/CI40338249693 PASS,100% linhas/97,98% branches; estática/build/23 tooling PASS. Mutação da fonte912c600 global90,6885758998435%, recorte87,70685579196217%, sem RuntimeError/NoCoverage. [Relatório/revisão](../docs/sprints/S04/TEST_REPORT.md), [operação local](../docs/integrations/local-studies.md). S04 DONE; IA/S05 ainda não implementada. PostgreSQL nativo/credenciais preservados, base de teste reconstruída/migrada/verificada separadamente. Notas seguintes históricas.

Estado operacional S04-T0062026-10-23: três rotas privadas de estudos implementadas, persistência/versões/concorrência/direitos atuais com PostgreSQL real e JWT local.907/907 testes/46 suites PASS,114,795s; linhas865/865100%, branches437/44697,98%. Guardas de operações/testes corrigidas para opções de routing/identidades codificadas; build/typecheck/lint e23 tooling verificados. Mutação integral da fonte corrigida ainda pendente, sprint IN_PROGRESS. A regressão integral passa com heap temporário768MB; mutação local repetida esgotou esse teto mesmo com GC/reciclagem, ficou INCOMPLETE sem score e foi transferida à CI, preservando escopo/limiares/deadlines. Banco nativo migrado, fonte operacional dos originais e estudo local-owner em duas versões comprovados por HTTP real; .env intacto. [Operação/token/contratos locais](../docs/integrations/local-studies.md), [relatório](../docs/sprints/S04/TEST_REPORT.md). Notas seguintes históricas.

Fundação NestJS/TypeScript strict/Zod/OpenAPI/Prisma/PostgreSQL da S01, Domain/parser/integração bíblica S02 e biblioteca independente de fontes S03. As três operações de leitura de fontes e cinco operações bíblicas estão implementadas; estudos/IA ainda não. Gates concluídos: [S02](../docs/sprints/S02/README.md) e [S03](../docs/sprints/S03/README.md).551 testes PASS,100% linhas/97,47% branches; mutação padrão95,87% local e95,41% CI, zero RuntimeError/NoCoverage.

S04-T005 concluída2026-10-22: domínio imutável de estudos e infraestrutura JWT/guard implementados,667 testes/34 suites PASS,100% linhas/97,89% branches. Mutação própria88,98%, sem RuntimeError/NoCoverage, sobreviventes e falhas históricas no [relatório](../docs/sprints/S04/TEST_REPORT.md); T006 READY, sprint inteira IN_PROGRESS. Regressão local usa, quando necessário, NODE_OPTIONS temporário --expose-gc --max-old-space-size=512 com test:coverage -- --logHeapUsage; isso limita o processo de testes sem alterar .env, suites ou prazos da aplicação. A configuração valida jwtSecret fornecida não vazia com mínimo32 bytes UTF-8; chave ausente representa acesso privado não configurado. Chave não impressa/modificada. JOSE6.2.13 verifica assinatura/claims e emite perfil local1h; guard nas rotas privadas, CLI operacional e persistência study aguardam T006. GOOGLE_CLIENT_ID não implementa login Google. Estados S03 abaixo históricos; [contrato vigente](../docs/integrations/auth.md).

Atualização2026-10-22: API/importação bíblica foram concluídas no complemento S02, com gates e auditoria finais aprovados tecnicamente. A base local bible_db contém o corpus integral autenticado da Bíblia Livre/porbr2018; fixtures de quatro versículos continuam exclusivas de teste. `GET /translations`, `GET /translations/:translationId/books`, `GET /translations/:translationId/books/:bookCode/chapters`, `GET /translations/:translationId/books/:bookCode/chapters/:chapter/verses` (from/to opcionais juntos) e `POST /references/resolve` seguem a [SPEC](../docs/sprints/S02/SPEC.md). IA/estudos ainda em tarefas seguintes.

Limites do pool:5 ligações, até10s para estabelecer ligação e5s para receber resposta, mantendo statement_timeout SQL em2s. Testes reais por proxy local comprovam ligação lenta, receção do cancelamento do servidor e prazo finito quando as respostas desaparecem; detalhes em [ERR-0010](../docs/megabrain/errors/ERR-0010-database-deadline-race.md). CI usa o script incremental existente no escopo completo, cache invalidado por alterações de harness/config/dependências e limite de job90min; um cache hit não salta a validação. Cancelamento/relatório incompleto continuam a falhar o gate.

Na configuração de mutação, suites integration/E2E usam um advisory lock de sessão PostgreSQL antes dos seus hooks e até depois dos teardowns; unitários puros não adquirem esse lock. Isso mantém as suites destrutivas isoladas quando Stryker10 transfere o token do checker para um segundo runner, mesmo com concurrency1. O coordenador verifica o alvo/identidade biblia_test e identifica a sua sessão, sem alterar tabelas ou prazos da aplicação. Prova com dois processos reais32+32 PASS e detalhes em [ERR-0005](../docs/megabrain/errors/ERR-0005-test-cleanup-isolation.md). Executar suites normais/manual e mutação separadamente no mesmo banco: a coordenação específica do mutador não transforma qualquer comando externo numa execução segura em paralelo.

Preparação reproduzível do corpus de teste: obter o ZIP oficial em `data/biblical-canon/porbr2018/source.zip`, conferir SHA2561f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682 e executar `python scripts/prepare-canon.py`. O JSON derivado pinado é `data/biblical-canon/porbr2018/snapshot.json`. `npm run db:import:canon:test -- data/biblical-canon/porbr2018/source.zip data/biblical-canon/porbr2018/snapshot.json test/fixtures/biblical-canon/porbr2018/manifest.json` exige os três caminhos e o alvo de teste guardado; não é comando de importação de desenvolvimento. CI obtém o mesmo ZIP/hash e prepara o JSON antes das suites. Testes normais/cobertura incluem projeto acceptance obrigatório para confronto integral; mutação mantém todo src e usa casos reais dirigidos de unit/integration/e2e, incluindo fronteira de batch1000/1001.

## Preparação local

Usar Node 24.16.0, npm 11.13.0 e Docker Desktop com motor Linux operacional. Executar os comandos nesta pasta.

```powershell
npm ci --ignore-scripts --strict-peer-deps
npm run prisma:generate
```

Copiar `.env.example` para `.env` e `.env.test.example` para `.env.test`, preenchendo apenas os ficheiros locais ignorados pelo Git. Gerar duas palavras-passe distintas com um gerador seguro. Não as enviar pelo chat nem versionar. Os nomes e alvos são:

| Ficheiro | Variável | Configuração |
|---|---|---|
| .env | NODE_ENV / PORT | development / 3000 |
| .env | BIBLE_DEV_DB_PASSWORD | Palavra-passe local de desenvolvimento |
| .env | BIBLE_TEST_DB_PASSWORD | Palavra-passe local de testes |
| .env | DATABASE_URL | PostgreSQL do PC: localhost:5432/bible_db, schema=app; alternativa Compose: biblia_dev em 127.0.0.1:55432 |
| .env.test | NODE_ENV | test |
| .env.test | TEST_DATABASE_URL | PostgreSQL, utilizador/base biblia_test, 127.0.0.1:55433, schema=app |

As palavras-passe nas URLs devem ser codificadas para URL. Há exemplos sem segredos nos dois ficheiros `.example`. Se o volume de desenvolvimento já existe, mudar a variável não muda a palavra-passe dentro do PostgreSQL.

O utilizador pode apontar `DATABASE_URL` a outro PostgreSQL local; nesse caso, deve provisionar o schema `app` e as migrações nesse alvo num trabalho próprio. Na revisão S03-T007, o `.env` alterado pelo utilizador foi validado; apenas `BIBLE_TEST_DB_PASSWORD` foi sincronizada com a credencial já validada de `.env.test`, evitando divergência quando o container de teste for recriado. Restantes valores preservados; o alvo de desenvolvimento não foi migrado nem recebeu fixtures. As variáveis adicionais de Google/JWT/PostgreSQL não são consumidas pela aplicação atual. Testes mantêm a configuração isolada de `.env.test`, com guard e identidade real antes de escrever.

Atualização EXT-002 em2026-10-22: bible_db criada no PostgreSQL16.14 instalado no PC/porta5432, DATABASE_URL alinhada com schema=app, três migrações existentes aplicadas e conexão/HTTP de leitura verificados. Nenhuma fixture de teste alimenta esse alvo. Os campos POSTGRES_DB/USER/PORT/PASSWORD são dados auxiliares coerentes com a URL; a aplicação usa DATABASE_URL como fonte da conexão, sem interpolação automática. O Compose continua a usar BIBLE_DEV_DB_PASSWORD/BIBLE_TEST_DB_PASSWORD; o serviço Docker de desenvolvimento é uma alternativa e não é o alvo do `.env` atual.

```powershell
docker compose up -d --wait
npm run db:migrate:test
npm run build
npm start
```

O servidor escuta em `127.0.0.1:3000`. `GET /health/live` verifica o processo; `GET /health/ready` executa uma consulta Prisma real e devolve 503 se o banco estiver indisponível. Swagger: `/docs/`; contrato: `/openapi.json`. Ctrl+C encerra HTTP e ligações. Configuração inválida impede o arranque e produz um diagnóstico genérico sem a URL.

A migração de teste recusa alvos inseguros antes de ligar e confirma a identidade no servidor. Não há comando de migração de produção nesta sprint. A migração inicial só estabelece o namespace `app`; a tabela `persistence_probe` é uma fixture técnica criada exclusivamente na base de testes. Não contém textos bíblicos fictícios.

S03 acrescenta `app.source_library_source` e `app.source_library_excerpt`, com constraints próprias e pesquisa lexical inglesa calculada, sem GIN persistente. Na execução S03 só o banco de teste foi migrado; o provisionamento local posterior EXT-002 aplicou as três migrações em bible_db. `npm start` usa desenvolvimento; a base local tem tabelas e catálogo ainda vazio, sem dados de teste. Readiness verifica conectividade e não substitui a verificação das migrações; não há migração automática no arranque.

## Biblioteca de fontes no alvo de teste

Contratos: `GET /sources`, `GET /sources/:sourceId/excerpts?q=God&limit=20&offset=0` e `GET /source-excerpts/:excerptId`. As respostas conservam direitos, créditos, localizações e limitações. A pesquisa encontra palavras no capítulo admitido; não valida afirmações históricas ou associações bíblicas.

Para verificar a admissão, obter o HTML original indicado no [manifesto da fixture](test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json) e conservá-lo no caminho ignorado `data/source-library/josephus-antiquities-pg2848-en/source.html`. O SHA-256 exigido é `098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99`. Um original ausente ou alterado faz o teste/importador falhar; não gerar substituto nem atualizar o hash sem nova admissão. Manifesto, quatro excertos e aviso originais são fixtures versionadas, exclusivas de teste.

```powershell
npm run db:import:sources:test -- data/source-library/josephus-antiquities-pg2848-en/source.html test/fixtures/source-library/josephus-antiquities-pg2848-en/manifest.json test/fixtures/source-library/josephus-antiquities-pg2848-en/excerpts.json test/fixtures/source-library/josephus-antiquities-pg2848-en/NOTICE.source.txt
```

O comando exige os quatro caminhos explícitos, valida hashes contra a admissão fixa e confirma `biblia_test`/utilizador/schema antes de escrever. Importação atómica: mesmo id/hash retorna `unchanged`; hash diferente é conflito sem substituição. Não existe escrita/importação HTTP nem importação de fixture para produção. As suites limpam apenas tabelas do módulo na base de teste e conservam ficheiros reais. Integração, cobertura e mutação exigem também o HTML original provisionado. O CI agora obtém o HTML por HTTPS da URL admitida e verifica o SHA-256 fixo antes das suites; indisponibilidade ou alteração fazem o job falhar. A preparação foi exercitada localmente em T007, incluindo falhas de download/integridade; execução remota continua NOT_RUN.

## Verificação

Para S05 o gate específico `npm run test:mutation:ai-gate` é obrigatório depois da execução integral de Stryker: rejeita qualquer NoCoverage e score próprio ai-assistant<=85%. O cálculo genérico e os estados originais continuam intactos. A CI executa ambos automaticamente; o gate específico aceita caminho de JSON confiável opcional para diagnóstico, sem modificar o relatório.

```powershell
npm run typecheck
npm run lint
npm run build
npm run test:tooling
npm run test:coverage
npm run test:mutation
```

Também existem `test:unit`, `test:integration`, `test:e2e` e `test:architecture`. Os testes de integração/E2E e mutação precisam do PostgreSQL de testes e da migração aplicada. Jest usa `--experimental-vm-modules` para carregar Nest 12; o aviso experimental do Node é esperado e não é um teste aprovado por si só. Stryker executa uma instância de cada vez porque a fixture usa uma única base isolada; não executar duas suites destrutivas concorrentes sobre essa base.

No OneDrive, entradas de diretório podem ser identificadas como links apesar de `stat` reconhecer ficheiros normais. O Jest permite seguir essas entradas; o script `test` desativa Watchman por argumento para propagar a opção aos três projetos, e a configuração de mutação também o desativa. Usar os scripts npm acima preserva essa configuração e evita uma execução com zero testes descobertos.

`npm run test:mutation:incremental` usa o último relatório para reavaliar mutantes afetados por mudanças de testes/código; resultados reutilizados ficam identificados pelo Stryker. O comando padrão `test:mutation`, usado no CI, executa a avaliação integral. Não editar os relatórios para alterar o score.

O cache incremental usa `reports/mutation/incremental.json`, separado do relatório JSON final `reports/mutation/mutation.json`. Usar o mesmo caminho faz dois writers do Stryker escreverem no mesmo ficheiro e pode produzir JSON inválido, como observado na S02. Sem cache válido a primeira avaliação incremental pode ser integral; um relatório anterior válido pode inicializar o cache, conservando a origem e deixando a seleção/reutilização a cargo do Stryker. JSON inválido não aprova o gate, mesmo que o log mostre um score suficiente.

O script incremental encaminha argumentos ao Stryker antes de executar o gate. Para reavaliar trechos estáticos após corrigir o harness/testes, suporta `npm run test:mutation:incremental -- --force --mutate ficheiro:linha-linha`. Stryker preserva no cache os mutantes fora da seleção; não editar estados manualmente. Depois de uma reavaliação dirigida, executar novamente o comando sem argumentos e conferir relatório/escopo completo. Um resultado estático antigo pode ser reutilizado mesmo após novos testes, por não ter cobertura associada a cada teste; não tratar isso como nova prova do cenário corrigido.

Cobertura: `reports/coverage/`; mutação: `reports/mutation/`. Limites: linhas >=90%, branches >=85%, score bruto de mutação >85%; o gate adicional rejeita exatamente 85%, relatórios incompletos e denominador vazio. Código próprio `src/**/*.ts` está no escopo; cliente Prisma gerado fica excluído.

O workflow GitHub Actions prepara um PostgreSQL descartável no runner e executa os mesmos scripts. O serviço efémero de CI usa trust sem uma palavra-passe versionada; essa opção não é usada no Docker Compose local nem serve para deployment. Só uma execução remota comprova o workflow. Não foi feito push nesta sprint.

Para parar os serviços locais, usar `docker compose stop`. A base de testes usa tmpfs e pode perder dados quando o container é recriado; voltar a aplicar a migração. O volume de desenvolvimento é persistente; não executar `down -v` para limpar testes.
