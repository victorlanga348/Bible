# S10 — Tarefas

| ID | Tarefa | Estado | Dependência |
|---|---|---|---|
| S10-T001 | Comunicação same-origin e leitura real | DONE | RED/GREEN; browser/API/PG leitura;97testes/build/lint;coverage runtime100%/99,04%;mutação93,33%/auditoria/revisão |
| S10-T002 | Login Google e sessão no frontend | DONE | T001 DONE; contrato T002_SESSION_SPEC/ADR-0012; CI frontend41131759411 PASS mutação86,22%/cobertura100%/97,40%; CI backend41126297344 PASS 90,71%/90,13%; browser real dev/preview PASS; conta Google humana adiada |
| S10-T003 | Estudos/workspace/assistente e percursos reais | DONE | T002 DONE; T003_WORKFLOWS_SPEC; T003_TEST_REPORT; cancelamento AbortSignal; propagação estudo ativo; CAS workspace; 184 testes frontend PASS; 1453 testes backend PASS |
| S10-T004 | Ampliação local viável de geração e fontes | DONE | T003 DONE; T004_AI_SPEC; T004_TEST_REPORT; perfil local-extractive-v1; proveniência Josefo autêntica; abstenção estrita comprovada |
| S10-T005 | Gates, revisão e publicação da branch | DONE | T001–T004 DONE; sete quality gates conferidos; auditoria check-completion-docs PASS; revisão final em REVIEW.md |

Uma tarefa de cada vez. Priorizar integração existente antes de alterar IA. Falha de infraestrutura não é RED e nenhuma ausência de prova se torna PASS.
