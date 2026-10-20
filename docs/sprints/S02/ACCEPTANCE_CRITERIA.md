# S02 — Critérios de aceitação

Propostas a detalhar/aprovar antes da implementação. Nenhum critério executado.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S02-AC01 | API consulta e valida passagens reais com cânone e textos autorizados. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S02-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S02-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S02-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |

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
