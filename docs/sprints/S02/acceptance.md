# S02 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S02-AC01: Modelo, política de acesso/retenção, SH-001 e contratos necessários aprovados antes de código correspondente.
- S02-AC02: Migrações, repositórios, transações e restrições comprovados com PostgreSQL/Prisma reais e limpeza determinística.
- S02-AC03: HTTP real valida DTOs, erros, acesso e persistência; consulta de histórico não regenera estudo; mutação aplicável superior a 85%.
- S02-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | Modelo, SH-001, acesso e contratos aprovados. |
| 2 | TDD em persistência e casos de uso. |
| 3 | Typecheck, ESLint, dependências e build. |
| 4 | PostgreSQL/Prisma/NestJS, migrações e segurança reais. |
| 5 | Domínio/aplicação alterados com score superior a 85%. |
| 6 | NÃO APLICÁVEL: não há geração/adapter de IA nesta sprint. |
| 7 | Modelo, contratos, operação e memória sincronizados. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
