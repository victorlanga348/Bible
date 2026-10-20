# Sete gates obrigatórios de qualidade

Estado: política atualizada na operação S00-T001; automação e scripts ainda inexistentes.
Uma tarefa de implementação só passa a DONE quando todos os gates aplicáveis estão satisfeitos.

## Gate 1 — Especificação
Spec aprovada, critérios verificáveis e dependências identificadas. Registar também aprovação do plano da tarefa e do escopo da sprint.
Sem contrato necessário aprovado, a tarefa dependente fica BLOCKED.

## Gate 2 — TDD
Evidência de RED pela razão esperada, GREEN e REFACTOR validado, com testes executados e verificação arquitetural.
Não aceitar implementação anterior ao teste como TDD.

## Gate 3 — Qualidade estática
TypeScript typecheck, ESLint, verificação de dependências arquiteturais e build aplicáveis.
Usar scripts reais do package.json. Se obrigatórios e ainda inexistentes, preparar a ferramenta numa tarefa aprovada; não inventar nomes nem declarar aprovação.
Registar falhas e corrigir antes de DONE.

## Gate 4 — Integração real
PostgreSQL isolado, Prisma, repositórios, transações, restrições e migrações reais quando afetados.
Testes HTTP com NestJS inicializado e verificação de rotas/DTOs/entradas/respostas/erros/persistência/segurança conforme contrato.
Integrações externas em suites específicas reais; mocks não substituem comprovação permanente.
Segurança, acessibilidade e recuperação de fluxos entram nos critérios aplicáveis e nas suites correspondentes, sem desaparecer por esta consolidação.

## Gate 5 — Mutação
StrykerJS sob validação de compatibilidade. Domínio e aplicação afetados com score bruto superior a 85%, cálculo conforme [política](mutation-testing.md), relatório gerado e sobreviventes analisados.
Exclusões justificadas; escopo não manipulado. Score insuficiente impede conclusão.

## Gate 6 — IA
Quando aplicável: fontes verificadas, citações válidas, suporte semântico, avaliações com critérios aprovados executadas e limitações documentadas.
Combinar casos de referência e execução real controlada; verificar inexistência de referências fabricadas.
Não confundir cobertura ou mutação de software com qualidade histórica/interpretativa. Ver [avaliação](../ai/evaluation.md).

## Gate 7 — Governança
Critérios de aceitação satisfeitos; docs, contratos, ADRs e roadmap sincronizados; MegaBrain atualizado quando houver conhecimento relevante.
Verificar limites de arquitetura, direitos de utilização, segurança, acessibilidade e operação conforme impacto.
Relatório com comandos, resultados, falhas, artefactos e limitações. Pergunta obrigatória:
**"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

## Aplicabilidade, estado e fechamento
Registar por gate: PENDENTE, APROVADO, FALHADO ou NÃO APLICÁVEL, com evidência/motivo e revisão.
PENDENTE/FALHADO em gate obrigatório impede DONE. Falta de ferramenta/credencial não é NÃO APLICÁVEL.
Para documentação pura: Gate 1 verifica autorização do âmbito documental e critérios; Gate 7 verifica estrutura, links, coerência e evidências. Gates 2–6 são NÃO APLICÁVEL apenas porque não há comportamento executável.
Concluir uma tarefa não encerra a sprint: esta permanece REVIEW até aprovação explícita de encerramento.

## Migração da política anterior
Os antigos G1–G10 foram consolidados: autorização em Gate 1; TDD em 2; software/estática em 3; integração em 4; mutação em 5; IA em 6; documentação/arquitetura/direitos/operação/UX/memória distribuídos por 3, 4, 6 e 7.
A evidência histórica DOC-0001 descreve a política então vigente; não reclassificar retroativamente como execução destes sete gates.
