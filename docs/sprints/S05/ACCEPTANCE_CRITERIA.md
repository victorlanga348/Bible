# S05 — Critérios de aceitação

Critérios concretizados/aceites pelo agente antes de produto conforme [SPEC](SPEC.md)/[perfil](../../ai/profiles/local-extractive-v1.json)/[rubrica](EVALUATION_PLAN.md). AC05 PASS após T005/CI40471991297/zeroRuntimeError+NoCoverage e CLI real corrigido, com [provas e limites](T005_COMPLETION_REPORT.md). Atualização T006: prova composta nativa real e contratos privados demonstrados; CI atual e14casos agora aprovados, conforme T007_COMPLETION_REPORT; auditoria documental final precede commit. [Execuções por critério](TEST_REPORT.md), [revisão](REVIEW.md); não transferir PASS individual para sprint inteira.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S05-AC01 | Estudo gerado por fornecedor real é fundamentado em fontes recuperadas e verificáveis. | 14casos nativos/revisão semântica PASS; T007_COMPLETION_REPORT | PASS |
| S05-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | CI40651025107/1706PASS/HTTP e persistência reais; fecho T006 | PASS |
| S05-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | Tooling70 inclui9 arquitetura; admissões/curadorias/bancos reais e revisão T006 | PASS |
| S05-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | CI40660972664 e14avaliações/revisão PASS; auditoria documental de fecho PASS | PASS |
| S05-AC05 | Adapter local real aplica perfil/pins/autenticação/loopback/um processo/limites/cancelamento, rejeita protocolos/resultados inválidos e distingue timeout/indisponibilidade. | RED/GREEN e protocolo técnico identificado mais chamadas reais do adapter T005; nenhuma resposta gravada como IA | PASS |
| S05-AC06 | Índice próprio pgvector1024/ordenação exata/transação/offsets/digests e revalidação de direitos antes de inferir/entregar, inclusive revogação, sem SQL transversal. | SQL/rights/rollback/11vetores nativos e CI40651025107 PASS; avaliação semântica própria em AC08 | PASS |
| S05-AC07 | Análise privada aponta para versão real do estudo, grava atomicamente e não revela recurso/quote a outro owner ou fonte agora restrita; entradas/saídas estritas e erros da SPEC. | Contratos HTTP32/rollback13/versões/rights técnicos e percurso HTTP nativo95s; TEST_REPORT distingue doubles e inferência | PASS |
| S05-AC08 | Dez casos EV e quatro RG reservados conformes, zero citações irrelevantes/inventadas/injeção/violação, limitações de uma frase/uma obra explícitas. | Catorze chamadas reais pelo produto com perfil efetivo, originais/uso/tempo/proveniência e revisão por caso do agente contra fontes; sem alegar revisão humana;14/14PASS em T007_COMPLETION_REPORT | PASS |

## Sete gates
| Gate | Obrigação |
|---|---|
| 1 | Sprint, spec/contratos, tarefas/dependências aprovados |
| 2 | RED/GREEN/REFACTOR demonstrados por comportamento |
| 3 | TypeScript strict/lint/build/arquitetura; linhas >=90%, branches >=85% |
| 4 | PostgreSQL/Prisma/migrações/HTTP reais e serviços pertinentes |
| 5 | Stryker, Mutation Score bruto >85%, relatório e sobreviventes |
| 6 | IA, fontes, suporte/citações e limitações quando aplicável |
| 7 | Docs/README, ADRs, MegaBrain, critérios e relatórios sincronizados |

Não aplicabilidade exige motivo/evidência separados de NOT_RUN; não é PASS. Serviço/credencial obrigatório ausente é BLOCKED e impede encerramento. Sem código mutável real não inventar score nem criar regras artificiais.
