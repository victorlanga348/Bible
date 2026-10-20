# Plano mestre S00–S09

Estado: plano preparado pelo pedido do utilizador; S00-T001 autorizada documentalmente. Não há implementação, datas ou aprovação das restantes sprints.
A stack e ADR-0001 permanecem vigentes. Esta sequência não escolhe frontend, modelos, embeddings, autenticação, deploy ou licenças.

## Sprints propostas
| Sprint | Objetivo temático | Estado | Trilhas | Dependências | Entregáveis e qualidade |
|---|---|---|---|---|---|
| [S00](../sprints/S00/README.md) | Fundação e Governança | REVIEW | Transversal (A/B/C) | Nenhuma sprint anterior | [Escopo](../sprints/S00/scope.md), [critérios/gates](../sprints/S00/acceptance.md) |
| [S01](../sprints/S01/README.md) | Domínio Bíblico | BACKLOG | B; A no harness | S00 | [Escopo](../sprints/S01/scope.md), [critérios/gates](../sprints/S01/acceptance.md) |
| [S02](../sprints/S02/README.md) | Persistência e Contratos | BACKLOG | A; B e C na revisão | S01 | [Escopo](../sprints/S02/scope.md), [critérios/gates](../sprints/S02/acceptance.md) |
| [S03](../sprints/S03/README.md) | Biblioteca Bíblica | BACKLOG | B e A | S02 | [Escopo](../sprints/S03/scope.md), [critérios/gates](../sprints/S03/acceptance.md) |
| [S04](../sprints/S04/README.md) | Estudo Estruturado | BACKLOG | B e A | S03 | [Escopo](../sprints/S04/scope.md), [critérios/gates](../sprints/S04/acceptance.md) |
| [S05](../sprints/S05/README.md) | Integração de IA | BACKLOG | B e A | S04 | [Escopo](../sprints/S05/scope.md), [critérios/gates](../sprints/S05/acceptance.md) |
| [S06](../sprints/S06/README.md) | Perguntas Livres | BACKLOG | B e A; C na revisão | S05 | [Escopo](../sprints/S06/scope.md), [critérios/gates](../sprints/S06/acceptance.md) |
| [S07](../sprints/S07/README.md) | Frontend | BACKLOG | C; A e B na integração | S06 | [Escopo](../sprints/S07/scope.md), [critérios/gates](../sprints/S07/acceptance.md) |
| [S08](../sprints/S08/README.md) | Integração Ponta a Ponta | BACKLOG | A/B/C | S07 | [Escopo](../sprints/S08/scope.md), [critérios/gates](../sprints/S08/acceptance.md) |
| [S09](../sprints/S09/README.md) | Hardening e MVP | BACKLOG | A/B/C | S08 | [Escopo](../sprints/S09/scope.md), [critérios/gates](../sprints/S09/acceptance.md) |

Cada escopo detalha entregáveis, exclusões, restrições, riscos e decisões. Cada acceptance contém critérios verificáveis e os sete gates.
S00 não inclui bootstrap. S01 prepara toolchain aprovada para domínio; S02 prepara NestJS/persistência. S02 inclui histórico segundo SH-001. S03 incorpora fontes autorizadas.
S04 cobre regras/casos de uso por ports; geração real e avaliação do fornecedor só são comprovadas em S05. S06 integra continuação e perguntas ao histórico.
S07 trata navegação e apresentação; S08 verifica o percurso real; S09 prepara prontidão, sem autorização automática de publicação.

## Entrada e aprovação
Cada sprint apresenta plano e aguarda aprovação. Cada tarefa também necessita de spec/contrato e plano aprovados antes de código.
Gates e dependências podem bloquear tarefas mesmo quando o tema da sprint foi aprovado.
Decisões editoriais que afetem regras ou contratos devem ser resolvidas antes da tarefa dependente; não criar campos provisórios como se aprovados fossem.
A ordem é proposta por dependência, sem impedir replaneamento explícito e aprovado.

## Fechamento e manutenção
Relatório, retrospectiva factual, MegaBrain e pendências atualizados; aprovação explícita antes de sprint DONE.
Consultar [dependências](dependencies.md), [backlogs](../sprints/README.md) e [correspondência](traceability.md).
Não reduzir a cobertura pretendida da Bíblia nem apresentar biblioteca progressiva como cobertura de fontes integral.
