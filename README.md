# Bíblia App

Backend modular para leitura bíblica, biblioteca de fontes e estudos privados versionados, com IA local em integração. Frontend fora do ciclo atual.

S00–S07 concluídas tecnicamente; [fecho S07](docs/sprints/S07/T007_COMPLETION_REPORT.md). Backend com cânone/fontes/estudos, IA/RAG/conversas privadas, referências cruzadas e workspace de notas/favoritos/histórico com eliminação retomável. CI40900841329:2133testes102suites83tooling PASS,100%linhas97,56%branches, mutação89,28%global88,82%IA/zeroRuntimeError+NoCoverage; provas nativas/semânticas e preservação PASS. S08 autorizada e READY para hardening/restauração real/validação final; backend inteiro ainda não declarado concluído. IA limitada à seleção de uma frase inglesa de obra admitida para uso local pessoal, conforme direitos e cobertura documentados.

Estado e próximo passo: [contexto breve](docs/megabrain/agent-context/project-state.md). Provas/falhas por execução: [relatório S05](docs/sprints/S05/TEST_REPORT.md). Uso/configuração: [backend](backend/README.md), [IA local](docs/integrations/local-ai.md). Histórico das entradas anteriores preservado em [arquivo](docs/megabrain/agent-context/README-history-2026-10-27.md).

Desenvolvimento: corpus autêntico porbr2018 com66livros/1189capítulos/31102versículos; fonte histórica limitada a quatro parágrafos de Josefo/Whiston. Nova admissão local de IA é da mesma obra, sem testemunha independente adicional. Estudos legados preservados; modelos/perfis/dados têm admissões próprias.

## Entrada
Ler [índice](docs/README.md), [AGENTS](AGENTS.md), [GEMINI](GEMINI.md), [governança](docs/documentation-governance.md), [sprints](docs/sprints/README.md) e [contexto operacional](docs/megabrain/agent-context/project-state.md).
Trabalho atual: [PLAN S04](docs/sprints/S04/PLAN.md), [SPEC](docs/sprints/S04/SPEC.md), [tarefas](docs/sprints/S04/TASKS.md) e [relatório](docs/sprints/S04/TEST_REPORT.md), na execução integral. Evidências das sprints anteriores permanecem preservadas.

## Backend prescrito
NestJS, TypeScript strict, Node.js LTS compatível, REST, OpenAPI/Swagger, Zod, Prisma/PostgreSQL; pesquisa textual nativa e pgvector quando necessário. DDD/hexagonal, monólito modular, seis [módulos](docs/architecture/bounded-contexts.md). Domain independente de frameworks/persistência/fornecedor IA.
Jest, Supertest e Stryker; TDD estrito, integração real. Linhas >=90%, branches >=85%, mutação bruta >85%, zero erros de tipagem/lint e nenhum teste obrigatório falhado/bloqueado. Versões fixadas no package-lock; compatibilidade e resultados exigem execução real.
Instalação, Docker, arranque e scripts reais de verificação estão no [README do backend](backend/README.md). [Sete gates](docs/quality/quality-gates.md).

## Planeamento e dependências
Ciclo [S00–S08](docs/roadmap/master-plan.md), trilhas A domínio, B infraestrutura, C qualidade/documentação. Frontend e S09 antigos adiados; [histórico/rastreabilidade](docs/roadmap/traceability.md) preservados.
[Ações externas](docs/external-actions/REQUIRED_ACTIONS.md): ambiente PostgreSQL isolado, cânone/traduções/licenças, fontes, fornecedor/modelos IA, acesso/retenção e deployment. Nenhum segredo no Git/chat.
Specs históricas de negócio continuam rascunho; SPEC v0.2 S02 e plano T005 foram aprovados pelo «ok». Planos detalhados seguintes precisam de aceite próprio. Branch backend feat/biblia-backend; commit por sprint só após relatório/aprovação final; merge/push e próxima sprint exigem autorização própria.
Histórico preservado: [DOC-0001](docs/tasks/DOC-0001-inicializacao-governanca.md) e [S00-T001](docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md).
