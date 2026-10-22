# Operação local de estudos — S04

Backend pessoal em loopback, PostgreSQL do PC e credenciais em backend/.env ignorado. Configurar NODE_ENV=development, DATABASE_URL PostgreSQL com schema=app e jwtSecret privada com pelo menos32 bytes UTF-8. Preservar os valores existentes; não publicar o ficheiro, chave ou token. Ausência de jwtSecret conserva a leitura pública e fecha as rotas privadas.

Em backend/, os comandos existentes são:

```powershell
npm run db:migrate:dev
npm run sources:prepare -- data/source-library/josephus-antiquities-pg2848-en/source.html data/source-library/josephus-antiquities-pg2848-en/source.txt data/source-library/josephus-antiquities-pg2848-en/operational
npm run db:import:sources:dev -- data/source-library/josephus-antiquities-pg2848-en/source.html admissions/josephus-antiquities-pg2848-en.local.json data/source-library/josephus-antiquities-pg2848-en/operational/excerpts.json data/source-library/josephus-antiquities-pg2848-en/operational/NOTICE.source.txt
```

Preparação requer Python3, biblioteca padrão, e os originais HTTPS identificados na admissão versionada. [HTML oficial](https://www.gutenberg.org/files/2848/2848-h/2848-h.htm), SHA256098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99; [TXT oficial irmão](https://www.gutenberg.org/cache/epub/2848/pg2848.txt), SHA256bb2e32da8ba3adc109b7694e6a8f2f11570462af2bedd55798da70b754c6e440. Alteração da origem exige nova revisão, nunca atualizar o pin para ignorar uma divergência. Diretório data/ ignorado não entra em Git. A preparação deriva quatro parágrafos do HTML e preserva o aviso integral do TXT; não lê fixtures. O manifesto operacional está separado em admissions/. Direitos limitados ao uso local analisado, créditos conservados; sendToAi pending.

Migração/admissão exigem ambiente development explícito, host loopback, schema app único e identidade real correspondente à URL, recusando base/role biblia_test. Migração aplica somente ficheiros pendentes, sem reset. Importação e associação inicial são idempotentes; falha posterior de curadoria pode deixar a fonte já importada, recuperável por repetição, sem promessa de transação entre módulos. Cânone porbr2018/GEN1:1 deve já existir. Associação única é paralelo narrativo de Josefo I.1.1, sem alegar confirmação histórica independente.

Emitir o token na máquina local, sem o colar em logs ou Git:

```powershell
$studyToken = npm run --silent auth:token -- local-owner
```

O comando compila e emite somente o JWT na saída quando --silent é usado; validade1h, issuer biblia-local/audience biblia-backend. Quem tem acesso à chave pode emitir subjects locais; não é um serviço remoto de contas. Manter o mesmo subject para recuperar os próprios estudos. Estudo operacional inicial já guardado em bible_db pertence a local-owner e retém versões1/2. Rodar a chave invalida tokens anteriores após reiniciar; não migra owner nem apaga o histórico.

Arrancar por npm start e usar Bearer no Swagger /docs ou cliente HTTP local. POST /studies recebe translationId/reference; GET /studies/:id recupera a última versão, version opcional seleciona o histórico; POST /studies/:id/versions recebe expectedVersion. Contratos completos na [SPEC S04](../sprints/S04/SPEC.md), OpenAPI servido em /openapi.json. Histórico não regenera; owner alheio404, conflito409. Direitos da fonte são reavaliados na entrega e podem redigir quote/secções dependentes sem apagar o snapshot. Secções sem análise curada declaram insuficiência; esta sprint não chama IA.

Provas reais e limitações atuais no [relatório S04](../sprints/S04/TEST_REPORT.md). O backup app anterior à migração está no diretório local reports/ ignorado; guarda dados reais e não deve ser publicado. A restauração e validação de recuperação são trabalho próprio de S08.
