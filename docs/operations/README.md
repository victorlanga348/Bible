# Operações

Estado2026-11-06: frontend local e integração S10 em revisão S10-T006. [Guia de uso e ações humanas](USER_ACTIONS.md), com comandos reais, Google, arranque do índice e divisão de responsabilidades; [evidências atuais](../sprints/S10/T006_TEST_REPORT.md). A release backend abaixo é histórica e não certifica o frontend atual.

Release pessoal local S00–S08 verificada2026-10-29. [Fecho](../sprints/S08/T007_COMPLETION_REPORT.md), [relatório](../sprints/S08/TEST_REPORT.md), [evidência](../sprints/S08/evidence/release-verification.json).

[Inventário e configuração](environments.md), [observabilidade](observability.md), [runbooks de recuperação/incidente](runbooks.md), [arranque/token/testes](../../backend/README.md), [IA local](../integrations/local-ai.md). Uma validação pesada por vez neste PC8GB. Apenas processos/recursos próprios; main, segredos e serviços alheios preservados.

O frontend existe em `frontend/`, servido localmente na porta5173. Não existe deployment remoto/público, HA ou monitorização contínua. Backups locais foram restaurados em ambiente descartável, incluindo configuração TimeZone e recuperação HTTP de dados privados. Não extrapolar essa prova para outro ambiente/fuso/fornecedor.
