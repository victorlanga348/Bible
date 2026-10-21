# S01 — Relatório de testes

Data inicial: 2026-10-20; continuação/validação e aprovação final: 2026-10-21. Windows/PowerShell, Node 24.16.0/npm 11.13.0, Docker Desktop Linux 29.7.2, PostgreSQL 17.11. Branch feat/biblia-backend; base Git b458c0b. STATUS: DONE, após aprovação do utilizador «segunda sprint aprovada, continue com a proxima apos o commit». Revisão/escolhas técnicas/encerramento/commit aceites. COMMIT: AUTORIZADO; hash a registar após criação, sem autorreferência impossível.

## Execuções comprovadas

Comandos a partir de backend/, salvo Git. RTK 0.43.0 instalado: primeiras execuções nativas npm.cmd preservaram saídas completas de diagnóstico; posteriores usaram rtk npm run. Scripts só foram executados depois de criados no package.json.

| Comando | Resultado | Evidência |
|---|---|---|
| npm install --ignore-scripts --no-audit --no-fund --strict-peer-deps --loglevel=error | PASS | Instalação concluída; tentativa anterior interrompida não foi contada como sucesso |
| npm ls --depth=0 | PASS | Dependências diretas fixadas, exit 0 |
| docker compose up -d --wait | PASS | postgres-dev e postgres-test saudáveis, portas 55432/55433 em loopback |
| npm run prisma:generate | PASS | Prisma Client 7.10.1 gerado sem modelos |
| npm run db:migrate:test | PASS | Identidade validada; migração 202610200001_bootstrap_namespace aplicada em biblia_test/app |
| npm run test:unit | PASS | 26 testes iniciais; suite agregada posterior inclui 34 de configuração/proteção do alvo |
| npm run test:integration | PASS | 6 iniciais; suite agregada posterior inclui 7 reais, acrescentando encerramento físico da sessão |
| npm run test:e2e (suites individuais e agregada) | PASS | 16 testes HTTP/arranque, NestJS e Supertest reais |
| npm run test:coverage / rtk npm run test:coverage | PASS | Baseline 48 testes, linhas100%/branches87,27%; após regressões de mutação: 5 suites, 57 testes, linhas100%/branches94,54%, funções/statements100% |
| npm run typecheck / rtk npm run typecheck | PASS | Zero erros após acertar formato de módulos |
| npm run build | PASS | Compilação strict concluída em backend/dist |
| npm run lint | PASS | Zero erros/avisos; require permitido apenas nos ficheiros CommonJS |
| rtk npm run test:tooling | PASS | 13 verificações node:test de arquitetura e score estrito |
| rtk git check-ignore (env, dependências e cliente gerado) | PASS | .env/.env.test/node_modules/src/generated ignorados |
| Parsing YAML com js-yaml já instalado | PASS | Workflow lido; serviço biblia_test e permissions contents:read verificados. Não é execução GitHub |
| npm start + Invoke-RestMethod/Invoke-WebRequest | PASS | Processo compilado: readiness 200 {status:ok,database:up}, OpenAPI3.0.0 com duas rotas e Swagger200; processo terminado após a verificação |
| npm audit --omit=dev --json | PASS | Zero vulnerabilidades conhecidas nas dependências de produção, na consulta de 2026-10-20 |
| Inspeção local de credenciais (Node/fs + git diff/ls-files) | PASS | 46 ficheiros pendentes verificados sem correspondências às credenciais locais, URLs com palavra-passe ou blocos de chave privada; não é auditoria universal de segredos |
| git diff --check e diff --exit-code dos artefactos históricos | PASS | Sem erros de whitespace; specs de negócio, S00/DOC-0001 e ADR-0001/0002 sem alterações |
| Validação de links Markdown relativos pendentes | PASS | 21 documentos verificados; repetir apenas se houver novos caminhos/links |
| rtk npm run test:mutation | FAIL | Execução integral: 172 mutantes; Killed95/Timeout4/Survived22/NoCoverage2/CompileError49. Bruto 99/123 = 80,487804878%, abaixo do gate; exit1 |
| rtk npm run test:mutation:incremental (2026-10-20; resultado recuperado em 2026-10-21) | PASS | 172 mutantes: Killed112/Timeout2/Survived9/CompileError49; sem NoCoverage/RuntimeError/Pending. Bruto 114/123 = 92,6829268292683%. Log confirma conclusão em 4min4s; node scripts/check-mutation.cjs executado em 2026-10-21, exit0. Fontes do relatório comparadas com src: zero diferenças |
| rtk docker compose ps / up -d --wait (2026-10-21) | PASS após iniciar Docker Desktop | Motor estava parado; ambos os serviços locais iniciados e saudáveis. Primeira tentativa no sandbox não acedia à configuração Docker; execução autorizada fora do sandbox distinguiu motor parado de permissão |
| rtk npm run db:migrate:test (2026-10-21) | PASS | Base de teste tmpfs recriada após paragem: alvo/identidade protegidos e migração reaplicada com sucesso |
| rtk npm run test:coverage (2026-10-21, configuração final) | PASS | 5 suites/60 testes: 36 unitários, 7 integrações PostgreSQL/Prisma reais e 17 HTTP/arranque; linhas81/81=100%, branches52/55=94,54%, funções14/14=100%, statements92/92=100% |
| rtk npm run lint / typecheck / build / test:tooling (2026-10-21) | PASS | Zero erros de lint/typecheck; build strict aprovado; tooling13/13, incluindo arquitetura7/7 e score6/6 |
| rtk npm run test:mutation (2026-10-21, integral final) | PASS | 172 mutantes, 6 ficheiros próprios; Killed115/Timeout3/Survived5/CompileError49, NoCoverage0/RuntimeError0/Pending0. Bruto118/123 = 95,9349593495935%; gate inteiro adicional aprovado, exit0. Dry run60 PASS; duração12min57s; fontes do relatório iguais às fontes atuais |
| npm run test:coverage (tentativas anteriores à correção da descoberta, 2026-10-21) | FAIL | Zero ficheiros descobertos no OneDrive; reproduzido com RTK, npm.cmd nativo, sem cache e fora do sandbox. Não foi sucesso nem RED de comportamento; causa/correção abaixo |
| Inspeção local Node/fs + git diff/ls-files e parsing js-yaml (2026-10-21) | PASS | Ficheiros pendentes inspecionados sem credenciais locais/URLs com palavra-passe/chaves privadas; links relativos e estrutura do workflow verificados. Contagens finais na validação documental abaixo; limites do scanner mantidos |
| Workflow remoto GitHub Actions | NOT_RUN | Sem commit/push autorizado; só configuração local preparada |

Artefactos: backend/reports/coverage/coverage-summary.json e lcov.info; backend/reports/mutation-attempt-01.json preserva a primeira execução integral falhada; backend/reports/mutation-attempt-02.json preserva a incremental aprovada. Nova avaliação integral em backend/reports/mutation/mutation.json e mutation.html; diagnóstico em backend/stryker.log. Gerados ignorados pelo Git; este relatório preserva resultados. Código próprio src/**/*.ts no escopo, cliente Prisma gerado excluído; sem Domain/Application de negócio nesta sprint.

## RED → GREEN → REFACTOR

| Comportamento/tarefa | RED realmente executado | GREEN / regressão |
|---|---|---|
| S01-T005: score bruto estrito | test:tooling: 6 falhas por Not implemented | 6/6 após contagem e rejeição de 85% exatos/denominador vazio/estados incompletos |
| S01-T005: fronteiras/ciclos | test:architecture: 6 falhas por Not implemented | 6/6 após AST/grafo; regressão com fontes reais |
| S01-T005: barrels proibidos | test:architecture: 1 falha, 6 PASS (0 violações em vez de 1) | 7/7 após incluir fim de caminho nas regras; tooling 13/13 |
| S01-T006: configuração/isolamento | test:unit: 26 falhas por Not implemented | 26/26; corrigido refinamento Zod que lançava Invalid URL em vez de erro sanitizado |
| S01-T006: saúde/OpenAPI/404 | test:e2e: 6 falhas por rotas ausentes e erro HTTP padrão | 6/6 após Nest/Prisma/Swagger/filtro |
| S01-T006: entrada/erros/log | test:e2e -- --testPathPatterns=transport: 7 falhas/1 PASS; entrada inválida retornava 201 e filtro não distinguia erros | 8/8 com pipe StandardSchema/Zod e log sanitizado; controller técnico só na suite |
| S01-T006: arranque/encerramento | test:e2e -- --testPathPatterns=startup: 2 falhas por Not implemented | 2/2; bind real loopback/porta efémera e EADDRINUSE real com libertação de recursos |
| S01-T007: configuração/migração | Verificação real falhou com schema app inexistente | Migração aplicada e 6/6 integrações; tarefa estrutural, sem alegar RED de negócio |

Refatorações: configureTransport partilhada por app e suite técnica; Standard Schema nativo do Nest para Zod/OpenAPI sem adaptador extra; módulos Node20 preservando CommonJS com dependências ESM. Suite agregada após alterações: 48/48. A correção posterior dos barrels passou 13/13 checks de tooling e não alterou src de produção.

Após o primeiro Stryker, acrescentados nove testes de regressão e asserções em casos existentes: protocolos com prefixo/sufixo indevido, aliases IPv4/IPv6/localhost e portas implícitas, bases de desenvolvimento distintas, fecho de sessão via pg_stat_activity, metadados OpenAPI e registo/remoção de SIGTERM. São reforços orientados pelos mutantes sobreviventes; não se apresentam como RED original de funcionalidades já implementadas. Produção src não mudou nesta iteração. Nova suite57/57, cobertura100%/94,54%, lint/typecheck novamente aprovados.

Na continuação de 2026-10-21, análise dos nove sobreviventes levou a mais três casos: aceitação explícita dos três aliases locais permitidos (substitui um teste por três) e mapeamento de HttpException403 para o erro500 sanitizado previsto no contrato técnico (controller apenas de teste). Suite final60/60; src de produção preservado. São reforços de regressão sobre comportamento existente, sem alegação de RED original. Configuração do harness foi corrigida com verificação executável: descoberta falhava com zero ficheiros; após correção, cinco suites/60 testes executados e aprovados, sem avisos de configuração.

## Falhas encontradas e corrigidas

- TS6 exigiu rootDir; Node16 recusou imports ESM do Nest. Corrigidos rootDir/module Node20. Falhas de ambiente não contadas como RED.
- Jest precisou de VM modules; loadEnvFile não atualizou a cópia de process.env da sandbox Jest. Setup usa parseEnv sem imprimir valores.
- Prisma recusou --allow-no-models; gerar sem a opção funcionou. Migração importa JS compilado e sobrepõe explicitamente o ficheiro de teste, evitando NODE_ENV=development herdado.
- Uma integração começou antes de a migração terminar e voltou a encontrar schema ausente; a execução posterior à migração com exit 0 passou 6/6. Tentativa concorrente não é evidência de sucesso.
- Stryker não encontrou testes por glob Windows no sandbox; depois faltou resolver jest-environment-node. Glob relativo e dependência explícita corrigiram; novo dry run passou 48 testes. Resultados de mutação separados na tabela de execuções.
- A primeira avaliação integral ficou em 80,49%: não aprovada. Os testes expuseram cobertura insuficiente das comparações de segurança e do encerramento físico; regressões acrescentadas. A incremental passou92,68%; a integral final passou95,93%. Reaproveitamento incremental foi feito pelo próprio Stryker; a aceitação técnica final usa a nova execução integral, sem editar resultados nem retirar ficheiros/operadores.
- Sandboxes preservadas de tentativas falhadas causaram avisos de nomes de package duplicados no Jest. Roots limitadas a src/test evitam explorar diretórios temporários, sem eliminar testes ou mutantes.
- OneDrive: readdirSync com withFileTypes identificou ficheiros como links, enquanto lstat/stat/realpath os reconheceram como ficheiros normais. O crawler Jest ignorava-os: zero ficheiros descobertos, mesmo fora do sandbox e sem cache. haste.enableSymlinks=true resolveu; Watchman desativado no argumento do script test (propaga-se aos três projetos) e no config de mutação. A opção apenas na raiz não chegava à validação dos projetos; colocá-la dentro de cada projeto produzia avisos, removidos na configuração final. Cobertura60/60 comprova a correção. Não se atribui este incidente a RTK nem a permissões.
- Duas invocações de lint/typecheck foram feitas por engano na raiz sem package.json e falharam ENOENT; não são resultados do backend. Reexecutadas em backend/ com sucesso. npm.cmd nativo foi usado para diagnosticar a descoberta do Jest, sem atribuir incompatibilidade a RTK. Nenhuma dependência foi instalada/alterada nesta continuação.

## Mutação: análise integral final

Responsável pela análise: agente executor, S01-T008; revisão/aceitação do utilizador recebida em 2026-10-21. Todos os cinco sobreviventes continuam no denominador; nenhuma exclusão adicional, supressão de operador ou equivalência presumida foi usada para aumentar o score. IDs abaixo pertencem ao JSON final, não se devem transportar IDs entre tentativas por inferência.

| ID / localização | Operador e efeito | Análise e disposição |
|---|---|---|
| 4 — src/app.ts:20 | ObjectLiteral: remove logger:false | Reativa logging padrão do Nest. Os contratos de resposta e os diagnósticos sanitizados próprios continuam verificados; a suite não exige silêncio total dos logs do framework. Lacuna residual de observação de logging; mantida no score, sem afirmar equivalência |
| 97 — src/config/runtime-config.ts:32 | StringLiteral: sentinela loopback torna-se vazia | A mesma sentinela continua a normalizar os três aliases locais; a comparação entre alvos com hosts explícitos não muda nos cenários exercitados. Não se afirma equivalência para toda URL possível; sobrevivente residual mantido |
| 122/123 — src/infrastructure/database.ts:15 | ObjectLiteral/StringLiteral: remove ou esvazia schema do adapter | Não há modelos Prisma no bootstrap; o SQL próprio de persistência usa app explicitamente e readiness não referencia tabelas. O metadado schema não altera os resultados observáveis atuais. Mantidos no denominador; quando houver modelos, validar o namespace com esses modelos reais |
| 172 — src/presentation/health.controller.ts:27 | StringLiteral: SELECT1 torna-se query vazia | Os três testes associados continuam a distinguir DB operacional/indisponível e arranque: uma query vazia ainda passa pelo adapter/ligação, e readiness não consome as linhas retornadas. Mantido no denominador; não se acrescenta uma asserção que apenas espelhe a string SQL |

As remoções das âncoras do protocolo, a remoção de localhost permitido e o desvio do mapeamento de estados HTTP foram detetados na execução integral final. Os testes adicionados têm consequências verificáveis no contrato, sem alterar produção.

Timeouts: 131 (error.filter.ts:6, BlockStatement, elimina envio da resposta), 109 (runtime-config.ts:33, LogicalOperator, muda fallback de porta) e 179 (health.controller.ts:31, StringLiteral, invalida o estado de indisponibilidade). No primeiro, retirar o envio pode deixar a requisição pendente; nos outros dois a ferramenta atingiu o limite temporal, sem prova de falha por asserção nem causa temporal isolada. Classificação original preservada: 3/123 válidos (2,44%). Não são declarados Killed nem prova de falha de infraestrutura. Mesmo tratando os três como não detetados, só Killed115/123 = 93,4959349593496% continua >85%; os timeouts não determinam a aprovação do gate.

CompileError49: mutantes recusados pelo checker TypeScript, separados e não contados como deteção. Diagnósticos: TS2355×7, TS2769×4, TS2564×1, TS2345×10, TS2367×11, TS2532×1, TS2531×1, TS2322×9, TS2739×1, TS2554×1, TS2366×3. São alterações inválidas de tipos/assinaturas/retornos; as fontes originais passaram typecheck/build e o dry run. Não há RuntimeError, Pending ou NoCoverage no resultado final.

## Validação documental e impacto

Documentação pura de consolidação (S01-T009): RED/GREEN de comportamento não aplicável; estrutura, links relativos, whitespace, coerência de estados e inspeção local de credenciais executados. Nenhuma dependência instalada, src de produção alterado ou contrato de negócio criado nesta continuação. README/AGENTS, índices/sprints/roadmap, SPEC/ADR/stack, API técnica, qualidade, arquitetura, operação, EXT-002 e MegaBrain revistos em ambos os sentidos. Specs de negócio, S00/DOC-0001 e ADR-0001/0002 preservadas por comparação Git.

Comandos de inspeção: git diff --check; git diff --exit-code nos caminhos históricos; Node/fs + child_process para enumerar diff/ficheiros não versionados, comparar apenas em memória as credenciais locais com ficheiros pendentes, verificar links Markdown relativos e ler YAML via js-yaml já instalado. Sem valores sensíveis na saída; nenhum script npm fictício. RTK preferido quando compatível; PowerShell/Node nativos usados para leitura, parsing e diagnóstico que exigiam saída integral. Âncoras Markdown e conteúdo de links externos não são abrangidos pelo check de existência local; o scanner não é auditoria universal de segredos. CI remoto continua NOT_RUN.

Resultado final de 2026-10-21: 70 ficheiros pendentes inspecionados, zero correspondências às credenciais locais/padrões privados verificados; 34 Markdown/232 links relativos, zero destinos ausentes; zero alterações nos caminhos históricos protegidos; seis tarefas e índices da S01 coerentes em REVIEW; YAML local válido; relatório de mutação idêntico às fontes próprias atuais e gate118/123 aprovado. git diff --check sem erros. Branch confirmada feat/biblia-backend, HEAD continua b458c0b: nenhum commit ou staging efetuado nesta continuação.

## Limites e pendências

Sem corpus bíblico/histórico, IA, autenticação ou exposição externa. Fixture persistence_probe só tem dados técnicos exclusivos de teste; nenhum conteúdo histórico inventado. Avaliações IA não aplicáveis à S01, não são PASS.
Execução técnica local e análise de mutação concluídas, sem teste obrigatório local falhado/bloqueado no conjunto final. A primeira integral falhada e os diagnósticos de harness continuam preservados; não se confundem com o resultado final aprovado. Aceitação formal SPEC/PLAN/ADR-0004, revisão e encerramento/commit recebidos em 2026-10-21; ver matriz de gates no REVIEW. Pergunta de fechamento apresentada; utilizador aprovou sem indicar alterações adicionais. Sprint e seis tarefas DONE; continuar para S02 após o commit, sem presumir aprovação dos contratos de negócio. Sem autorização de push/merge.

## Verificação de encerramento aprovada

Em 2026-10-21, após a aprovação citada, relatório JSON de mutação relido e comparado com as seis fontes próprias: zero diferenças; gate118/123 novamente verificado em memória. Cobertura existente relida: linhas81/81, branches52/55. Não houve alteração de comportamento desde as suites aprovadas, nem instalação de dependências; não se apresenta esta leitura como nova execução de Jest/Stryker. Atualizações de fechamento são documentais: TDD de comportamento não aplicável; checks de links, estados, credenciais locais e git diff --check repetidos antes do commit. CI remoto permanece NOT_RUN.

Check pré-commit: 71 ficheiros da S01 selecionados por manifesto explícito; 35 Markdown/236 links relativos, zero destinos ausentes; zero correspondências aos segredos locais/padrões privados verificados; seis tarefas DONE; zero alterações históricas protegidas e zero whitespace inválido. Nenhum ficheiro S02 entra no commit S01. Hash do commit principal será registado depois da criação numa atualização documental identificada.
