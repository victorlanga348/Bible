# ERR-0029 — Deadline nativo era apresentado como erro de rede

Confirmado2026-10-31/S10-T003. Transporte frontend http-client.ts. O App compõe o sinal de cancelamento com AbortSignal.timeout(15000) para escritas de estudo; os pedidos de IA mantêm os seus budgets distintos.

RED executável usa um sinal nativo realmente expirado e o respetivo reason TimeoutError. O transporte devolvia ApiError NETWORK_ERROR/status0, embora o motivo fosse deadline. Log s10-t003-native-timeout-red.log,1FAIL/19SKIP. Não é falha de sintaxe, serviço nem simulação de resposta de modelo.

Causa: a classificação só reconhecia Error.message=TIMEOUT e name=AbortError. Correção mínima inclui name=TimeoutError. GREEN48PASS/3ficheiros9,33s, transport-contracts/api-transport/http-client; log s10-t003-native-timeout-green.log. Duração/sinais/retries/modelo/backend não alterados. Static/build/global coverage/mutação da revisão continuam gates próprios.

Lição: testar o motivo real do deadline nativo, além de erros técnicos construídos manualmente. Não confundir timeout do servidor, deadline do cliente e cancelamento voluntário.
