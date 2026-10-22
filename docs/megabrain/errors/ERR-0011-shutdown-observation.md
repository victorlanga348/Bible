# ERR-0011 — Observação instantânea do encerramento físico era intermitente

Data2026-10-22, S02-T006, teste de infraestrutura herdado S01. Estado: causa observacional reproduzida, correção de teste em validação. Nenhuma alteração adicional de src ou prazo da aplicação.

Após refinar os seeds, a regressão completa passou548 testes e falhou1: depois de await probe.onModuleDestroy(), pg_stat_activity ainda devolveu o PID observado. A asserção exigia desaparecimento instantâneo. Artefacto reports/s02-fixture-setup-coverage-fixed.log, sem converter a tentativa em PASS.

Primeiro ensaio separado com seis probes/monitor Prisma não reproduziu. Um monitor pg real já conectado, consultado imediatamente após o mesmo $disconnect, reproduziu em13/60 probes: o PID ainda estava visível na primeira leitura e desapareceu na seguinte, dentro de59,94ms no conjunto. Todas as60 sessões desapareceram, sem terminar PIDs manualmente. reports/s02-shutdown-observation.json e -fast.json conservam ambas as experiências. Não atribuir uma falha interna específica do Prisma/pg sem trace adicional; a ordem observada demonstra que o retorno do cliente não é uma garantia de ausência instantânea nessa view.

Critério refinado de verificação: após fechar o pool, observar o PID real até desaparecer, com limite2000ms e consultas a cada10ms somente enquanto existir. Não aceitar PID persistente, não usar sleep fixo como prova nem ignorar o resultado. O finally continua a desconectar mesmo quando a asserção falha. Uma implementação que não feche a ligação continua a falhar o critério; código de produção permanece intacto.

Validação necessária: repetir typecheck/lint, regressão549 e mutação no setup atual. Isto corrige uma expectativa de observabilidade de infraestrutura, não implementa comportamento de negócio ou dispensa um teste falhado.

Regressão posterior: typecheck/lint PASS,549 testes/30 suites PASS em90,19s, reports/s02-fixture-setup-coverage-observation.log/-summary.json. O código de Database não foi alterado por esta correção; confirmação de mutação permanece pendente.
