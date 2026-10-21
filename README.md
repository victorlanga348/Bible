# Bíblia App

Plataforma de estudo bíblico histórico, contextual e comparativo, com fontes verificáveis, divergências e incertezas explícitas. Uso inicial privado/pessoal; cobertura canónica completa pretendida e biblioteca de fontes progressiva.

## Estado real — 2026-10-21
Fundação técnica implementada e validada localmente na [pasta backend](backend/README.md): NestJS/TypeScript strict, Zod, Prisma/PostgreSQL isolado e testes HTTP/persistência reais. S02 tem corpus local admitido e domínio/parser implementados e verificados; consulta/importação de banco/API bíblica e IA ainda não estão implementadas. Sem frontend ou backend completo.
S00/S01 DONE e commitadas, principal S01 `1702cc0`. [S02](docs/sprints/S02/README.md) DONE com escopo reduzido por «termina, o que falta vou adicionar depois»: corpus/domínio/parser T004/T005 entregues; [T006](docs/sprints/S02/tasks/S02-T006-integration.md)/T007 adiadas no backlog. Resultados atuais no [relatório S02](docs/sprints/S02/TEST_REPORT.md); encerramento aprovado e commit principal S02 `c0c24b9`, CI remoto NOT_RUN. Pedido posterior autoriza preparação S03, com escopo/contratos/plano próprios para revisão.

## Entrada
Ler [índice](docs/README.md), [AGENTS](AGENTS.md), [GEMINI](GEMINI.md), [governança](docs/documentation-governance.md), [sprints](docs/sprints/README.md) e [contexto operacional](docs/megabrain/agent-context/project-state.md).
Trabalho atual: [PLAN S02](docs/sprints/S02/PLAN.md), [SPEC e revisão de escopo v0.3](docs/sprints/S02/SPEC.md), [S02-T005](docs/sprints/S02/tasks/S02-T005-domain.md), [tarefas](docs/sprints/S02/TASKS.md) e [relatório](docs/sprints/S02/TEST_REPORT.md). Evidências da fundação S01 e documentação histórica S00 permanecem preservadas.

## Backend prescrito
NestJS, TypeScript strict, Node.js LTS compatível, REST, OpenAPI/Swagger, Zod, Prisma/PostgreSQL; pesquisa textual nativa e pgvector quando necessário. DDD/hexagonal, monólito modular, seis [módulos](docs/architecture/bounded-contexts.md). Domain independente de frameworks/persistência/fornecedor IA.
Jest, Supertest e Stryker; TDD estrito, integração real. Linhas >=90%, branches >=85%, mutação bruta >85%, zero erros de tipagem/lint e nenhum teste obrigatório falhado/bloqueado. Versões fixadas no package-lock; compatibilidade e resultados exigem execução real.
Instalação, Docker, arranque e scripts reais de verificação estão no [README do backend](backend/README.md). [Sete gates](docs/quality/quality-gates.md).

## Planeamento e dependências
Ciclo [S00–S08](docs/roadmap/master-plan.md), trilhas A domínio, B infraestrutura, C qualidade/documentação. Frontend e S09 antigos adiados; [histórico/rastreabilidade](docs/roadmap/traceability.md) preservados.
[Ações externas](docs/external-actions/REQUIRED_ACTIONS.md): ambiente PostgreSQL isolado, cânone/traduções/licenças, fontes, fornecedor/modelos IA, acesso/retenção e deployment. Nenhum segredo no Git/chat.
Specs históricas de negócio continuam rascunho; SPEC v0.2 S02 e plano T005 foram aprovados pelo «ok». Planos detalhados seguintes precisam de aceite próprio. Branch backend feat/biblia-backend; commit por sprint só após relatório/aprovação final; merge/push e próxima sprint exigem autorização própria.
Histórico preservado: [DOC-0001](docs/tasks/DOC-0001-inicializacao-governanca.md) e [S00-T001](docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md).
