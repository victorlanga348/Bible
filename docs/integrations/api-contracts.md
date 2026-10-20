# Contratos de API

Estado: nenhum contrato HTTP aprovado ou implementado.
Não existem métodos, rotas, payloads, campos, códigos de resposta ou formatos de erro definidos.

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
