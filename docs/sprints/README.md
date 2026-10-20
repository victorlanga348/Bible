# Sprints — Bíblia App

Fonte operacional para planeamento e gestão de S00–S09. O [roadmap](../roadmap/master-plan.md) resume a sequência; cada sprint mantém escopo, backlog, aceitação e retrospectiva próprios.
Estado: S00 autorizada apenas para a atualização documental; restantes sprints propostas, sem datas ou aprovação de início.

## Registo
| Sprint | Estado da sprint | Trilhas | Dependências |
|---|---|---|---|
| [S00 — Fundação e Governança](S00/README.md) | REVIEW | Transversal (A/B/C) | Antecedente DOC-0001 |
| [S01 — Domínio Bíblico](S01/README.md) | BACKLOG | B; A no harness | S00 |
| [S02 — Persistência e Contratos](S02/README.md) | BACKLOG | A; B e C na revisão | S01 |
| [S03 — Biblioteca Bíblica](S03/README.md) | BACKLOG | B e A | S02 |
| [S04 — Estudo Estruturado](S04/README.md) | BACKLOG | B e A | S03 |
| [S05 — Integração de IA](S05/README.md) | BACKLOG | B e A | S04 |
| [S06 — Perguntas Livres](S06/README.md) | BACKLOG | B e A; C na revisão | S05 |
| [S07 — Frontend](S07/README.md) | BACKLOG | C; A e B na integração | S06 |
| [S08 — Integração Ponta a Ponta](S08/README.md) | BACKLOG | A/B/C | S07 |
| [S09 — Hardening e MVP](S09/README.md) | BACKLOG | A/B/C | S08 |

Estados de sprint usam os mesmos rótulos de gestão das tarefas, com condição adicional de aprovação de encerramento para DONE.
O README da sprint é a referência do estado da sprint; backlog é a referência dos estados das suas tarefas. Índices e roadmap devem refletir esses estados.

## Estrutura e identidade
Cada sprint tem README.md, scope.md, backlog.md, acceptance.md e retrospective.md.
IDs: S00, S01, ...; tarefas: S00-T001, S00-T002, ...; sequência única dentro da sprint e nunca reutilizada para outro trabalho.
Backlog regista ID, título, trilha, prioridade, estado, dependências e spec.
Fichas detalhadas usam o [template único](../tasks/template.md) e ficam em docs/sprints/Sxx/tasks/. Criar README nesse diretório quando houver fichas.
Apenas a ficha de S00-T001 é criada nesta operação. Backlogs futuros não substituem planos detalhados aprovados.

## Estados e transições de tarefa
| Estado | Condição |
|---|---|
| BACKLOG | Proposta ainda sem condições de início; pode conter refinamento documental por aprovar |
| READY | Sprint, spec, contrato e plano necessários aprovados; dependências satisfeitas |
| IN_PROGRESS | Uma tarefa READY iniciada no âmbito autorizado |
| BLOCKED | Impedimento conhecido, com motivo e condição de desbloqueio; contratos não aprovados bloqueiam implementação dependente |
| REVIEW | Execução terminada para revisão, evidências e gates em avaliação |
| DONE | Todos os gates aplicáveis satisfeitos e critérios demonstrados |

Fluxo normal: BACKLOG → READY → IN_PROGRESS → REVIEW → DONE.
Qualquer tarefa impedida passa a BLOCKED; só regressa a READY quando dependências e aprovações forem verificadas.
Revisão com falha devolve a IN_PROGRESS se a correção já estiver autorizada; caso contrário, BLOCKED.
Não usar DONE para indicar apenas que o código foi escrito. Não mover tarefas bloqueadas para READY por aprovação genérica do roadmap.
Histórico anterior mantém os seus rótulos originais; estados novos não são aplicados retroativamente a DOC-0001.

## Início da sprint
Apresentar objetivo, escopo, tarefas, dependências, riscos, aceitação e validação; aguardar aprovação explícita.
Aprovação de sprint não aprova specs ou planos de tarefa nem alterações fora do escopo.
Trabalhar numa tarefa aprovada de cada vez, salvo autorização expressa para paralelismo. Trilhas não autorizam execução paralela por si.

## Durante a execução
Consultar documentação, skills relevantes, MegaBrain e ADRs; executar [TDD](../quality/tdd-policy.md) e [gates](../quality/quality-gates.md).
Atualizar ficha/backlog, motivo de bloqueio e evidências. Não adicionar dependências ou alterar escopo sem aprovação.
Não presumir microserviços ou datas; sprints têm fronteiras próprias e dependências explícitas, não autonomia absoluta sobre contratos.

## Fechamento
1. Verificar tarefas DONE e evidências dos gates.
2. Confirmar critérios da sprint, documentação e MegaBrain.
3. Produzir relatório e retrospectiva baseada em factos.
4. Registar pendências e transferências com destino e aprovação.
5. Atualizar roadmap e solicitar aprovação de encerramento.
6. Manter sprint REVIEW até aprovação explícita; só então DONE.

Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
Concluir S00-T001 não encerra S00 automaticamente.

## Referências
[Dependências](../roadmap/dependencies.md) · [Correspondência histórica](../roadmap/traceability.md) · [Governança](../documentation-governance.md) · [MegaBrain](../megabrain/README.md).
