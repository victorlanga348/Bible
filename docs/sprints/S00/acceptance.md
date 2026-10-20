# S00 — Aceitação e gates

Estado: critérios documentais autorizados. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S00-AC01: Estrutura S00–S09 e roadmap completos, com IDs e estados válidos.
- S00-AC02: Regras TDD, integração, mutação e sete gates coerentes; documentação anterior preservada conforme matriz de impacto.
- S00-AC03: Links, rastreabilidade e dependências validados com evidências; relatório pronto para revisão.
- S00-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | Âmbito e critérios documentais aprovados. |
| 2 | NÃO APLICÁVEL: sem comportamento executável. |
| 3 | NÃO APLICÁVEL: sem código/package.json; validar Markdown pelo Gate 7. |
| 4 | NÃO APLICÁVEL: sem aplicação/infraestrutura. |
| 5 | NÃO APLICÁVEL: sem código mutável; sem score. |
| 6 | NÃO APLICÁVEL: sem IA executada. |
| 7 | Estrutura, links, coerência, histórico e evidências; contexto atualizado. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
