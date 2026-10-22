# S04 — Critérios de aceitação

Critérios refinados/aceites pelo agente na autorização integral2026-10-22, conforme SPEC e ADR-0005; implementação ainda NOT_RUN. A prova preparatória de JOSE não satisfaz estes critérios de produto.

| Critério detalhado | Resultado verificável | Estado |
|---|---|---|
| S04-AC05 | JWT real HS256/typ/iss/aud/sub/iat/exp, lifetime<=3600s; chave ausente fecha privadas; token ausente/alterado/expirado401, owner alheio404, owner no body rejeitado | NOT_RUN |
| S04-AC06 | POST cria versão1; GET recupera versão sem geração; revisão com expectedVersion cria snapshot imutável; duas revisões simultâneas geram uma nova versão e um409 | NOT_RUN |
| S04-AC07 | Contexto bíblico é verdadeiro, seis secções presentes, lacunas explícitas e nenhuma interpretação sem curadoria; citação conserva texto/hash/localizador/crédito/direitos | NOT_RUN |
| S04-AC08 | Fonte revogada/ausente redige quote e secções/interpretações dependentes na leitura e entrega pós-escrita; falha técnica500 não vira ausência; snapshot guardado fica intacto | NOT_RUN |
| S04-AC09 | Associação narrativa explícita GEN1:1/Josefo I.1.1 por contratos públicos; owner/versionamento/source links em tabelas próprias e migrações reais, sem SQL entre módulos | NOT_RUN |

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S04-AC01 | Estudo estruturado determinístico é construído e guardado com versões a partir de evidências existentes. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S04-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S04-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |
| S04-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |

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
