# S08 — Critérios de aceitação

Aceites por decisão delegada2026-10-29 na [SPEC](SPEC.md), antes de código. Nenhum critério de produto executado ainda. AC01 exige release pessoal local/inventário/restore+HTTP; AC02 regressões/segurança/casos assimétricos e performance mensurável; AC03 fronteiras/dados operacionais sem fixtures e admissão; AC04 suites/gates/runbooks/limitações/provas atuais.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S08-AC01 | Backend pronto para o ambiente aprovado, sem pendência crítica ou teste obrigatório bloqueado. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S08-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S08-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S08-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |

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
