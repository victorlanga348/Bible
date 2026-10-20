# S05 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S05-AC01: Fornecedor, modelo, contrato, política de dados e plano de execução real aprovados.
- S05-AC02: Adapter real testado em suite controlada; falhas/custo/quotas e proveniência documentados.
- S05-AC03: Avaliações curadas verificam suporte, referências inexistentes, contexto e divergências; critérios bloqueantes e limites registados.
- S05-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | Contrato do adapter, modelo e avaliação aprovados. |
| 2 | TDD de coordenação/validação afetadas. |
| 3 | Typecheck, ESLint, dependências e build. |
| 4 | Fornecedor real e armazenamento/HTTP afetados em suites controladas. |
| 5 | Domínio/aplicação alterados acima de 85%; adapters avaliados pelo seu comportamento. |
| 6 | Corpus, chamadas reais, fontes/citações e critérios semânticos executados. |
| 7 | Proveniência, limitações, custos/dados e conhecimento sincronizados. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
