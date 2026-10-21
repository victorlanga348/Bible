# Runbooks

Estado: comandos locais de preparação, migração de teste, arranque, validação e paragem documentados no [backend](../../backend/README.md) e executados conforme [relatório S01](../sprints/S01/TEST_REPORT.md). Os cenários abaixo continuam conceptuais para operação futura; não há procedimento de recuperação de produção validado.

## Antes de intervir
Confirmar ambiente e âmbito, pesquisar MegaBrain, recolher evidência sanitizada e distinguir hipótese de causa.
Não executar limpeza, migração reversa, restauro ou repetição paga sem plano e autorização apropriados.

## Cenários a concretizar
| Cenário | Diagnóstico e resposta a preparar |
|---|---|
| PostgreSQL indisponível | Verificar ligação, credenciais e ambiente; não afirmar gravação; validar recuperação |
| Migração falhada | Conservar diagnóstico; avaliar estado real e plano de recuperação antes de nova alteração |
| Fornecedor de IA indisponível | Distinguir falha técnica de ausência de evidência; controlar repetição e custo |
| Referência fabricada/não sustentada | Conter entrega afetada, preservar evidência e criar regressão/avaliação |
| Fonte retirada/licença alterada | Suspender uso afetado e rever armazenamento, exibição e proveniência |
| Acesso indevido | Conter exposição, preservar evidências e rever política/implementação |

## Modelo de runbook futuro
Responsável, âmbito, sinais, pré-condições, verificações, ações aprovadas, critérios de interrupção, recuperação, confirmação, comunicação e referências.
Acrescentar comandos somente após execução e validação no ambiente correspondente.
Para incidentes relevantes, usar [Error Report](../megabrain/templates/error-report.md); não criar incidentes fictícios.
