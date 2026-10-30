Estado S07-T006: dez operações privadas de workspace implementadas conforme [SPEC S07](../sprints/S07/SPEC.md), com26testes Nest/JWT/Supertest/PostgreSQL PASS. Notas CAS/revision e favoritos idempotentes referem estudo/versão; históricos são metadados sem regeneração. Eliminação retomável devolve204 só após todos os proprietários confirmarem.400/401/404/409WORKSPACE_CONFLICT/503WORKSPACE_UNAVAILABLE sanitizados e OpenAPI real. Gate completo atual e prova nativa ainda pendentes; implementação não equivale a fecho da tarefa. Registos históricos abaixo preservados.

Adenda S10-T002: [bootstrap Google runtime, origens locais5173, cookie e sessao](../sprints/S10/T002_SESSION_SPEC.md), fixada antes de codigo. GET /auth/google/bootstrap e POST /auth/google preservam identidade/seguranca da S08 com whitelist local explicitamente ampliada; sem CORS global. Implementacao/gates em [relatorio proprio](../sprints/S10/T002_TEST_REPORT.md).

# Contratos de API

S07 contratos aceites pelo agente delegado2026-10-29 antes de código: [SPEC S07](../sprints/S07/SPEC.md), relações privadas com fundamento/fontes atuais, notas/favoritos versionados, histórico keyset e eliminação modular repetível. Ainda NOT_RUN; entrega S06 permanece comprovada. Sem campos/endpoints implícitos além da SPEC.

Contratos S06 aceites2026-10-28 pelo agente delegado, antes de implementação: [quatro operações/DTOs/erros/retenção/contexto](../sprints/S06/SPEC.md). POST /studies/:studyId/conversations, GET/DELETE /conversations/:conversationId, POST /conversations/:conversationId/turns; JWT/owner404/expectedRevision obrigatório. Implementadas/verificadas: [fecho S06](../sprints/S06/T007_COMPLETION_REPORT.md), incluindo PostgreSQL/HTTP reais e nove turnos nativos/semântica PASS. APIs S05 mantidas.

Fecho S04 verificado2026-10-26: três operações privadas de estudo abaixo implementadas e verificadas por Nest/JOSE/PostgreSQL reais, dentro de907 regressões e CI40338249693. Gates/fonte corrigida/revisão aprovados; S04 DONE, sem alterar contratos nesta atualização de estado. [Relatório S04](../sprints/S04/TEST_REPORT.md)/[operação local](local-studies.md). Contratos futuros de IA/conversas ainda não são entrega. Notas seguintes históricas.

Estado vigente S04-T0062026-10-22: POST /studies, GET /studies/:id?version e POST /studies/:id/versions implementados e32 testes HTTP reais PASS, conforme [SPEC S04](../sprints/S04/SPEC.md). Bearer local obrigatório, owner só do token, snapshots imutáveis, revalidação atual das fontes, entradas/saídas estritas e OpenAPI com401/400/404/409/500. Prova adicional pelo processo HTTP em loopback contra bible_db do PC, sem tokens em logs. Não há endpoint de emissão, escrita pública de curadoria ou geração IA nesta sprint. Gates integrais S04 ainda pendentes. As notas seguintes são históricas.

Atualização2026-10-22: cinco contratos bíblicos da SPEC S02 agora têm handlers, validação estrita, OpenAPI e provas reais200/400/404/500; preservam a gramática e não acrescentam pesquisa por palavra-chave. O complemento está IN_PROGRESS nos gates finais, não apenas no estado de proposta descrito historicamente abaixo. Banco local bible_db também foi migrado/importado a partir do corpus integral e verificado via Nest/Prisma/HTTP. Contratos/DTOs canónicos na [SPEC S02](../sprints/S02/SPEC.md), evidências no [relatório](../sprints/S02/TEST_REPORT.md). S04 tem refinamento documental preparado, sem handlers de estudo implementados ainda.

Estado: contratos HTTP técnicos implementados e aceites na revisão final S01 em 2026-10-21, definidos na [SPEC S01](../sprints/S01/SPEC.md) e publicados pela aplicação em `/openapi.json`. Liveness, readiness, Swagger e erros técnicos têm testes NestJS/Supertest reais; evidências no [relatório](../sprints/S01/TEST_REPORT.md).
Cinco contratos bíblicos aprovados na SPEC v0.2 S02; restantes capacidades de negócio continuam por especificar/aprovar. As capacidades abaixo não criam métodos, rotas, payloads ou campos por inferência.

Histórico da preparação S02-T004, proposta v0.2 de 2026-10-21: contratos de catálogo/consulta/resolução, DTOs e erros foram concretizados para revisão na [SPEC S02](../sprints/S02/SPEC.md), antes do aceite registado a seguir. Nenhuma rota acima da fundação S01 é apresentada como existente. A SPEC é a fonte para evitar duplicação de campos/contratos nesta entrada.
Aceite posterior pelo «ok»: cinco contratos v0.2 aprovados, mas ainda sem handlers/composição/HTTP bíblico. T005 implementa apenas Domain/parser; provas reais da API/persistência em T006/T007. Manter distinção entre contrato aprovado e rota efetivamente existente.

## Capacidades a especificar

S03: três contratos de catálogo/excertos/pesquisa da SPEC v0.1 implementados após aprovação do plano/refinamento T006 pelo novo «vai enfrente». Nest/Supertest/PostgreSQL reais verificam200/400/403/404/500 e OpenAPI. O403 de negócio é limitado ao filtro source-library; HttpException403 inesperada mantém sanitização500 técnica S01. Não há associação validada a passagens ou suporte semântico automático. Só o banco de teste foi migrado/importado; scripts locais e limites no README do backend, resultados finais no TEST_REPORT S03.
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
