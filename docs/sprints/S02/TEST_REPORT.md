# S02 — Relatório de testes

## Retoma2026-10-22 — T006 em validação

Snapshot atual após ajuste de Database:549 testes/30 suites PASS,92,337s, script test:coverage; typecheck/lint/build/test:tooling13 PASS. Evidências reports/s02-final-{typecheck,lint,build,tooling,coverage}.log e s02-final-coverage-summary.json. Código estabilizado para nova mutação: source-library Domain/Verse/schemas e Database são reavaliados forçadamente pelo Stryker antes da confirmação global, conservando os estados originais não reavaliados até a ferramenta os substituir. Nenhum gate integral de mutação foi aprovado antecipadamente para este Database.

Robustez de prazos: a reavaliação de mutação falhou no dry run por timeout real de conexão do segundo cliente, sem avaliar mutantes. Plano refinado antes da implementação e testes por proxy: RED válido2 falhas esperadas (ligação2500ms e cancelamento SQL com resposta adiada500ms), GREEN2 PASS após separar ligação10000ms/leitura5000ms/SQL2000ms. Regressão adicional de resposta perdida confirmou limite finito do cliente:3 PASS,12,205s. [ERR-0010](../../megabrain/errors/ERR-0010-database-deadline-race.md) conserva falhas de harness/orçamento de teste, prova válida e limites. Src Database mudou: resultados globais anteriores não são automaticamente gate deste snapshot; regressão completa/mutação a repetir.

CI39726619966 passou526 testes/estática/tooling, mas o limite40min do job cancelou a mutação às05:51:58 UTC, antes do gate final. Configuração revista para90min e cache incremental isolado, sem reduzir src/operadores/limiares; actionlint PASS, confirmação remota pendente. Causa/configuração em [ERR-0009](../../megabrain/errors/ERR-0009-mutation-ci-runtime.md). Tentativa cancelada continua incompleta, sem score aceite.

Ensaio dirigido de identidade do importador:16 mutantes,12 Killed/1 Survived/3 CompileError, sem Timeout/RuntimeError/NoCoverage;12/13=92,3076923076923%. Sobrevivente: remover só optional chaining de identities[0].role é equivalente, porque o primeiro operando já confirma a presença da linha/db. Conservado no denominador, sem o apresentar como detetado. Fonte do ficheiro corresponde à atual; reports/s02-identity-mutation-directed-original.json/.html/-summary.json. O relatório conserva ficheiros antigos fora da seleção e não é aceite como gate global.

Para confirmar o escopo completo, o JSON original do report remoto980 foi extraído byte a byte do arquivo com digest verificado e fornecido como cache ao Stryker, preservando o cache local anterior. A ferramenta reavalia forçadamente os pontos com RuntimeError e schemas afetados; depois o comando sem seleção deve voltar ao padrão global e verificar fontes/estados. Nenhuma edição manual de estados, concatenação de relatórios para fabricar score ou dispensa de RuntimeError. Uma primeira CLI com padrões separados por espaços foi rejeitada antes de executar; a CLI real exige lista separada por vírgulas, corrigida. Resultado final ainda pendente.

Regressão mais recente, depois da análise dos sobreviventes:546/546 PASS,29 suites,120,775s, script real test:coverage no PostgreSQL canónico de teste55433. Linhas536/536=100%, branches232/238=97,47%, statements646/647=99,84%, funções116/116=100%. Typecheck/lint também PASS após os novos testes; reports/s02-t006-coverage-mutants.log/-summary.json e -typecheck-mutants.log/-lint-mutants.log. Não houve modificação de src; os novos testes reforçam contratos/defesas já implementados. Ensaio Stryker dirigido ao admitted-canon iniciado com test:mutation:incremental -- --mutate src/modules/biblical-canon/infrastructure/admitted-canon.ts --force, apenas para comprovar as novas regressões de integridade; não representa score global nem substitui o CI completo.

Ensaio dirigido de admissão concluído:27 mutantes no ficheiro,13 Killed/2 Timeout/12 CompileError, zero Survived/NoCoverage/RuntimeError,15/15=100% segundo o cálculo prescrito. As remoções individuais dos hashes do snapshot e do manifesto são Killed; os dois Timeout são operadores booleanos compostos e conservam essa classificação, sem lhes atribuir falha lógica por conveniência. Fonte do ficheiro corresponde à atual. O relatório incremental original também conserva26 ficheiros antigos fora da seleção, inclusive fontes desatualizadas: o gate textual99,12% desse conjunto não foi aceite como global. Original/HTML e análise dirigida preservados em reports/s02-admission-mutation-directed-original.json/.html/-summary.json. Sem edição de cache/estados e sem exclusão no padrão global de src. Novo ensaio dirigido ao import-test-canon verifica a defesa de identidade, também sem substituir o gate integral.

Análise do run39724675332 no código8055a4c: execução completa36min28s,980 mutantes,555 Killed/32 Timeout/45 Survived/1 NoCoverage/326 CompileError/21 RuntimeError; score textual92,73% não aceite pelo gate por RuntimeError. Arquivo12403818247, SHA2562dbcb96b0aea551f1dc153c6f6803111fdb21c528ad2cb005ce5149b5cd2b3fc conferido; relatórios originais/derivados em reports/ci-39724675332*. Erros de query/statement timeout ainda ocorreram no harness anterior à correção6272697; a execução com a correção continua separada no CI39726619966.

A análise encontrou lacunas verificáveis nos testes, sem alterar o comportamento implementado: metadados modificados mas ainda JSON válido, casos de relacionamento com uma só inconsistência, identidade defensiva do importador, isolamento de duas edições, DTOs/ranges e diagnósticos. Foram acrescentadas regressões correspondentes,5 suites dirigidas/91 testes PASS em25,157s, log reports/s02-mutation-regression-tests.log. O double da identidade é técnico/unitário e explicitamente não comprova integração; os restantes casos de Application/HTTP usam PostgreSQL/Nest reais. Não remover mutantes sobreviventes do denominador, nem declarar os novos casos aprovados pela mutação antes de a ferramenta os avaliar. Regressão completa atualizada em execução.

Verificação completa após a correção6272697: PASS526 testes/27 suites/4 projetos,134,114s;319 unitários,122 integração,84 E2E e1 aceitação integral. Comando real test:coverage, com setup que confirma alvo independente loopback55434/biblia_test; reports/s02-t006-coverage-sequential.log e -coverage-sequential-summary.json. Linhas536/536=100%, branches231/238=97,05%, statements645/647=99,69%, funções116/116=100%. Inclui12 constraints adicionais, nova regressão de limpeza e percurso HTTP sobre todos os31.102 versículos importados. A tentativa paralela anterior permanece registada como falhada/incompleta; não foi reclassificada. Build final PASS em reports/s02-t006-build-final.log; typecheck/lint/tooling13 também PASS após os ajustes.

Após esta prova, o contentor temporário bible-s02-harness-test/55434 foi parado/removido somente depois de conferir nome, imagem/digest, binding loopback, identidade real biblia_test/biblia_test e zero outras ligações. Relatório reports/s02-independent-test-cleanup.json. Nenhum contentor/volume do utilizador foi alterado; configuração canónica de testes continua55433, desenvolvimento nativo5432. Fixtures versionadas e evidências locais foram preservadas.

Mutação local incremental interrompida por recursos:203 avaliações iniciadas e54 timeouts, apenas137MB livres de7974MB na medição final; relatório parcial sem score aceite. Log/manifesto preservados em reports/s02-t006-mutation-resource-aborted.log/.json, sem alterar cache/estados. O sandbox ainda tinha o harness anterior. O gate final usará execução integral isolada do CI no código6272697, não extrapolação dos resultados locais nem dispensa de mutação. [Run39726619966](https://github.com/victorlanga348/Bible/actions/runs/39726619966) passou estática/tooling/cobertura e está em mutação. Só o processo Stryker local e os seus workers, identificados por PID/comando, foram parados; serviços/dados do utilizador preservados.

Checkpoint enviado:8055a4c49800ae1c9c6cd8ec750a129b0081f669. O [run39724675332](https://github.com/victorlanga348/Bible/actions/runs/39724675332) passou setup, provisionamento, quatro migrações, typecheck/lint/tooling e cobertura; mutação ainda em execução. O run anterior39722420996 terminou FAIL no gate de mutação por23 RuntimeError (apesar do score textual98,32%): deadlocks de limpeza/FK e regras Domain executadas durante a coleta de fixtures. Artefacto íntegro e investigação em [ERR-0005](../../megabrain/errors/ERR-0005-test-cleanup-isolation.md). Correções do harness em validação; sem encerramento antecipado. A nova regressão de concorrência será executada em outro PostgreSQL isolado loopback55434/biblia_test, sem partilhar dados com a mutação atual55433 nem com bible_db5432.

Correção adicional do harness: regressão real RED1 falha/1 PASS → GREEN2 PASS no PostgreSQL independente55434; lock SHARE ROW EXCLUSIVE admite a leitura FK e serializa writers/limpezas. Fixtures de schemas/paths não executam Domain na coleta;45 unitários PASS. Typecheck/lint/tooling13 PASS após estes ajustes, sem mudança de src. Tentativa completa paralela interrompida: importação integral expirou aos30.850ms e só159MB de RAM estavam livres. Log parcial preservado, FAIL para a importação/execução final incompleta; repetição sequencial pendente. Não contar526 testes previstos como executados nem alterar limites para ocultar a falha. Novo checkpoint permite confirmação no runner isolado; T006/T007 e gate de mutação mantêm-se pendentes.

Checkpoint de implementação autorizado para CI: sprint/T006 continuam IN_PROGRESS, T007 dependente; não é encerramento nem PASS antecipado do gate de mutação. A matriz513 abaixo é a primeira validação completa; testes adicionais de constraints e percurso HTTP integral escritos depois ainda terão execução própria. Sem nova funcionalidade implementada depois do RED/GREEN; acrescentam verificações do comportamento existente.

Autorização geral posterior retomou T006/T007. Estado IN_PROGRESS; critérios finais/mutação ainda não aprovados por antecipação. Ambiente mantido: Node24.16/npm11.13, Nest12/Zod4/Prisma7/Jest30/Stryker10 e PostgreSQL17.11 isolado no Docker, identidade biblia_test/biblia_test confirmada antes de limpezas próprias. Desenvolvimento PC16.14 permanece separado. Sem dependência npm nova nesta tarefa. Branch feat/biblia-backend, base operacional ed03dc5; commits anteriores S02/S03 preservados.

Preparação real: python scripts/prepare-canon.py confirmou ZIP1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682, XML5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db, aviso admitido e inventário66/1189/31102. JSON integral UTF-8/LF:14c2103dc8fedc80007b4c37a05f09c43926f05e8a0dc8ccd62b3443dccd0a27; round trip integral de todos os textos/identidades, incluindo espaços. Manifesto canónico JSON.stringify: b3a9b624e175f5a6870d3e52f8ccd905b4a94232dc3e627eb74486c513d6a19e; esta comparação tolera somente formatação de JSON/CRLF, sem trocar metadados. Originais/fixtures S02 não foram regravados. Derivado e raw ignorados pelo Git.

| Etapa/comando real em backend/ | Resultado observado | Artefacto local reports/ |
|---|---|---|
| test:integration -- --runTestsByPath test/integration/canon-schema.spec.ts | FAIL esperado de configuração: tabelas ainda ausentes; não é RED de negócio | s02-t006-schema-before.log |
| prisma:generate e db:migrate:test | PASS; migração202610220001_biblical_canon aplicada, quatro tabelas em app | s02-t006-migrate.log |
| test:integration -- --runTestsByPath test/integration/canon-library.spec.ts | RED:28 falhas de comportamento em contratos compiláveis,2 casos genéricos já passavam | s02-t006-application-red.log |
| test:integration -- --runTestsByPath test/integration/canon-library.spec.ts test/integration/canon-schema.spec.ts | GREEN31 PASS,5,808s | s02-t006-application-green.log |
| test:e2e -- --runTestsByPath test/e2e/canon.spec.ts | RED26 falhas/4 casos já passavam pela validação global; rotas válidas retornavam404 | s02-t006-http-red.log |
| Mesmo comando E2E após implementação | GREEN30 PASS,6,381s; cinco contratos/Zod/OpenAPI e200/400/404/500 reais | s02-t006-http-green.log |
| test:integration -- --runTestsByPath test/integration/canon-admission.spec.ts | RED11 falhas: admissão/importador ainda ausentes em stubs compiláveis | s02-t006-admission-red.log |
| Mesmo comando após implementação | GREEN11 PASS,26,08s; importação integral/transação/repetição e confronto de todos os textos persistidos | s02-t006-admission-green.log |
| Refactor: batches SQL explícitos de1000 versículos, mesmo comando | PASS11,20,643s; evita agendamento concorrente de batches internos no mesmo cliente pg | s02-t006-admission-refactor.log |
| test:coverage | PASS513 em26 suites/4 projetos,72,052s;319 unit/109 integração/84 E2E/1 aceitação integral | s02-t006-coverage.log/-coverage-summary.json |
| Cobertura do src próprio | Linhas536/536=100%; branches231/238=97,05%; statements645/647=99,69%; funções116/116=100% | json-summary real |
| typecheck inicial | FAIL: ApiBodyOptions não aceita standardSchema; import dinâmico exigia extensão .js | s02-t006-typecheck.log |
| typecheck após correção e lint/build finais | PASS; metadata do Body já publica schema sem decorator incompatível, teste OpenAPI mantido | -typecheck-fixed.log/-lint-final.log/-build-final.log |
| test:tooling | PASS13, incluindo fronteiras/imports/ciclos reais | s02-t006-test-tooling.log |
| Provisionamento CI em diretório temporário | PASS3: download HTTPS real, falha HTTP e bytes alterados recusados; JSON derivado com mesmo hash | s02-t006-ci.json |

Os scripts npm acima foram invocados com rtk npm run; transformação JSON/checks estruturados usam ferramentas nativas por parsing UTF-8/JSON e necessidade de prova exata. Nenhum dado de desenvolvimento foi limpo. Primária de Application é Prisma/PostgreSQL real, sem doubles de repositório. Todos os textos dirigidos são os excertos autênticos admitidos; caso de fronteira usa1001 registos reais do mesmo snapshot, sem escritura fabricada.

A aceitação integral foi separada em test/acceptance/canon-corpus.spec.ts, obrigatória em test/test:coverage e CI. Mutação mantém todo src e usa projetos unit/integration/e2e com casos reais dirigidos, inclusive fronteira1000/1001. Não repetir31.102 inserts para cada mutante é refinamento de execução previsto no plano, não exclusão de comportamento/código ou troca de integração por fake. O score só será reportado após conclusão válida. Checker TypeScript/denominador/exclusões permanecem os prescritos.

Falha CI remota do primeiro push operacional: workflow não iniciou jobs, pois job.services foi usado no env do job, onde o contexto job não está disponível. Evidência [run39718273703](https://github.com/victorlanga348/Bible/actions/runs/39718273703). Correção move a resolução para um step que escreve GITHUB_ENV; parser YAML local sozinho não deteta erro de contexto de GitHub Actions. Validação semântica com actionlint oficial e nova execução remota serão registadas antes de afirmar CI PASS.

Validação adicional CI: actionlint1.7.12 oficial, arquivo SHA2566e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9, reproduziu falha do workflow antigo e aprovou a correção (exit0). Run39721380203 passou setup/downloads/migração/estática/tooling, mas falhou4/440 por reports ausente no clone limpo. Harness passou a criar o diretório: prova Node em diretórios novos confirmou ausência antes e presença depois. Run39722420996 passou440 testes remotos e está a executar mutação no snapshot S03 anterior, sem API bíblica nova ainda. ERR-0007/0008 preservam causas/provas; não confundir esse run com validação do checkpoint S02.

Desenvolvimento real verificado: operação reports/provision-local-canon.cjs confirmou bible_db/postgres/localhost5432/schema app, aplicou a quarta migração e importou o snapshot integral vindo do ZIP/XML pinados (não os quatro excertos). PASS66/1189/31102, confronto de todo texto persistido, repetição unchanged e Nest/Supertest para readiness/catalogue/passagem/referência200 no PostgreSQL16.14. Ambiente preservado e banco de testes não tocado. Resumo reports/local-canon-provisioned.json, log de migração sanitizado. O score de mutação continua pendente, sem declarar release.

## Histórico da entrega reduzida — 2026-10-21

Data: 2026-10-21. Sprint DONE com escopo reduzido a corpus/domínio/parser T004/T005 por decisão explícita «termina, o que falta vou adicionar depois». SPEC v0.2/plano T005 aprovados antes do código; revisão de escopo v0.3 registada. T006/T007 adiadas no BACKLOG; consultas/importação/HTTP bíblicos ainda não implementados.
Branch feat/biblia-backend; base d0036ab, após commit principal S01 1702cc0. Encerramento do recorte e commit aprovados; principal S02 `c0c24b9f48aba7926dea05207a7263a97b7fc7b0`, `feat(sprint-02): implement biblical canon`,44 ficheiros selecionados e árvore limpa após commit. Hash registado posteriormente; menções PENDING abaixo são históricas. Sem push/merge. Resultados abaixo são da árvore de trabalho, não de uma release ou CI remota.

## Ambiente e comandos reais

Windows/PowerShell, Node24.16.0, npm11.13.0, TypeScript6.0.3, Jest30.5.2, Stryker10.0.0, PostgreSQL17.11 em Docker Desktop local. Bases dev/test isoladas, ambas saudáveis; regressão de integração usa o alvo de teste protegido da S01. Sem dependência nova, fornecedor pago ou IA. Leituras estruturadas usam Node/Python/PowerShell nativos por não terem equivalente RTK; comandos npm/Git usam RTK quando compatível. Logs e relatórios locais em backend/reports/, ignorados pelo Git.

| Execução em backend/ | Estado | Evidência |
|---|---|---|
| rtk npm run test:unit -- --testPathPatterns=biblical-canon | FAIL esperado — RED | Duas suites/87 falhas por comportamento ainda ausente em stubs compiláveis; s02-t005-red-01.log, exit1. Não eram falhas de sintaxe/import/ambiente |
| rtk npm run test:unit -- --testPathPatterns=biblical-canon/reference | PASS — GREEN referência | 53 testes; s02-t005-green-reference.log |
| rtk npm run test:unit -- --testPathPatterns=biblical-canon | PASS — GREEN entidades | 87 testes; s02-t005-green-01.log |
| rtk npm run test:coverage | PASS — regressão/refactor | 7 suites/152 testes: 128 unitários (92 novos), 7 integrações e17 E2E técnicos reais; s02-t005-coverage-01.log |
| rtk npm run typecheck; rtk npm run lint; rtk npm run build | PASS | Zero erros; typecheck/lint repetidos após reforços de regressão |
| rtk npm run test:tooling | PASS | 13 checks: arquitetura7 e gate de mutação6; inclui análise AST/ciclos dos novos ficheiros |
| rtk npm run test:mutation:incremental — tentativa01 | FAIL | 288 mutantes avaliados, mas cache e JsonReporter escreviam no mesmo caminho; JSON inválido e gate exit1. O score textual não foi aceite |
| rtk npm run test:mutation:incremental — tentativa02 | PASS | Cache separado do relatório; dry run152 PASS, 172 resultados S01 reutilizados/116 mutantes novos. Duração3min47s, gate exit0; s02-t005-mutation-02.log |
| Node/fs: parsing independente das duas saídas e comparação com src | PASS | JSON final e cache válidos, mesmos resultados; zero diferenças entre source do relatório e14 ficheiros próprios |
| CI remota | NOT_RUN | Sem push autorizado; execução local não comprova CI remota |
| Integração/API/importação do módulo biblical-canon | NOT_RUN | Pertence à T006/T007. Os 24 testes reais acima verificam regressão técnica da fundação, não estes comportamentos |
| IA | NOT_RUN; não aplicável | Domínio/parser sem chamadas/modelos de IA |

## TDD e cobertura

Os testes de gramática/invariantes foram escritos primeiro, executados contra assinaturas/stubs lançando erro de comportamento ausente, e só depois implementados. RED87, GREEN53 de referência e GREEN87 do conjunto ficam preservados nos logs. Helpers específicos evitam repetir validações; nenhuma abstração genérica, SDK/framework, port vazio ou adapter de catálogo foi introduzido no Domain.

Depois de GREEN, cinco reforços verificam prefixo de código inválido e impossibilidade de invalidar identidades/texto por escrita posterior. São regressões sobre comportamento existente, sem alegar novo RED original. Resultado final T005:92 testes (referência55, entidades37). Verse preserva os quatro textos autênticos byte a byte no valor JSON, incluindo espaços finais; parser estrutural não afirma existência.

Cobertura global: linhas161/161 =100%; branches86/89 =96,62%; statements183/183 =100%; funções26/26 =100%. Domínio novo: linhas80/80 e branches34/34 =100%. Escopo src/**/*.ts, excluindo apenas gerado conforme configuração existente. Resumo em reports/coverage/coverage-summary.json, cópia estável s02-t005-coverage-summary.json e lcov/HTML locais; não existe coverage-final.json nesta configuração (reporter json-summary).

## Mutação e análise

Relatório válido preservado em reports/s02-t005-mutation-final.json, além de reports/mutation/mutation.json e HTML. Cache separado reports/mutation/incremental.json. Escopo integral de código próprio mantido, sem alteração de operadores/exclusões/limiares. A execução é incremental: reutilizou172 mutantes da execução integral S01 e avaliou os116 novos, com dry run de toda a suite atual.

| Escopo | Total | Killed | Timeout | Survived | CompileError | Válidos | Score bruto |
|---|---|---|---|---|---|---|---|
| 14 ficheiros próprios | 288 | 206 | 3 | 6 | 73 | 215 | 209/215 =97,20930232558139% |
| Oito ficheiros Domain S02 | 116 | 91 | 0 | 1 | 24 | 92 | 91/92 =98,91304347826087% |

NoCoverage/RuntimeError/Pending: zero. CompileError é separado, não deteção; os24 novos são mutantes inválidos de tipos/retornos/estado obrigatório, rejeitados pelo checker TypeScript. Originais passam typecheck/build e dry run. Timeouts3 herdados permanecem com a classificação real; só Killed206/215 =95,81395348837209% também supera85%, portanto não determinam aprovação.

Novo sobrevivente137, canon-domain-error.ts:2, StringLiteral: esvazia a mensagem interna. As suites exigem a classe de erro e a recusa dos estados inválidos; a mensagem literal interna não faz parte da SPEC ou do envelope HTTP. Não se declara equivalência universal nem se cria teste que só copie a string. Mantido no denominador, sem defeito crítico de contrato identificado.

Restantes sobreviventes, ainda no denominador: app.ts:20/id4 remove logger:false (lacuna residual de observação de logs do framework); runtime-config.ts:32/id97 esvazia sentinela de loopback (cenários exercitados mantêm normalização); database.ts:15/ids122–123 remove/esvazia schema do adapter (ainda sem modelos Prisma, SQL técnico qualificado); health.controller.ts:27/id288 esvazia query de readiness (a conexão ainda é exercitada, sem consumo das linhas). Análise original detalhada no relatório S01; IDs do relatório atual explicitados para não os transportar por inferência. T006 deve verificar schema app com modelos reais.

Timeouts atuais109/runtime-config.ts:33,247/error.filter.ts:6 e295/health.controller.ts:31. Retirar envio de resposta pode deixar requisição pendente; os outros atingiram limite temporal sem causa isolada comprovada. Não renomear para Killed. Nenhum sobrevivente foi retirado do cálculo.

Incidente/correção: [ERR-0002](../../megabrain/errors/ERR-0002-stryker-report-collision.md). Artefacto inválido da tentativa01 preservado, sem reparação manual; tentativa02 confirmou duas saídas válidas e gate estrito >85%.

## Admissão e dados reais — T004

ZIP oficial porbr2018 obtido após aprovação; SHA-256 1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682. XML canónico 5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db. Inventário verificado:66 livros/1.189 capítulos/31.102 versículos, sem lacunas/duplicações numéricas. Aviso/créditos CC BY4.0 preservados; EXT-003 resolvida para snapshot/usos aprovados. Não se alega verificação GPG.

[Fixture real](../../../backend/test/fixtures/biblical-canon/porbr2018/README.md): manifesto/catálogo/aviso e GEN1:1,JHN3:16–18 exclusivos de teste, comparados ao XML sem trim/correção. ZIP completo fica em backend/data/ ignorado; nenhum SQL fornecido executado. XML usa códigos USFM; TXT usa aliases BibleWorks e contém diferenças de espaços/colchetes documentadas, sem fundir exports. Nenhum conteúdo bíblico gerado ou fixture usada como seed.

## Critérios e sete gates — alcance da T005

P01/P02/P03 PASS. Critérios do recorte final AC05/AC06/AC07 PASS, com evidências de admissão/Domain/gates/governança. Critérios originais AC01–04 não foram integralmente satisfeitos: casos I01–I03/H01 continuam NOT_RUN, fora do encerramento por adiamento explícito. A futura T007 conserva sua exigência de aceitação da integração. A tabela de gates abaixo vale também para o recorte corpus/Domain entregue.

| Gate | Resultado T005 | Evidência/alcance |
|---|---|---|
| 1 | APROVADO | «ok» à SPEC v0.2/recorte/plano; T004 concluída antes de código |
| 2 | APROVADO | RED87 → GREEN53/87 → regressão152 e arquitetura |
| 3 | APROVADO | Estática/build/tooling e cobertura acima dos mínimos |
| 4 | NÃO APLICÁVEL ao Domain puro | Sem persistência/HTTP novos; regressão real S01 passou, sem substituir futura prova S02 |
| 5 | APROVADO | Relatório válido, bruto global97,21% e Domain98,91%, análise de sobreviventes |
| 6 | NÃO APLICÁVEL | Sem IA |
| 7 | APROVADO tecnicamente | Documentos/estado/impactos sincronizados; validação documental final abaixo |

## Histórico da preparação e limites

Antes do «ok», T004 esteve BLOCKED: pesquisadas duas candidatas e concretizados SPEC v0.2, recorte/contratos/plano, sem atribuir escolhas religiosas ao utilizador. Checks documentais anteriores:16 Markdown/165 links e depois18/174, sem destinos ausentes. Nenhum resultado daquela preparação era teste de software. Primeira comparação do rótulo por pipe PowerShell falhou por acentos do script; repetida com escapes Unicode, sem alterar a fonte para satisfazer o check.

O plano aprovado da SPEC foi preservado como histórico; estado efetivo está em TASKS/README e neste relatório. A S02 foi depois encerrada com escopo reduzido, por decisão explícita registada no PLAN/REVIEW. Sem Application/rotas/migração/importação bíblica, novas dependências ou commit/push/merge.

Validação anterior à decisão de adiamento em2026-10-21: Node/fs + Git enumerou42 ficheiros modificados/novos,27 Markdown/195 links relativos, zero destinos ausentes e estados T004/T005 DONE, T006/T007 BLOCKED coerentes. Comparação em memória com passwords dos ficheiros locais ignorados: zero ocorrências nesses42 ficheiros; não é auditoria universal de segredos. git diff --check PASS, diff de S00/S01/DOC-0001/ADRs/.github vazio e índice Git sem staging. git check-ignore confirmou ZIP, ambientes e relatório ignorados. Python stdlib voltou a verificar ZIP/XML/aviso por hash, inventário completo/numeração e quatro textos exatos da fixture: PASS. Não houve teste novo de comportamento nesta conferência documental/de dados.

## Encerramento reduzido autorizado e conferência final

Atualização posterior: «se terminou pode finalizar e ir para a proxima» autoriza finalizar/commitar a S02 e continuar para preparação S03 após o commit. Commit permanece PENDING até a execução real e será registado depois sem autorreferência impossível. As menções anteriores de ausência de autorização descrevem os passos históricos. Sem push/merge ou execução de planos/contratos S03 ainda não apresentados.

O utilizador determinou «termina, o que falta vou adicionar depois» em2026-10-21. Escopo final: corpus/domínio/parser T004/T005. T006/T007 adiadas no BACKLOG sem sprint futura atribuída; integração/API continuam NOT_RUN. Critérios AC05–07 PASS no recorte; AC01–04 originais e casos I/H preservados como não integralmente satisfeitos. PLAN/SPEC v0.3/REVIEW registam impacto e decisão. Sprint DONE no recorte autorizado; commit PENDING sem pedido específico de commit, sem push/merge ou início de S03.

Alteração deste fecho exclusivamente documental: RED/GREEN adicional não aplicável, pois não houve comportamento/configuração executável novo. Não se repetiram suites já aprovadas sem mudança de código que justificasse a repetição. Node/fs comparou novamente as fontes dos14 ficheiros com o relatório Stryker válido: zero diferenças; contagens reais e cobertura preservadas. Evidência existente continua a aplicar-se ao incremento entregue.

Check final Node/fs + Git PASS:44 ficheiros modificados/novos,29 Markdown/234 links relativos, zero destinos ausentes; T004/T005 DONE e T006/T007 BACKLOG coerentes, critérios atuais AC05–07 PASS e antigos AC01–04 NOT_RUN preservados. Nenhuma alteração em S00/S01/DOC-0001/ADRs/.github; nenhum staging. Comparação limitada com passwords locais: zero ocorrências nos ficheiros alterados, sem alegação de auditoria universal. Artefacto local ignorado reports/s02-closure-docs.json. rtk git diff --check PASS; rtk git check-ignore confirmou ZIP/ambientes/relatório ignorados. Leituras e parsing nativos por não terem equivalente RTK; Git compatível via RTK. Sem alterações silenciosas ao escopo original: o adiamento está explícito nas fontes canónicas.
