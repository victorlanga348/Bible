# Instruções operacionais — Bíblia App

## Autorização de execução vigente — 2026-10-22

O utilizador instruiu executar tudo o que for necessário, terminar todas as sprints e fazer git push sem nova autorização prévia, exigindo relato detalhado. Esta instrução posterior prevalece sobre exigências de nova aprovação neste ficheiro: o agente pode refinar e documentar planos/contratos/dependências, implementar, validar, encerrar incrementos e fazer commits/push na branch feat/biblia-backend sem repetir pedidos de permissão. A conclusão integral inclui retomar tarefas S02-T006/T007 antes adiadas e cumprir as dependências das sprints seguintes. Decisões concretas delegadas devem ser fundamentadas e registadas antes de implementação; não atribuir ao utilizador escolhas específicas que o agente tomou. Mantêm-se TDD, dados autênticos, proteção de segredos, isolamento, limites modulares e gates reais. Falhas/serviços ausentes não viram PASS; não declarar sprints concluídas sem provas. Manter main preservada, sem force push. Uma tarefa de cada vez, sem autorização implícita de subagentes. A pergunta de fechamento pode constar da auditoria documental sem interromper a execução para nova aprovação já dispensada.

## Fontes e aprovações
/docs contém as specs normativas; README é a entrada; ADRs aceites documentam decisões; MegaBrain preserva experiência sem substituir requisitos.
Ler [governança](docs/documentation-governance.md), [sprints](docs/sprints/README.md), [gates](docs/quality/quality-gates.md), [contexto](docs/megabrain/agent-context/project-state.md) e [PLAN S00](docs/sprints/S00/PLAN.md).
Em conflito entre requisitos, contratos, código ou decisões, interromper a implementação e solicitar esclarecimento. Não resolver silenciosamente.

O pedido mestre e o «ok» de 2026-10-20 aprovam a consolidação documental S00-T002 a S00-T007 e a transição do PLAN S00. Não aprovam S01, specs de negócio, encerramento, commit, merge ou push.
Antes da sprint apresentar objetivo, escopo, tarefas, dependências, riscos, critérios e validação; aguardar aprovação explícita.
Antes da tarefa identificar Sxx-Txxx; consultar specs, contratos, ADRs, erros/padrões/armadilhas do MegaBrain e skills relevantes. Apresentar plano revisável, vantagens, desvantagens, alternativas, riscos, mitigações e critérios verificáveis.
Exigir aprovação explícita do escopo de sprint, spec/contratos, plano e dependências da tarefa. Uma aprovação pode cobrir tarefas documentais expressamente listadas; não elimina aprovações de comportamentos futuros.
Mudança de escopo exige impacto e nova aprovação. Nunca alterar silenciosamente spec aprovada.
Modificar só ficheiros necessários, preservar alterações do utilizador e evitar refatorações alheias. Não instalar dependências sem justificação/aprovação. Não inventar contratos, campos, regras ou endpoints.

## Arquitetura e stack
Monólito modular NestJS, TypeScript strict, Node.js LTS compatível, REST, OpenAPI/Swagger, Zod, Prisma e PostgreSQL. Pesquisa textual nativa; pgvector quando necessário à pesquisa semântica. Versões por validar.
Jest, Supertest e Stryker Mutator obrigatórios; integrações reais e avaliações de IA.
Módulos: biblical-canon, source-library, study, cross-references, ai-assistant, study-workspace.
Cada módulo organiza domain, application, infrastructure, presentation e composição module.ts quando necessário.
Domain não importa NestJS, Prisma, Zod, SDKs de IA ou ambiente. Application depende de Domain/ports, nunca de implementações concretas. Infrastructure implementa ports; Presentation valida transporte e delega regras. Tipos Prisma não substituem entidades de domínio.
Não aceder diretamente às tabelas de outro módulo, criar abstrações genéricas sem necessidade, nem adicionar Redis, microsserviços, filas externas ou tecnologias sem justificação/aprovação. Ver [limites](docs/architecture/dependency-rules.md).

## TDD estrito: RED → GREEN → REFACTOR
Para cada alteração de comportamento:
1. RED: critério aprovado; teste antes da implementação; executar e comprovar falha pela razão esperada; guardar evidência.
2. GREEN: implementar o mínimo; executar e comprovar aprovação sem funcionalidade extra.
3. REFACTOR: melhorar desenho sem mudar comportamento; repetir testes e fiscalização arquitetural.

Não implementar primeiro para escrever testes depois, esconder defeitos ou ignorar testes falhados.
Sintaxe, ambiente ou dependência em falta não demonstram RED.
Configuração/estrutura/migração requerem verificações executáveis adequadas; harness não dispensa TDD subsequente.
Documentação pura exige justificação de não aplicabilidade e validação documental real. Ver [TDD](docs/quality/tdd-policy.md).

## Testes reais e dados controlados
Application usa infraestrutura real como estratégia padrão. Doubles locais identificados podem apoiar testes unitários específicos; não comprovam integração nem substituem permanentemente serviços reais.
Persistência: PostgreSQL de teste independente de desenvolvimento/produção; Prisma, migrações, repositórios, consultas, transações e restrições reais. Confirmar alvo antes de limpeza determinística.
HTTP: NestJS inicializado via Supertest, com contratos, schemas Zod, entradas/saídas, erros, persistência e segurança.
Fixtures versionadas são reais, identificadas, reproduzíveis e exclusivas de teste; não alimentam produção nem são apagadas após cada tarefa. Não inventar conteúdo bíblico/histórico.
IA: separar regras/contratos determinísticos, integração real e avaliações semânticas com fontes verificadas. Respostas estáticas não são chamadas reais. Suites pagas têm autorização/orçamento/quotas; não são exigidas em todo ciclo local.
Credencial/serviço obrigatório ausente: BLOCKED, nunca PASS. Preparar contratos/adapters/validação/tratamento de erros possíveis no escopo aprovado; integração continua bloqueada até prova real.
Registar ações em docs/external-actions/REQUIRED_ACTIONS.md; nunca pedir segredos no chat ou criar chaves fictícias.
Ver [testes](docs/quality/testing-strategy.md).

## Qualidade e evidências
Sete [gates](docs/quality/quality-gates.md): spec/plano/dependências; TDD; estática/build/arquitetura; integração/migrações reais; mutação; IA; documentação/governança.
Line Coverage >= 90%; Branch Coverage >= 85%; Mutation Score bruto > 85%; zero erros TypeScript/lint e zero testes obrigatórios falhados ou bloqueados.
Stryker obrigatório, prioritariamente Domain/Application; comprovar compatibilidade com Jest. Incompatibilidade bloqueia, sem dispensa/troca silenciosa.
Excluir código gerado, migrações e SDKs externos; avaliar comportamento próprio e justificar outras exclusões. Não manipular escopo; investigar sobreviventes e gerar relatório.
85% exatos falham. Sem mutantes válidos não há score aprovável. Ver [cálculo](docs/quality/mutation-testing.md).
Por execução/critério: PASS, FAIL, BLOCKED, NOT_RUN; registar separadamente aplicabilidade, motivo, comando real, ambiente, data, resultado, falhas e artefactos. Não aplicabilidade não é PASS.
Usar só scripts reais do package.json; não inventar comandos, métricas ou resultados. Gate obrigatório pendente/falhado/bloqueado impede DONE.

## Terminal e Git
Preferir rtk instalado/compatível; usar equivalente nativo quando indisponível/incompatível e registar motivo. C:\Users\victo\.codex\RTK.md é referência histórica; esta preferência com fallback substitui a obrigação anterior. Não editar o ficheiro externo.
Antes de editar verificar principal, estado e ficheiros a preservar. Backend usa feat/biblia-backend; inspecionar branch existente. Nunca sobrescrever alterações nem executar reset destrutivo.
Não alterar main, fazer merge automático ou push sem autorização específica. Aprovar relatório/commit não autoriza push.
Após relatório/REVIEW e aprovação explícita de encerramento/commit: selecionar só ficheiros da sprint e criar pelo menos um commit identificável:
- chore(sprint-00): establish backend governance
- feat(sprint-01): bootstrap backend infrastructure
- feat(sprint-02): implement biblical canon
- feat(sprint-03): implement source library
- feat(sprint-04): implement structured studies
- feat(sprint-05): integrate ai and rag
- feat(sprint-06): implement contextual conversations
- feat(sprint-07): implement cross references and workspace
- chore(sprint-08): harden backend for release

Nunca versionar .env sensível, credenciais ou segredos. Antes da aprovação final Commit = PENDING. Registar hash/MegaBrain sem autorreferência impossível nem alterações silenciosas.

## Gestão e fechamento
Trilhas: A domínio/regras; B infraestrutura/integrações; C qualidade/documentação. Não autorizam agentes paralelos, serviços separados ou violação de dependências.
Uma tarefa aprovada de cada vez salvo autorização expressa. Estados BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE; transições no índice de sprints.
Consultar MegaBrain/ADRs antes da tarefa; depois registar só problemas reais, causas confirmadas, correções/regressões e lições, atualizando contexto quando necessário. Não guardar segredos/transcrições completas.
Cada sprint tem PLAN.md, TASKS.md, ACCEPTANCE_CRITERIA.md, TEST_REPORT.md e REVIEW.md; entradas antigas apontam à fonte canónica, sem duplicar backlog/normas.
Fechar verificando critérios/gates, docs/ADRs/MegaBrain/roadmap, relatório e pendências. Sprint fica REVIEW até aprovação explícita; não iniciar a seguinte sem nova autorização.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

## Estado atual

Estado vigente2026-10-27: S00–S04 DONE; S05-T004 DONE/T005 IN_PROGRESS. ERR0019 confirmado por RED de health200 depois do deadline; NativeRuntime corrigido com restante absoluto/checagem pós-response/poll limitado. GREEN e855unitários/26suites/estática/build PASS; CLI real corrigido em execução sessão64252/reports/ai-provider-local-TWNsKr, não duplicar modelos/testes pesados. Produção mudou: scores665ed24/f75ce1c/ed53ce5 não validam o fix, nova CI necessária. Diagnóstico estático anterior5Killed/0reuso/default2802/59fontes/88,52%próprio preservado, passo temporário removido. PGteste próprio55433 parado após identidade/ID, tmpfs pede migração; .env/bible_db/main/domus intactos. T006/T007/API/RAG/14casos dependentes. Uma tarefa/sem agentes/nova permissão/force. Causa/provas docs/megabrain/errors/ERR-0019-late-readiness-health.md; notas seguintes históricas.

Estado vigente2026-10-26: S04-T004–T007/S04 DONE técnico e encerramento delegado após auditoria.907 testes/46 suites locais e CI40338249693 PASS,100% linhas/97,98% branches, estática/build/23 tooling PASS; mutação fonte912c600 global1159/1278=90,6885758998435%, recorte24 ficheiros371/423=87,70685579196217%, sem Timeout86,52482269503547%, zero RuntimeError/NoCoverage. Originais/hash/fontes conferidos,52 sobreviventes próprios analisados, hipóteses de nomes duplicados refutadas sem corrigir bug inexistente. PostgreSQL16.14/bible_db/corpus66/1189/31102 e .env preservados; teste17.11 reconstruído com cinco migrações. Fecho/commit/push já autorizados, hash final a registar depois. Próxima tarefa S05-T004 para contratos/viabilidade reais de IA, sem modelo/runtime instalado por preparação. Uma tarefa/sem subagentes/nova permissão/main/force. Notas seguintes históricas.

Estado operacional2026-10-23: S04-T006 IN_PROGRESS, Domain/Application/adapters/Prisma/Nest/CLI implementados por RED/GREEN.907/46 suites PASS,100% linhas/97,98% branches; guardas de URL corrigidas, build/typecheck/lint/23 tooling verificados. Mutação integral da fonte corrigida pendente; ensaios locais INCOMPLETE por defeito confirmado anterior e depois memória, nunca score aceite. Configurações temporárias arquivadas, padrão src/checker/limiares intactos; concluir em CI com fonte efetiva e calcular também o recorte24 ficheiros sem cache alheio. bible_db do PC: cinco migrações, corpus66/1189/31102 preservado, fonte operacional1/4/1 e estudo local-owner com duas versões, HTTP real/jwtSecret PASS e .env intacto. T005 de9d29b/CI39847927373 verificada; checkpoint fda125f/CI39858487212 anterior à correção não a valida. T007 depende dos gates T006; uma tarefa, sem agentes/novas permissões. Hashes posteriores sem autorreferência; notas seguintes históricas.

Atualização posterior ao fecho: S02 publicada cea12891fa00ade7ec52601a6e8e43384385be83 e confirmada na CI39791599315. S04 IN_PROGRESS, T004/T005 DONE: domínio/JWT/guard por RED/GREEN,667/34 suites PASS,100% linhas/97,89% branches, estática/build/tooling PASS; mutação própria323/363=88,98071625344353%, zero RuntimeError/NoCoverage,40 sobreviventes analisados. T006 READY para persistência/HTTP study, ainda NOT_RUN, depois do commit T005; T007 depende de T006. .env preservado. Autorização integral mantém-se, sem nova permissão/subagentes; uma tarefa por vez. Padrão de mutação integral intacto, configurações temporárias arquivadas. CI do checkpoint d10e198 também PASS integral, sem substituir o score próprio corrigido. Notas seguintes históricas.

Fecho integral2026-10-22: S02-T006/T007 DONE técnico,551 testes/31 suites PASS,100% linhas/97,47% branches; mutação padrão local95,87% e CI39778403173 integral95,41%, ambas sem RuntimeError/NoCoverage, fontes correspondentes. Auditoria causal preservou optional role como Survived; detalhes TEST_REPORT/REVIEW/MUTATION_ANALYSIS S02. Encerramento/commit/push delegados, validação documental antes de commit e hash registado depois. Próxima tarefa S04-T004, já autorizada, planos/SPEC preparados mas código não implementado. Manter uma tarefa de cada vez, sem agentes paralelos. Banco do PC16.14/bible_db completo e separado dos testes; .env preservado. As notas de checkpoints a seguir são históricas.

### Histórico dos checkpoints de validação

Atualização2026-10-22: autorização integral de execução/commit/push vigente, sem novas permissões. S02-T006 IN_PROGRESS/T007 dependente, integração bíblica implementada; src6085489,549 testes/30 suites PASS,100% linhas/97,47% branches. CI39732231940 falhou mutação por19 RuntimeError, sem score aceite. Stryker10 transfere token do checker e cria segundo runner mesmo com concurrency1: isolamento por advisory lock nos hooks raiz de integration/E2E em validação, RED2→GREEN2 real e estática PASS; regressão completa e gate global pendentes. Não retirar checker nem aceitar relatório incompleto. PostgreSQL16.14 do PC/localhost5432/bible_db com quatro migrações e66/1189/31102 registos autênticos, confronto integral/HTTP PASS; .env preservado/ignorado. Testes independentes em PostgreSQL17.11/55433; container temporário55434 já removido após identidade conferida. S04 tem planos/SPEC preparados, código NOT_RUN. Consultar contexto/TEST_REPORT S02 e execução integral para resultados atuais.

### Histórico antes da autorização integral
S00/S01 DONE e commitadas; principal S01 1702cc073e76c0bc3225d19f07fc69b7d0f80861. S02 DONE com escopo reduzido por «termina, o que falta vou adicionar depois»; decisão de fecho/adiamento em PLAN/SPEC v0.3/REVIEW. T004 DONE: ZIP/XML/aviso/catalogação e fixture reais verificados; T005 DONE técnico: Domain/parser verificados por152 testes, estática/tooling, cobertura100%/96,62% e mutação97,21%, sem Application/importação de banco/API bíblica ou IA. Consultar PLAN/SPEC/TASKS/TEST_REPORT S02 para resultados atuais. Colisão cache/JSON Stryker corrigida e nova execução válida; T006/T007 adiadas no BACKLOG, sem execução ou sprint futura atribuída. Encerramento/commit S02 e preparação S03 autorizados por «se terminou pode finalizar e ir para a proxima»; principal S02 c0c24b9f48aba7926dea05207a7263a97b7fc7b0. Sem push/merge ou execução dos planos futuros de integração ainda não aprovados. História DOC-0001/S00-T001 e specs históricas preservadas.
S03 DONE: T004–T007 DONE tecnicamente. «Vai enfrente» aprovou T006/refinamento sem GIN; «aprovado» posterior aprovou T007 e uso/adaptação necessária do `.env`. Application/Prisma/duas tabelas/importação/pesquisa/HTTP e percurso composto real verificados. 440 testes PASS; linhas100%/branches97,07%; mutação bruta99,08883826879271% (435/439), zero RuntimeError/NoCoverage; CI preparado com original HTTPS/hash e exercitado localmente, CI remota NOT_RUN. Só biblia_test foi migrado/importado; sem migração/importação de desenvolvimento, IA ou associação bíblica validada. `.env` do utilizador: apenas BIBLE_TEST_DB_PASSWORD sincronizada com a credencial real já validada em `.env.test`; demais valores preservados e Compose resolvido conferido. Consultar TEST_REPORT/REVIEW S03 e ERR-0003–0006. .gitattributes conserva hashes da fixture. Encerramento/commit S03 aprovados pelo «pode usar», após o relatório/revisão final e a pergunta obrigatória de fechamento; commit principal `604c45a29e78b5fb4d705ca4be95cbf77c1bc942` criado e registado posteriormente. S04/push/merge não autorizados. Não repetir aprovações T004–T007.
