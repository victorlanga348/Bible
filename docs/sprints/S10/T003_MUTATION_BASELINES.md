# S10-T003 — baselines integrais de mutação

Resultado seguinte concluído: CI41198918785/6bc6fea PASS85,0243902439%, inventário completo e307Survived/2Timeout revistos em [revisão final](T003_MUTATION_REVIEW.md). As três medições abaixo permanecem FAIL históricos, sem reclassificação. A nota de execução pendente no final é o estado observado antes desse resultado.

Análises oficiais do mesmo escopo global32fontes/31ficheiros mutáveis, comparadas por fontes Git e reinstrumentação independente. Somente testes/d.ts fora conforme QUALITY_PLAN; sem redução de operadores ou exclusão de componentes. O inventário PASS não é PASS de qualidade. Brutos e ZIPs conservados fora de Git em LOCALAPPDATA/BibleAI/quality-artifacts.

| CI / revisão | Mutantes | Killed | Timeout | Survived | NoCoverage | CompileError | Detetados/válidos | Resultado |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
|41168600897 /3f33e2a|2770|1229|2|707|101|731|1231/2039=60,3727317312%|FAIL|
|41175424282 /fca52d9|2775|1369|2|647|25|732|1371/2043=67,1071953010%|FAIL|
|41193518647 /6b874d9|2765|1617|2|413|0|733|1619/2032=79,6751968504%|FAIL|

ZeroRuntimeError nos três. Score bruto=(Killed+Timeout)/(Killed+Timeout+Survived+NoCoverage), estritamente>85%; não remover sobreviventes/equivalentes do denominador nem mudar estados. As diferenças de inventário entre revisões correspondem a fontes efetivamente alteradas; cada relatório foi conferido contra a sua própria revisão, nunca contra um checkout diferente.

| CI | Artefacto | SHA256 ZIP | SHA256 mutation.json |
| --- | --- | --- | --- |
|41168600897|13031998989|9305b72cc4866e07ae2777dca9f0b4aaf286917f91d0225abe2a47d8410f5368|ac03bfac0714c4ef7231f291e442f4bb8398e948ccc3a573e533211688877680|
|41175424282|13032983837|13715b1d3fd7ceb51161301d0067f25039d871b5801f832cf2b76ae7aa30dcad|7c911c9726ee19dbf9526f0bc08ae3d0bafe106b7e8178a852eca9c6958d3fa3|
|41193518647|13040825907|b05af4d46d0a6a442ada1bfb78d2af8b343f4f230ef085972a3739727c323cd5|de6d17e53ea57b00099df1e144f45a5530f39ea59256cfb2a44621760fce9fb5|

Primeira análise integral85min18s. Segunda incremental oficial25min47s:1618reutilizados/1157revalidados. Terceira31min45s:1625reutilizados/1140revalidados. Toda reutilização exige identidades e cópia exata da análise final, não um relatório parcial/incremental intermédio. Os comandos/gates atuais continuam obrigatórios.

Revisão específica dos dois Timeout em6b874d9: query-client.ts13 BooleanLiteral false→true permite repetir4xx que deviam terminar; reason real Hit limit reached(601/600), testes cobertos220–225. Linha15 ConditionalExpression→true torna retry incondicional, reason Hit limit reached(801/800), testes219/226–228. São deteções de não terminação por limite de hits, não atrasos de Chrome/infraestrutura; conservar estados e counts originais. Reavaliar correspondência no relatório final antes de herdar esta revisão.

A CI41198918785/6bc6fea86e67a869fdef5d2860848ca67360b419 avalia a revisão seguinte com correções de concorrência/Input e contratos de apresentação reais. Job124530640753 passou build/lint/Chrome/cobertura/verificação de seed e executa mutação; resultado de mutação ainda NOT_RUN enquanto a execução decorre. O endpoint de logs de job retornou BlobNotFound404 durante a execução, pelo que não existe percentagem de progresso observada a reportar. Aguardar a conclusão e auditar raw, inventário e sobreviventes antes de T003DONE.
