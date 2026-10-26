# S04 — Motor de Estudos

Execução verificada2026-10-26: T004–T007 DONE, sprint DONE no fecho delegado após revisão/auditoria.907 regressões/CI corrigida, estática/build/tooling e mutação global90,69%/própria87,71% aprovadas com fontes/originais correspondentes. Sem alteração do escopo/contratos nesta revisão; limitações e evidências no [TEST_REPORT](TEST_REPORT.md)/[REVIEW](REVIEW.md). Commit principal a criar e hash a registar posteriormente. Preparação seguinte histórica.

## Preparação vigente — 2026-10-22

A [autorização integral](../../roadmap/completion-execution.md) delega decisões e execução sem nova permissão. Sprint IN_PROGRESS, T004/T005 DONE/T006 IN_PROGRESS. [SPEC](SPEC.md)/ADR-0005 implementadas em persistência/versões/adapters/HTTP/CLI com RED/GREEN;907 regressões PASS,100% linhas/97,98% branches e operação real no PC comprovada. Guardas de URL corrigidas e dados preservados; mutação integral da fonte corrigida pendente em CI/T007 dependente. Ensaios locais incompletos não são score e não dispensam o gate; não inferir o gate novo da mutação T00588,98%. Notas seguintes históricas.

Objetivo: criar e guardar estudos determinísticos privados, com texto bíblico/contexto reais, evidências autorizadas, versões imutáveis e limitações explícitas. Não exigir nem simular LLM; geração real pertence a S05. Cobertura de fontes inicial é uma obra/quatro parágrafos, não investigação académica completa de toda a Bíblia.

| Tarefa | Escopo e saída verificável | Dependência |
|---|---|---|
| [S04-T004](tasks/S04-T004-contracts.md) | Refinar SS-001/HTTP/direitos, identidade local JWT e curadoria operacional separada da fixture; justificar/verificar JOSE antes de instalar | S02 integral e S03 fechadas |
| [S04-T005](tasks/S04-T005-domain-access.md) | Study/Section/Interpretation/Evidence imutáveis, classificação e privacidade, JWT real/guard falha fechado; RED/GREEN/REFACTOR | T004 |
| [S04-T006](tasks/S04-T006-persistence-http.md) | Construção por contratos públicos Canon/Source, Prisma/transações/versões, três rotas privadas, concorrência e projeção de direitos | T005 |
| [S04-T007](tasks/S04-T007-verification.md) | Percurso real de ponta a ponta, gates, direitos/owner, documentação e encerramento/commit/push autorizados | T006 |

Ficheiros previstos: módulo study em domain/application/infrastructure/presentation/module.ts; autenticação técnica em infraestrutura partilhada; schema/migração próprios de study; contratos públicos complementares de source-library para associações explícitas; scripts operacionais locais e testes correspondentes; docs/README. Não aceder a tabelas/adapters de módulos alheios, criar serviço externo ou alterar Domain para depender do ambiente.

Dependência nova proposta e justificada: JOSE em versão exata compatível, para assinar/verificar JWT com implementação auditável existente, evitando criptografia própria. Confirmar licença, engines, modo ESM e integração Node24/Jest30 antes de instalar sob a autorização delegada. Usar jwtSecret já existente sem imprimir ou versionar; Google OAuth não é inferido de GOOGLE_CLIENT_ID. Chave ausente fecha acesso privado, preservando contratos públicos existentes.

Riscos e mitigação: falsos factos por mera presença de citação → classificação/limitação explícitas; conteúdo persistido de fonte revogada → revalidação e redação na leitura; conflito concorrente → expectedVersion e transação; fuga entre owners → token validado e404 de recurso alheio; autenticação inválida →401 próprio sem alterar o403 técnico S01. Cada risco tem teste negativo obrigatório. Alternativas de ligação lexical automática, histórico anónimo ou servidor público de tokens por username foram rejeitadas por falsa fundamentação e privacidade.

Validação: testes primeiro, RED de comportamento em contratos compiláveis, GREEN mínimo, refactor com regressão/arquitetura. Application usa Prisma/PostgreSQL real; HTTP usa Nest/Supertest e schemas estritos. Casos de corpus partem de dados autênticos, identidades de teste são técnicas. Scripts reais existentes: typecheck, lint, build, test:tooling, test:coverage, test:mutation/test:mutation:incremental; emissão de token/importação operacional só recebem script npm depois de existir implementação verificada. Uma suite destrutiva por banco; mutação integral pode executar no CI isolado se o PC não tiver recursos, sem aceitar relatório incompleto.

Saída: critérios da SPEC e ACCEPTANCE_CRITERIA verificados, linhas>=90%, branches>=85%, score bruto>85%, zero falha/bloqueio obrigatório, análise de sobreviventes e fontes atuais. Gate IA não aplicável a estudo determinístico, sem afirmar integração futura. Relatórios/revisão/ADRs/MegaBrain e pergunta de fechamento auditados antes de DONE; depois commit identificável/push e registo posterior do hash. O relatório final deve explicar também limites do acervo e configuração efetivamente usada.

## Rascunho histórico de S00

Estado: RASCUNHO para refinamento; sprint BACKLOG. Documento preparado em S00, sem autorização de execução.
Branch: feat/biblia-backend. Commit: PENDING. Dependência: S03 encerrada e nova aprovação.

## Objetivo e escopo
Estudo estruturado determinístico é construído e guardado com versões a partir de evidências existentes.
Study, StudySection, Interpretation, Evidence, GenerateStructuredStudy determinístico, persistência, versionamento e estrutura; distinguir factos, inferências e interpretações.

## Fora do escopo
Frontend, módulos de sprints posteriores, serviços adicionais, merge/push/publicação automática. Aprovar este roadmap não aprova specs, contratos ou imports.
Em S04 não exigir LLM; em S05 não aceitar integração estática como real.

## Tarefas, contratos e ficheiros
Ordem e dependências em [TASKS](TASKS.md). Antes de cada tarefa refinar spec, ports, entradas/saídas Zod/HTTP/OpenAPI, erros, persistência e critérios de segurança pertinentes, sem inventar assinaturas/fields neste rascunho.
Ficheiros previstos: documentação da tarefa/spec, módulo afetado com domain/application/infrastructure/presentation/module.ts, testes e migrações justificadas. Caminhos concretos e dependências aprovados no plano detalhado antes da edição.
Contratos aprovados não existem ainda. Domain independente de NestJS/Prisma/SDKs e Application de adapters; nenhum acesso direto a dados de outro módulo.

## Testes e Red → Green → Refactor
Para cada comportamento aprovado: teste antes; RED por causa esperada e saída guardada; GREEN mínimo; REFACTOR com regressões/fiscalização arquitetural.
Domínio puro sem serviços; Application com infraestrutura real como padrão; Prisma/PostgreSQL/migrações/repositórios/transações/restrições reais; HTTP NestJS/Supertest; fixtures autênticas/autorizadas e limpeza segura.
IA separa contratos determinísticos, integração real e avaliações semânticas com fontes verificadas. Falta de credencial deixa teste/gate BLOCKED.

## Aceitação, riscos e alternativas
Critérios em [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md). Limites: linhas >=90%, branches >=85%, mutação bruta >85%; zero erros de tipagem/lint e nenhum teste obrigatório falhado/bloqueado.
Riscos: contratos incompletos, direitos/dados indisponíveis, credenciais/infraestrutura em falta e regressões. Mitigar aprovando contratos/dados, ações externas e testes antes de código. Não substituir por fixtures fictícias.
Alternativa de antecipar módulos ou usar fakes como aceitação rejeitada; preservação de fronteiras custa contratos/mapeamentos, reduzindo acoplamento. Versões e custos exigem investigação/aprovação antes do uso.
Dependências externas em [REQUIRED_ACTIONS](../../external-actions/REQUIRED_ACTIONS.md); dados/acesso/retensão/fornecedores conforme momento afetado.

## Validação e aprovação
Scripts reais de package.json serão identificados depois de existir aplicação; não há comandos de suite aprovados neste rascunho.
Executar sete gates aplicáveis, registar por critério comando/ambiente/data/resultado e artefactos, produzir [TEST_REPORT](TEST_REPORT.md) e [REVIEW](REVIEW.md), aguardar aprovação de encerramento/commit. Não iniciar sprint seguinte sem autorização própria.
