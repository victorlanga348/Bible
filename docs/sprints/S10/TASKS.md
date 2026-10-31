# S10 — Tarefas

| ID | Tarefa | Estado | Dependência |
|---|---|---|---|
| S10-T001 | Comunicação same-origin e leitura real | DONE | RED/GREEN; browser/API/PG leitura;97testes/build/lint;coverage runtime100%/99,04%;mutação93,33%/auditoria/revisão |
| S10-T002 | Login Google e sessão no frontend | DONE | T001 DONE; contrato T002_SESSION_SPEC/ADR-0012; CI frontend41131759411 PASS mutação86,22%/cobertura100%/98,51%; CI backend41126297344 PASS 90,71%/90,13%; browser real dev/preview PASS; conta Google humana adiada |
| S10-T003 | Estudos/workspace/assistente e percursos reais | DONE | CI41198918785 PASS:396testes/100%linhas95,62%branches/mutação85,0243902439%; inventário/revisão307Survived+2Timeout PASS; browser/API/PG e IA real comprovados; auditoria documental29ficheiros/143links PASS; fecho sob autorização vigente |
| S10-T004 | Ampliação local viável de geração e fontes | BACKLOG | T003; plano/contrato/perfil/fontes/avaliações próprios |
| S10-T005 | Gates, revisão e publicação da branch | BACKLOG | T001–T004 e critérios aplicáveis comprovados |

Uma tarefa de cada vez. Priorizar integração existente antes de alterar IA. Falha de infraestrutura não é RED e nenhuma ausência de prova se torna PASS.
