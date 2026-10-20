# Sprint 00 — Plano de consolidação do backend

Data: 2026-10-20. Estado do plano: APROVADO pelo «ok» do utilizador após a apresentação deste plano.
Branch: `feat/biblia-backend`. Base: `origin/main`, commit `d1d25b7f509ee7b887d53f945550d3f8c2a957d3`.
Encerramento/commit: aprovados pelo «sim» do utilizador em 2026-10-20, após TEST_REPORT/REVIEW. Commit principal: `74d8b6ca685cc99271c803d931c2ac371d99e0a9`, registado posteriormente na documentação e no contexto operacional. Responsável: agente executor; aprovador: utilizador.
Identidade: continuação documental de S00; tarefas propostas S00-T002 a S00-T007, sem reutilizar S00-T001.

As previsões e notas de preparação abaixo preservam o plano apresentado. O estado efetivo pertence a [TASKS](TASKS.md), e a validação realizada a [TEST_REPORT](TEST_REPORT.md); o «ok» aprova a consolidação, não o encerramento/commit ou S01.

## 1. Objetivo e limite da autorização atual

Consolidar a governança, a arquitetura e o backlog do backend segundo o novo pedido mestre, aproveitando a documentação existente e preservando o histórico.

O «ok» autoriza executar as seis tarefas documentais abaixo e consolidar as mudanças da secção 3. Relatório e encerramento/commit continuam sujeitos a aprovação final. Não há autorização para iniciar a Sprint 01, instalar dependências, criar aplicação, schema ou migrações, chamar IA, fazer merge ou push.

S00-T001 continua DONE e o encerramento anterior de S00 continua REVIEW. Este plano não reabre essa tarefa nem declara a nova consolidação concluída. As tarefas propostas estão BACKLOG, à espera da aprovação do seu escopo, plano e referências documentais. Uma aprovação deste plano pode cobrir expressamente as seis tarefas documentais; não aprova specs ou tarefas de implementação das sprints seguintes.

## 2. Auditoria do repositório

| Área | Evidência observada | Consequência |
|---|---|---|
| Git inicial | Branch `docs/s00-t001-governanca-sprints`, commit `c3fe4f2`, árvore limpa | Nenhum trabalho não commitado a sobrescrever |
| Remoto | `https://github.com/victorlanga348/Bible.git`; HEAD remoto em `main` | Repositório e branch principal confirmados |
| Evolução da main | Fetch identificou `d1d25b7`, merge do PR #1; árvore igual à branch documental | Branch nova criada a partir da main remota atual, sem executar merge |
| Branch dedicada | `feat/biblia-backend` não existia localmente nem no remoto; criada em `d1d25b7` | Alterações futuras ficam nesta branch; main local preservada |
| Produto e normas | README, AGENTS, GEMINI, PRD, regras, quatro specs, sete gates e política TDD existentes | Consolidar e ligar fontes; evitar documentação concorrente |
| Arquitetura | ADR-0001 aceite; ADR-0002 condicionada; contextos e modelo conceptuais propostos | Preservar ADRs históricas e documentar a evolução numa sucessora |
| Planeamento | S00–S09, 28 tarefas; S00-T001 DONE, restantes BACKLOG/BLOCKED | A sequência nova exige migração explícita, sem reciclar IDs |
| Aplicação | Sem package.json, lockfile, NestJS, schema Prisma, migrações ou CI no repositório | Bootstrap e ferramentas pertencem à Sprint 01 |
| Contratos e dados | Nenhum endpoint aprovado; catálogo de fontes vazio; cânone e licenças pendentes | Specs e dados precisam de aprovação antes da implementação dependente |
| MegaBrain | Estrutura Markdown local; sem configuração Obsidian encontrada nas entradas inspecionadas | Reutilizar diretórios existentes; não criar uma estrutura paralela |
| Ferramentas locais | Node `v24.16.0`, npm `11.13.0`, Python `3.14.5`, cliente Docker `29.7.2` | São versões observadas, não uma matriz de compatibilidade aprovada |
| PostgreSQL de teste | Nenhuma ligação validada; Docker não encontra `dockerDesktopLinuxEngine` | Não há infraestrutura real comprovada; decidir e disponibilizar ambiente antes do gate da Sprint 01 |

Inspeção: [governança](../../documentation-governance.md), [índice de sprints](../README.md), [gates](../../quality/quality-gates.md), [TDD](../../quality/tdd-policy.md), [testes](../../quality/testing-strategy.md), [mutação](../../quality/mutation-testing.md), [PRD](../../PRD.md), [regras](../../product/business-rules.md), [API](../../integrations/api-contracts.md), [modelo](../../architecture/data-model.md), [stack](../../architecture/stack.md), [ADRs](../../architecture/adr/README.md), [roadmap](../../roadmap/master-plan.md) e [rastreabilidade](../../roadmap/traceability.md).

MegaBrain consultado: [estado operacional](../../megabrain/agent-context/project-state.md), [erros](../../megabrain/errors/README.md), [padrões](../../megabrain/patterns/README.md) e [armadilhas](../../megabrain/pitfalls/README.md). Não há incidentes de aplicação ou padrões de implementação comprovados registados.

Skill consultada: `vercel:create-a-backend`, no catálogo local. Aplicação limitada a respeitar framework e arquitetura prescritos. Não se escolheu Vercel, alojamento, serviços ou dependências adicionais. Não foram delegadas tarefas a agentes.

## 3. Mudanças propostas para aprovação

As diferenças abaixo foram apresentadas e aprovadas documentalmente no «ok» ao plano; a consolidação não aprova comportamentos futuros. Estados efetivos de execução pertencem a TASKS.md.

| Tema | Documentação atual | Consolidação proposta |
|---|---|---|
| Sprints | S01 domínio; S02 persistência; S07 frontend; S09 hardening | Sequência backend S00–S08 da secção 5; frontend fora deste ciclo |
| Trilhas | A infraestrutura; B domínio/IA; C frontend | A domínio e regras; B infraestrutura e integrações; C qualidade e documentação |
| Stack | Runner, validação e publicação de API pendentes | Registar TypeScript strict, Node LTS compatível, REST, OpenAPI/Swagger, Zod, Jest, Supertest e Stryker como prescritos; versões por verificar |
| Topologia | Unidades de execução por justificar | Monólito modular com os seis módulos pedidos; sem Redis, filas externas ou microsserviços |
| Qualidade | Mutação >85%; sem mínimos numéricos de cobertura | Linhas >=90%, branches >=85%, score bruto de mutação >85%, zero erros de tipagem/lint e nenhum teste obrigatório falhado ou bloqueado |
| Application | Doubles unitários permitidos como apoio | Infraestrutura real como estratégia padrão; doubles identificados não comprovam integração |
| Stryker | Escolha condicionada, runner ainda não escolhido | Ferramenta obrigatória; compatibilidade com Jest a validar; incompatibilidade bloqueia o gate e exige intervenção, sem substituição silenciosa |
| Resultados | Estados de tarefa e de gates separados | Preservar os estados de tarefa; usar PASS/FAIL/BLOCKED/NOT_RUN por execução/critério; explicar aplicabilidade separadamente |
| Git | Mensagens em português; branch por tarefa | Commits deste backend em `feat/biblia-backend`, mensagens exatas por sprint prescritas no novo pedido; commit só após aprovação do relatório |
| Artefactos | README, scope, backlog, acceptance, retrospective | PLAN, TASKS, ACCEPTANCE_CRITERIA, TEST_REPORT e REVIEW como documentos canónicos, com índices e referências históricas atualizados |

Não alterar silenciosamente o significado de um ID existente. Na execução de S00, documentar a correspondência entre tarefas antigas e novas, conservar as entradas históricas e alocar novos números após o maior ID de cada sprint. O facto de um tema mudar de sprint não autoriza renomear uma tarefa antiga como se sempre tivesse tido outro objetivo.

### Reutilização documental

- Manter `docs/sprints/S00` a `S08`; não criar também pastas `sprint-00` a `sprint-08`.
- Manter `docs/architecture/system-overview.md`, `bounded-contexts.md`, `data-model.md` e `adr/`; não duplicar em `overview.md`, `domain-model.md` ou `decisions/`.
- Manter `docs/glossary.md`, `docs/product/business-rules.md`, `docs/quality/` e `docs/integrations/api-contracts.md`; não criar fontes concorrentes em `domain/`, `development/` ou `api/`.
- Incorporar conteúdo útil de scope/backlog/acceptance nos novos documentos canónicos. Preservar navegação antiga com referências curtas; não manter duas listas ativas de tarefas ou critérios.
- Preservar as evidências de S00-T001, DOC-0001 e a retrospectiva histórica; o novo REVIEW descreve apenas esta consolidação. Marcar no roadmap o planeamento antigo de frontend e S09 como histórico/adiado, sem executar ou apagar esses trabalhos.
- Usar o MegaBrain já configurado. Criar apenas a capacidade documental inexistente: `docs/external-actions/REQUIRED_ACTIONS.md`, com índice próprio e ligações a partir dos índices relevantes.

## 4. Arquitetura proposta

Monólito modular NestJS, REST e contratos explícitos de entrada/saída. Cada módulo terá `domain`, `application`, `infrastructure`, `presentation` e composição em `module.ts`, conforme o pedido. Criar pastas e abstrações apenas quando houver comportamento aprovado que as justifique.

| Módulo | Responsabilidade e propriedade propostas | Relações a especificar |
|---|---|---|
| `biblical-canon` | Book, Chapter, Verse, Translation, referência e navegação | Expõe referências validadas por contratos; não assume versificação comum entre traduções |
| `source-library` | Source, SourceExcerpt, proveniência, direitos e pesquisa | Fornece evidências identificáveis e limitações de cobertura |
| `study` | Study, StudySection, Interpretation, Evidence e versões | Consome contratos de cânone/fontes; define composição do estudo e proveniência |
| `ai-assistant` | Orquestração de LLM/RAG, embeddings, conversas, validação e limites | Consome ports e evidências; adapters ficam na infraestrutura; não define verdade teológica |
| `cross-references` | Relações entre passagens e classificação justificada | Referencia identidades de passagens por contrato; mantém suporte e natureza da relação |
| `study-workspace` | Notas, favoritos, histórico e recuperação de estudos/sessões | Referencia estudos por contrato; não controla diretamente tabelas de outros módulos |

A lista define módulos obrigatórios; aggregates, transações, context map e assinaturas de ports serão refinados antes das respetivas implementações. A eventual distinção entre módulo técnico e bounded context de negócio será registada, sem atribuir automaticamente um aggregate por entidade ou um serviço independente por módulo.

Direção de dependências: Application depende de Domain e ports internos; Infrastructure implementa esses ports; Presentation valida transporte e delega; composição NestJS liga implementações. Domain não importa NestJS, Prisma, Zod, SDKs de IA ou ambiente. Tipos Prisma não atravessam contratos internos. Chamadas entre módulos usam contratos explícitos; nenhum acesso direto às tabelas alheias.

Na Sprint 04, a construção determinística de estudos a partir de evidências existentes terá contrato e testes próprios. Geração com LLM e integração real pertencem à Sprint 05. Usar pgvector apenas para a pesquisa semântica necessária nessa etapa; pesquisa textual usa PostgreSQL. Não inventar endpoints, campos, quotas, prazos ou políticas de autenticação neste plano.

## 5. Backlog macro do backend proposto

| Sprint | Escopo | Evidência principal de saída | Dependência |
|---|---|---|---|
| S00 | Governança, arquitetura, rastreabilidade, backlog e plano S01 | Documentação validada, relatório aprovado e commit identificável | Aprovação deste plano |
| S01 | NestJS, strict TS, PostgreSQL, Prisma/migrações, Zod, OpenAPI, erros/logging, Jest/Supertest/Stryker e CI | Arranque, conexão e persistência reais, contratos técnicos aprovados e gates | S00 encerrada; ambiente de teste e toolchain aprovados |
| S02 | Cânone, traduções, parser, validação, navegação e consulta | API consulta/valida passagens reais com dados autorizados | S01; cânone, versificação e licenças |
| S03 | Fontes, excertos, proveniência, ingestão e pesquisa textual | Evidências autênticas recuperáveis e origem verificável | S02; curadoria/licenças |
| S04 | Estudos, secções, interpretações, evidências, persistência e versões | Estudo determinístico construído e guardado sem exigir LLM | S03; SS-001 e contratos aprovados |
| S05 | LLM real, embeddings/pgvector, RAG, citações e limites | Estudo fundamentado, integração real e avaliações aprovadas | S04; fornecedor/modelos, orçamento e credenciais |
| S06 | Conversas contextuais, mensagens, memória e perguntas livres | Conversa real preserva contexto e valida novas referências | S05; FQ-001, acesso e retenção |
| S07 | Referências cruzadas e workspace | Relações justificadas, notas, favoritos e recuperação real | S06; contratos de relações e SH-001 |
| S08 | Auditorias, regressão completa, segurança, desempenho e release | Backend validado sem pendência crítica; operação documentada | S07; ambiente e critérios de release aprovados |

Cada sprint continua a exigir plano, specs/contratos e tarefas aprovados antes da execução, relatório, aprovação final e commit. O quadro é planeamento, não autorização antecipada. Deployment preparado não significa publicação autorizada.

## 6. Tarefas atómicas propostas para S00

Prioridade: alta para todas, por integrarem a fundação solicitada. Estado: BACKLOG. Responsável proposto: agente executor. Revisor/aprovador: utilizador. Executar uma tarefa de cada vez, na ordem abaixo.

| ID | Trilha | Resultado e ficheiros principais | Dependências | Aceitação |
|---|---|---|---|---|
| S00-T002 | C | Consolidar AGENTS/GEMINI, governança, TDD, testes e gates, incluindo cobertura e aprovações separadas | Aprovação do escopo e plano desta tarefa nesta secção | AC-002, AC-005 |
| S00-T003 | A/B | Consolidar visão, seis módulos, linguagem, modelo conceptual e limites; criar ADR-0003 sucessora para a evolução arquitetural/stack | T002; ADR-0001/0002 lidas | AC-003 |
| S00-T004 | C | Migrar roadmap, dependências, rastreabilidade e documentos canónicos S00–S08; preservar histórico e retirar frontend deste ciclo | T003; proposta da secção 3 aprovada | AC-004 |
| S00-T005 | B/C | Criar registo de ações externas e relacionar decisões, momento de resolução, implementação preparada e testes pendentes | T004; inventário da secção 7 | AC-006 |
| S00-T006 | B/C | Preparar PLAN de S01 e decomposição técnica com contratos e dependências por aprovar | T005; sem provisionar/instalar | AC-007 |
| S00-T007 | C | Validar documentação, inspecionar segredos, sincronizar contexto/README, produzir TEST_REPORT e REVIEW e apresentar para aprovação | T006; critérios anteriores satisfeitos | AC-008 |

Referências normativas comuns: novo pedido mestre, secções 3–17, [governança existente](../../documentation-governance.md) e este plano. T003 não aprova schema físico. T006 não aprova nem executa contratos técnicos de S01. Aprovações posteriores de comportamento continuam independentes.

Cada tarefa terá ficha no diretório `tasks/`, conforme o [template existente](../../tasks/template.md), com os critérios desta tabela, ficheiros afetados, evidências e plano de validação. Mudança além do plano exige nova análise e aprovação.

## 7. Decisões e ações externas pendentes

Nenhuma credencial ou serviço é necessário para redigir e validar a documentação de S00. Há dependências que bloqueiam implementações ou validações posteriores; a ausência delas não transforma uma integração em PASS.

| ID proposto | Componente e ação necessária | Momento/critério de desbloqueio | Preparação atual |
|---|---|---|---|
| EXT-001 | IA: escolher fornecedor, modelos de geração/embeddings, orçamento e autorizar/configurar credenciais | Antes do adapter e das avaliações reais de S05; execução real aprovada | Apenas requisitos; nenhum adapter ou variável configurada |
| EXT-002 | PostgreSQL: aprovar ambiente isolado e disponibilizá-lo; se Docker for escolhido, iniciar o motor Linux | Antes da conexão, migrações e persistência reais de S01; provar isolamento de teste/dev/produção | Docker cliente instalado, motor indisponível; nenhuma base validada |
| EXT-003 | Cânone e traduções: decidir cânone/versificação, edições e direitos de uso | Antes de importação e testes canónicos reais em S02; origem/licença documentadas | Sem catálogo ou texto aprovado |
| EXT-004 | Biblioteca: aprovar fontes autênticas, proveniência e direitos de ingestão/citação/envio ao fornecedor | Antes da ingestão real de S03 e avaliações de S05 | Catálogo existente vazio |
| EXT-005 | Acesso e dados: decidir proteção do uso privado, retenção/eliminação e envio de dados à IA | Antes de persistir dados pessoais/expor acesso e antes de chamadas reais ao fornecedor | DEC-04/DEC-10 pendentes; sem implementação |
| EXT-006 | Operação: definir ambiente de deployment, acesso, segredos, backups e custos autorizados | Antes de preparar validação final de S08; publicar só com autorização específica | DEC-05 pendente; nada provisionado |

O registo a criar em `docs/external-actions/REQUIRED_ACTIONS.md` seguirá o formato pedido: ID, componente, estado ACTION_REQUIRED, ação, local, variável quando aplicável, como obter, implementação preparada, validação pendente e critério de desbloqueio. Para decisões sem variável, indicar «não aplicável» com motivo. Não inventar nomes de fornecedores, instruções de aquisição específicas, valores de segredos ou adapters existentes.

Após escolha do fornecedor, detalhar o procedimento correspondente e os nomes de configuração aprovados; `LLM_API_KEY` foi fornecida como exemplo, não representa uma credencial disponível. Não pedir segredos no chat. No código futuro, usar comentários ACTION_REQUIRED apenas onde ajudarem a identificar uma dependência real.

Decisões técnicas para S00/S01: matriz de versões compatíveis de Node LTS/NestJS/TypeScript/Prisma/PostgreSQL/Jest/Stryker/Zod/OpenAPI; gestor de pacotes; mecanismo de isolamento PostgreSQL; contratos de configuração, erros, logging, arranque e persistência técnica; fiscalização arquitetural; política/ambiente de CI e integração real. Consultar documentação oficial antes de propor versões e dependências concretas. Nenhuma foi instalada ou aprovada por este plano.

## 8. Esboço do plano S01 a detalhar em S00-T006

1. Aprovar spec técnica, matriz de versões, dependências e isolamento real; identificar scripts que serão criados, sem afirmar que já existem.
2. Preparar harness e verificações executáveis de configuração/estrutura; configurar TypeScript strict, lint, build, Jest, Supertest e Stryker.
3. Especificar composição NestJS, configuração Zod, OpenAPI, erros e logging sanitizado; teste antes de cada comportamento próprio.
4. Especificar persistência técnica mínima, sem inventar domínio: Prisma, migração versionada em PostgreSQL descartável, transação, restrição e limpeza com proteção do alvo de teste.
5. Provar arranque e HTTP real via Supertest, ligação real e efeitos persistidos; configuração inválida, indisponibilidade e erros com os contratos aprovados.
6. Preparar CI com os mesmos checks e banco isolado, segredos protegidos e bloqueios reais explícitos. Uma execução local não comprova execução remota de CI.
7. Executar cobertura, mutação, fiscalização arquitetural, migrações e inspeção de segredos; emitir relatórios antes de solicitar aprovação/commit.

Critério principal de S01: aplicação inicia e comunica com PostgreSQL real. Nenhum endpoint, campo de tabela, payload ou dependência adicional fica aprovado por este esboço. O plano detalhado deverá tornar esses contratos revisáveis antes de os implementar.

## 9. Critérios de aceitação de S00

Os resultados abaixo dizem respeito à execução futura da consolidação, não à existência deste plano. Estado inicial de todos: NOT_RUN.

| Critério | Condição verificável | Verificação/evidência planeada |
|---|---|---|
| AC-001 | Branch dedicada baseada na main remota inspecionada; nenhuma alteração à main, merge ou push desta operação | Estado Git, refs e comparação com baseline |
| AC-002 | Novas regras e trilhas coerentes entre AGENTS, GEMINI e fontes canónicas; sem autorização implícita de sprints futuras | Revisão das referências e requisitos do pedido mestre |
| AC-003 | Seis módulos mapeados, responsabilidades e dependências claras, ADR sucessora ligada e decisões pendentes identificadas | Revisão DDD/hexagonal e preservação SHA-256 de ADR-0001/0002 |
| AC-004 | S00–S08 têm os cinco artefactos pedidos, documentos canónicos únicos, IDs únicos e dependências sem ciclos; histórico rastreável | Verificador documental, inventário e matriz de migração |
| AC-005 | Gates registam cobertura de linhas >=90%, branches >=85%, mutação bruta >85%, zero falhas obrigatórias/tipagem/lint e dados reais | Inspeção das políticas; sem apresentar métricas não medidas |
| AC-006 | Ações externas têm todos os campos, dono da ação, sprint afetada e critério de desbloqueio, sem segredos ou implementação fictícia | Verificação de completude e revisão do estado real |
| AC-007 | S01 tem plano técnico, tarefas, contratos a aprovar, riscos, ambiente real e estratégia de validação; não foi iniciada | Revisão do plano e inspeção dos ficheiros criados |
| AC-008 | Links locais válidos, arquivos históricos preservados, diff limpo, relatório/REVIEW e MegaBrain sincronizados; commit aguarda aprovação final | Verificações reproduzíveis com comandos, data, resultados e limitações |

## 10. Estratégia de validação e Red → Green → Refactor

S00 altera exclusivamente documentação. Não há comportamento executável a submeter a RED/GREEN/REFACTOR, nem cobertura ou mutantes a medir. Esta não aplicabilidade será justificada nos gates; os checks de documentação serão executados realmente. Não criar lógica artificial para produzir cobertura ou score.

Validação documental prevista:

1. Registar baseline/hash dos documentos históricos antes das alterações autorizadas.
2. Verificar diretórios, cinco artefactos por sprint, navegação, links e fontes canónicas.
3. Validar unicidade dos IDs, estados permitidos, dependências existentes e grafo sem ciclos, incluindo correspondência dos IDs anteriores.
4. Comparar as normas com o novo pedido e com as decisões preservadas; verificar os seis módulos, trilhas e limiares sem os reduzir.
5. Inspecionar diff e candidatos a segredos sem imprimir valores sensíveis; confirmar que só documentação do escopo foi alterada.
6. Registar por critério PASS, FAIL, BLOCKED ou NOT_RUN, sempre com comando real e resultado observado; produzir TEST_REPORT e REVIEW.

O verificador inline de S00-T001 é específico da baseline anterior e exige contagens fixas. Não o adaptar para simular regressão aprovada nem tratar alterações documentais autorizadas como defeito de produto: preservar o relatório antigo e criar validação adequada à nova entrega.

Para S01 e seguintes: teste antes do comportamento, executar e guardar RED por causa esperada; implementação mínima e GREEN; refactor com repetição dos testes e fiscalização das dependências. Falha de ambiente/sintaxe não comprova RED. Migrações/configuração terão verificações executáveis adequadas. Todas as alterações de comportamento continuam sujeitas a TDD.

Aplicar Stryker ao comportamento próprio abrangido, prioritariamente Domain/Application; avaliar lógica própria de composição/adapters. Excluir apenas código gerado, migrações, SDKs e casos justificados. Investigar sobreviventes; preservar o cálculo de [mutação](../../quality/mutation-testing.md). Ausência real de código mutável exige justificação, não score de 100%; ferramenta incompatível ou credencial ausente deixa gate obrigatório BLOCKED. No plano S01, definir o escopo real de lógica própria a medir sem criar regras de negócio artificiais.

### Aplicabilidade dos sete gates em S00

| Gate | Tratamento planeado |
|---|---|
| 1 — Spec/escopo/plano | PENDENTE: aprovação deste plano, das seis tarefas documentais e das mudanças da secção 3 |
| 2 — TDD | Não aplicável à documentação, com justificação; checks documentais obrigatórios |
| 3 — Estática/build | TypeScript/ESLint/build não aplicáveis sem código/package.json; diff e Markdown verificados no Gate 7 |
| 4 — Integração | Não aplicável sem aplicação ou migração; ambiente PostgreSQL futuro permanece pendente |
| 5 — Mutação | Não aplicável sem código executável; nenhum score será declarado |
| 6 — IA | Não aplicável sem geração; nenhuma integração/avaliação será declarada aprovada |
| 7 — Governança | PENDENTE: critérios, links, rastreabilidade, histórico, relatórios e contexto sincronizados |

NOT_RUN com aplicabilidade «não» não é PASS de uma suite. A convenção de relatório indicará separadamente resultado, aplicabilidade, motivo e evidência. Falta de ferramenta/serviço obrigatório nunca se classifica como não aplicabilidade.

## 11. Ficheiros previstos depois da aprovação

Rever e alterar apenas quando afetados pela consolidação:

- Raiz: `AGENTS.md`, `GEMINI.md`, `README.md`.
- Fontes: `docs/README.md`, `documentation-governance.md`, `PRD.md`, `glossary.md`, `product/business-rules.md`, `product/roadmap.md`.
- Arquitetura: `docs/architecture/README.md`, `system-overview.md`, `bounded-contexts.md`, `dependency-rules.md`, `data-model.md`, `stack.md`, índice ADR e nova ADR-0003.
- Qualidade: índice de `docs/quality/` e políticas TDD, testes, gates e mutação; `docs/tasks/README.md`, `backlog.md` e `template.md` quando necessário para os artefactos/evidências.
- Planeamento: índices de `docs/sprints/` e `docs/roadmap/`, plano mestre, dependências, rastreabilidade, S00–S08 e fichas das tarefas S00-T002 a T007. Em S09, apenas indicar o destino histórico do planeamento que foi substituído, preservando conteúdo anterior.
- Integrações/operação: índices, `api-contracts.md`, `auth.md`, `llm-provider.md`, `environments.md` quando necessário para ligar decisões, sem aprovar contratos inexistentes.
- Ações externas: novo `docs/external-actions/README.md` e `REQUIRED_ACTIONS.md`.
- MegaBrain: índice/contexto operacional e registos mínimos de problemas confirmados; nenhum padrão, incidente ou lição inventado.

Preservação obrigatória: conteúdo histórico de `docs/tasks/DOC-0001-inicializacao-governanca.md`, `docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md`, ADR-0001 e ADR-0002. As quatro specs existentes continuam em rascunho e não serão alteradas nesta consolidação. A atualização das suas referências será feita nos índices/rastreabilidade, sem aprovação tácita do comportamento.

Não alterar ficheiros externos ao repositório, incluindo RTK.md. Nesta preparação apenas este PLAN é criado; todas as atualizações listadas acima são futuras e dependem de aprovação.

## 12. Alternativas, riscos e mitigação

| Escolha/risco | Vantagem ou consequência | Mitigação/alternativa |
|---|---|---|
| Reutilizar estrutura e consolidar documentos canónicos | Evita normas concorrentes; exige atualizar ligações | Manter referências antigas curtas e validar todos os links; alternativa de duplicar árvores rejeitada por manutenção e instrução explícita |
| Migrar roadmap com correspondência de IDs | Reflete backend pedido sem apagar histórico; aumenta trabalho documental de S00 | Preservar IDs/artefactos e registar substituições; não executar duas sequências concorrentes |
| Manter seis módulos num monólito | Fronteiras claras e deploy único; exige contratos entre módulos | Revisão de imports/propriedade dos dados; adiar abstrações sem necessidade |
| Escolher versões sem prova de compatibilidade | Pode impedir Prisma/Jest/Stryker e integrações reais | Não fixar versões nesta preparação; documentação oficial e prova real em S01 aprovada |
| Infraestrutura real indisponível | Gates de persistência ficam BLOCKED | EXT-002 e comprovação de isolamento antes da implementação dependente |
| Cânone/licenças/modelos indefinidos | Pode impedir corpus real e avaliações | Resolver ações externas antes da sprint afetada; nenhuma fonte/resposta fictícia |
| Zero mutantes válidos confundido com sucesso | Produz score enganador | Não declarar score; justificar aplicabilidade e avaliar código próprio real |
| Histórico Git/OneDrive | Na publicação anterior, leitura do índice reverso falhou; push funcionou com `pack.readReverseIndex=false` | Preservar objetos; usar configuração temporária quando necessária; não apagar/recriar histórico ou alterar configuração global |
| Main remota avançar durante o trabalho | Risco de base desatualizada ou trabalho alheio sobrescrito | Confirmar refs no início/fim; não fazer merge/reset automático; apresentar divergência se houver |

## 13. Evidências desta preparação

Ambiente: Windows/PowerShell, repositório local, 2026-10-20. Os resultados seguintes são inspeção/preparação; não são aprovação dos critérios futuros da sprint.

| Comando/ação executada | Resultado observado |
|---|---|
| `rtk git status --short --branch`, `rtk git branch -vv`, `rtk git remote -v`, `rtk git log -4 --oneline` | Árvore inicial limpa, branch documental e origin Bible confirmados |
| `rtk git ls-remote --symref origin HEAD refs/heads/main refs/heads/feat/biblia-backend` | Main remota em d1d25b7; branch backend ausente |
| `git -c pack.readReverseIndex=false -c pack.writeReverseIndex=false fetch --no-tags origin main` | Exit 0; origin/main atualizado de 593833e para d1d25b7 |
| Comparações Git entre branch documental e origin/main | Sem diferença de conteúdo; único commit adicional é o merge do PR #1 |
| `git switch --no-track -c feat/biblia-backend origin/main` | Exit 0; branch criada em d1d25b7 sem alterar main nem executar merge |
| `rtk git status --short --branch` e comparação com origin/main, após criar branch | Exit 0; branch correta, árvore limpa e nenhuma diferença |
| `rg --files` com filtros de aplicação/configuração e leituras UTF-8 focadas | Sem package.json/lockfile/schema/compose; documentação existente identificada |
| `node --version`, `npm.cmd --version`, `python --version` | v24.16.0, 11.13.0, 3.14.5 |
| Comando Docker reproduzido abaixo | Exit 1; cliente 29.7.2, motor Linux indisponível; nenhuma conexão PostgreSQL testada |

Comando Docker executado:

```powershell
docker version --format '{{.Client.Version}}|{{if .Server}}{{.Server.Version}}{{end}}'
```

Preferência RTK aplicada às leituras Git compatíveis. Git nativo usado no fetch com configurações específicas e na criação da branch; PowerShell usado para leitura UTF-8 e descoberta de ferramentas; comandos nativos de versão não executam scripts de aplicação. Nenhum segredo foi lido ou impresso nesta preparação.

## 14. Aprovações e fechamento

Agora: solicitar aprovação do escopo documental de S00, das tarefas S00-T002 a S00-T007 e da transição explícita descrita na secção 3. Não solicitar credenciais para implementar documentação.

Depois da execução autorizada: apresentar TEST_REPORT e REVIEW no formato pedido, com Commit `PENDING`, evidências, limitações e todos os critérios. Corrigir falhas obrigatórias antes de solicitar aprovação de encerramento. Pergunta de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

Apenas após aprovação explícita do relatório/encerramento: verificar Git, selecionar ficheiros de S00, criar `chore(sprint-00): establish backend governance`, registar hash e atualizar MegaBrain sem autorreferência impossível do próprio commit. O registo do hash poderá constar de uma atualização documental posterior autorizada, sem deixar alterações silenciosas na árvore. Não fazer push, merge ou iniciar S01 sem autorização própria.

Plano executado e encerramento/commit aprovados posteriormente pelo «sim». As previsões anteriores registam o processo seguido; S01, push e merge continuam sem autorização.
