# S06 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S06-AC01: FQ-001 e contratos aprovados, com contexto/acesso/retenção explícitos.
- S06-AC02: Perguntas usam o estudo correto, procuram evidência nova quando necessário e não tratam resposta anterior como fonte.
- S06-AC03: HTTP/persistência e IA real controlada comprovam continuidade, falhas, referências e correção visível.
- S06-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | FQ-001 e contratos aprovados. |
| 2 | TDD de associação, contexto e correção. |
| 3 | Typecheck, ESLint, dependências e build. |
| 4 | NestJS/PostgreSQL/Prisma e fornecedor real afetados. |
| 5 | Domínio/aplicação abrangidos acima de 85%. |
| 6 | Casos de continuação, fonte ausente, pressuposto controverso e citação inválida. |
| 7 | Histórico, política de dados, contratos e memória sincronizados. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
