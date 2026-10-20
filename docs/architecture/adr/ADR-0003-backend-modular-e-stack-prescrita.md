# ADR-0003 — Backend modular e stack prescrita

Estado: ACEITE documentalmente. Data: 2026-10-20. Decisor: utilizador.
Origem: novo pedido mestre, secções 3/7/10/11, e «ok» ao [PLAN S00](../../sprints/S00/PLAN.md). Tarefa S00-T003.
Implementação: não iniciada. Complementa ADR-0001; sucede à escolha condicionada de ferramenta da ADR-0002 quanto à obrigatoriedade. Ambas preservadas byte a byte.

## Contexto e decisão
O backend é um monólito modular NestJS/TypeScript strict/Node LTS compatível, REST/OpenAPI, validação Zod, Prisma/PostgreSQL, pesquisa textual nativa e pgvector quando necessário à pesquisa semântica.
Módulos: biblical-canon, source-library, study, cross-references, ai-assistant e study-workspace.
Domain/Application/Infrastructure/Presentation separados; composição module.ts; contratos entre módulos; sem acesso direto a tabelas alheias; sem SDK/Prisma/framework no domínio. Regras e entidades internas não são entidades Prisma.
Jest/Supertest/Stryker obrigatórios; compatibilidade ainda exige prova real. Incompatibilidade bloqueia o gate, não autoriza dispensar/trocar ferramenta.
Nenhuma nova unidade distribuída, Redis ou fila externa. Sem fornecedor de deploy selecionado.

## Alternativas e consequências
A stack e o monólito foram prescritos, não escolhidos por benchmark. Não alegar comparação empírica com frameworks/ORMs.
Manter topologia indefinida não refletiria o pedido; distribuir módulos acrescentaria operação não autorizada.
Fronteiras exigem ports, mapeamentos e testes reais; reduzir abstrações ao necessário. Um módulo técnico não implica contexto de negócio independente.
Versões, aggregates, schema, contratos HTTP, identidade/acesso, fontes/licenças e IA continuam sujeitos às decisões e aprovações próprias.

## Validação
S00 verifica consistência documental e preservação histórica; S01 terá compatibilidade/infraestrutura reais e checks de imports. S04 compõe estudo sem exigir LLM; S05 valida fornecedor/RAG realmente.
Ver [dependências](../dependency-rules.md), [contextos](../bounded-contexts.md), [stack](../stack.md) e [gates](../../quality/quality-gates.md). Sem prova de funcionamento nesta ADR.
