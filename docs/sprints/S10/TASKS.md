# S10 — Tarefas

| ID | Tarefa | Estado | Dependência |
|---|---|---|---|
| S10-T001 | Comunicação same-origin e leitura real | DONE | RED/GREEN; browser/API/PG leitura;97testes/build/lint;coverage runtime100%/99,04%;mutação93,33%/auditoria/revisão |
| S10-T002 | Login Google e sessão no frontend | IN_PROGRESS | T001 DONE; contrato T002_SESSION_SPEC/ADR-0012 fixados antes de código; conta real separada |
| S10-T003 | Estudos/workspace/assistente e percursos reais | BACKLOG | T002; PostgreSQL de teste identificado; contratos |
| S10-T004 | Ampliação local viável de geração e fontes | BACKLOG | T003; plano/contrato/perfil/fontes/avaliações próprios |
| S10-T005 | Gates, revisão e publicação da branch | BACKLOG | T001–T004 e critérios aplicáveis comprovados |

Uma tarefa de cada vez. Priorizar integração existente antes de alterar IA. Falha de infraestrutura não é RED e nenhuma ausência de prova se torna PASS.
