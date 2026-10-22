# ERR-0005 — Limpeza de testes sem serialização com escritas em curso

## Recorrência remota — 2026-10-22, em investigação

O [run39722420996](https://github.com/victorlanga348/Bible/actions/runs/39722420996), no commit11701c3, passou440 testes normais, mas o gate próprio recusou23 RuntimeError na mutação. O arquivo remoto12402471033 foi descarregado pelo conector GitHub e o SHA256 ed1c6a94bd3de3e6be1fe555b6f9f1bee1f3cbe6374db60ee62e15db530608d0 corresponde ao digest publicado. JSON original preservado em reports/ci-39722420996-mutation.json, sem alterar estados. Contagens:394 Killed,15 Timeout,7 Survived,200 CompileError,23 RuntimeError; o número textual98,32% não é um gate aprovado.

O log PostgreSQL mostra agora o ciclo concreto: a limpeza detém ExclusiveLock na tabela pai e espera ExclusiveLock na filha; um INSERT em excertos detém a filha e espera RowShareLock no pai para verificar a FK. A regressão antiga cobria o writer que já bloqueava o pai, não este segundo interleaving. Novo teste real coordena o lock inicial da filha, observa a espera e só então libera a inserção. Hipótese de correção a validar: SHARE ROW EXCLUSIVE continua a serializar writers/limpezas e admite ROW SHARE da FK, evitando o ciclo. Não atribuir a sequência a uma falha do Prisma sem evidência adicional.

Outros RuntimeError têm Domain a lançar durante a coleta de suites: sourceSnapshot() era executado no topo de response-contract.spec.ts e na construção de uma matriz E2E. Esses dados de transporte passaram a vir diretamente das fixtures autênticas, sem executar construtores mutáveis na coleta. A suite de schemas continua a testar os mesmos valores;45 testes dirigidos PASS. A confirmação de mutação ainda depende de nova execução válida, sem exclusão de fontes/operadores ou conversão manual de RuntimeError para Killed. A execução local anterior em curso conserva o seu sandbox original.

Regressão controlada realizada em PostgreSQL17.11 separado, loopback55434/biblia_test com identidade confirmada e quatro migrações: reports/s02-cleanup-child-red.log demonstra1 falha/1 aprovação com EXCLUSIVE (o writer termina e a limpeza falha por deadlock); reports/s02-cleanup-child-green.log demonstra2/2 PASS com SHARE ROW EXCLUSIVE. O mesmo modo foi aplicado ao helper de cânone por possuir o mesmo padrão de FKs. Só helpers de teste mudaram, sem alterar transações da aplicação. Dados de transporte45/45, typecheck/lint/tooling13 PASS após a alteração.

Uma execução completa adicional em paralelo ao Stryker foi interrompida depois de a importação integral exceder30s (30.850ms). O PC tinha159MB livres de7974MB; a execução parcial não comprova gate final. Preservado reports/s02-t006-coverage-final.log, comando test:coverage com setup isolado comprovado em reports/isolated-target-last.json (porta55434). Repetir sequencialmente, sem aumentar timeout ou declarar sucesso por causa da pressão de recursos. A baseline513 local e a cobertura remota do checkpoint anterior continuam provas dos respetivos snapshots, não da nova regressão526 ainda pendente.

Repetição sequencial executada:526/526 PASS em27 suites,134,114s, cobertura100%/97,05%, incluindo a aceitação integral/HTTP e as duas regressões de limpeza. Evidência reports/s02-t006-coverage-sequential.log/-coverage-sequential-summary.json. O timeout da transação permaneceu30s. O Stryker local antigo foi interrompido, com log/manifesto incompletos preservados e sem score aprovado, para evitar a pressão de memória/54 timeouts. Gate de mutação transferido para execução integral real do CI39726619966 no checkpoint6272697, ainda pendente de conclusão/análise; não é exclusão ou dispensa de gate.

Data:2026-10-21. Harness source-library, S03-T006. Estado: resolvido, isolamento/teardown e regressão439/gate final aprovados. Responsável: agente executor. Prisma7.10.1/PostgreSQL17.11/Jest30/Stryker10, somente alvo biblia_test confirmado.

## Observações e causa demonstrada

A primeira mutação terminou com13 RuntimeError: dois workers encerrados pelo Nest (ERR-0004), cinco erros de teardown por recursos não inicializados após beforeAll falhar, seis erros FK ao apagar fontes no teardown. Estes estados fizeram o gate estrito falhar;95,53% textual não foi aceite como PASS.

O cleanup anterior apagava excertos/fontes numa transação em array, sem serializar com um writer ainda em curso. Experiência real independente confirmou a lacuna: um segundo cliente insere uma fonte sem commit, a limpeza termina sem esperar, depois o writer confirma os excertos. O teste esperava bloqueio observado/zero linhas e falhou antes da correção. Isso demonstra ausência de isolamento da limpeza face ao writer; não prova um defeito interno do Prisma nem a sequência exata de cada FK no primeiro relatório. Não atribuir essa causa mais específica sem trace de statements.

## Correção e regressão

`cleanSourceTestData` usa transação interativa, lock EXCLUSIVE de ambas as tabelas próprias (pai antes de filho) e DELETEs sequenciais aguardados. Escritas já em curso terminam antes da limpeza; outras aguardam a transação. Não há TRUNCATE/CASCADE sobre outros módulos, limpeza de desenvolvimento, volume apagado ou fixture removida.

[cleanup.spec.ts](../../../backend/test/integration/source-library/cleanup.spec.ts): um caso real RED→GREEN com dois clientes/pg_stat_activity, logs reports/s03-t006-cleanup-before.log/-after.log. O cliente writer fecha em finally; falha inicial do writer também desbloqueia a espera. Guard/identidade reais precedem escrita.

Teardowns S03 verificam se Database/app chegaram a ser criados antes de fechar/limpar. Isso evita uma segunda exceção por undefined ocultar o erro original de setup; falhas de setup/teste/cleanup reais continuam a falhar, sem catch silencioso. Regressão `rtk npm run test:coverage`:438 PASS,20 suites, linhas100%/branches97,07%. Reavaliação Stryker usa a ferramenta/cache originais, sem editar estados ou excluir código.

## Prevenção

Uma suite destrutiva de cada vez no banco partilhado; concorrência apenas nos casos explicitamente controlados. Não pressupor que DELETE filho/pai dentro de transação espera por um writer invisível ainda não confirmado. Um gate de mutação rejeitado por RuntimeError exige corrigir o harness e repetir a prova, sem converter o erro em Killed manualmente.

Validação final:439 testes normais PASS; execução incremental sem argumentos voltou ao padrão completo src/**/*.ts,639 mutantes,435/439=99,08883826879271%, zero RuntimeError/NoCoverage e fontes correspondentes. Relatório/cache separados e válidos; evidência canónica no TEST_REPORT S03. O ensaio misto ambíguo não foi contado como deteção do optional chaining: repetição isolada real produziu Survived, preservado no denominador.
