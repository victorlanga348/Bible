# S10 — Integração da aplicação

Incremento solicitado2026-11-24: **S10-T007 IN_PROGRESS**, cadastro/entrada com conta própria, sem depender de Google. [Contrato/plano](T007_ACCOUNT_SPEC.md). O fecho T006 abaixo permanece histórico; não comprova os gates deste incremento.

Extensão S10-T007 em execução por pedido do utilizador: [cadastro e entrada com conta da aplicação](T007_ACCOUNT_SPEC.md). O fecho T006 abaixo permanece histórico e não certifica este novo incremento.

Estado: DONE 2026-11-06; sete gates aplicáveis e auditoria documental PASS. S10-T006 corrigiu e validou a integração: [plano](T006_REVIEW_PLAN.md), [evidências atuais](T006_TEST_REPORT.md) e [ações específicas do utilizador](../../operations/USER_ACTIONS.md). Branch `feat/biblia-integracao`, criada a partir de frontend5210a54; frontend/backend/main preservadas. [Tarefas](TASKS.md), [contrato de integração](SPEC.md), [critérios](ACCEPTANCE_CRITERIA.md), [testes históricos](TEST_REPORT.md), [revisão](REVIEW.md).

CI42268953701/d3e4438 PASS:351testes, cobertura99,89%/95,66%, mutação global86,02247191011236%, zeroNoCoverage/RuntimeError e inventário35fontes auditado. Arranque completo **`npm.cmd run dev` na raiz**, API/PG/browser/IA local confirmados com limites explícitos. T001–T005 permanecem históricos; T006 é a validação atual. Login pessoal Google continua adiado. Sem contratação paga ou deploy público.
