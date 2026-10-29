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


## T006 — revisão preliminar dos cinco shards atuais

CI40900841329/6a5142e, cinco SUCCESS e parte3 ainda em curso. ZIPs oficiais12909597682/12909582031/12909381787/12908458618/12907719939 baixados e SHA-256 conferidos, originais fora de OneDrive em LOCALAPPDATA/BibleAI/quality-artifacts/40900841329; só ficheiros de relatório da partição extraídos para revisão. Digests e83sobreviventes do recorte novo em reports/s07-t006-completed-shards-audit.json, sem URLs de download. Não há score global aprovado antes do agregado.

Foram lidas as83assinaturas/replacements/linhas do recorte workspace/history/write-scope. Nenhuma foi reclassificada, excluída ou declarada equivalente sem prova. Famílias encontradas:

| Local | Observação concreta e consequência para hardening S08 |
|---|---|
| workspace Domain21 | Tipos runtime/estruturas nulas, validação canónica de datas, data da revisão igual/regressiva, controles permitidos tab/CR/LF e reaplicação do target em Note. Asserções negativas e limites diretos devem distinguir a razão/ordem; mensagem interna vazia também sobrevive. |
| workspace Application20 | Guardas de identidade/versão/janela e teto/integralidade da revisão não observados diretamente antes dos ports; HTTP/Domain validam parte dos casos. Testar entrada Application antes de I/O com doubles locais identificados e versões reais2/inexistentes na integração, sem substituir serviços. Não são defeitos demonstrados do produto original. |
| schemas18 | Âncoras UUID/versão, versão positiva diferente de1, controles/tamanho UTF-8 na fronteira HTTP, limites de revisão e propriedades do histórico/OpenAPI. Levar valores positivos assimétricos e negativos por camada para distinguir validações duplicadas. Descrições documentais vazias também sobrevivem; não excluir da métrica. |
| history Application15 | Identidade/âncoras/cursor ISO e limit50; recusas diretas anteriores ao port não exercitadas em todos os ramos. |
| history store6 | Keyset com data diferente/id empatado, projeção/ordem e causa de erro do cleanup. Acrescentar datas assimétricas e rollback SQL real mantendo causa. |
| workspace store2 | Ordenação/projeção da lista de notas carece de valores com datas diferentes e empate desambiguado. |
| adapter1 | Rethrow de WorkspaceUnavailableError vs wrapping não foi distinguido; preservar causa de falha real. |

Recortes diagnósticos honestos: WorkspaceLibrary31detectados/51válidos60,7843%; ai-history-library35/5070%; prisma-history-store19/2576%. O contrato exige score bruto global e IA>85%, ainda pendentes, não estes recortes arbitrários. Os recortes baixos são lacunas concretas para a sprint de hardening, não aprovação ampla da resistência desses ficheiros. write-scope5/5válidosKilled, controlador workspace15/15Killed; Domain120/14185,1064%. CompileError fora do denominador conforme política, sem novos ignorers ou alterações de operadores. Todos os gaps de comportamento original identificados devem ser reavaliados em S08 antes da declaração final do backend; classificações de segurança/isolamento não são dispensadas por cobertura100%.


Resultado final T006: CI40900841329 oito SUCCESS,6540mutantes=4174Killed65Timeout509Survived1792CompileError, zeroRuntimeError/NoCoverage. Global4239/4748=89,27969671440607%; IA2105/2370=88,81856540084388%. Agregado e755f92db54fca6b80268fb91837ca51170df79487accd6f75c2bd1d3452e062, ZIP oficial12910382807/1241032bytes/SHAf212e5b12c1546c95f30aa5553e6f80cce0bf5a9bb2544cb963a8f655df3f39c verificado. Auditor independente comparou107fontes mutáveis contra6a5142e; inventário CI132fontes/107mutáveis, fingerprint39434b598181d3c4194f9a6b39990205f69ee8aa1e696b2720769ed89dd0ee51. Agregador obrigatório comprovou seis partições/fontes/operadores/IDs sem lacunas ou sobreposição. Os43RuntimeError anteriores não aparecem no resultado atual; originais conservados.

Recorte selecionado completo98sobreviventes revisto em reports/s07-t006-mutation-audit.json. Além dos83acima: Study14 (oito guardas de owner/cursor/limit50; dois ordenação/projeção, dois campos where de append protegidos também pelo lock anterior; uma mensagem interna vazia e um delimitador de immediate-context já preexistente), e um export de WorkspaceLibrary no módulo. S08 deve testar importação por módulo consumidor/injeção pública, dados assimétricos de estudos/conversas/notas e identidades/cursors inválidos antes de I/O. Guardas anteriores e comportamento original foram inspecionados; nenhum defeito real confirmado só pela existência do mutante. Os sobreviventes antigos dos módulos inalterados mantêm as revisões S05/S06/T005 e as lacunas de release antes registadas; score global não é prova de ausência de defeitos. Nenhum gap de release é apagado deste relatório pelo fecho funcional S07.
