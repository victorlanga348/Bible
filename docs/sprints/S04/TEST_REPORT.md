# S04 — Relatório de testes

## T004 — Contratos e preparação, 2026-10-22

Sprint IN_PROGRESS, implementação T005/T006 ainda NOT_RUN. T004 concluída documentalmente sob autorização integral, após S02/S03 concluídas; SPEC/PLAN/fichas e ADR-0005 definem o comportamento antes de código. JOSE6.2.13/MIT/ESM com SRI confrontado,2/2 provas reais de assinatura/verificação/compatibilidade Node24/Jest30 PASS,1,109s, script test -- --config reports/jose-compatibility/jest.config.cjs; ficheiros/probe.log ignorados. Não são testes da autenticação da aplicação. Relação GEN1:1/Josefo I.1.1 confrontada com textos reais; curadoria operacional e persistência ainda não executadas. Skill de autenticação consultada para verificação no servidor e distinção entre login/sessão e o acesso CLI local; decisão/alternativas na ADR.

TDD de negócio não aplicável à documentação; gates1/7 documentais validados antes de commit. Não atribuir cobertura/mutação da S02 a código S04 inexistente. Os critérios da sprint permanecem NOT_RUN até comportamento e integrações reais. Os estados de prontidão de S00 a seguir são históricos.

## Histórico do template anterior

STATUS: NOT_RUN. Sprint não iniciada; este é o registo de prontidão documental, não um relatório de testes executados.
BRANCH: feat/biblia-backend. COMMIT: PENDING. Aprovações de execução/encerramento pendentes.

| Verificação | Estado | Evidência/limitação |
|---|---|---|
| Unitários | NOT_RUN | Implementação/suite inexistentes |
| Integração real | NOT_RUN | Ambiente e contratos a aprovar |
| E2E HTTP | NOT_RUN | Sem aplicação da sprint |
| TypeScript/ESLint/build | NOT_RUN | Scripts reais ainda inexistentes |
| Cobertura linhas/branches | NOT_RUN | Não medida; mínimos >=90% / >=85% |
| Mutation Score | NOT_RUN | Não medido; obrigatório >85% no escopo aplicável |
| Arquitetura/migrações/segredos | NOT_RUN | Verificar diff/código/ambiente da sprint |
| Avaliações de IA | NOT_RUN | Corpus/rubrica/fornecedor conforme aplicabilidade |

Critérios: todos NOT_RUN em [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md). Comandos e artefactos de aplicação: nenhum executado. RED/GREEN/REFACTOR: sem evidência; comportamento não implementado.
Quando iniciada, registar data/ambiente/revisão, comandos reais, resultados, cobertura/contagens de mutação/sobreviventes, falhas/regressões, pendências e riscos por critério. Não substituir esta ausência por PASS.
Dependências e ações: [PLAN](PLAN.md), [TASKS](TASKS.md), [ações externas](../../external-actions/REQUIRED_ACTIONS.md). Caso o serviço obrigatório continue indisponível na execução, marcar o respetivo teste/gate BLOCKED e pedir intervenção.
