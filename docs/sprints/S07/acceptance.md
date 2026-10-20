# S07 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S07-AC01: Framework, fluxos, contratos de componentes e critérios acessíveis aprovados.
- S07-AC02: Seleção, estudo/fontes, perguntas e histórico funcionam com API real, incluindo vazio/erro/carregamento.
- S07-AC03: Teclado, foco, contraste, zoom/reflow e leitura assistida verificados conforme matriz aprovada.
- S07-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | Specs de navegação/UX e contratos aprovados. |
| 2 | TDD dos comportamentos de interface. |
| 3 | Typecheck, ESLint, dependências e build da stack aprovada. |
| 4 | Browser/API reais e acessibilidade; sem backend falso permanente. |
| 5 | Obrigatório se domínio/aplicação forem alterados; UI isolada pode justificar NÃO APLICÁVEL. |
| 6 | Obrigatório se mudar prompt/modelo/recuperação/semântica; apresentação isolada pode justificar NÃO APLICÁVEL. |
| 7 | Páginas, componentes, design, copy, auditorias e memória sincronizados. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
