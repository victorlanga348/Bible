# S05-T005 — Checkpoint de runtime, 2026-10-27

T005 IN_PROGRESS. Checkpoint autorizado para publicação/CI sob delegação vigente, sem encerrar a tarefa ou S05. Planos anteriores ao código na [ficha](tasks/S05-T005-provider.md). Novos HTTP/provider/artifacts/native têm RED/GREEN e prova real; cobertura completa passou, mas mutação própria75,83% exige reforço e nova execução. T006/T007 dependentes.

Publicado posteriormente como81a89a4ba710715d04114aa7374038c64394a037, `feat(sprint-05): manage authenticated local model execution`, push normal na feat/biblia-backend. [CI40449032546](https://github.com/victorlanga348/Bible/actions/runs/40449032546) concluída: global85,62%, mas própria75,83% FAIL para fecho. [Auditoria e reforços atuais](T005_MUTATION_RUNTIME_REVIEW.md).

## Prova real pelo adapter novo

`npm run ai:verify:local` PASS em154,23159s, relatório ignorado `reports/ai-provider-local-147JgU/report.json`, data2026-10-27T04:05:18.936Z. Runtime assinado/pins do perfil cf125651… e fonte raw/aviso admitidos, sem fixture para inferência ou respostas gravadas. Resultados:

| Operação | Resultado real |
|---|---|
| Embeddings de dois parágrafos | Dois vetores1024 dimensões,709 tokens |
| Embedding da pergunta | Um vetor1024 dimensões,32 tokens |
| Sabbath, contexto p1 completo | p1-s11, citação literal pertinente,1016+11 tokens |
| Ano da destruição de Jerusalém | null,1018+7 tokens |
| Entrada técnica excedente | Tokenizer real recusou antes de /v1/embeddings |

Doze pedidos/respostas controlados originais preservados, sem headers/chave; runtime fechado e ausência de processo/lock confirmada. Depois desta execução foram acrescentados somente créditos/URL/finalidade aos metadados do CLI; esses campos novos não são atribuídos ao relatório original. Prova direta anterior também PASS71,16095s, `s05-t005-live-adapter-proof.json`. Primeira tentativa desse harness falhou por caminho dist/src incorreto, sem iniciar modelo; não é RED de negócio.

CLI operacional usa contexto direto do parágrafo autêntico, sem recuperação vetorial. Não comprova Application, persistência, API privada de análise ou14 avaliações integradas. Esses gates dependem de T006/T007. Modelos não correram em paralelo com suites pesadas; containers próprios parados, .env/bible_db/main/domus preservados. Chave continua somente no ficheiro local, sem novos segredos/dependências.

## Testes e revisão local

Cliente HTTP técnico real RED41→RED48→GREEN48/1,349s; provider com sessão técnica gravada RED27→RED30→GREEN30/1,752s. Artefactos FS técnicos RED17→RED19→GREEN19, cancelamento posterior RED1FAIL19PASS antes de suporte ao sinal, depois GREEN20. São provas determinísticas identificadas, não inferência real.

NativeRuntime: `npm run test:unit -- --runTestsByPath test/unit/ai-assistant/native-runtime.spec.ts`, RED13FAIL1,945s e expansão antes da implementação RED20FAIL1,646s, shell executável sem comportamento, logs `s05-t005-native-runtime-{red,final-red}.log`; GREEN20/8,26s em `s05-t005-native-runtime-green.log`. Caso adicional de lease desaparecida encontrou erro não classificado, RED1FAIL21PASS9,17s antes da correção de finishLease, depois GREEN22; o caso de substituição preserva o lock alheio. Logs `s05-t005-native-lease-{red,green}.log`. Watchdog independente10s no filho técnico evita órfãos quando mutantes removem cleanup; teste adicional confere o harness, total23. Não é watchdog do modelo real nem substituto da prova acima. Cleanup só liberta a sua lease depois de parar filho próprio.

`npm run test:unit`:824 testes/26suites PASS20,478s; typecheck/lint/build e24 tooling PASS, logs `s05-t005-pre-gates-*`. Seis testes de prompt/protocolo são regressões pós-mutação sobre regras já corretas, não RED inicial. Fonte completa precisa de novos gates, sem herdar resultado anterior.

Regressão integral local posterior do mesmo código81a89a4: PostgreSQL de teste próprio fa533936a0a4/project biblia-backend/service postgres-test confirmado antes de start; cinco migrações reaplicadas no tmpfs, identidade guardada pelo script. `npm run db:migrate:test` PASS e `NODE_OPTIONS=--expose-gc --max-old-space-size=768 npm run test:coverage` PASS1165 testes/55suites/130,523s, linhas1135/1138=99,73%, branches679/707=96,03%. Módulo próprio270/273 linhas e242/261branches. Logs `s05-t005-local-test-migrations.log` e `s05-t005-local-full-coverage.log`. Sem mudanças de .env/banco nativo; NODE_OPTIONS removida depois. Medição anterior `npm run test:coverage -- --selectProjects unit` passou824 casos, mas saiu FAIL pelos limiares globais ao omitir integration/E2E:60,54% linhas/68,74%branches, diagnóstico `s05-t005-unit-only-coverage.log`, nunca gate aprovado.

Revisão posterior acrescentou três regressões e reforçou argumentos de CPU/contexto/offline: health inesperado não chama callback, erro arbitrário do callback é sanitizado e perfil com tamanho idêntico/digest alterado é recusado. Regras de produção inalteradas, não RED fictício. `npm run test:unit -- --runTestsByPath test/unit/ai-assistant/native-runtime.spec.ts test/unit/ai-assistant/runtime-artifacts.spec.ts` PASS46/2suites/11,421s; typecheck/lint PASS, logs `s05-t005-review-{regressions,typecheck,lint}.log`. Nova CI dos testes finais ainda pendente.

Relatório real original SHA256 bc394df232925c23a6d07232a627262c96cc4f50d0dbc50632f7cb7944a98e94. Revalidar digests/contagens e fontes do relatório de mutação final antes de qualquer DONE; estes resultados locais não substituem o score obrigatório.

## CI do empacotamento, fonte anterior

[CI40444290178](https://github.com/victorlanga348/Bible/actions/runs/40444290178), fonte2daad433823cb965631c7f496437ead68281deed, job121991731317: PASS1038 testes/51suites,24 tooling, linhas931/931100%, branches515/52498,28%, build/estática. Resolve ERR-0018. Execução40439892332 permanece FAIL por ENOENT no dry run, sem score aceite.

Mutação global1319Killed/30Timeout/128Survived/688CompileError,1349/1477=91,33378469871361%. Próprio ai-assistant190Killed/9Survived/71CompileError,190/199=95,47738693467336%. Zero RuntimeError/NoCoverage. Padrão src/checker/limiares intactos;2000/2165 resultados reutilizados pelo Stryker,165 reavaliados.55 fontes conferidas com commit e fontes atuais correspondentes. Novos HTTP/provider/native/artifacts não estavam neste snapshot, portanto não ficam aprovados por esta CI.

Artefacto12707398628/backend-quality, ZIP1232764 bytes/SHA b0a34bea35f0f40cf8767d0d57bf00a0d67393940d779618a0af58a89387304e; mutation.json SHA7865fa574755d6903be7aae9be5ada385ca6511440434561ee37c7c12bc219e3. Originais `reports/ci-40444290178-*`, auditor `audit-s05-protocol-ci.py`, resultado `s05-t005-protocol-ci-audit.json`.

## Nove sobreviventes próprios, sem exclusões

| ID | Causa e ação |
|---|---|
|360|Substituto intermediário sem Cc mantém o predicado, conforme análise Domain anterior.|
|411/412|end<=start redundante com texto positivo/comprimento coerente, conforme análise anterior.|
|482|Remover separador join(', ') torna JSON de múltiplas frases inválido. Acrescentado contexto legal com duas frases, parse e ordem.|
|529|Remover validateContext muda erro de entrada inválida para rejeição de resultado. Acrescentados contexto vazio e IDs duplicados, exigindo AiModelInputError.|
|542|Faltava fronteira positiva completion_tokens=1. Variante técnica de usage comprova aceitação; não se alega geração real de um token nesta gravação.|
|569|Faltava resposta com uma única embedding, caso de query. Acrescentada variante técnica controlada de um vetor.|
|607|Vetor encurtado também violava norma e mascarava guarda dimensional. Acrescentado vetor [1], norma válida/dimensão errada.|
|610|Troca >0.0001 por >=0.0001: igualdade impossível em binary64 para abs(norm-1). Subtração exata por Sterbenz em [0.5,2]; racionais 1±literal binary64 de0.0001 não são representáveis como norm. Fora desse intervalo a diferença é maior. Prova executada `python reports/prove-normalization-boundary.py`, `s05-normalization-boundary-proof.json` PASS. Não se fabrica igualdade com mocks.|

Antigo407 agora Killed após regressão dos offsets negativos coerentes. Cinco lacunas distinguíveis receberam contraexemplos pós-mutação; confirmação Killed depende do próximo relatório. Quatro equivalentes mantidos no denominador bruto, sem editar estados/cache. Análise anterior preservada em [MUTATION_ANALYSIS](MUTATION_ANALYSIS.md).

## Revisão e saída

Domain permanece puro, ports sem SDK/framework, ambiente/key/processos confinados em infrastructure; sem API/SQL novos nesta tarefa. CLI é harness operacional de inputs públicos controlados. Auditoria documental executável antes de commit; documentação pura não tem RED/GREEN de comportamento. Publicar fonte completa, obter cobertura/mutação, analisar fonte/contagens/sobreviventes e só depois decidir T005 DONE. Pergunta de fecho integral permanece para T007, sem nova autorização já dispensada.
