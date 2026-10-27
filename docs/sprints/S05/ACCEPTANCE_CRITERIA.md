# S05 — Critérios de aceitação

Critérios concretizados/aceites pelo agente antes de produto conforme [SPEC](SPEC.md)/[perfil](../../ai/profiles/local-extractive-v1.json)/[rubrica](EVALUATION_PLAN.md). AC05 PASS após T005/CI40456053750 e CLI real corrigido, com [provas e limites](T005_COMPLETION_REPORT.md). Demais critérios de produto continuam NOT_RUN, sem receber PASS por adapter/viabilidade; S05 ainda IN_PROGRESS.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S05-AC01 | Estudo gerado por fornecedor real é fundamentado em fontes recuperadas e verificáveis. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S05-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S05-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S05-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S05-AC05 | Adapter local real aplica perfil/pins/autenticação/loopback/um processo/limites/cancelamento, rejeita protocolos/resultados inválidos e distingue timeout/indisponibilidade. | RED/GREEN e protocolo técnico identificado mais chamadas reais do adapter T005; nenhuma resposta gravada como IA | PASS |
| S05-AC06 | Índice próprio pgvector1024/ordenação exata/transação/offsets/digests e revalidação de direitos antes de inferir/entregar, inclusive revogação, sem SQL transversal. | PostgreSQL/Prisma/fontes reais T006 e avaliações integradas T007; desenvolvimento/teste isolados | NOT_RUN |
| S05-AC07 | Análise privada aponta para versão real do estudo, grava atomicamente e não revela recurso/quote a outro owner ou fonte agora restrita; entradas/saídas estritas e erros da SPEC. | NestJS/Supertest/DB reais, acesso válido/inválido/negado e prova pós-gravação/GET | NOT_RUN |
| S05-AC08 | Dez casos EV e quatro RG reservados conformes, zero citações irrelevantes/inventadas/injeção/violação, limitações de uma frase/uma obra explícitas. | Catorze chamadas reais pelo produto com perfil efetivo, originais/uso/tempo/proveniência e revisão por caso do agente contra fontes; sem alegar revisão humana | NOT_RUN |

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
