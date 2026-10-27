# ERR-0006 — Resultados estáticos antigos persistiam no incremental

Recorrência S05 resolvida2026-10-27: CI40454224318/f75ce1c executou cinco candidatos de http-client.ts:4 com0/5 reutilizados, todos Killed/testsCompleted92, incluindo os três antes Survived/testsCompleted71. Em seguida comando sem argumentos confirmou padrão completo59fontes/2802mutantes, global1745/1940=89,94845360824742%, própria586/662=88,51963746223565%, zeroRuntimeError/quatroNoCoverage no denominador. ZIP/digests e fontes auditados na revisão S05; cache só atualizado pelo Stryker. Passo temporário de diagnóstico removido depois desta prova, workflow padrão restaurado. Reforço posterior de duração de teardown ainda exige CI própria, sem atribuir-lhe este resultado. Notas seguintes históricas.

Recorrência confirmada2026-10-27 em S05-T005: CI40452080219/ed53ce5 passou1195 testes e score próprio88,0665%, mas IDs480–482/http-client.ts:4 conservam static=true/coveredBy=[]/testsCompleted71, iguais à CI40449032546 antes de novos testes dos endpoints. São os únicos sobreviventes estáticos próprios. Relatório atual e anterior mantidos sem edição. Plano registado antes da pipeline: forçar cinco candidatos da linha4 e depois confirmar padrão completo sem argumentos, checker/limiares intactos; prova nova ainda pendente. Não herdar este score como se tivesse reexecutado cada estático. Notas seguintes preservam a resolução histórica e a prevenção.

Data:2026-10-21. Stryker10/Jest30, S03-T006. Estado: resolvido, reavaliação forçada e confirmação final do escopo completo aprovadas no TEST_REPORT. Responsável: agente executor. Sem alteração de operadores/thresholds/ignoreStatic ou exclusões do src próprio.

## Causa e evidência confirmadas

Após corrigir harness/testes, a segunda execução ainda continha RuntimeError de schema cuja razão apontava para o primeiro sandbox, além de resultados estáticos anteriores. Inspeção de IncrementalDiffer instalado confirmou: a reutilização considera chave do mutante/cobertura por teste; um estático sem testes associados pode conservar o estado apesar de novos casos. Um relatório incremental com source igual não demonstra que cada cenário estático foi reexecutado.

Houve também um Killed ambíguo na remoção do segundo optional chaining da identidade: primeiro por timeout de ligação, depois por estado inicial inesperado (imported/unchanged). Essas falhas não demonstravam deteção da alteração lógica. A causa precisa dessas interferências nas execuções mistas não foi isolada; não atribuir ao PostgreSQL/Prisma um defeito não provado.

## Correção e comprovação

O script npm incremental agora usa um wrapper Node para encaminhar argumentos ao Stryker antes do gate. Preserva cache/JSON em paths distintos. A pipeline antiga com `&& node ...` receberia argumentos npm no comando final, não no Stryker.

Executada reavaliação forçada de35 mutantes nos trechos app:21, schemas:3–6/28 e import-test-snapshot:11. O próprio Stryker mantém os resultados fora da seleção no incremental; relatório continuou com639 mutantes, sem merge/edição manual de estados. RuntimeError/NoCoverage eliminados. Essa execução sozinha não substitui a confirmação posterior do padrão completo src/**/*.ts.

O candidato ambíguo foi repetido isoladamente com integração real (18 testes relacionados). Resultado Survived, não Killed; log reports/s03-t006-mutation-identity-isolated.log. A leitura de role ocorre apenas quando o primeiro operando confirmou db e a existência da linha, portanto remover só esse optional chaining é equivalente para linhas simples devolvidas pelo adapter. Mantido no denominador: score passou de99,3166% para99,08883826879271%, sem alegar deteção inexistente.

Um primeiro intervalo de coluna selecionou zero mutantes e não foi aceite como reavaliação. Código ProjectReader confirmou linhas1-based/colunas0-based no argumento, enquanto o relatório apresenta colunas1-based. Intervalo corrigido11:47–11:67 produziu exatamente1 mutante e prova nova. Não confundir um gate aprovado sobre cache existente com avaliação fresca de zero candidatos.

## Prevenção e limites

Depois de corrigir harness/contratos estáticos, verificar os estados reutilizados e usar --force quando necessário. Reavaliações dirigidas são diagnósticos com cache preservado, não redução do escopo aprovável. Terminar com comando incremental sem argumentos, JSON/cache válidos, todos os mutantes próprios e comparação das fontes. Resultados ambíguos por infraestrutura/estado de fixture exigem investigação/repetição, sem lhes atribuir uma causa lógica por conveniência.

Validação final:439 testes normais PASS; execução incremental sem argumentos voltou ao padrão completo src/**/*.ts,639 mutantes,435/439=99,08883826879271%, zero RuntimeError/NoCoverage e fontes correspondentes. Relatório/cache separados e válidos; evidência canónica no TEST_REPORT S03. O ensaio misto ambíguo não foi contado como deteção do optional chaining: repetição isolada real produziu Survived, preservado no denominador.
