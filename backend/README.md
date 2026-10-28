# Backend Bíblia App

NestJS/TypeScript strict/Zod/OpenAPI/Prisma/PostgreSQL. Cânone bíblico, fontes e estudos privados versionados entregues em S01–S04; integração IA/RAG T006 verificada, T007 IN_PROGRESS para14avaliações reais.

POST /studies/:studyId/ai-analyses, GET/DELETE /ai-analyses/:analysisId implementados com Bearer/owner, fontes atuais autorizadas, citações literais e persistência de referências/proveniência. Não há conversa/S06 nem release de IA aprovado. Sem runtime/índice configurados, criação503; leitura/eliminação próprias continuam disponíveis.

Provas e limitações atuais: [fecho T006](../docs/sprints/S05/T006_COMPLETION_REPORT.md), [relatório](../docs/sprints/S05/TEST_REPORT.md), [contexto breve](../docs/megabrain/agent-context/project-state.md), [operação AI](../docs/integrations/local-ai.md). CI40651025107 passou1706testes/mutação89,94%global88,78%AI/zeroRuntimeError+NoCoverage;14casos T007 ainda NOT_RUN. Histórico de falhas preservado em [arquivo](../docs/megabrain/agent-context/backend-README-history-2026-10-27.md) e TEST_REPORT, sem aceite retroativo.

Comandos operacionais existentes: npm run db:import:ai:dev, npm run ai:index:dev e npm run ai:verify:rag. Só desenvolvimento guardado, originais/admissões operacionais, nenhum override HTTP/modelo/path. Importação não executa modelos. Configuração e pré-requisitos no documento de operação; não executar inferência junto de suites pesadas neste PC8GB.

## Preparação local

CI de mutação usa seis partições com PostgreSQL isolado e agregação estrita de todo o escopo. Operação/limites/provas em [mutation testing](../docs/quality/mutation-testing.md); partição isolada não aprova release.

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

Avalia??o integrada: `npm run ai:evaluate:local` exige os recursos locais reais j? admitidos e n?o aceita overrides. Executa uma tentativa por caso congelado, guarda relat?rio em `reports/ai-evaluation-local-*` (ignorado), verifica isolamento e remove somente as an?lises t?cnicas novas; quatro estudos t?cnicos pr?prios s?o conservados. Resultado REVIEW requer revis?o sem?ntica expl?cita; n?o ? PASS autom?tico.
