# Bíblia App

Plataforma de estudo bíblico histórico, contextual e comparativo, com fontes verificáveis, divergências e incertezas explícitas. Uso inicial privado/pessoal; cobertura canónica completa pretendida e biblioteca de fontes progressiva.

## Estado real — 2026-10-20
Somente documentação e governança. Sem backend/frontend implementados, package.json, schema Prisma, migrações, corpus aprovado, integrações ou ambientes provisionados.
A consolidação documental S00 foi autorizada pelo «ok» ao plano e validada. S00 DONE: relatório, encerramento e commit aprovados pelo «sim» do utilizador em 2026-10-20. S01 não iniciada. Nenhum teste de aplicação ou métrica de cobertura/mutação medido.

## Entrada
Ler [índice](docs/README.md), [AGENTS](AGENTS.md), [GEMINI](GEMINI.md), [governança](docs/documentation-governance.md), [sprints](docs/sprints/README.md) e [contexto operacional](docs/megabrain/agent-context/project-state.md).
Entrega atual: [PLAN S00](docs/sprints/S00/PLAN.md), [tarefas](docs/sprints/S00/TASKS.md), [critérios](docs/sprints/S00/ACCEPTANCE_CRITERIA.md), [relatório](docs/sprints/S00/TEST_REPORT.md), [revisão](docs/sprints/S00/REVIEW.md).
Próximo passo apenas após encerramento autorizado: rever/aprovar [plano S01](docs/sprints/S01/PLAN.md) e contratos técnicos antes de qualquer instalação.

## Backend prescrito
NestJS, TypeScript strict, Node.js LTS compatível, REST, OpenAPI/Swagger, Zod, Prisma/PostgreSQL; pesquisa textual nativa e pgvector quando necessário. DDD/hexagonal, monólito modular, seis [módulos](docs/architecture/bounded-contexts.md). Domain independente de frameworks/persistência/fornecedor IA.
Jest, Supertest e Stryker; TDD estrito, integração real. Linhas >=90%, branches >=85%, mutação bruta >85%, zero erros de tipagem/lint e nenhum teste obrigatório falhado/bloqueado. Versões/compatibilidade ainda por validar.
Não há comandos de instalação, execução ou testes da aplicação existentes. Não inventar scripts. [Sete gates](docs/quality/quality-gates.md).

## Planeamento e dependências
Ciclo [S00–S08](docs/roadmap/master-plan.md), trilhas A domínio, B infraestrutura, C qualidade/documentação. Frontend e S09 antigos adiados; [histórico/rastreabilidade](docs/roadmap/traceability.md) preservados.
[Ações externas](docs/external-actions/REQUIRED_ACTIONS.md): ambiente PostgreSQL isolado, cânone/traduções/licenças, fontes, fornecedor/modelos IA, acesso/retenção e deployment. Nenhum segredo no Git/chat.
Specs e contratos continuam rascunho; aprovar documentação não aprova implementação. Branch backend feat/biblia-backend; commit por sprint só após relatório/aprovação final; merge/push e próxima sprint exigem autorização própria.
Histórico preservado: [DOC-0001](docs/tasks/DOC-0001-inicializacao-governanca.md) e [S00-T001](docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md).
