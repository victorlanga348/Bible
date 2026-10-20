# DOC-0001 — Inicialização da governança documental

Estado: concluída — inicialização e validação documentais.
Prioridade: alta, conforme objetivo imediato do utilizador.
Data: 2026-10-17. Sprint: não atribuída. Trilha: transversal.
Responsável: agente executor desta sessão. Revisor/aprovador: utilizador.

## Autorização e âmbito
Origem: pedido mestre do utilizador para o Bíblia App nesta sessão, com fases de inspeção, planeamento, aprovação, criação e validação.
Plano apresentado após inspeção; aprovação explícita recebida: «confirmo».
A aprovação inclui recriar README.md, criar a estrutura documental e preservar propostas/pendências como tal. Não aprova implementação, specs em rascunho, contratação, instalação, commit ou publicação.

## Contexto observado
Branch main associada a origin/main. Na inspeção, apenas README.md estava versionado e encontrava-se eliminado na árvore de trabalho; a versão HEAD continha «EM BREVE...».
Não havia código, dependências, schema ou documentação no disco além de .git. Foi lida a instrução externa RTK.md.

## Solução executada
Criar os documentos pedidos, índices, ADR da stack fornecida, templates de tarefas/ADRs/MegaBrain e contexto operacional.
Ligar requisitos PRD/BR às specs, tarefas e roadmap. Não escolher tecnologias pendentes.

## Alternativas, vantagens e riscos
Documentação reduzida adiaria rastreabilidade; a estrutura completa foi escolhida pelo utilizador.
Benefício: responsabilidades e estados explícitos. Custo: manutenção de múltiplos documentos.
Riscos: duplicação, propostas confundidas com decisões e README local eliminado; mitigações: índices, matriz de impacto, estados e aprovação explícita da recriação.

## Critérios de aceitação
- DOC-AC01: todos os caminhos obrigatórios existem e têm conteúdo útil.
- DOC-AC02: links locais resolvem para ficheiros/âncoras existentes.
- DOC-AC03: nenhuma tecnologia pendente, contrato ou funcionalidade é apresentada como aprovada/implementada.
- DOC-AC04: governança, TDD, integração real, mutação e MegaBrain refletem o pedido.
- DOC-AC05: PRD, quatro specs, backlog e roadmap são coerentes e rastreáveis.
- DOC-AC06: nenhuma alteração de código de aplicação ou instalação de dependências.

## Plano e validações aplicáveis
RED/GREEN/REFACTOR, integração da aplicação e mutation testing: não aplicáveis, por alteração exclusivamente documental.
Validação documental: inventário obrigatório, conteúdo, links, IDs e referências cruzadas; revisão editorial de estados, riscos e políticas.
Não há score de mutação ou testes de software para declarar.

## Evidências de execução
Validação em 2026-10-17, Windows/PowerShell, Python 3.14.5 e RTK 0.43.0.
Revisão base Git: 593833e; validação sobre a árvore de trabalho ainda sem commit, com 80 ficheiros novos e README.md alterado.

1. Inspeção: `rtk git status --short --branch`, `rtk git ls-files --stage`, `rtk git show HEAD:README.md` e listagem de diretório. Confirmado o estado inicial descrito acima.
2. Verificador Python inline, invocado por `rtk proxy python -c`: comparou uma lista independente dos caminhos obrigatórios com o disco, leu todos os Markdown como UTF-8, resolveu links locais, verificou conteúdo, espaços finais, IDs, critérios das specs e cobertura da matriz.
3. Primeira passagem: nenhum caminho em falta ou link quebrado; o verificador não expandia o intervalo PLAN-001 a PLAN-005 no roadmap. As referências foram escritas explicitamente para facilitar verificação automática.
4. Segunda passagem: código de saída 0; resultados abaixo.
5. `rtk git diff --check`: código de saída 0 e nenhum problema reportado. Os ficheiros novos, ainda não versionados, também foram inspecionados pelo verificador Python.
6. Listagem recursiva independente: nenhum diretório documental sem README.md; árvore completa abaixo.
7. Revisão editorial: limites arquiteturais, pendências, fontes sem acervo, ausência de contratos e implementação, BR-01 a BR-12, PRD-01 a PRD-11, specs e roadmap coerentes. Esta revisão não valida factos históricos ou licenças de obras ainda não selecionadas.

| Verificação | Resultado observado |
|---|---|
| Ficheiros obrigatórios | 51 de 51 presentes |
| Diretórios obrigatórios adicionais | 8 de 8 presentes |
| Ficheiros Markdown na árvore | 81: 80 novos e 1 alterado |
| Links relativos | 248 verificados; 0 quebrados |
| Documentos vazios | 0 |
| Espaços finais | 0 linhas sinalizadas |
| Critérios propostos nas specs | SS-001: 8; FQ-001: 6; SR-001: 8; SH-001: 6 |
| Rastreabilidade automática | 0 erros após explicitar IDs do roadmap |
| Áreas em falta na matriz de governança | 0 |
| Ficheiros fora de Markdown, excluindo .git | 0 |

Não foram executados testes de aplicação, integração, mutação ou avaliações de IA: não há implementação. Não houve instalação de dependências, commit, push ou deploy.

## Documentação e MegaBrain
Âmbito: raiz e todas as áreas de docs solicitadas. Contexto atualizado em [project-state](../megabrain/agent-context/project-state.md).
Não foram encontrados incidentes técnicos ou padrões implementados que justifiquem registos fictícios.

## Definition of Done
Estrutura e conteúdo completos; links e rastreabilidade validados; estados e pendências revistos; evidências finais registadas; relatório ao utilizador com árvore e limitações.
Critérios DOC-AC01 a DOC-AC06 cumpridos na validação documental. Specs e planos futuros continuam sujeitos a aprovação própria.

## Decisões, pendências e riscos finais
Registada ADR-0001 com a stack e os limites explicitamente fornecidos pelo utilizador; nenhuma escolha técnica adicional foi aceite por inferência.
DEC-01 a DEC-10 permanecem pendentes: frontend, fornecedor/modelos, embeddings, acesso, deploy, traduções/licenças, versões/ferramentas, StrykerJS, cânone e retenção/dados enviados.
Riscos atuais: inexistência de acervo autorizado, critérios operacionais/limiares da IA por aprovar e propostas ainda sem revisão de implementação. A referência RTK em AGENTS.md é local ao ambiente do utilizador e requer disponibilidade ou revisão explícita para portabilidade.
Próximas tarefas recomendadas: refinar PLAN-001 e PLAN-005; depois rever PLAN-002/003. Cada execução futura exige plano e aprovações próprios.

## Árvore final
Exclui apenas .git; todos os outros ficheiros da árvore de trabalho estão representados.

```text
Bible/
|-- docs/
|   |-- ai/
|   |   |-- evaluation.md
|   |   |-- grounding-and-citations.md
|   |   |-- orchestration.md
|   |   |-- prompts.md
|   |   |-- README.md
|   |   \-- safety-and-limits.md
|   |-- architecture/
|   |   |-- adr/
|   |   |   |-- ADR-0001-stack-e-limites-arquiteturais.md
|   |   |   |-- README.md
|   |   |   \-- template.md
|   |   |-- bounded-contexts.md
|   |   |-- data-model.md
|   |   |-- dependency-rules.md
|   |   |-- README.md
|   |   |-- stack.md
|   |   \-- system-overview.md
|   |-- audits/
|   |   |-- accessibility.md
|   |   |-- README.md
|   |   \-- security.md
|   |-- biblical-library/
|   |   |-- canon-and-versions.md
|   |   |-- historical-context.md
|   |   |-- interpretation-policy.md
|   |   |-- README.md
|   |   \-- source-catalog.md
|   |-- components/
|   |   |-- citation-card.md
|   |   |-- README.md
|   |   \-- study-panel.md
|   |-- copywriting/
|   |   |-- microcopy.md
|   |   \-- README.md
|   |-- design/
|   |   |-- README.md
|   |   |-- responsive.md
|   |   \-- tokens.md
|   |-- integrations/
|   |   |-- api-contracts.md
|   |   |-- auth.md
|   |   |-- llm-provider.md
|   |   \-- README.md
|   |-- megabrain/
|   |   |-- agent-context/
|   |   |   |-- project-state.md
|   |   |   \-- README.md
|   |   |-- errors/
|   |   |   \-- README.md
|   |   |-- investigations/
|   |   |   \-- README.md
|   |   |-- lessons/
|   |   |   \-- README.md
|   |   |-- patterns/
|   |   |   \-- README.md
|   |   |-- pitfalls/
|   |   |   \-- README.md
|   |   |-- templates/
|   |   |   |-- approved-pattern.md
|   |   |   |-- error-report.md
|   |   |   |-- lesson-learned.md
|   |   |   |-- README.md
|   |   |   \-- technical-investigation.md
|   |   \-- README.md
|   |-- operations/
|   |   |-- environments.md
|   |   |-- observability.md
|   |   |-- README.md
|   |   \-- runbooks.md
|   |-- pages/
|   |   |-- passage-explorer.md
|   |   |-- README.md
|   |   \-- study-workspace.md
|   |-- product/
|   |   |-- business-rules.md
|   |   |-- README.md
|   |   |-- roadmap.md
|   |   |-- source-policy.md
|   |   \-- study-methodology.md
|   |-- quality/
|   |   |-- mutation-testing.md
|   |   |-- quality-gates.md
|   |   |-- README.md
|   |   |-- tdd-policy.md
|   |   \-- testing-strategy.md
|   |-- specs/
|   |   |-- free-questions.md
|   |   |-- README.md
|   |   |-- source-retrieval.md
|   |   |-- structured-study.md
|   |   \-- study-history.md
|   |-- tasks/
|   |   |-- backlog.md
|   |   |-- DOC-0001-inicializacao-governanca.md
|   |   |-- README.md
|   |   \-- template.md
|   |-- documentation-governance.md
|   |-- glossary.md
|   |-- PRD.md
|   \-- README.md
|-- AGENTS.md
|-- GEMINI.md
\-- README.md
```
