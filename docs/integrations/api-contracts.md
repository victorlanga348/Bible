# Contratos de API

Estado: contratos HTTP técnicos implementados e aceites na revisão final S01 em 2026-10-21, definidos na [SPEC S01](../sprints/S01/SPEC.md) e publicados pela aplicação em `/openapi.json`. Liveness, readiness, Swagger e erros técnicos têm testes NestJS/Supertest reais; evidências no [relatório](../sprints/S01/TEST_REPORT.md).
Contratos de negócio continuam por especificar/aprovar. As capacidades abaixo não criam métodos, rotas, payloads ou campos por inferência.

## Capacidades a especificar
| Necessidade conceptual | Origem | Trabalho necessário |
|---|---|---|
| Resolver seleção bíblica | PRD-01 | Cânone, versões, versificação e PLAN-009 |
| Solicitar estudo estruturado | SS-001 | Aprovar entradas, saída, validação e falhas |
| Recuperar/apresentar fontes | SR-001 | Decidir se exposição é direta ou integrada no estudo |
| Continuar com pergunta | FQ-001 | Contexto, acesso e ciclo de vida |
| Consultar histórico | SH-001 | Acesso, retenção, ordenação e paginação |
| Comparar passagens | PRD-04 | Refinar âmbito e interface antes de assumir endpoint próprio |

Esta lista não determina um endpoint por capacidade.

## Checklist para aprovar cada contrato
Spec e versão, autenticação/autorização, operação, semântica, entradas, validação, saídas, proveniência, erros, limites, repetição de pedidos, concorrência, compatibilidade e consumidor.
Definir política síncrona/assíncrona, cancelamento ou streaming apenas se justificada.
Escolher formato de publicação do contrato e estratégia de versionamento na tarefa correspondente.

## Verificação e alteração
Aplicação NestJS inicializada para testes HTTP; repositórios e Prisma reais quando a operação persiste.
Testes de contrato devem verificar consumidor e implementação. Alteração exige análise de impacto bidirecional sobre specs, frontend, modelo e testes.
Não produzir exemplos JSON com campos presumidos para preencher esta lacuna.
