# S06 ? Revis?o da muta??o T006

Revis?o2026-10-29, fonte `4a34ddb694f7740348e955fd09dcce2dbd784896`, [CI40695319164](https://github.com/victorlanga348/Bible/actions/runs/40695319164), oito jobs SUCCESS. Agente revisor delegado; n?o houve exclus?o, altera??o de estados ou redu??o de limiares. A revis?o dos sobreviventes n?o os converte em Killed.

Artefacto oficial12823337172, ZIP SHA256 `90ac2b02396b93eb857081dc102c39095922e001061cdf169ceda44b78082520`; relat?rio agregado SHA256 `fdc6e0d331a24d195d69cd952b65d0c7f13ab6d9f01953b07c89607a5f37c86d`. Qualidade12819296901 ZIP SHA256 `72c24032326145090b26a826841edb5fdcb5ab3c6368cdd6c6cf75ab7cb72abc`. Originais em reports ignorado; fontes87/87 confrontadas com commit e ?rvore atual pelo diagn?stico `python reports/audit-s06-ci.py 40695319164-99 4a34ddb694f7740348e955fd09dcce2dbd784896`. Invent?rio agregado da CI:104ficheiros de fonte,87mut?veis,5051mutantes;3240Killed/49Timeout/356Survived/1406CompileError, zero RuntimeError/NoCoverage. Score bruto global3289/3645=90,2331961591%; IA2044/2286=89,4138232721%. Os limiares s?o globais/do m?dulo conforme pol?tica, n?o um limiar fict?cio por ficheiro.

| Recorte de conversa | Killed | Timeout | Survived | CompileError | Score bruto |
|---|---:|---:|---:|---:|---:|
| Dom?nio |188|4|3|55|98,4615%|
| Application |81|1|12|46|87,2340%|
| Reposit?rio |64|0|11|34|85,3333%|
| Controller |9|0|3|5|75%|
| Schemas |34|0|8|3|80,9524%|

Investiga??o confrontou source, localiza??o, operador/replacement e testes existentes; IDs administrativos n?o definem equival?ncia entre runs. Compara??o auxiliar por assinatura/trecho identificou319sobreviventes com assinatura j? sobrevivente e37sem essa correspond?ncia; ? diagn?stico, n?o transfer?ncia manual de estados nem prova de equival?ncia de todos os mutantes. Os356estados atuais s?o exclusivamente os produzidos pelo Stryker corrente.

- Reposit?rio: a remo??o da compara??o revision em hydrate continua protegida pela constraint PostgreSQL que vincula revision ao tamanho de turns e pela valida??o do dom?nio. Mensagens internas/retorno da mesma classe de erro n?o mudam a proje??o HTTP sanitizada. Guards de cancelamento anteriores ao INSERT/UPDATE t?m verifica??es posteriores dentro da transa??o; testes reais de cancelamento exigem rollback. Os tr?s mutantes de valida??o da revision esperada deixam lacuna de chamada direta do port com n?mero inv?lido; Presentation/Application validam antes. S08-T006 deve acrescentar regress?es das fronteiras internas sem retirar os sobreviventes atuais.
- Application: mensagens internas n?o s?o contrato p?blico; trim ? reiterado por AiQuestion/ConversationDocument. Guards de cancelamento repetem verifica??es do reposit?rio/slot/provider e as suites reais j? verificam n?o confirma??o/compensa??o. A remo??o do slice no legado preserva os inputs observados, mas falta regress?o espec?fica de envelope com truncamento. O mutante que recusa tamb?m AiNotFoundError durante compensa??o n?o foi eliminado: acrescentar caso real de an?lise j? eliminada antes da limpeza em S08-T006. Falha de compensa??o continua erro503, nunca confirma??o indevida; crash/orfandade continua risco expl?cito.
- Schemas: anchors UUID s?o redundantes com comprimento36 e a regex fixa. Descri??es Zod sobrevivem sem mudar valida??o de transporte. A fronteira exata500bytes e exce??o de Unicode precisam de asserts espec?ficos no schema, embora dom?nio/AiQuestion e HTTP rejeitem entrada indevida. Estas lacunas permanecem na auditoria de S08, sem alega??o de equival?ncia completa.
- Controller: abort ap?s writableEnded e remo??o do listener n?o foram distinguidos pela suite; cancelamento real antes de confirma??o j? passou. Revisar ciclo de vida/listeners em S08-T006. N?o reduzir timeout nem simular sucesso para eliminar mutantes.
- Dom?nio: tr?s guards JSON redundantes j? revistos em T005; guards remanescentes continuam a validar a estrutura. Composi??o/exporta??es e texto de erros sanitizados conservam sobreviventes de metadados e liga??o Nest; verificar fronteiras de consumidores em S08-T006.
- Restantes sobreviventes em estudo/IA e fontes byte-id?nticas mant?m limita??es documentadas nas revis?es S04/S05/T005. Varia??es de Timeout/Killed n?o s?o reclassificadas manualmente. Nenhum RuntimeError/NoCoverage atual ? tolerado como score v?lido.

Resultado do gate de muta??o atual: PASS pelos limiares e auditoria de fontes/relat?rio; riscos de cobertura discriminante acima permanecem expl?citos. N?o comprova qualidade sem?ntica do modelo nem encerra T006/S06 sem a prova nativa e os demais gates.
