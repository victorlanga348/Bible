# ERR-0002 — Colisão entre cache incremental e relatório JSON

Data: 2026-10-21. S02-T005, stack Stryker10/Jest30. Estado: resolvido, causa confirmada e regressão executada; duas saídas válidas e gate aprovado no TEST_REPORT S02. Não é erro de domínio bíblico nem incompatibilidade entre Stryker e Jest.

## Observação e causa

Primeira mutação S02 terminou a avaliação de288 mutantes e mostrou97,21% no log, mas o gate adicional falhou ao ler JSON. O ficheiro tinha conteúdo remanescente após o fim do objeto, portanto era inválido. Nenhum score desse artefacto foi aceite como PASS.

O script incremental apontava incrementalFile para reports/mutation/mutation.json, que também era a saída do JsonReporter. Inspeção do código instalado confirmou dois writers no encerramento: JsonReporter escreve JSON compacto e MutationTestReportHelper escreve o cache indentado no incrementalFile, depois de emitir o evento de relatório. Com o mesmo caminho, as escritas podem colidir. A S01 tinha produzido ficheiro válido numa execução anterior; isso não prova ausência da corrida.

## Correção e regressão

Cache separado em reports/mutation/incremental.json; relatório final permanece reports/mutation/mutation.json. Nenhuma mudança de escopo, operador, threshold ou exclusão. Novo cache inicializado a partir do relatório integral S01 válido preservado; a ferramenta reutilizou172 resultados e avaliou116 mutantes novos. Nova execução exit0 em3min47s, dry run152 PASS, bruto209/215=97,20930232558139%; parsing independente das duas saídas PASS e zero diferenças entre fontes do relatório e src.

Artefacto inválido preservado em backend/reports/s02-t005-mutation-attempt-01-invalid.json; logs em s02-t005-mutation-01.log e -02.log, ignorados pelo Git. Não reparar o JSON manualmente, aproveitar apenas o score textual ou contar a falha de relatório como RED de Domain. O JSON malformado causou saída excessiva do Node ao imprimir o erro; limitar as linhas/trechos das inspeções e não despejar o relatório inteiro. Um leitor de log auxiliar foi terminado depois de os runners Node já terem acabado; não houve segunda suite destrutiva concorrente.

## Prevenção

Tratar cache e relatório como artefactos com caminhos distintos; um log de score não substitui JSON legível e gate estrito. Verificação estrutural de paths e nova execução reais no [TEST_REPORT S02](../../sprints/S02/TEST_REPORT.md). Não alterar thresholds ou excluir código para compensar problema de toolchain.
