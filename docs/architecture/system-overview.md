# Visão do sistema

Estado: arquitetura consolidada documentalmente em S00; fundação técnica implementada, validada e aceite no encerramento S01 em 2026-10-21, sem módulos de negócio. Decisões: [ADR-0003](adr/ADR-0003-backend-modular-e-stack-prescrita.md) e [ADR-0004](adr/ADR-0004-fundacao-executavel-s01.md). Monólito modular NestJS/TypeScript strict, REST/OpenAPI, Zod, Prisma/PostgreSQL.

## Fluxo
Presentation valida entrada/saída por contratos aprovados e chama Application; Application coordena Domain/ports; Infrastructure implementa persistência e fornecedores; composição NestJS liga dependências.
O estudo reúne texto/evidências identificados, distingue factos/inferências/interpretações/hipóteses e apresenta incertezas. Conversas preservam contexto e verificam novas referências.
Em S04, construção determinística a partir de evidências existentes; LLM real e RAG apenas em S05. Pgvector entra quando necessário à pesquisa semântica; pesquisa textual usa PostgreSQL.

## Módulos e camadas
Seis módulos: biblical-canon, source-library, study, cross-references, ai-assistant, study-workspace. Ver [contextos](bounded-contexts.md).
Cada módulo possui domain/entities, value-objects, services, repositories; application/use-cases e ports; infrastructure/persistence, integrations, mappers; presentation/controllers, schemas; module.ts na composição, conforme necessidade real.
Não criar pastas/abstrações vazias para aparentar implementação. Domain independente de NestJS/Prisma/SDKs/Zod/ambiente; Application depende de contratos internos; controllers sem regras de negócio.
Um deploy lógico de backend; sem Redis, filas externas ou microsserviços. Alojamento ainda pendente, sem provisão/contratação.

## Trilhas e confiança
A: domínio/regras; B: infraestrutura/integrações; C: qualidade/documentação. Responsabilidades não autorizam paralelismo nem serviços separados.
Entrada, fontes e saída do modelo são dados não confiáveis; fontes não alteram políticas nem autorizam ferramentas. Ver [segurança IA](../ai/safety-and-limits.md).
Dados pessoais, acesso, retenção e envio ao fornecedor dependem de decisões explícitas antes de uso.
Endpoints técnicos e namespace de persistência estão descritos na [SPEC S01](../sprints/S01/SPEC.md), com provas no [relatório](../sprints/S01/TEST_REPORT.md). Endpoints, payloads e schema de negócio exigem spec/plano próprios.
