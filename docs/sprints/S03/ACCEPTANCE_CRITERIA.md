# S03 — Critérios de aceitação

SPEC/recorte e planos T004–T007 aprovados pelos aceites registados. Admissão, Domain, integração/HTTP e revisão integrada reais comprovados; AC01–04 PASS técnico no recorte aprovado. Sprint DONE após «pode usar» ao encerramento/commit; hash será registado após criação. IA não aplicável/NOT_RUN e CI remota NOT_RUN são limites explícitos, sem substituir gates locais obrigatórios.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S03-AC01 | Evidências reais são recuperáveis e possuem origem, localização e direitos verificáveis. | T004–T007: artefactos pinados, importação real até HTTP e cobertura4; TEST_REPORT | PASS |
| S03-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | T006/T007: transações/constraints e HTTP200/400/403/404/500 reais; TEST_REPORT | PASS |
| S03-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | T004–T007: revisão de imports/ports/tabelas, arquitetura executável, hashes/aviso e direitos preservados | PASS |
| S03-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | T007:440 testes, tooling13, linhas100%/branches97,07%, mutação99,09%, documentação/revisão e limites; TEST_REPORT | PASS |

## Casos concretos propostos

| Caso | Condição/resultado exigido | Fase/estado |
|---|---|---|
| S03-P01 | Artefacto/aviso/usos/edição/cobertura/locator/hashes verificados, fixture autêntica reproduzível | PASS T004: aceite/hashes/aviso/revisão de condições/fixture reais |
| S03-P02 | Source/SourceExcerpt recusam estado inválido e preservam texto/proveniência exatos | PASS T005: RED137/GREEN137 e regressão289 |
| S03-P03 | Elegibilidade separa ingest/store/index/display/quote/sendToAi; pending/denied bloqueiam operação afetada | PASS regras T005 e integração/HTTP T006 |
| S03-I01 | Ingestão real atómica, constraints/repetição id-hash/conflito/rollback em PostgreSQL guardado | PASS T006; inclui concorrência, encerramento do cliente e cleanup isolado |
| S03-I02 | Pesquisa lexical e leitura reais, ranking/empates/paginação/cobertura da SPEC, sem vazamento por direitos | PASS T006, quatro textos reais e casos negativos |
| S03-H01 | Três operações/DTOs estritos,200/400/403/404/500, OpenAPI e persistência reais; regressão técnica S01 preservada | PASS T006/T007; percurso integrado real e regressão54 E2E |
| S03-G01 | Estática/build/arquitetura, cobertura e Stryker acima dos mínimos, docs/revisão/limites sincronizados | PASS T007; auditoria global no recorte aprovado |

Proposta inclui adiar associação validada fonte-passagem (dependência S02 ausente), sem declarar esse componente entregue. Encontrar excerto/localização não comprova suporte semântico de uma afirmação; SR-AC05 requer avaliação própria S04/S05, original SR-001 preservada.

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
