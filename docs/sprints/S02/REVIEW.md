# S02 — Revisão e encerramento do escopo reduzido

## Encerramento do complemento integral — 2026-10-22

Commit de fecho publicado após auditoria documental PASS239 links/zero segredos/zero ficheiros proibidos: cea12891fa00ade7ec52601a6e8e43384385be83,25 ficheiros, mensagem chore(sprint-02): close verified biblical canon integration. Este registo é posterior e não pretende referir o próprio hash.

T006/T007 DONE técnico, extensão da entrega reduzida anterior. Autorização integral do utilizador delega encerramento/commit/push sem nova pergunta. Entregue: quatro tabelas próprias do cânone, importação integral autenticada/transacional/idempotente, conflitos e rollback, catálogo/consultas/navegação, resolução com existência real e cinco operações HTTP estritas. Domain/ports permanecem independentes e nenhum módulo lê tabelas alheias. Não há estudos/IA nesta entrega.

Gates atuais:551 testes/31 suites PASS, estática/build/arquitetura/tooling PASS,100% linhas/97,47% branches; mutação padrão local95,87155963302752% e CI integral95,41284403669725%, ambas sem RuntimeError/NoCoverage. Fontes conferidas, relatórios brutos preservados e análise de sobreviventes/timeouts em [MUTATION_ANALYSIS](MUTATION_ANALYSIS.md). TDD, prazos e falhas históricas estão no [TEST_REPORT](TEST_REPORT.md). A falsa deteção do optional role foi recusada na auditoria; observação limitada corrigiu o teste e retake produziu Survived, mantido na confirmação global.

Ambientes: PostgreSQL16.14 instalado no PC, bible_db/5432, com66/1189/31102 registos autênticos; testes17.11 separados/55433 e CI efémera. Quatro versículos de fixture não foram o seed do corpus integral. .env preservado/ignorado; credenciais não versionadas. Corpus amplo não significa biblioteca histórica ampla: fonte Josefo continua limitada a quatro parágrafos e sem IA. jwtSecret/GOOGLE_CLIENT_ID ainda não são integração de autenticação neste incremento.

Pergunta de fecho auditada: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"** A revisão conferiu alterações de schema/API/deadlines/harness/CI/ambiente e relatórios; foram refletidas. Preparações S04/S05 permanecem identificadas como não implementadas e fora do commit S02. Validação documental final precede commit; hash de fecho será registado depois de criado, sem autorreferência. O commit de implementação8055a4c e o checkpoint de harness90793e8 já estão publicados; main preservada. S04 pode prosseguir sob a autorização vigente depois deste encerramento.

## Histórico das revisões parciais e do recorte anterior

## Revisão parcial do checkpoint integral — 2026-10-22

Checkpoint de harness posterior:551 testes normais/31 suites PASS,100% linhas/97,47% branches;550 testes/30 suites PASS na configuração específica de mutação. Coordenação de suites por sessão PostgreSQL comprovada com dois processos reais32+32 PASS, espera observada/máximo1 titular em300 amostras. Corrige a transferência do checker para segundo runner do Stryker10 sem alterar node_modules, retirar checker ou excluir integrações/src. Fixture do teste concorrente precede aquisição de recursos; observers distinguem coordenador de clientes da aplicação e continuam a exigir ausência de leaks destes. Typecheck/lint/actionlint PASS; build/tooling do src6085489 continuam aplicáveis porque src não mudou. CI anterior39732231940 e ensaios locais falharam/incompletos preservados, sem gate antecipado. Este commit é checkpoint para nova mutação local/remota, não encerramento; T006 IN_PROGRESS/T007 dependente.

Sprint/T006 IN_PROGRESS, sem encerramento integral. A autorização geral permite este checkpoint/push e dispensa nova aprovação. A entrega agora contém importação integral/persistência/navegação/cinco contratos reais; esta secção atual prevalece sobre a revisão reduzida histórica abaixo. S04 continua somente em preparação.

Código atual: correções de qualidade reforçam integridade de metadados válidos, isolamento de edições, identidade defensiva do importador e schemas/diagnósticos; Database separa ligação10s, leitura5s e execução SQL2s após prova TCP RED2→GREEN2/regressão3. Regressão integral549 PASS/30 suites,92,337s; typecheck/lint/build/tooling PASS. Os thresholds e o escopo de src próprio não foram reduzidos. O relatório TEST_REPORT distingue baselines e fontes anteriores.

Gate de mutação ainda pendente: ensaios dirigidos comprovaram remoção individual dos hashes e defesa de identidade; não são score global. A tentativa CI40min foi cancelada antes do gate, e uma tentativa local de dry run falhou por ligação2s, sem score aceite. Limite CI90min e cache incremental com invalidação do harness foram validados por actionlint; execução remota do checkpoint e confirmação integral local ainda necessárias. Cache/relatórios originais preservados, sem edição de estados.

Riscos em revisão: cache estático, resultados fora da seleção dirigida, concorrência de limpeza/FK e prazos de transporte. Mitigações/testes e falhas reais nos ERR-0005/0006/0009/0010 e TEST_REPORT. Não declarar DONE nem transferir um score antigo ao Database modificado. O commit deste checkpoint documenta trabalho revisável e provas já executadas; o fecho continua dependente de gates completos.

Estado vigente2026-10-22: complemento T006/T007 em execução por autorização geral posterior, com T006 em validação e sprint IN_PROGRESS. Persistência/importação integral/five contratos reais implementados e testados;513 regressões PASS,100% linhas/97,05% branches. Mutação final e revisão integrada T007 pendentes, sem DONE antecipado. A revisão abaixo preserva somente o encerramento reduzido anterior; ver TEST_REPORT e TASKS vigentes.

Data:2026-10-21. Estado: DONE no recorte corpus/domínio/parser. Aprovação de redução de escopo e encerramento: utilizador, «termina, o que falta vou adicionar depois», após relatório de T004/T005 e explicação das pendências T006/T007. Commit principal S02 `c0c24b9f48aba7926dea05207a7263a97b7fc7b0`, realizado após «se terminou pode finalizar e ir para a proxima» em2026-10-21, depois desta revisão/pergunta de fechamento;44 ficheiros do escopo, árvore limpa após commit. Hash registado posteriormente. Continuação para preparação S03 autorizada após commit, sem aprovação implícita de novos contratos/planos. Sem push/merge.

## Entrega e decisão

T004 admite a Bíblia Livre/porbr2018 com origem, checksum, aviso/licença, catálogo e fixtures reais. T005 implementa Translation, Book, Chapter, Verse, PassageReference e parser estrutural puro, sem afirmar existência no banco. Regras/gramática do «ok» à SPEC v0.2 preservadas.

A decisão atual retira migração/importação, Application/consultas/navegação, cinco rotas e sua aceitação integrada do escopo de fecho. T006/T007 ficam BACKLOG para adição posterior pelo utilizador. Vantagem: concluir a entrega validada agora; custo: leitura bíblica HTTP e persistência continuam indisponíveis. Alternativa de completar o plano integral foi apresentada anteriormente; o utilizador escolheu adiar o restante. Nenhuma tecnologia/contrato novo foi implementado ou dependência instalada.

## Evidência e gates do recorte entregue

[TEST_REPORT](TEST_REPORT.md): RED87 esperado → GREEN53/87 → regressão152 PASS, com92 testes novos de Domain. TypeScript/lint/build/tooling13 aprovados; linhas100%, branches96,62%; Domain100%/100%. Stryker incremental:288 mutantes,172 reutilizados da integral S01/116 novos; score bruto209/215=97,21%, Domain91/92=98,91%. JSON válido e fontes dos14 ficheiros iguais a src, novamente conferidos no fecho.

Sem NoCoverage/RuntimeError/Pending; sobreviventes e3 timeouts analisados/mantidos no cálculo. Novo sobrevivente altera mensagem interna sem contrato literal aprovado. Colisão cache/relatório Stryker corrigida e repetição válida documentadas no ERR-0002; tentativa falhada não contada como PASS.

| Gate | Resultado no escopo de encerramento | Evidência/limite |
|---|---|---|
| 1 | APROVADO | SPEC/plano T005 aceites antes do código; utilizador autorizou agora redução/encerramento |
| 2 | APROVADO | RED/GREEN/refactor e regressão documentados |
| 3 | APROVADO | Estática/build/arquitetura e cobertura verificadas |
| 4 | NÃO APLICÁVEL ao incremento de Domain puro | Sem persistência/HTTP novos no recorte; regressão técnica real S01 passou. Integração bíblica adiada continua NOT_RUN |
| 5 | APROVADO | Stryker válido >85%, sem exclusões artificiais; sobreviventes analisados |
| 6 | NÃO APLICÁVEL | Sem IA |
| 7 | APROVADO tecnicamente | Escopo/critério/tarefas/índices/README/contexto sincronizados e checks documentais do fecho no TEST_REPORT |

Não há dispensa de falha de comportamento entregue ou redução de thresholds. T006/T007 e critérios originais não executados conservam estado e aplicabilidade futura. A revisão só aprova o incremento realmente entregue.

## Impactos, riscos e continuação

PLAN/SPEC registam a decisão sem apagar os contratos originais. Critérios novos AC05–07 identificam o recorte final; AC01–04 originais permanecem históricos e não integralmente satisfeitos. TASKS mantém as pendências numa fonte única. Roadmap/dependências/rastreabilidade registam o adiamento e não tratam S03 como automaticamente pronta.

Domain sem Nest/Prisma/Zod/ambiente/imports externos/ciclos; texto autêntico preservado, corpus ignorado separado de fixture versionável. Sem edição bíblica artificial, equivalência entre versões ou execução de SQL do fornecedor. Créditos/CC BY4.0 e hashes rastreáveis; sem alegação GPG independente.

Limites: não há Application, migração/importação no banco ou API bíblica, IA, frontend ou CI remota comprovada. Antes de funcionalidades que precisem desses serviços, rever a dependência adiada. ADR-0003/0004 continuam aplicáveis; sem mudança arquitetural, sem alterações históricas S00/S01/DOC-0001.

Pergunta obrigatória de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
