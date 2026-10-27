# ERR-0019 — Health tardio ultrapassava readiness

Confirmado2026-10-27 em S05-T005, após revisão dos sobreviventes. O runtime media readiness antes de fetch health, mas o timeout dessa chamada era relativo ao início do pedido; um200 recebido depois do prazo global de readiness ainda podia abrir a sessão. Não era falha de serviço nem justificação para ampliar180s do perfil.

Plano e hipótese registados na ficha antes de teste/correção. Servidor Node técnico com anúncio de ownership retardado650ms e health200 depois de mais600ms, readiness interno1000ms. RED `npm run test:unit -- --runTestsByPath test/unit/ai-assistant/native-runtime.spec.ts -t 'absolute readiness deadline'`:1FAIL/29 não selecionados,3,377s; recebeu resolução late success em vez de AiTimeoutError. Prova `reports/s05-t005-readiness-deadline-red.log`, sem erro de import/sintaxe/infraestrutura. Dados exclusivamente técnicos, não chamada de IA.

Correção mínima: calcular tempo restante absoluto em cada ciclo, usar esse restante no timeout do health, revalidar prazo depois da resposta/cancelamento do body e preservar AiTimeoutError. Poll limitado ao restante, com mínimo técnico1ms; nenhum limite/modelo/prompt/permissão ampliado. GREEN do mesmo teste1PASS/29 não selecionados2,823s; callback não chamado, filho parado e lease removida. Regressão855 testes/26suites PASS24,136s e typecheck/lint/build PASS, logs `s05-t005-readiness-*`. Refactor sem mudança extra necessária.

Prova real pelo CLI corrigido em execução, sem modelos em paralelo com suites pesadas. Só PostgreSQL de teste próprio fa533936a0a4 foi parado após conferir ID/project/service; domus/Desktop/bible_db/.env preservados. Scores de CI665ed24/f75ce1c são anteriores à correção e não validam esta fonte. Gate integral de mutação/artefactos/fontes corrigidos e prova real continuam pendentes; incidente ainda em validação, sem PASS antecipado.

Lição: um timeout relativo por request não substitui deadline absoluto de readiness; testar resposta válida que cruza o deadline, além de servidor permanentemente indisponível. Watchdog do harness também não comprova o prazo de teardown do runtime; esse caso tem asserção independente<4s.
