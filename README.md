# Bíblia App

Atualização2026-10-30: [S08-T008 Google Sign-In](docs/sprints/S08/tasks/S08-T008-google-login.md) implementado. CI41078164874/db7f08d:2332testes113suites100tooling/100%linhas97,82%branches/mutação90,64%global89,96%IA/zeroRuntimeError+NoCoverage. Confirmação real com a conta Google adiada pelo utilizador, tarefa BLOCKED nessa integração. [Relatório atual](docs/sprints/S08/GOOGLE_AUTH_TEST_REPORT.md). Release anterior e suas métricas abaixo permanecem históricas.

Backend concluído tecnicamente para uso pessoal local: S00–S08, seis módulos NestJS, cânone bíblico, fontes, estudos privados versionados, IA/RAG local, conversas, referências cruzadas, notas, favoritos e eliminação retomável. [Fecho e limites](docs/sprints/S08/T007_COMPLETION_REPORT.md).

Validação da revisão f71a735: [CI40912125811](https://github.com/victorlanga348/Bible/actions/runs/40912125811), oito jobs SUCCESS;2249testes107suites89tooling,100%linhas97,94%branches; mutação90,96%global89,87%IA, zeroRuntimeError/NoCoverage. Backups dos dois bancos restaurados em ambiente isolado, recursos recuperados por HTTP, índice/vetores e dados anteriores preservados. [Relatório](docs/sprints/S08/TEST_REPORT.md).

Para usar, seguir [instalação, arranque e token](backend/README.md). API em127.0.0.1:3000; Swagger em `/docs/`, contrato em `/openapi.json`. [Inventário](docs/operations/environments.md), [backup/recuperação](docs/operations/runbooks.md), [operação IA](docs/integrations/local-ai.md).

Corpus autêntico Bíblia Livre/porbr2018:66livros1189capítulos31102versículos, atribuição/CC BY4.0 conservadas. IA usa quatro parágrafos de Josefo/Whiston e seleciona no máximo uma frase inglesa; também pode declarar evidência insuficiente. As respostas são atribuídas à fonte, com limitações explícitas. Direitos e avaliação cobrem uso pessoal local; frontend e serviço remoto/público permanecem fora deste ciclo backend. T008 acrescenta login Google em escopo próprio. [Escolhas e trabalho necessário para ampliar a IA](docs/integrations/ai-next-steps.md).

[Documentação](docs/README.md), [sprints](docs/sprints/README.md), [estado breve](docs/megabrain/agent-context/project-state.md), [arquitetura](docs/architecture/README.md), [sete gates](docs/quality/quality-gates.md), [AGENTS](AGENTS.md). Branch de entrega feat/biblia-backend; main preservada.
