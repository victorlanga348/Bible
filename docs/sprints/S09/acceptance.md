# S09 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S09-AC01: Critérios de MVP aprovados e satisfeitos; achados bloqueantes de segurança/acessibilidade resolvidos.
- S09-AC02: Ambiente escolhido, observabilidade e recuperação verificados conforme planos aprovados, sem publicação automática.
- S09-AC03: Relatório final explicita cobertura real, licenças, pendências, limitações e decisão de encerramento/publicação separadas.
- S09-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | MVP, hardening e operação com critérios aprovados. |
| 2 | Toda correção de comportamento por TDD. |
| 3 | Typecheck, ESLint, dependências e build aplicáveis. |
| 4 | Regressão real, segurança, acessibilidade e recuperação. |
| 5 | Domínio/aplicação abrangidos acima de 85%; relatórios analisados. |
| 6 | Avaliações finais aplicáveis sem esconder limites de cobertura. |
| 7 | Prontidão, docs, ADRs, licenças, memória e pendências; publicação exige autorização própria. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
