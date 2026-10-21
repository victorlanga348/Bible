# S03 — Relatório de testes e admissão

Estado vigente: S03-T004–T007 DONE técnico em2026-10-21, após aceites dos respetivos planos e todos os critérios/gates aplicáveis. Sprint DONE; encerramento/commit S03 aprovados pelo «pode usar», após o relatório/revisão final e a pergunta obrigatória de fechamento. Hash a registar após criação. O aceite final não aprova S04/push/merge. Evidências atuais a seguir; etapas anteriores preservam histórico real, incluindo tentativas rejeitadas.

## Resultado final T007 — revisão integrada vigente

Data:2026-10-21. Aprovação: «aprovado, e veja que alterei o .env, podes usar e adaptar o que precisares tambem», após apresentação do plano T007. Ambiente Windows/PowerShell, Node24.16/npm11.13, Nest12/TS6 strict/Zod4/Prisma7, Jest30/Stryker10, PostgreSQL17.11 real no Docker Desktop. Branch feat/biblia-backend, HEAD ee55c4e; zero staging/commit novo. Sem alteração de src, migrações, contratos, dependências, thresholds ou exclusões nesta tarefa.

| Critério/gate | Aplicabilidade / resultado | Comando real e artefacto local em backend/reports/ |
|---|---|---|
| T007-AC01 / gate1 | PASS: recorte/contratos/planos/dependências aceites; S03-AC01–04 e P/I/H/G rastreados | Revisão SPEC/API/modelo/ADRs/regras e critérios; T004–T006 reutilizados onde inalterados |
| T007-AC02 / gate4 | PASS: original/manifesto/excertos/aviso → importador → transação PG → Nest/Supertest → respostas exatas | rtk npm run test:e2e -- --runTestsByPath test/e2e/source-admission.spec.ts:1 PASS inicial, sem seed; incluído novamente em test:coverage |
| T007-AC02 / arranque/importação | PASS: importado/inalterado, zero/três/cinco caminhos recusados, alvo inseguro recusado e erro de arranque genérico | node reports/check-s03-t007-launchers.cjs; -launchers.json:5 grupos,7 processos reais; identidade confirmada e tabelas do módulo limpas |
| T007-AC03 / configuração CI | PASS local: download HTTPS real/hash; falha de transporte e bytes alterados recusados, temporários removidos | node reports/check-s03-t007-ci.cjs; -ci-provision.json:3 casos, Bash executa o bloco exato do workflow em diretórios novos; parser js-yaml instalado confirmou YAML |
| T007-AC04 / gate3 | PASS: TypeScript strict/lint/build/arquitetura | rtk npm run typecheck, lint, build, test:tooling; logs -typecheck.log, -lint.log, -build.log, -test-tooling.log;13 checks PASS |
| T007-AC04 / cobertura | PASS:21 suites/440 testes,319 unit/67 integração/54 E2E | rtk npm run test:coverage;36,65s, exit0, -coverage.log e -coverage-summary.json; linhas372/372=100%, branches166/171=97,07%, statements433/434=99,76%, funções69/69=100% |
| T007-AC04 / gate5 | PASS: todo src próprio, score bruto estritamente >85% | rtk npm run test:mutation:incremental sem argumentos;4min1s, exit0, -mutation.log/-mutation-final.json/-mutation-summary.json;639 mutantes,524 reutilizados/115 reavaliados, dry run436 PASS |
| T007-AC05 / gate7 | PASS: revisão/estados/README/ações/MegaBrain e limites sincronizados | node reports/check-s03-t007-docs.cjs; -docs-final.json:links/diff/segredos conhecidos/staging; node reports/check-s03-t007-artifacts.cjs; -artifacts-final.json:quatro hashes, fontes e cache |
| Gate6 / IA | NOT_RUN; não aplicável a este recorte sem IA | Nenhuma chamada/avaliação semântica/SDK; sendToAi pending, SR-AC05 reservado a S04/S05 |
| CI remota / deployment | NOT_RUN; fora da execução autorizada | Configuração e bloco de provisionamento exercitados localmente; nenhum job remoto/publicação executado |

### TDD, configuração e doubles identificados

Nenhum comportamento de negócio mudou nesta tarefa de revisão. A prova composta passou na primeira execução porque verifica o comportamento T006 já existente; não é RED retroativo. Evidências RED/GREEN/REFACTOR de cada comportamento permanecem nas etapas T005/T006 abaixo. Documentação pura não exige TDD de negócio, mas exige os checks executáveis descritos.

Antes da edição CI, o verificador falhou pela ausência do passo de provisionamento (assertion «CI must provision the admitted original before database/tests», -ci-config-before.log). Depois da edição, o bloco exato baixou3.561.835 bytes por HTTPS e confirmou098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99 antes de aceitar o ficheiro. Os dois testes negativos substituem apenas curl por funções locais identificadas: retorno22 e bytes alterados. Shell/hash/cleanup executam de verdade; esses doubles não comprovam uma indisponibilidade remota real. A obtenção positiva usou o serviço HTTPS real, sem desativar TLS ou mudar hash. Não há download no runtime.

Tentativas de preparação com caminho duplicado de script e parser `yaml` indisponível foram erros locais de ferramenta, não RED nem prova do produto. Caminho corrigido; YAML analisado com `js-yaml` já instalado por tooling, sem instalar dependência. RTK usado em npm/Docker/Git quando compatível; leituras/checks estruturados UTF-8/JSON e execução do bloco Bash usam ferramentas nativas por necessidade de parsing/prova exata.

### Mutação e revisão técnica

Resultado atual:426Killed/9Timeout/4Survived/200CompileError. Válidos439, detetados435; bruto99,08883826879271%. Só Killed426/439=97,03872437357631%, portanto o gate não depende dos timeouts. Zero RuntimeError/NoCoverage/Pending/estado desconhecido; CompileError não conta como deteção.30 ficheiros instrumentados/26 com mutantes; cache e relatório JSON válidos, ficheiros/estados iguais entre ambos e fontes correspondentes ao src, padrão [src/**/*.ts, !src/generated/**]. Cópia final T007 preservada, sem editar estados.

Quatro sobreviventes mantêm identidade/análise T006 abaixo: runtime-config98, canon-domain-error144, import-test-snapshot451 e health.controller641. Nenhuma nova equivalência universal alegada. Nove timeouts mantêm os IDs110/545/554/572/573/579/589/600/648 e limites causais da análise T006. Única mudança de estado: prisma-source-repository499 (remoção do SQL do advisory lock), antes Timeout, agora Killed. A falha é a asserção de dois imports concorrentes reais: uma violação da PK substituiu o resultado esperado unchanged, coerente com a remoção da serialização. Não é um erro da baseline ou de teardown. -mutation-findings.json conserva a comparação/razões.

Revisão integrada: contratos/DTOs/Zod/OpenAPI concordam com o recorte aprovado; SQL parametrizado, paginação/ranking/coverage4 e barreiras por direitos demonstrados pelos testes. Domain/Application independentes de frameworks/ORM; adapter só lê/escreve as duas tabelas do módulo; composição usa um Database partilhado. Manifesto/excertos/aviso/raw conservam os hashes admitidos e a atribuição. Sem nova decisão arquitetural que exija ADR; ADR-0003/0004 preservadas. Direitos locais da admissão T004 e limites semânticos não foram alargados.

### `.env`, limites e saída

O `.env` alterado pelo utilizador passou na validação de configuração. DATABASE_URL aponta a outro alvo local de desenvolvimento; foi preservado e não houve migração/importação de desenvolvimento. Variáveis adicionais Google/JWT/PostgreSQL não são consumidas pela aplicação atual.

Uma inconsistência foi corrigida dentro da autorização: apenas BIBLE_TEST_DB_PASSWORD foi sincronizada com a credencial real já validada na base isolada e em `.env.test`. A configuração Compose resolvida agora coincide com essa credencial; restantes chaves/valores preservados e conferidos. Nenhum segredo impresso/versionado, container recriado ou volume apagado. -env-check.json regista apenas resultados/hashes de integridade, sem valores. `.env`/`.env.test`, raw e relatórios mantêm-se ignorados. O teste HTTP/PG continua a usar somente biblia_test/biblia_test/app. Readiness testa conectividade; não certifica schema/acervo do alvo de desenvolvimento.

Antes do aceite final: T007 IN_PROGRESS → REVIEW → DONE técnico; S03 IN_PROGRESS → REVIEW. Critérios S03-AC01–04 PASS no recorte de uma obra inglesa/quatro parágrafos, sem associações bíblicas, IA ou corpus maior. S02-T006/T007 permanecem adiadas. Não há bloqueio obrigatório local pendente; CI remota e deployment continuam NOT_RUN. Encerramento/commit S03 PENDING, aguardando aceite final e a pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

Conferência final:77 ficheiros alterados/novos,31 Markdown/228 links relativos, zero destinos ausentes, whitespace, ficheiros fora do escopo ou staging; zero ocorrências dos segredos locais conhecidos (incluindo chaves adicionais do `.env`) e de chaves privadas na varredura limitada. Check de artefactos:26 fontes correspondentes,639 mutantes, cache/JSON iguais, quatro hashes conservados. `git check-ignore` confirmou `.env`, `.env.test`, original HTML e relatório final ignorados. Não houve commit/push/merge.

Consulta read-only final via `rtk docker compose --env-file backend/.env -f backend/compose.yaml exec -T postgres-test psql -U biblia_test -d biblia_test` confirmou db/role biblia_test,0 fontes/0 excertos e três migrações aplicadas: bootstrap_namespace, source_library e source_permission_nulls. Nenhuma limpeza adicional ou alteração de desenvolvimento foi necessária; ficheiros autênticos mantidos. O schema/acervo do alvo de desenvolvimento não foi certificado por esta consulta de teste.


## Resultado final T006 — baseline histórica reutilizada

Ambiente local: Windows/PowerShell, Node24.16/npm11.13, Nest12/TS6 strict/Zod4/Prisma7, Jest30/Stryker10, PostgreSQL17.11 em Docker Desktop. Branch feat/biblia-backend, HEAD ee55c4e; nenhum commit/staging S03, dependência nova, push/merge ou execução remota. Guard/identidade confirmaram biblia_test/biblia_test/app separado do desenvolvimento.

| Critério/gate | Aplicabilidade e resultado | Comando real/evidência |
|---|---|---|
| T006-AC01 | PASS; migrações/constraints aplicáveis | prisma:generate e db:migrate:test; dois modelos app, PK/FK/unicidades/checks,15 cenários reais e correção SQL null |
| T006-AC02 | PASS; original/manifesto/excertos/aviso admitidos |13 testes de admissão, SHA-256 fixos e digest UTF-8 real; CLI db:import:sources:test retorna imported/unchanged com quatro caminhos explícitos do README |
| T006-AC03 | PASS; atomicidade/concorrência | Falha real de escrita/rollback, conflito/duplicados, dois clientes/locks observados, reconexão e limpeza serializada;31 casos library+cleanup |
| T006-AC04 | PASS; pesquisa/leitura/rights | Inglês lexical parametrizado, ranking/empates, paginação segura/cobertura4, vazio/SQL adversarial, direitos pending/denied antes de materializar texto |
| T006-AC05 | PASS; transporte |34 E2E source-library,2 de composição e regressão S01; três rotas, Zod estrito entrada/saída, OpenAPI/limites/defaults,200/400/403/404/500 e logs sanitizados |
| T006-AC06 / gates1–4 | PASS; aprovação/TDD/estática/integração | RED/GREEN iniciais preservados abaixo; typecheck/lint/build e test:tooling13 PASS; arquitetura/ports próprios, sem tabelas de outro módulo |
| Cobertura / gate3 | PASS | rtk npm run test:coverage:20 suites/439 PASS (319 unit/67 integração/53 E2E),30,047s, -coverage-verified.log. Linhas372/372=100%; branches166/171=97,07%; statements433/434=99,76%; funções69/69=100% |
| Mutação / gate5 | PASS; todo src próprio | rtk npm run test:mutation:incremental sem argumentos:639 mutantes,620 reutilizados/19 reavaliados,435 testes relacionados ao src PASS,1min47s, exit0. -mutation-verified.log e -mutation-final.json |
| IA / gate6 | NOT_RUN; não aplicável | Sem chamadas/fornecedor/avaliação semântica neste recorte; SR-AC05 continua próprio de S04/S05, nunca inferido pela pesquisa lexical |
| Documentação / gate7 | PASS no recorte T006 | Revisão/critério/tarefas, modelo/API, ações/índices/README/AGENTS/contexto e MegaBrain sincronizados; links/diff/segredos conhecidos validados por Node/Git |
| CI remota / deployment | NOT_RUN | Não autorizados/executados; provisionamento do original no runner faz parte do plano T007 ainda por aprovar |

Scripts no quadro são os reais de package.json, invocados com rtk npm run. Logs/resumos em backend/reports/ são artefactos locais ignorados; -coverage-summary.json e -mutation-final.json preservam os resultados. Os quatro testes do harness exit/abort não importam src, portanto não entram na seleção automática findRelatedTests do Stryker; foram aprovados no Jest normal439. Nenhum teste obrigatório da baseline falhou/ficou bloqueado.

### Mutação final, reavaliação e análise

30 ficheiros instrumentados,26 com mutantes; ports/interfaces e subtipos vazios/decoradores sem operador gerado não recebem score fictício. Padrão final [src/**/*.ts, !src/generated/**], sem novas exclusões.425Killed/10Timeout/4Survived/200CompileError; válidos439, detetados435, bruto99,08883826879271%. Só Killed425/439=96,81093394077449% também supera85%; timeouts não determinam aprovação. Sem RuntimeError/NoCoverage/Pending/estado desconhecido.

200CompileError são mutantes inválidos, não deteção. Typecheck/build do original, dry run435 e baseline439 PASS demonstram compatibilidade da stack; não se alterou o checker para esconder estados. JSON final/cache parseados separadamente,639 mutantes em ambos,26 fontes correspondentes ao src e zero diferenças de conteúdo. Comparação normaliza apenas CRLF/LF do código, não os bytes/hashes dos artefactos admitidos.

Fonte source-library: Domain78/78 Killed e Application32/32 Killed=100% dos válidos, sem timeout nessas camadas. Quatro sobreviventes globais mantidos no denominador:

- runtime-config:32/id98: sentinela de normalização loopback esvaziada, gap herdado de cenários; não declarado equivalente universalmente.
- canon-domain-error:2/id144: mensagem interna esvaziada, sem contrato literal público aprovado; herdado S02.
- health.controller:27/id641: query vazia ainda exercita ligação, resultado de SELECT1 não consumido pelo handler; gap técnico herdado, sem alegar equivalência universal.
- import-test-snapshot:11/id451: remoção do segundo optional chaining; primeiro operando falso já confirmou a existência da linha/db. Repetição isolada real produziu Survived e é compatível com essa equivalência para rows simples do adapter.

Uma avaliação mista havia marcado o último candidato Killed por timeout de ligação e depois imported/unchanged inesperado; isso não era prova causal da alteração. Descartado esse resultado e repetido o candidato isolado:18 testes relacionados,1 mutante,24s, Survived. Um primeiro intervalo de coluna gerou0 candidatos e não foi aceite como reavaliação; intervalo0-based corrigido, sem inventar score novo a partir de zero avaliações. [ERR-0006](../../megabrain/errors/ERR-0006-static-mutation-cache.md).

O cache estático conservava erros/resultados anteriores apesar de novos testes. A ferramenta reavaliou35 candidatos com --force em trechos explícitos; conservou automaticamente o resto do relatório. Depois voltou ao comando sem argumentos/padrão completo, reavaliando mais19 estáticos. Não houve edição/merge manual de estados, redução do denominador, ignoreStatic ou alteração de thresholds. O wrapper incremental só encaminha argumentos ao Stryker antes do gate. A primeira e segunda tentativas com RuntimeError foram FAIL, nunca PASS pelos scores textuais95,53%/97,71%.

Timeouts finais: runtime-config:33/id110; prisma-source-repository:49/id499; schemas:16/id545,21/id554,28/ids572–573; source-error.filter:7/id579 e12/id589; error.filter:6/id600; health.controller:31/id648. Remover o envio da resposta nos filtros deixa HTTP pendente, mecanismo esperado em579/589/600; causa temporal exata dos restantes não isolada. Conservados como Timeout, não Killed. Nenhuma asserção de causa inexistente ou dependência desses dez estados para atingir o threshold.

Avisos do preprocessor ao analisar HTML/aviso de dados foram preservados; não são código mutado nem falhas da baseline. Nenhuma dependência Angular instalada, warning suprimido ou HTML excluído do contrato de fidelidade.

### Revisão, encerramento da tarefa e limites

Refactor/revisão confirmou Domain puro, ports específicos e um único lifecycle Database partilhado; fonte/texto/precision/direitos preservados. Corrigidos CHECK/null, terminação Nest/teardown e limpeza com writer; erros reais e regressões em ERR-0003–0006. Regras atuais não autorizam ampliar acervo/IA, criar associação bíblica ou retomar S02-T006/T007.

Conferência final Docker: dev/test saudáveis em loopback55432/55433; consulta read-only no serviço postgres-test confirmou db/role biblia_test e0 fontes/0 excertos após limpeza dos testes. Ficheiros de fixture/original mantidos; nenhum dado de desenvolvimento alterado.

T006 IN_PROGRESS → REVIEW → DONE técnico; gates1/2/3/4/5/7 PASS,6 não aplicável/NOT_RUN. S03 continua IN_PROGRESS, T007 BLOCKED no aceite do [plano concreto](tasks/S03-T007-verification.md), commit PENDING. Pergunta de fechamento da sprint só na revisão final; CI/original no runner e avaliação integrada ainda não executados por inferência.

Validação documental final Node/fs+Git:75 ficheiros/31 Markdown/224 links relativos, zero destinos ausentes, whitespace ou alterações S00/S01/S02/specs originais/ADRs/.github; nenhum staging. Varredura limitada de passwords locais conhecidos e chaves privadas: zero ocorrências, sem alegação de auditoria universal. Cache/relatório iguais em639 mutantes/26 fontes, padrão completo confirmado e quatro hashes de artefactos preservados; raw/ambientes/relatórios continuam ignorados. Artefactos locais: reports/s03-t006-docs-final.json e -artifacts-final.json. Leituras estruturadas UTF-8/JSON/Git usam ferramentas nativas por necessidade de parsing; npm/Docker/Git por RTK quando compatível. Não há TDD de comportamento adicional para sincronização documental pura; estes checks executáveis validam essa parte.

## Revalidação T006 — etapa438 (histórico)

`rtk npm run test:coverage` final:20 suites/438 PASS (318 unit/67 integração/53 E2E),29,91s, exit0; reports/s03-t006-coverage-final.log. Linhas372/372=100%, branches166/171=97,07%, statements433/434=99,76%, funções69/69=100%. O src próprio continua integralmente no escopo; sem nova exclusão.

Após a primeira mutação, correções verificadas: bootstrap rejeita falha de provider ao launcher existente em vez de encerrar diretamente (RED observado → GREEN1, depois composição2 PASS); guarda process.exit só no ambiente Jest (antes exit27 →3 PASS); cleanup de teste serializado com writer real e teardown condicionado à criação efetiva do recurso (1 RED →1 GREEN). [ERR-0004](../../megabrain/errors/ERR-0004-nest-composition-exit.md)/[ERR-0005](../../megabrain/errors/ERR-0005-test-cleanup-isolation.md) separam causas confirmadas dos limites da análise. Subprocessos, PostgreSQL e HTTP reais permanecem exercitados; nenhuma falha obrigatória foi silenciada.

Regressões adicionais:45 casos determinísticos de contrato de saída com a fixture autêntica, três testes da guarda de processo, cinco unidades defensivas de identidade inesperada com double local identificado (não prova de servidor real). Integrações anteriores continuam a validar a identidade verdadeira; caso adicional comprova recuperação/pesquisa/idempotência após desconectar o cliente importador. OpenAPI confere limites/defaults publicados e logs403/404 são verificados sem texto/ids/segredos. Nenhum texto histórico foi inventado.

Primeira mutação — FAIL do gate, não aprovação:638 mutantes/330 reutilizados,27min9s.394Killed/12Timeout/18Survived/200CompileError/13RuntimeError/1NoCoverage;406/425=95,5294% textual, insuficiente para aceitar relatório com RuntimeError. App.ts já tinha correção posterior, portanto a fonte do relatório diferia nesse ficheiro; cópia inicial preservada em reports/s03-t006-mutation-attempt-01.json e cache -incremental-attempt-01.json. Não houve edição de estados/cache para converter erros. Adicionadas regressões das lacunas e iniciada nova execução incremental completa do src atual; gate5 continua pendente até relatório válido.

Os resultados abaixo conservam a primeira etapa377 PASS e os RED/GREEN iniciais; os438 testes acima são a regressão vigente.

A segunda execução arrancou com435 testes relacionados ao src PASS e479/639 mutantes reutilizados; os três casos da guarda de exit sem imports de src ficam fora da seleção automática findRelatedTests do Stryker, mas passaram no Jest normal. Surgiu uma segunda terminação nativa do Nest (abort/exit134), confirmada no código instalado; acrescentada guarda local e prova específica4 PASS, composição2 PASS. Essa cópia já iniciada não contém a guarda nova; não será aceite como aprovação final se houver RuntimeError. Nenhum ignoreStatic/operador/exclusão/threshold foi alterado.

## Execução T006 — primeira etapa377 (histórico)

Mesmo ambiente local e branch/base abaixo; nenhuma dependência instalada. Cliente Prisma regenerado para os dois modelos próprios. Migrações202610210001/202610210002 aplicadas somente a biblia_test/role biblia_test no schema app, guard/identidade confirmados; desenvolvimento não migrado/importado. Fonte/fixture/aviso T004 preservados, sem envio a IA.

| Verificação real | Estado | Comando/artefacto e resultado |
|---|---|---|
| Estrutura antes/depois | FAIL esperado → PASS | `rtk npm run test:integration -- --testPathPatterns=source-library/schema`: antes1 falha por ausência das tabelas, depois1 PASS. É verificação estrutural, não RED de regra; reports/s03-t006-schema-before.log/-after.log |
| Prisma/migração inicial | PASS | `rtk npm run prisma:generate`; `rtk npm run db:migrate:test`, duas tabelas somente em app e sem GIN/tsvector automático |
| Application/repositório — RED | FAIL esperado | `rtk npm run test:integration -- --testPathPatterns=source-library/library`:26 falhas em stubs compiláveis, reports/s03-t006-application-red-02.log. Sem sintaxe, falta de tabela ou serviço usada como RED |
| Application/repositório — GREEN/regressão | PASS |25/26 na primeira GREEN, só expectativa interna errada P1001 versus ECONNREFUSED nativo do adapter pg; corrigida para exigir a falha real.29/29 na regressão final, incluindo isolamento entre fontes e digest hexadecimal em maiúsculas |
| Ficheiros admitidos/importador — RED → GREEN | FAIL esperado → PASS | `rtk npm run test:integration -- --testPathPatterns=source-library/admission`:13 falhas em stubs →13 PASS. Logs -admission-red-isolated.log/-green-01.log; alterações/ausência de cada um dos quatro artefactos recusadas |
| Transporte — RED → GREEN | FAIL esperado → PASS | `rtk npm run test:e2e -- --testPathPatterns=source-library`:28 falhas por rotas/contratos ausentes,2 verificações de404 já passavam; depois30 PASS. Logs -http-red-isolated.log/-green-01.log |
| CHECK de permissões | FAIL → PASS | `rtk npm run test:integration -- --testPathPatterns=source-library/constraints`:6 nulls aceites indevidamente/9 PASS; migração corretiva preserva a aplicada e15/15 passam na regressão. [ERR-0003](../../megabrain/errors/ERR-0003-source-permission-null.md), logs -constraints-before.log/-permission-migration.log |
| CLI real — duas execuções | PASS | `rtk npm run db:import:sources:test --` com source.html, manifest.json, excerpts.json e NOTICE.source.txt explícitos, conforme README backend: imported → unchanged. -cli-import-01.log/-02.log; build real em ambas |
| CLI sem caminhos | FAIL esperado | `rtk npm run db:import:sources:test`, exit1, somente diagnóstico genérico; -cli-rejected.log. Não é falha pendente do produto |
| Regressão e cobertura | PASS | `rtk npm run test:coverage`:15 suites/377 testes (265 unit/65 integração/47 E2E), zero falhados/bloqueados; -coverage-01.log |
| Estática/build/arquitetura | PASS | `rtk npm run typecheck`, `rtk npm run lint`, build pelo importador/migração, `rtk npm run test:tooling`:13 checks, incluindo dependências/ciclos dos adapters/composição reais |
| Stryker incremental | Em execução, gate pendente |638 mutantes instrumentados/330 resultados reutilizados,308 a avaliar;113 estáticos não ignorados. Padrão todo src próprio, cache separado do relatório; não aprovar só pela cobertura |
| IA/avaliação semântica | NOT_RUN; não aplicável | Nenhum fornecedor/chamada IA neste escopo; recuperação lexical não prova suporte histórico |
| CI remota | NOT_RUN | Sem push; preparar original verificado no runner é item explícito do plano T007 ainda não executado |

Os primeiros lançamentos RED de admissão e HTTP coincidiram sobre a base partilhada; foram descartados como evidência de isolamento. Repetidos sequencialmente antes da implementação (-red-isolated.log), com as falhas de comportamento acima. Todas as validações posteriores que limpam a base, incluindo cobertura/mutação, executadas uma de cada vez. Não tratar concorrência de suites destrutivas como estratégia de teste.

O teste técnico S01 esperava exatamente uma migração. A migração aditiva revelou essa dependência indevida (-baseline-migration-regression.log,1 FAIL/6 PASS). O teste agora exige a migração fundadora e todas as entradas concluídas, aceitando evoluções do esquema; os sete casos passaram na regressão. Não se alteraram relatórios/specs/S01/S02 nem comportamento técnico403 global.

Desenho verificado: ports próprios sem dependência concreta em Application, Prisma mapeado para app, metadados/direitos conferidos antes de materializar excertos, filtro403 apenas de erros source-library. Consultas parametrizadas, inglês lexical/plainto_tsquery, rank/ordem estáveis, paginação segura até MAX_SAFE_INTEGER e contagem de cobertura real. Sem GIN persistente no refinamento aprovado. Importação verifica hashes fixos de quatro artefactos e SHA-256 UTF-8 dos textos; uma transação e lock PostgreSQL por identidade impedem importação parcial/duplicada. Concorrência comprovada com dois clientes reais e overlap observado de locks, não suposta pelo relógio.

Cobertura global T006: linhas100%, branches96,49%, statements99,53%, funções100%; resumo JSON/lcov em reports/coverage. Ramos defensivos não exercitados incluem desaparecimento entre identidade/leitura e identidade inesperada do servidor após guard; não foram excluídos. Refactor/revisão preservou comportamento e fronteiras; sem abstração genérica ou acesso a tabelas de outro módulo.

Gates1/2/3/4 demonstrados para T006;5 pendente da execução Stryker final,6 não aplicável,7 em sincronização documental. T006 ainda IN_PROGRESS, sem DONE prematuro. A sprint não está encerrada; plano T007 preparado para aceite posterior.

## Histórico T004/T005

Data:2026-10-21. Sprint IN_PROGRESS após «vai enfrente» aprovar escopo/SPEC v0.1/planos T004/T005. T004 DONE; T005 DONE tecnicamente após GREEN/regressão/estática/mutação e revisão. T006/T007 ainda não executadas. Branch feat/biblia-backend, base ee55c4e após principal S02 c0c24b9; árvore de trabalho S03 não commitada. Commit PENDING, sem encerramento/commit/push/merge autorizados.

## Ambiente e dados

Windows/PowerShell, Node24.16/npm11.13, TS6/Nest12/Jest30/Stryker10, PostgreSQL17.11 dev/test em Docker Desktop saudáveis e isolados. Nenhuma dependência instalada. T005 é Domain puro; regressão técnica integra banco/HTTP reais, sem simular futura integração de fontes.

T004 admite HTML oficial Josefo/Whiston/Gutenberg2848,3.561.835 bytes, SHA098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99, obtido2026-10-21T17:05:40.441948Z. Livro I capítulo1: quatro parágrafos realmente numerados, cinco marcadores de notas omitidos. Extração e limitações no README/manifest da fixture. Raw/HTML/TXT/PDF de evidência ficam ignorados; quatro excertos/manifest/aviso exclusivos de teste são versionáveis.

Aviso integral do TXT oficial irmão preservado, SHA18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1; HTML não contém o aviso integral, não se declara o contrário. Texto canónico continua HTML; UTF-8 estrito verificado apesar do prólogo declarar ISO-8859-1. Não trocar exports silenciosamente. Fixture excerpts.json SHA2171bd34f61e74b22d61e58e6c71caa336716b8ad15e2c60f8210ce2e35d7f63; texto não gerado/corrigido/traduzido.

Direitos: declaração do fornecedor e condições/aviso conferidos, revisão local do texto original/tradução antiga com evidência primária da Lei9/2022 art.47 e datas bibliográficas, conforme README/manifest. Cinco usos locais permitidos; sendToAi pending. EXT-004 satisfeita só para recorte/usos locais/fixture, continua aberta para ampliações/IA. Não se alega garantia universal, GPG ou suporte histórico automático.

## Comandos e resultados reais

| Execução | Estado | Evidência/alcance |
|---|---|---|
| Python urllib HTTPS | FAIL de ambiente | Cadeia de certificado não aceite, sem ficheiro transferido por essa tentativa; não é RED |
| PowerShell Invoke-WebRequest para HTML/TXT | PASS | TLS mantido, bytes originais obtidos; sem bypass/credencial/serviço pago |
| Pesquisa legal WIPO PDF assinado | FAIL de acesso | Link assinado devolveu403; não presumida leitura integral. PDF oficial alternativo INICC obtido, conteúdo Lei9/2022 conferido apesar do nome histórico lei42001.pdf |
| Python stdlib: hashes/inventário/extração independente | PASS | Source/fixture/aviso/PDF hashes, quatro identidades/textos e numeração; segunda extração HTML confirmou todos os textos e digests |
| rtk npm run test:unit -- --testPathPatterns=source-library — RED | FAIL esperado | 3 suites/137 falhas por comportamento ausente em stubs compiláveis; reports/s03-t005-red-01.log, exit1 |
| Mesmo comando — GREEN | PASS | 3 suites/137 testes, reports/s03-t005-green-01.log, exit0 |
| rtk npm run typecheck; rtk npm run lint; rtk npm run build | PASS | Zero erros de TypeScript/lint, compilação real |
| rtk npm run test:tooling | PASS | 13 checks:7 arquitetura,6 gate de mutação; inclui AST/ciclos do novo Domain |
| rtk docker compose -f compose.yaml ps | PASS | postgres-dev e postgres-test saudáveis, loopback55432/55433 |
| rtk npm run test:coverage | PASS | 10 suites/289 testes:265 unitários (137 S03),7 integrações e17 E2E técnicos reais; reports/s03-t005-coverage-01.log |
| rtk npm run test:mutation:incremental | PASS | Dry run289,396 mutantes:288 reutilizados da S02/108 novos; duração3min10s, gate exit0. Cache/JSON independentes válidos, fontes iguais a src; reports/s03-t005-mutation-01.log/final.json |
| Ingestão/pesquisa/Prisma/HTTP source-library | NOT_RUN | T006/T007, sem migração/port/adapter/controller/composição ou falso PASS |
| IA | NOT_RUN; não aplicável | Sem chamadas/fornecedor/avaliações semânticas S03 |
| CI remota | NOT_RUN | Sem push autorizado |

## TDD, desenho e cobertura

137 testes escritos e executados contra stubs antes do comportamento; log RED mostra falhas esperadas, sem erro de import/tipo/ambiente usado como RED. Depois, GREEN mínimo para entidades, matriz de permissões e helpers internos. Revisão de refactor confirmou helpers específicos, cópia/freeze de permissions e preservação de texto, sem camada/base class/port genérico desnecessários. Regressão/estática/arquitetura reais executadas depois. Não alegar RED reconstruído.

Source conserva autoria/edição/origem/direitos/limitações e permissions independentes; translator null expressa não identificado. SourceExcerpt conserva texto/localização/hash estrutural/ordem; originUrl null representa link não disponível, conforme campo previsto, sem inventar endereço. Confronto com artefacto/hash e existência de Source/locator são responsabilidade futura de Application/adapters, não simulados por Domain.

Matriz de allowed/pending/denied para ingest/store, display/quote e index/display/quote, incluindo independência de sendToAi. Permissões pendentes não são default permitido. Checksum hexadecimal validado estruturalmente e preservado, cálculo real no teste/admissão/adapters. Objetos validados e cópia de permissions imutáveis, texto não aparado pelo Domain.

Cobertura global: linhas231/231=100%, branches118/121=97,52%, statements264/264=100%, funções36/36=100%. Novo Domain:70/70 linhas,32/32 branches,81/81 statements e10/10 funções=100%. Todo src próprio incluído; gerado excluído conforme configuração existente. JSON-summary preservado em reports/s03-t005-coverage-summary.json, lcov/HTML locais.

## Limites e gates atuais

Validação documental final em2026-10-21: Node/fs + Git PASS em37 ficheiros alterados/novos,24 Markdown/202 links relativos, zero destinos ausentes; T004/T005 DONE e T006/T007 BLOCKED coerentes. Zero diferenças nas18 fontes do relatório Stryker e zero alterações S00/S01/S02/specs originais/ADRs/.github; nenhum staging/commit S03. Varredura limitada de passwords locais e padrões de chaves privadas/tokens: zero ocorrências, sem alegação de auditoria universal. Artefacto ignorado reports/s03-t005-docs-final.json.

rtk git diff --check PASS para alterações rastreadas; git diff --no-index --check entre /dev/null e cada um dos17 ficheiros novos também PASS, com exceção de whitespace estritamente definida para os bytes originais do aviso. git check-ignore confirmou corpus/ambientes/relatório ignorados. Não se alterou hash/texto para contornar conversão de Git. Plano T006 preparado com proposta de adiar GIN persistente para respeitar index pending/denied; esse refinamento permanece pendente de aceite e não altera a SPEC v0.1 silenciosamente.

T004-AC01–04 PASS no alcance de curadoria/dados/documentação, sem testes de negócio fictícios. P01 admissão e P02/P03 Domain PASS, incluindo gate de mutação T005; I01/I02/H01/G01 globais da sprint NOT_RUN. Associação bíblica validada continua adiada, SR-001 original preservada e suporte semântico SR-AC05 permanece em avaliação própria S04/S05.

Gates1/2/3/5 aprovados em T005;4 não aplicável ao novo Domain sem persistência/HTTP (regressão técnica real passou, não substitui prova S03);6 não aplicável sem IA;7 aprovado tecnicamente pela sincronização e checks documentais finais. T005 DONE no recorte aprovado, com associações adiadas; a sprint não está encerrada.

## Histórico da preparação documental

Conferência de versionamento da fixture: core.autocrlf=true foi observado. NOTICE original tem323 CRLF/5 linhas com whitespace final; filtro padrão mudava o blob de a28d024e79f26fd65a6e2b863b0d95df73533528 para f292702d4c72169d2823aa5593c95712bb65963e. .gitattributes -text preserva bytes e aplica exceção de whitespace apenas ao aviso original, não ao código; JSON text/eol=lf fixa serialização/hashes. rtk git check-attr e git hash-object com/sem filtros PASS para aviso/manifest/excerpts com as regras. Não há novo comportamento de Domain; verificação executável de configuração substitui TDD adicional, sem repetir suites já válidas por mudança exclusivamente de filtros Git/documentação.

### Mutação final e análise

19 ficheiros próprios instrumentados,396 mutantes; relatório enumera18 ficheiros com mutantes. SourceDomainError é um subtipo vazio de Error, sem operador mutável gerado; continua no padrão src/**/*.ts e na cobertura, sem exclusão manual ou score fictício por ficheiro. Quatro ficheiros com comportamento novo produziram108 mutantes:78Killed/30CompileError, válidos78, bruto78/78=100%. Sem Survived/Timeout/NoCoverage/RuntimeError/Pending novos.

Global:284Killed/3Timeout/6Survived/103CompileError, válidos293, detetados287, bruto287/293=97,95221843003414%. Só Killed284/293 também supera85%; os timeouts não determinam aprovação. CompileError não é deteção: novos diagnósticos TS2564x3,TS2345x9,TS1313x10,TS2355x3,TS2367x5 são mutantes inválidos rejeitados pelo checker; originais passam typecheck/build/dry run. Relatório e cache parseados separadamente, resultados coerentes e zero diferenças de source para os18 ficheiros relatados. JSON preservado reports/s03-t005-mutation-final.json; cache separado reports/mutation/incremental.json, HTML/JSON finais locais.

Seis sobreviventes herdados mantidos no denominador: app.ts:20/id4 remove logger:false (observação incompleta de logs do framework); runtime-config.ts:32/id97 esvazia sentinela de loopback (cenários atuais mantêm normalização); database.ts:15/ids122–123 remove/esvazia schema (sem modelos Prisma ainda, SQL técnico qualificado); canon-domain-error.ts:2/id137 esvazia mensagem interna fora do contrato literal; health.controller.ts:27/id396 esvazia query de readiness (ligação continua exercitada, sem consumo de linhas). Não se declaram equivalentes universalmente nem se acrescentam asserções que só espelhem constantes. Análises originais nos relatórios S01/S02; IDs atuais explicitados.

Timeouts herdados109/runtime-config:33,355/error.filter:6 e403/health.controller:31, preservados como Timeout, não Killed. Retirar envio de resposta pode deixar pedido pendente; causas temporais dos restantes não isoladas. Sem NoCoverage/RuntimeError/Pending globais. T006 deverá comprovar schema app nos primeiros modelos reais.

Houve avisos do preprocessor Stryker ao tentar desativar typechecks em HTML de dados/aviso bíblico; não eram ficheiros de código mutado. Nenhuma dependência Angular instalada ou warning silenciado; dry run e execução/gate válidos. Thresholds/operadores/escopo próprios preservados, sem dispensa de testes obrigatórios.

Antes de «vai enfrente»,20 Markdown/195 links relativos sem destinos ausentes, quatro tarefas BLOCKED e3 operações GET propostas. Zero alterações em backend/.github/S00/S01/S02/specs originais/ADRs, zero staging, source-library ainda ausente naquela preparação. Checagem comparou14 fontes do relatório S02 sem diferenças e passwords locais sem ocorrências nos ficheiros modificados (verificação limitada, não auditoria universal). Artefacto reports/s03-preparation-docs.json. Isso não era teste de software nem admissão.

S02:44 ficheiros commitados em c0c24b9;12 metadados em ee55c4e, árvore limpa antes de preparar S03. Esta sprint continua não commitada. Parsing/extração nativos Node/Python/PowerShell por ausência de equivalente RTK; Git/npm por RTK quando compatível. Um patch documental apontou um contexto de outra SPEC e falhou integralmente, sem edição parcial; corrigido com caminhos/contextos próprios, sem conflito de requisito.
