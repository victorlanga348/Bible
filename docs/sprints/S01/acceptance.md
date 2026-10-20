# S01 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S01-AC01: Regras de domínio e contratos internos necessários têm aprovação rastreável; lacunas de seleção/comparação identificadas e refinadas.
- S01-AC02: Domínio sem imports de NestJS, Prisma ou SDKs de IA; testes mostram RED/GREEN/REFACTOR.
- S01-AC03: Typecheck, ESLint, build aplicável e mutação de domínio afetado executados; score bruto superior a 85%.
- S01-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | Aprovar spec e plano por tarefa, sem aprovação global implícita. |
| 2 | TDD por comportamento de domínio. |
| 3 | Toolchain aprovada, typecheck, ESLint, dependências e build aplicável. |
| 4 | NÃO APLICÁVEL a domínio puro; qualquer fronteira acrescida exige revisão de escopo. |
| 5 | StrykerJS compatível; domínio/aplicação afetados com score superior a 85%. |
| 6 | NÃO APLICÁVEL a geração; regras epistemológicas verificadas em testes de domínio. |
| 7 | Docs de domínio, ADRs e MegaBrain conforme aprendizagem. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
