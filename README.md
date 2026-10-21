# Bíblia App

Plataforma de estudo bíblico histórico, contextual e comparativo, com fontes verificáveis, divergências e incertezas explícitas. Uso inicial privado/pessoal; cobertura canónica completa pretendida e biblioteca de fontes progressiva.

## Estado real — 2026-10-21
Fundação técnica implementada e validada localmente na [pasta backend](backend/README.md), Sprint 01 autorizada pelo utilizador. NestJS/TypeScript strict, Zod, Prisma, PostgreSQL local isolado e testes HTTP/persistência reais já existem. Os módulos bíblicos e de IA pertencem às sprints seguintes; não há frontend, corpus ou backend completo.
S00 DONE, commitada. S01 DONE, revisão e encerramento/commit aprovados em 2026-10-21; continuação para S02 autorizada após o commit. Evidências no [relatório S01](docs/sprints/S01/TEST_REPORT.md) e avaliação no [REVIEW](docs/sprints/S01/REVIEW.md); CI remoto NOT_RUN.

## Entrada
Ler [índice](docs/README.md), [AGENTS](AGENTS.md), [GEMINI](GEMINI.md), [governança](docs/documentation-governance.md), [sprints](docs/sprints/README.md) e [contexto operacional](docs/megabrain/agent-context/project-state.md).
Trabalho atual: [PLAN S01](docs/sprints/S01/PLAN.md), [spec técnica](docs/sprints/S01/SPEC.md), [tarefas](docs/sprints/S01/TASKS.md), [critérios](docs/sprints/S01/ACCEPTANCE_CRITERIA.md), [relatório](docs/sprints/S01/TEST_REPORT.md) e [revisão](docs/sprints/S01/REVIEW.md). A evidência documental histórica da S00 permanece preservada.

## Backend prescrito
NestJS, TypeScript strict, Node.js LTS compatível, REST, OpenAPI/Swagger, Zod, Prisma/PostgreSQL; pesquisa textual nativa e pgvector quando necessário. DDD/hexagonal, monólito modular, seis [módulos](docs/architecture/bounded-contexts.md). Domain independente de frameworks/persistência/fornecedor IA.
Jest, Supertest e Stryker; TDD estrito, integração real. Linhas >=90%, branches >=85%, mutação bruta >85%, zero erros de tipagem/lint e nenhum teste obrigatório falhado/bloqueado. Versões fixadas no package-lock; compatibilidade e resultados exigem execução real.
Instalação, Docker, arranque e scripts reais de verificação estão no [README do backend](backend/README.md). [Sete gates](docs/quality/quality-gates.md).

## Planeamento e dependências
Ciclo [S00–S08](docs/roadmap/master-plan.md), trilhas A domínio, B infraestrutura, C qualidade/documentação. Frontend e S09 antigos adiados; [histórico/rastreabilidade](docs/roadmap/traceability.md) preservados.
[Ações externas](docs/external-actions/REQUIRED_ACTIONS.md): ambiente PostgreSQL isolado, cânone/traduções/licenças, fontes, fornecedor/modelos IA, acesso/retenção e deployment. Nenhum segredo no Git/chat.
Specs de negócio continuam rascunho; a autorização atual cobre a fundação S01. Branch backend feat/biblia-backend; commit por sprint só após relatório/aprovação final; merge/push e próxima sprint exigem autorização própria.
Histórico preservado: [DOC-0001](docs/tasks/DOC-0001-inicializacao-governanca.md) e [S00-T001](docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md).
