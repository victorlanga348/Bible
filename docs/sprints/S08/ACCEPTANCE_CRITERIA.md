# S08 — Critérios de aceitação

Critérios da [SPEC](SPEC.md), aceites por decisão delegada antes de implementação. Resultados técnicos2026-10-29; fecho documental delegado após auditoria PASS. [Relatório](TEST_REPORT.md)/[evidência](evidence/release-verification.json).

| Critério | Estado | Evidência verificável |
|---|---|---|
| S08-AC01 — pronto para ambiente aprovado | PASS | Release pessoal local, fontes/configuração/migrações inventariadas, main+AI restaurados/HTTP/constraints/vetores, todos os gates de produto aprovados |
| S08-AC02 — contratos válidos/inválidos/negados | PASS |2249testes107suites reais, regressões de fronteiras/versão2/Unicode/cursors/owner/JWT/CAS/múltiplas evidências; metas de desempenho congeladas satisfeitas |
| S08-AC03 — fronteiras/dados/direitos | PASS |89tooling/arquitetura, monólito/seis módulos/ADRs, preparação operacional sem fixtures/snapshot e31102textos idênticos, admissões/licenças/limitações preservadas |
| S08-AC04 — gates/relatórios/operabilidade | PASS | CI oito SUCCESS/cobertura/mutação/revisão semântica/recuperação, runbooks/configuração e entradas sincronizadas; auditoria documental final T007 PASS |

| Gate | Resultado da revisão executável |
|---|---|
|1 — escopo/spec/plano/dependências | APROVADO: delegação vigente, SPEC e fichas antes das alterações |
|2 — TDD | APROVADO no aplicável: regressões/configuração e histórico reais; nenhum RED retroativo. Documentação/revisão não requer comportamento artificial |
|3 — estática/build/arquitetura/cobertura | APROVADO: zero erros,100%linhas97,94%branches |
|4 — integrações/migrações | APROVADO: PG/Prisma/Nest/Supertest, restauro/HTTP/preservação reais |
|5 — mutação | APROVADO:90,9646%global89,8734%IA,429sobreviventes revistos,zeroRuntimeError+NoCoverage |
|6 — IA | APROVADO: uma nova geração congelada/revisão separada; avaliações S05/S06/S07 incorporadas por identidade |
|7 — documentação/governança | APROVADO: auditoria T007 PASS2026-10-29T19:05:16.361Z/31Markdown263links/zero alertas; revisão final após transição |

Nenhum serviço obrigatório ausente/falhado/bloqueado no ambiente admitido. Não aplicabilidade é separada de PASS: não houve novo TDD/teste/mutação de produto para documentação pura. Não se aprovam serviço público/outro fuso ou qualidade histórica geral. Pergunta final confrontada na REVIEW.
