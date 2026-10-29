# S07 — Revisão de mutação

## T005 — CI40827091922 /2ec7918874ebbe29afb32fa738cddf92624e6d0a

Oito jobs SUCCESS. Agregado oficial backend-mutation-verified12878186200: ZIP1113326bytes/SHA9625ffe361c56721532d08160cabe0c64027250ab40c8acb8ab3fce1f833adac; mutation.json SHAfa62cc5ae0b1be9a3cd28984ac3a601de1e427d7571cacab6f34e4486b04748c. Download/digest e95fontes embutidas conferidos contra o commit. Gate real preserva inventário completo, operadores padrão, fingerprints, todas as partições e zero RuntimeError/NoCoverage. Nenhum mutante foi excluído ou reclassificado.

5758mutantes:3730Killed56Timeout412Survived1560CompileError. Score bruto global3786/4198=90,1858027632%; IA2044/2286=89,4138232721%. Recorte relações+paginação497/553=89,8734177215% (490Killed7Timeout56Survived154CompileError). Timeout conta detetado e CompileError sai do denominador conforme política vigente. Os seis NoCoverage anteriores foram comparados por assinatura/posição/replacement e são Killed agora, sem apagar a execução falhada40818184684.

| Ficheiro do recorte | Killed | Timeout | Survived | CompileError |
|---|---:|---:|---:|---:|
| relation.controller.ts |6|0|0|1|
| relation-library.ts |35|0|0|21|
| relation.ts |217|3|5|43|
| library-adapters.ts |65|0|4|43|
| prisma-relation-store.ts |54|0|3|22|
| pagination.ts |32|1|9|10|
| schemas.ts |63|0|35|14|
| relation-error.filter.ts |18|3|0|0|

Revisão dos56sobreviventes do recorte, a partir de reports/s07-ci-40827091922-audit.json:

- Domínio5: mensagem interna sem assert textual; guard de data/object/bookCode redundante com parsing/acesso/normalized; transformação do texto de controlos. Não transformar redundância em estado Equivalent: estados brutos mantidos.
- Adapters4: texto interno de erro; rethrow versus wrapper da mesma classe; primeiro guard de inteiro do offset duplicado pelo domínio; fronteira endOffset==tamanho sem span pequeno de fixture terminando exatamente no último codepoint. As validações reais de integridade/direitos/offsets continuam ativas no produto.
- Repositório3: mensagem interna; retirada isolada de filtros de início/fim do extremo to não diferenciada pelas atuais fixtures de intervalo. As queries corretas estão implementadas e revistas, mas os testes precisam de casos assimétricos de sobreposição. Isto é lacuna de regressão, não equivalência demonstrada.
- Paginação9: guard de data sobreposto ao schema ISO; âncoras de UUID e base64url; roundtrip canónico não distinguido por amostra não canónica; mensagem de issue não exposta como contrato HTTP. Os filtros owner no SQL não têm sobreviventes.
- Schemas35: âncoras de identificadores/UUID/digest/bookCode, trim e descrição; refinamentos Unicode/bytes sobrepostos aos do domínio; min de offsets, cardinalidade exata de arrays e schema de erros/metadados Swagger. Algumas mutações restringem entradas válidas com2..4evidências e offset positivo; a prova nativa real com2spans e a Application com4spans passam no produto correto, mas falta cobertura HTTP específica que as mate.

Não há sobrevivente em Application/controller/errorfilter de relações nem remoção sobrevivente do owner, digest persistido, classificação/leituras ou confirmação falsa de SQL. Não há defeito conhecido no código correto por estas mutações; permanecem lacunas de testes de contrato/fronteiras. Gate quantitativo aprovado com folga, sem exigir100% nem alegar equivalência universal. A tarefa de hardening S08 deve acrescentar casos assimétricos de intervalos, múltiplas evidências HTTP, offsets positivos, último codepoint, âncoras/cursor e Unicode/fronteira UTF-8 de transporte. Regressões dos módulos anteriores conservadas nas revisões S05/S06:412Survived globais,56no recorte novo e356restantes, conforme relatório oficial.

Não repetir chamadas nativas/modelo para matar mutantes de schemas; usar as integrações de teste reais. Preservar a curadoria nativa e verificar identidade do produto antes de a incorporar. T006 deve revalidar gates devido ao novo comportamento; este resultado não aprova código futuro.
