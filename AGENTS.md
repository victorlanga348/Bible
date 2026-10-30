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

Release anterior S00–S08 concluída em84db8fe/ef8b87b. Incremento S08-T008 Google implementado: CI41078164874/db7f08d nove SUCCESS,2332testes113suites100tooling/100%linhas97,82%branches/mutação90,6426%global89,9578%IA/zeroRuntimeError+NoCoverage;138fontes113mutáveis6874assinaturas/466sobreviventes revistos. Tarefa BLOCKED apenas no teste com conta real, adiado expressamente pelo utilizador; não repetir pedido/nem alegar prova por RSA/JWKS técnicos. Servidor próprio408/porta3000 mantido para o teste. Backend isolado em LOCALAPPDATA/BibleAI/worktrees/google-login-backend/feat/biblia-backend; pasta principal pertence ao frontend do utilizador, não trocar branch/editar seus ficheiros. Código Google/IA/manifestos preservados na correção de CI dos originais admitidos, draft privado não deve ser publicado/eliminado. [Relatório](docs/sprints/S08/GOOGLE_AUTH_TEST_REPORT.md), [retoma](docs/sprints/S08/tasks/S08-T008-google-login.md), [contexto](docs/megabrain/agent-context/project-state.md), [guia IA](docs/integrations/ai-next-steps.md). Uma tarefa/sem agentes/main/segredos/serviços alheios preservados; documentação final não dispensa teste humano nem exige repetir gates de executáveis idênticos.


Pedido2026-10-27 reafirmado2026-10-28: reduzir consumo por contexto/releituras e validações repetidas, preservando TDD, requisitos, integrações e todos os gates. Consultar documentos pertinentes — tarefa, usar testes afetados durante RED/GREEN e regressões/gates completos nos marcos exigidos. Não alterar main, serviços alheios ou segredos, nem usar agentes. Autorização integral acima permanece vigente.
