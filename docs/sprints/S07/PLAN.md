# S07 — Referências Cruzadas e Workspace

Estado vigente2026-10-29: S07 IN_PROGRESS sob autorização integral, S06 encerrada48be2f0. T004 preparação de [SPEC](SPEC.md)/ADR-0007 em revisão documental antes de código; T005 relações, T006 workspace/lifecycle/históricos, T007 provas/gates. Agente é decisor delegado; uma tarefa por vez/sem agentes/sem novas perguntas. Nenhum gate de produto S07 presumido. Entradas seguintes históricas.

Estado: RASCUNHO para refinamento; sprint BACKLOG. Documento preparado em S00, sem autorização de execução.
Branch: feat/biblia-backend. Commit: PENDING. Dependência: S06 encerrada e nova aprovação.

## Objetivo e escopo
Utilizador navega entre passagens relacionadas e recupera estudos, notas, favoritos e histórico.
Citações diretas, alusões, paralelos temáticos/relações proféticas com evidência; notas, favoritos, histórico e recuperação de estudos/sessões.

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
