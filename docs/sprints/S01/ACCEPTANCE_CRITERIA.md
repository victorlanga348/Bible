# S01 — Critérios de aceitação

Contratos concretos na [SPEC](SPEC.md); evidências e limites no [TEST_REPORT](TEST_REPORT.md), avaliação dos gates no [REVIEW](REVIEW.md). Sprint DONE em 2026-10-21; execução técnica local concluída e aceitação formal/encerramento/commit aprovados pelo utilizador, conforme referência no REVIEW.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S01-AC01 | Aplicação inicia e comunica com PostgreSQL real; persistência e HTTP reais verificados. | 7 integrações Prisma/PostgreSQL, 17 E2E Nest/Supertest, migração real e npm start + readiness/Swagger no processo compilado | PASS |
| S01-AC02 | Contratos cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | 36 unitários (configuração/alvo), entrada Zod/erros HTTP/indisponibilidade/porta ocupada reais; 60 testes agregados | PASS |
| S01-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | 7 checks de arquitetura, fontes reais sem violações/ciclos. Não há módulos de negócio nem conteúdo bíblico/histórico: direitos/fontes não aplicáveis à fixture técnica exclusiva de teste, não são teste de corpus aprovado | PASS |
| S01-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | Execução técnica local aprovada, incluindo mutação95,93% e análise; docs/checks concluídos. Revisão e aceitação formal dos gates1/7 aprovadas em 2026-10-21; pergunta de fechamento apresentada, sem alterações adicionais indicadas pelo utilizador. IA não aplicável e CI remoto NOT_RUN conforme escopo | PASS |

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
