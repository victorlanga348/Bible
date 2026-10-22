# ERR-0013 — Deadline de Jest declarado no nível errado

Data2026-10-22, S04-T006. Estado: configuração corrigida e17 testes tooling PASS; curadoria real17/17 PASS posterior. Responsável: agente executor. Jest30.5.2/Node24.16, execução normal com quatro projetos e configuração plana de mutação.

## Causa confirmada

O primeiro GREEN de curadoria falhou17 casos no beforeAll, por5000ms, antes de chegar aos comportamentos. jest.config.cjs declarava testTimeout15000 dentro de cada projeto. O loader real --showConfig não o expunha em globalConfig; o jest-circus instalado lê globalConfig.testTimeout e o seu estado começa em5000. O [default documentado pelo Jest](https://jestjs.io/docs/configuration#testtimeout-number) também é5000ms. Não era prova de que a aplicação falhou ao validar curadoria.

A configuração plana de mutação herdava o campo dos projetos e já tinha15000. Por isso, só mover o campo para a raiz sem o propagar à configuração de mutação introduziria outra regressão. O teste usa o loader real em ambas as configurações, com o mesmo --watchman=false dos scripts existentes. Primeiro ensaio sem essa flag falhou validação de symlinks/watchman, conservado como probe inválido, não como RED do prazo.

## Correção e prova

Teste novo [jest-configuration.test.cjs](../../../backend/scripts/jest-configuration.test.cjs) escrito antes da alteração: RED1/16PASS por globalConfig.testTimeout undefined em vez de15000. Correção move15000 para a raiz e a configuração plana recebe regular.testTimeout. GREEN17/17 em test:tooling; artefactos s04-t006-jest-deadline-{red,typed-red,green}.log. O prazo normal efetivo aumenta5000→15000; a mutação conserva15000. Limites de produto Database permanecem ligação10000/leitura5000/SQL2000ms, sem alterar asserções/limiares ou ignorar falhas.

## Limite da atribuição causal

A repetição corrigida falhou depois com PostgreSQL57014 na consulta de identidade. Essa é outra observação; a correção do deadline não é declarada cura de latência SQL. Probes nativos3pg/3Prisma passaram e a suite monitorizada real17/17 passou8,006s. Causa específica das latências anteriores não demonstrada, preservada no [TEST_REPORT S04](../../sprints/S04/TEST_REPORT.md). Regressão integral/gates da T006 continuam obrigatórios, sem aceitar as tentativas falhadas como PASS.
