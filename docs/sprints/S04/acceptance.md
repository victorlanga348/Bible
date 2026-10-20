# S04 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S04-AC01: SS-001 e contratos necessários aprovados; contexto imediato/livro, divergências e distinções interpretativas cobertos.
- S04-AC02: Casos de uso e regras evidenciados por TDD e mutação superior a 85%, com fontes/persistência reais aplicáveis.
- S04-AC03: Relatório identifica qualquer double unitário e não afirma integração real de geração; dependência de S05 explícita.
- S04-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | SS-001 e ports aprovados. |
| 2 | TDD de cada política/caso de uso. |
| 3 | Typecheck, ESLint, dependências e build. |
| 4 | Fontes/persistência reais afetadas; port de geração não é adapter integrado. |
| 5 | Domínio/aplicação afetados acima de 85%. |
| 6 | NÃO APLICÁVEL à geração externa, fora do escopo; regras determinísticas nos Gates 2/7. Avaliação real em S05. |
| 7 | Limites, specs e memória claros; sem promessa de geração já disponível. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
