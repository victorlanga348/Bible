# S08 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S08-AC01: Percursos principais e falhas aprovados têm execução rastreável em componentes reais.
- S08-AC02: Proveniência e contexto preservados do browser ao histórico; isolamento e persistência confirmados.
- S08-AC03: Defeitos bloqueantes resolvidos por TDD e regressão; relatórios de software, mutação e IA separados.
- S08-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | Cenários e contratos completos aprovados. |
| 2 | Correções de comportamento exigem RED/GREEN/REFACTOR. |
| 3 | Scripts reais da stack e dependências arquiteturais. |
| 4 | Percurso completo em infraestrutura real; migrações e isolamento. |
| 5 | Regressão dos módulos abrangidos; correções em domínio/aplicação acima de 85%. |
| 6 | Geração real controlada e casos semânticos do percurso. |
| 7 | Relatórios, regressões, auditorias, roadmap e memória atualizados. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
