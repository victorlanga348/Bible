# Bíblia App

Execução vigente2026-10-22: utilizador autorizou terminar todas as sprints, refinar/implementar/validar e fazer commits/push sem novas permissões, com relato detalhado. [Plano de execução](docs/roadmap/completion-execution.md). Banco local PostgreSQL16.14/bible_db provisionado, corpus integral66 livros/1189 capítulos/31102 versículos com fidelidade verificada. [S02 integral](docs/sprints/S02/README.md) concluída tecnicamente:551 testes/31 suites PASS,100% linhas/97,47% branches, mutação padrão95,87% local e95,41% CI, zero RuntimeError/NoCoverage. S00/S01/S03 também concluídas. S04 é a próxima execução autorizada; S04–S08 ainda não estão entregues. Commit/push de encerramento já delegados; hashes/evidências no relatório/revisão. O estado de2026-10-21 abaixo é histórico.

Plataforma de estudo bíblico histórico, contextual e comparativo, com fontes verificáveis, divergências e incertezas explícitas. Uso inicial privado/pessoal; cobertura canónica completa pretendida e biblioteca de fontes progressiva.

## Estado real — 2026-10-21
Fundação técnica implementada e validada localmente na [pasta backend](backend/README.md): NestJS/TypeScript strict, Zod, Prisma/PostgreSQL isolado e testes HTTP/persistência reais. S02 tem corpus local admitido e domínio/parser implementados e verificados; consulta/importação de banco/API bíblica e IA ainda não estão implementadas. Sem frontend ou backend completo.
S00/S01 DONE e commitadas, principal S01 `1702cc0`. [S02](docs/sprints/S02/README.md) DONE no recorte corpus/domínio/parser; integração/API bíblica T006/T007 adiadas pelo utilizador, principal `c0c24b9`. [S03](docs/sprints/S03/README.md) DONE: T004–T007 DONE tecnicamente, com importação guardada, pesquisa PostgreSQL, três rotas reais de fontes e percurso completo artefactos → PostgreSQL → HTTP verificado. 440 testes PASS; linhas100%/branches97,07%; mutação bruta99,08883826879271% (435/439), zero RuntimeError/NoCoverage. Provas no [relatório](docs/sprints/S03/TEST_REPORT.md). [T007](docs/sprints/S03/tasks/S03-T007-verification.md) aprovada/concluída, CI preparado com original HTTPS/hash fixo e `.env` validado/adaptado apenas na credencial Compose de teste. Encerramento/commit S03 aprovados pelo «pode usar», após o relatório/revisão final e a pergunta obrigatória de fechamento. Commit principal: `604c45a29e78b5fb4d705ca4be95cbf77c1bc942`, registado posteriormente; CI remota NOT_RUN.

## Entrada
Ler [índice](docs/README.md), [AGENTS](AGENTS.md), [GEMINI](GEMINI.md), [governança](docs/documentation-governance.md), [sprints](docs/sprints/README.md) e [contexto operacional](docs/megabrain/agent-context/project-state.md).
Trabalho atual: [PLAN S02](docs/sprints/S02/PLAN.md), [SPEC](docs/sprints/S02/SPEC.md), [tarefas](docs/sprints/S02/TASKS.md) e [relatório](docs/sprints/S02/TEST_REPORT.md), na retoma integral. Evidências das sprints anteriores permanecem preservadas.

## Backend prescrito
NestJS, TypeScript strict, Node.js LTS compatível, REST, OpenAPI/Swagger, Zod, Prisma/PostgreSQL; pesquisa textual nativa e pgvector quando necessário. DDD/hexagonal, monólito modular, seis [módulos](docs/architecture/bounded-contexts.md). Domain independente de frameworks/persistência/fornecedor IA.
Jest, Supertest e Stryker; TDD estrito, integração real. Linhas >=90%, branches >=85%, mutação bruta >85%, zero erros de tipagem/lint e nenhum teste obrigatório falhado/bloqueado. Versões fixadas no package-lock; compatibilidade e resultados exigem execução real.
Instalação, Docker, arranque e scripts reais de verificação estão no [README do backend](backend/README.md). [Sete gates](docs/quality/quality-gates.md).

## Planeamento e dependências
Ciclo [S00–S08](docs/roadmap/master-plan.md), trilhas A domínio, B infraestrutura, C qualidade/documentação. Frontend e S09 antigos adiados; [histórico/rastreabilidade](docs/roadmap/traceability.md) preservados.
[Ações externas](docs/external-actions/REQUIRED_ACTIONS.md): ambiente PostgreSQL isolado, cânone/traduções/licenças, fontes, fornecedor/modelos IA, acesso/retenção e deployment. Nenhum segredo no Git/chat.
Specs históricas de negócio continuam rascunho; SPEC v0.2 S02 e plano T005 foram aprovados pelo «ok». Planos detalhados seguintes precisam de aceite próprio. Branch backend feat/biblia-backend; commit por sprint só após relatório/aprovação final; merge/push e próxima sprint exigem autorização própria.
Histórico preservado: [DOC-0001](docs/tasks/DOC-0001-inicializacao-governanca.md) e [S00-T001](docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md).
