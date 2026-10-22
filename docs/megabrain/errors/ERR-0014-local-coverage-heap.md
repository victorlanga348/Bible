# ERR-0014 — Orçamento local de heap na regressão S04

Estado: resolvido para a regressão integral; mutação nova ainda por validar. Área: S04-T006, Node24/Jest30/Windows, máquina8GB.

O limite temporário --max-old-space-size=512 tinha sido suficiente para o conjunto T005. Após ampliar Application/Prisma/HTTP, a primeira execução integral de cobertura terminou por FATAL ERROR: Reached heap limit, exit134, perto de500MB de heap. Essa execução não produziu prova integral aceite. É uma causa explícita de falha do processo de testes; não prova a origem das latências PostgreSQL57014 anteriores.

Depois de observar1.383MB livres no host, executar sequencialmente o conjunto com --expose-gc --max-old-space-size=768 e --logHeapUsage:830/830 testes PASS,45 suites,157,088s, linhas100%/branches97,94%. NODE_OPTIONS existiu apenas no processo filho PowerShell e foi restaurado; .env e prazos/limiares da aplicação não mudaram.768MB é teto configurado, não medição de pico.

Evidências locais ignoradas s04-t006-http-coverage.log, s04-t006-integrated-coverage-768.log e s04-t006-integrated-coverage-summary.json. Falha original conservada no [relatório](../../sprints/S04/TEST_REPORT.md). Dimensionar recursos a partir do conjunto real; não reduzir suites ou falsificar PASS por um ensaio dirigido. Stryker pode precisar de recursos próprios e exige prova independente, porque instrumentação/checker/VMs têm outro perfil.
