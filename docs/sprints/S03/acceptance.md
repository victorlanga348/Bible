# S03 — Aceitação e gates

Estado: critérios propostos; aprovação pendente. Nenhuma linha abaixo é evidência de execução futura.

## Critérios verificáveis
- S03-AC01: Cada fonte/edição utilizada tem identidade e permissões verificadas para o uso concreto.
- S03-AC02: SR-001 e contratos de recuperação aprovados; conteúdo recuperado mantém proveniência e localização.
- S03-AC03: Ausência de cobertura, referência inválida, licença incerta e falha técnica distinguidas por testes reais; não há bibliografia inventada.
- S03-AC04: tarefas do escopo em DONE com evidências, pendências transferidas explicitamente e aprovação de encerramento registada antes de sprint DONE.

## Plano de gates
| Gate | Aplicabilidade e evidência planeada |
|---|---|
| 1 | SR-001, fontes e contratos aprovados. |
| 2 | TDD das regras e recuperação. |
| 3 | Typecheck, ESLint, dependências e build. |
| 4 | Armazenamento/recuperação reais escolhidos e migrações afetadas. |
| 5 | Domínio/aplicação abrangidos com score superior a 85%. |
| 6 | Casos curados verificam fontes, localizações e suporte; geração externa fora do escopo. |
| 7 | Licenças, cobertura, catálogo, contratos e memória atualizados. |

Usar a definição normativa dos [sete gates](../../quality/quality-gates.md). Cada tarefa regista resultado real e justifica não aplicabilidade; falha ou gate pendente não permite DONE.

## Fechamento
Consolidar relatórios das tarefas, revisão de critérios, documentação, MegaBrain e roadmap. Solicitar aprovação explícita de encerramento; até lá a sprint fica REVIEW, mesmo com tarefas DONE.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
