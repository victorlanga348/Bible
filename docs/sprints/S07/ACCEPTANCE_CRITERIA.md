# S07 — Critérios de aceitação

Critérios PASS2026-10-29 no recorte local, conforme [fecho T007](T007_COMPLETION_REPORT.md), com CI integral e provas nativas/revisões T005/T006. Hardening e restauração real continuam S08; nenhuma autorização pública/remota presumida.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S07-AC01 | Utilizador navega entre passagens relacionadas e recupera estudos, notas, favoritos e histórico. | [Fecho/evidências](T007_COMPLETION_REPORT.md) | PASS |
| S07-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | [Fecho/evidências](T007_COMPLETION_REPORT.md) | PASS |
| S07-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | [Fecho/evidências](T007_COMPLETION_REPORT.md) | PASS |
| S07-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | [Fecho/evidências](T007_COMPLETION_REPORT.md) | PASS |

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
