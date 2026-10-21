# ERR-0004 — Falha de composição Nest encerrava o processo

Data:2026-10-21. source-library/composição, S03-T006. Estado: resolvido, revalidação final Stryker aprovada. Responsável: agente executor. Nest12.2/Jest30.5.2/Stryker10/Node24.16, sem credenciais no registo.

## Observação e causa confirmada

Mutantes que removiam providers da composição levaram NestFactory.create a chamar process.exit(1), encerrando o worker Jest. Logs Stryker mostram tentativas repetidas e workers encerrados. O comportamento original de bootstrap também foi reproduzido num teste com falha controlada de configuração: o provider lança erro durante inicialização real do Nest, antes de operações DB/HTTP. Sem abortOnError:false, o teste termina no process.exit em vez de obter rejeição que o launcher possa sanitizar.

Código primário instalado confirma o teardown de ExceptionsZone e as tentativas de RetryRejectedDecorator do Stryker. Worker abortado não é automaticamente Killed nem prova de incompatibilidade Jest/Stryker; relatório/gate devem decidir o resultado, sem dispensar RuntimeError.

## Correções e limites

createApplication usa abortOnError:false; o erro de provider é rejeitado ao chamador. O launcher existente continua responsável pelo diagnóstico STARTUP_FAILED e exitCode1, sem expor detalhe. [composition.spec.ts](../../../backend/test/e2e/composition.spec.ts) passou de encerramento inesperado/exit1 para1 PASS, logs reports/s03-t006-composition-red.log/-green.log. O spy local injeta apenas falha de configuração, não substitui persistência nem comprova integração do módulo.

O harness Jest guarda process.exit no seu próprio ambiente, transformando terminação em exceção observável. Mutantes de abortOnError ou da composição continuam a falhar os testes em vez de matarem o runner. A guarda não altera subprocessos/launcher, DB ou HTTP reais. [exit-guard.spec.ts](../../../backend/test/unit/exit-guard.spec.ts): antes exit27, depois3 PASS (códigos27/1/0); logs -exit-guard-before.log/-after.log. Configuração/harness requerem esta verificação executável, não RED de regra de negócio. O Jest pode imprimir a chamada de exit interceptada; isso não é terminação quando os três testes terminam e passam.

Primeira execução Stryker já iniciada conservou a cópia anterior no sandbox; não usar esse relatório como aprovação das correções posteriores. A execução incremental seguinte deve usar o src/harness atual, confirmar ausência de RuntimeError e manter todos os mutantes próprios/thresholds/denominador. Prova final será registada no [TEST_REPORT](../../sprints/S03/TEST_REPORT.md), sem editar resultados para converter estados.

## Segunda via de terminação confirmada

A reavaliação observou exit134/native stack em mutantes de opções de arranque. Inspeção de nest-factory.js:115–117 confirmou: se a exceção de teardown regressa a handleInitializationError com abortOnError ativo, Nest chama process.abort(). Proteger apenas exit não cobria essa segunda via. O ambiente Jest agora protege abort também; teste específico passa e composição confirma zero chamadas a exit/abort no comportamento original. Logs reports/s03-t006-abort-guard-after.log (4 verificações do harness) e -composition-abort-regression.log (2 PASS). A configuração guardada é local a Jest, sem alterar subprocessos ou reclassificar relatórios manualmente. O gate só será aprovado pela nova execução completa válida.

Validação final:439 testes normais PASS; execução incremental sem argumentos voltou ao padrão completo src/**/*.ts,639 mutantes,435/439=99,08883826879271%, zero RuntimeError/NoCoverage e fontes correspondentes. Relatório/cache separados e válidos; evidência canónica no TEST_REPORT S03. O ensaio misto ambíguo não foi contado como deteção do optional chaining: repetição isolada real produziu Survived, preservado no denominador.
