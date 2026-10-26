# S04 — Critérios de aceitação

Critérios refinados/aceites pelo agente na autorização integral2026-10-22, conforme SPEC e ADR-0005. Provas de comportamento PostgreSQL/Nest/CLI e fonte corrigida912c600 verificadas em2026-10-26:907 regressões/CI40338249693 PASS, cobertura100%/97,98%, estática/build/23 tooling, mutação global90,69%/recorte87,71% e análise dos sobreviventes. Revisão T007/auditoria documental aprovadas; S04 DONE por fecho delegado, sem atribuir gate da fonte anterior ao fix.

| Critério detalhado | Resultado verificável | Estado |
|---|---|---|
| S04-AC05 | JWT real HS256/typ/iss/aud/sub/iat/exp, lifetime<=3600s; chave ausente fecha privadas; token ausente/alterado/expirado401, owner alheio404, owner no body rejeitado | PASS:32 HTTP + CLI + operação nativa, com prova criptográfica T005 |
| S04-AC06 | POST cria versão1; GET recupera versão sem geração; revisão com expectedVersion cria snapshot imutável; duas revisões simultâneas geram uma nova versão e um409 | PASS:11 persistência/9 Application/32 HTTP e versões1/2 nativas |
| S04-AC07 | Contexto bíblico é verdadeiro, seis secções presentes, lacunas explícitas e nenhuma interpretação sem curadoria; citação conserva texto/hash/localizador/crédito/direitos | PASS:19 adapters/3 builder + HTTP + originais autenticados |
| S04-AC08 | Fonte revogada/ausente redige quote e secções/interpretações dependentes na leitura e entrega pós-escrita; falha técnica500 não vira ausência; snapshot guardado fica intacto | PASS:19 adapters/9 Application/32 HTTP, incluindo revogação real pós-transação |
| S04-AC09 | Associação narrativa explícita GEN1:1/Josefo I.1.1 por contratos públicos; owner/versionamento/source links em tabelas próprias e migrações reais, sem SQL entre módulos | PASS:24 schema/17 curadoria/22 admissão-identidade, migração e operação no PC; fiscalização/revisão de imports |

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S04-AC01 | Estudo estruturado determinístico é construído e guardado com versões a partir de evidências existentes. | AC06/07 e percurso HTTP real na bible_db, s04-native-study-verification.json | PASS |
| S04-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | AC05/06/08 e OpenAPI32 HTTP; falha de INSERT real500/rollback | PASS |
| S04-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | AC09,23 tooling, admissão operacional distinta de fixtures, hashes/avisos e revalidação | PASS |
| S04-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | T007, CI40338249693/907 testes, mutação global90,69%/própria87,71%, auditoria de links/segredos/whitespace real | PASS |

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
