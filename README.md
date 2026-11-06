# Bíblia App

Para arrancar a aplicação completa neste PC: executar **`npm.cmd run dev` na raiz deste repositório** e abrir **http://127.0.0.1:5173** quando aparecer `Bíblia App pronta`. API, frontend, verificação da IA e serviços locais existentes são coordenados pelo comando. [Passos e limites](docs/operations/DEV_STARTUP.md); [a tua parte](docs/operations/USER_ACTIONS.md).

Atualização2026-11-06: execução técnica [S10-T006](docs/sprints/S10/T006_REVIEW_PLAN.md) concluída, com agy coordenada pelo Codex. [CI42268953701 PASS](https://github.com/victorlanga348/Bible/actions/runs/42268953701):351testes, cobertura99,89%/95,66%, mutação global86,02247191011236%, zeroNoCoverage/RuntimeError e inventário35fontes auditado. [Tudo o que tens de fazer](docs/operations/USER_ACTIONS.md), [provas e limites](docs/sprints/S10/T006_TEST_REPORT.md). Google pessoal continua adiado; IA mantém perfil extrativo local. Restante histórico abaixo não substitui estes resultados.

Trabalho atual2026-10-30: [S10 — integração da aplicação](docs/sprints/S10/README.md), branch nova `feat/biblia-integracao` criada por pedido do utilizador. Frontend/backend/main preservadas. Leitura pela interface e API real já comprovada; sessão Google integrada, percursos privados e ampliação de IA seguem tarefas próprias. O estado/gates atuais estão em [S10](docs/sprints/S10/TEST_REPORT.md); restante texto guarda a release anterior e não comprova os incrementos novos.

Atualização2026-10-30: incremento [S08-T008 Google Sign-In](docs/sprints/S08/tasks/S08-T008-google-login.md) em validação, solicitado após o fecho local. Client ID existente agora é consumido; confirmação real com a conta Google fica pendente porque o utilizador optou por testar depois. Release anterior e suas métricas abaixo permanecem históricas.

Backend concluído tecnicamente para uso pessoal local: S00–S08, seis módulos NestJS, cânone bíblico, fontes, estudos privados versionados, IA/RAG local, conversas, referências cruzadas, notas, favoritos e eliminação retomável. [Fecho e limites](docs/sprints/S08/T007_COMPLETION_REPORT.md).

Validação da revisão f71a735: [CI40912125811](https://github.com/victorlanga348/Bible/actions/runs/40912125811), oito jobs SUCCESS;2249testes107suites89tooling,100%linhas97,94%branches; mutação90,96%global89,87%IA, zeroRuntimeError/NoCoverage. Backups dos dois bancos restaurados em ambiente isolado, recursos recuperados por HTTP, índice/vetores e dados anteriores preservados. [Relatório](docs/sprints/S08/TEST_REPORT.md).

Para usar, seguir [instalação, arranque e token](backend/README.md). API em127.0.0.1:3000; Swagger em `/docs/`, contrato em `/openapi.json`. [Inventário](docs/operations/environments.md), [backup/recuperação](docs/operations/runbooks.md), [operação IA](docs/integrations/local-ai.md).

Corpus autêntico Bíblia Livre/porbr2018:66livros1189capítulos31102versículos, atribuição/CC BY4.0 conservadas. IA usa quatro parágrafos de Josefo/Whiston e seleciona no máximo uma frase inglesa; também pode declarar evidência insuficiente. As respostas são atribuídas à fonte, com limitações explícitas. Direitos e avaliação cobrem uso pessoal local; frontend, OAuth e serviço remoto/público permanecem fora deste ciclo.

[Documentação](docs/README.md), [sprints](docs/sprints/README.md), [estado breve](docs/megabrain/agent-context/project-state.md), [arquitetura](docs/architecture/README.md), [sete gates](docs/quality/quality-gates.md), [AGENTS](AGENTS.md). Branch de entrega feat/biblia-backend; main preservada.
