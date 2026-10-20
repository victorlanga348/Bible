# Governança documental

Estado: atualização solicitada pelo utilizador e autorizada pelo «ok» após o plano de inspeção e atualização. Data: 2026-10-17.
Registo: [S00-T001](sprints/S00/tasks/S00-T001-atualizacao-governanca.md). Não autoriza implementação futura.

## Fonte da verdade
/docs contém as specs normativas; README.md contém visão geral e entrada.
Specs aprovadas definem comportamentos, contratos aprovados definem interfaces e ADRs aceites definem decisões arquiteturais.
PRD e regras de negócio sustentam a intenção do produto. MegaBrain guarda conhecimento técnico, sem alterar requisitos por si.
Código e testes devem corresponder às specs aprovadas. Em conflito, interromper implementação e solicitar esclarecimento; não corrigir silenciosamente requisitos para legitimar código.

## Estados e aprovação documental
| Estado | Significado |
|---|---|
| Definido pelo utilizador | Decisão explicitamente fornecida, registada com origem |
| Rascunho / proposto | Conteúdo em revisão, sem autorização de implementação |
| Pendente | Decisão sem resposta; indicar impacto e responsável |
| Aprovado / aceite | Aprovador, data e referência explícitos |
| Implementado | Comportamento existente com evidência |
| Substituído / obsoleto | Histórico preservado e sucessor ligado |

Specs, planos de tarefa e escopo de sprint têm aprovações separadas. Aprovar planeamento documental não aprova os comportamentos planeados.
Aprovador inicial: utilizador. Revisores técnicos são indicados por tarefa, sem atribuir pessoas não designadas.
Não modificar documentos aprovados silenciosamente: propor alteração, mostrar impacto e obter aprovação. Preservar histórico em Git quando autorizado, ou registo explícito de evolução enquanto alterações ainda não foram commitadas.

## Sprints e tarefas
O [índice de sprints](sprints/README.md) define estrutura, transições e fechamento.
O [plano mestre](roadmap/master-plan.md) organiza S00–S09. Tarefas novas usam Sxx-Txxx; os IDs anteriores permanecem rastreáveis na [correspondência](roadmap/traceability.md).
Estados de tarefa permitidos: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE.
Uma tarefa de implementação necessita de spec e plano aprovados antes de código. A aprovação de sprint não elimina estas condições.
Uma tarefa de documentação exige aprovação do âmbito e verificação documental; TDD e mutação podem ser não aplicáveis com justificação.

## Ciclo obrigatório
1. Identificar sprint/tarefa, specs, contratos, dependências e ADRs.
2. Consultar erros, padrões e armadilhas no MegaBrain; verificar skills relevantes.
3. Apresentar plano, vantagens, desvantagens, alternativas, riscos e aceitação.
4. Obter aprovações explícitas; limitar alterações ao necessário.
5. Executar RED–GREEN–REFACTOR para comportamento.
6. Executar qualidade estática, integração real, mutação e avaliações da IA aplicáveis.
7. Sincronizar os dois lados da matriz de impacto.
8. Registar evidências e conhecimento relevante.
9. Passar a DONE apenas após os sete gates aplicáveis.
10. Fechar sprint apenas com relatório, roadmap atualizado e aprovação explícita de encerramento.

Trabalhar numa tarefa aprovada de cada vez, salvo autorização expressa para paralelismo. Não adicionar dependências sem justificação e aprovação.
Inspeção deve ser focada; validação transversal de links é justificada quando a alteração afeta a navegação documental.

## Matriz de impacto bidirecional
| Alteração | Referências a rever em ambos os sentidos |
|---|---|
| Entidades e regras | [Produto](product/business-rules.md), [specs](specs/README.md), [modelo](architecture/data-model.md) e testes |
| Prisma, persistência, migrações | [Modelo](architecture/data-model.md), [testes](quality/testing-strategy.md) e [ambientes](operations/environments.md) |
| API | [Contratos](integrations/api-contracts.md), specs, consumidores e integração HTTP |
| IA e recuperação | [IA](ai/README.md), [biblioteca](biblical-library/README.md), specs e avaliações |
| UI | [Páginas](pages/README.md), [componentes](components/README.md), [design](design/README.md), copy e acessibilidade |
| Testes e critérios | [Qualidade](quality/README.md), critérios das specs, tarefas e acceptance da sprint |
| Infraestrutura | [Operações](operations/README.md), segurança, stack e ADR aplicável |
| Decisões arquiteturais | [ADRs](architecture/adr/README.md), arquitetura, contratos e planos |
| Erros e aprendizagens | [MegaBrain](megabrain/README.md), regressões e documentos normativos relacionados |
| Planeamento e estados | [Sprints](sprints/README.md), [roadmap](roadmap/README.md), [tarefas](tasks/README.md), dependências e contexto operacional |

Uma alteração de spec inicia análise sobre código, testes e consumidores; uma alteração técnica obriga a rever a spec. Registar ficheiros revistos e não aplicabilidade na tarefa.

## Git e execução
- main: versão estável; documentação em rascunho não significa aplicação implementada.
- develop: integração apenas se adotada.
- Funcionalidades: feat/sprint-X-trilha-nome, identificando Sxx e tarefa na descrição.
- Correções: fix/descricao; documentação: docs/descricao; refatoração: refactor/descricao.
- Conventional Commits com descrições em português e IDs reais quando aplicável.
- Não inventar commits, branches ou aprovações. Commit/push/publicação dependem do âmbito autorizado.
- Preferir rtk instalado e compatível; caso contrário usar equivalente nativo. Não editar RTK.md externo.
- Usar apenas scripts existentes no package.json; registar comando, resultado e falhas.

## Checklist de fechamento
1. Critérios de aceitação cumpridos e evidenciados?
2. Sete gates aplicáveis satisfeitos, sem teste obrigatório por executar?
3. Arquitetura, contratos, licenças, segurança e acessibilidade consistentes conforme impacto?
4. **Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?**
5. MegaBrain atualizado quando houve conhecimento relevante?
6. Pendências, dependências, roadmap e estados atualizados?
7. Encerramento da sprint explicitamente aprovado, se for pedido o seu fechamento?

Resultados históricos de DOC-0001 mantêm-se como evidência da versão inicial; não são execução dos gates novos nem aprovação retroativa de sprints.
