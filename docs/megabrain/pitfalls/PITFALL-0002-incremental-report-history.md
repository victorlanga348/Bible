# Stryker incremental conserva histórico fora de mutate

Confirmado2026-10-28/S06-T005, CI40668143255/429c5bc: seis análises SUCCESS, agregador FAIL por ficheiros extra. A entrada completa aprovada reduziu reexecuções (parte1:782/782 reutilizados após dry-run), mas Stryker10 conserva resultados fora de mutate no relatório. Não interpretar o relatório bruto de cada parte como se contivesse só o escopo atual.

Artefacto original12808066038/ZIP SHA472ef8e60cde0611595cc799ab135967f0ec54336ad459d3960b3c93ca88695f:83ficheiros no bruto da parte4,14do escopo e69históricos; projeção local conferiu fontes/assinaturas/estados dos69 contra o seed original antes de separar. Domínio novo209mutantes156Killed35CompileError18Survived/89,6552% apenas diagnóstico, não gate integral aprovado. Sobreviventes revelaram asserts negativos mascarados por omittedTurns incorreto e fronteiras ausentes;53regressões passaram após fortalecer testes, sem mudança do domínio.

Correção: guardar incremental-used.json antes de Stryker; bruto mutation.json intacto; gerar partition-mutation.json do escopo declarado, recusando ficheiro extra desconhecido/histórico alterado ou ficheiro atual ausente. Ledger com hashes/contagens e agregador continua exigindo inventário completo atual/zero RuntimeError+NoCoverage/limiares. RED2→GREEN22 do harness; CI final pendente no momento do registo. Nunca alterar estados, excluir mutantes atuais ou chamar o seed de resultado atual.

Correção confirmada na CI40670440360/cc157ea: seis partes+agregado SUCCESS, inventário4692/99src/83mutáveis; relatórios atuais passaram strict gate.15sobreviventes novos Killed após regressões; três guards redundantes para JSON documentados em T005_COMPLETION_REPORT.
