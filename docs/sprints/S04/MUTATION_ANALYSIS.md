# S04 — Análise de mutação

## T006 — Fonte corrigida aprovada, 2026-10-26

Fonte912c600/CI40338249693:1129 Killed/30 Timeout/119 Survived/617 CompileError,1159/1278=90,6885758998435%; recorte24 ficheiros366/5/52/213,371/423=87,70685579196217%, sem Timeout366/423=86,52482269503547%. Zero RuntimeError/NoCoverage; todas52 fontes com mutantes iguais ao commit e ao src atual. Motor10.0.0 confirmou63 fontes/1895 candidatos; os11 sem candidatos e os cinco desse grupo dentro do recorte24 mantêm a justificação da instrumentação abaixo. Originais/digests/comandos em [TEST_REPORT](TEST_REPORT.md).1769 resultados reutilizados e126 reavaliados pela ferramenta, sem exclusão de estáticos ou mudança de checker/thresholds.

Os52 sobreviventes próprios continuam no denominador. Os40 fora de runtime-config preservam as famílias/limites detalhados na análise anterior; a tabela seguinte identifica os IDs atuais, sem fingir que IDs são estáveis entre fontes. Os outros67 sobreviventes globais são dos módulos/ficheiros fora do recorte T006, com famílias analisadas em S02/S03/T005. Responsável técnico: agente executor T006; aceitação dos limites e revisão integral: T007. Nenhum score por ficheiro é convertido em exigência nova nem usado para excluir ficheiros de baixa sensibilidade.

| Ficheiro | IDs atuais Survived | Avaliação |
|---|---|---|
| config/development-target.ts | 48 | Diagnóstico interno não comparado literalmente. |
| config/runtime-config.ts | 170/171/172/174/177/178/179/180/181/182/190/191 | Condições de comparação e normalização: detalhe a seguir. |
| infrastructure/verify-database-identity.ts | 340 | Role optional depois de db ter confirmado linha existente. |
| source-library/infrastructure/canon-passage-validator.ts | 1074 | Falha técnica deste catch não discriminada; código preserva rethrow. |
| source-library/infrastructure/prisma-passage-link-repository.ts | 1096/1097/1115 | Lock/chave e ordenação, mesmos limites de concorrência/variantes anteriores. |
| study/application/generate-structured-study.ts | 1274/1296/1298 | Separador e texto da comparação sem fonte; validação final Study impede snapshot com texto vazio. |
| study/infrastructure/library-source-adapter.ts | 1685/1689/1697/1706 | Limitações e separador entre racionales, não integridade/direitos da quote. |
| study/infrastructure/prisma-study-repository.ts | 1755 | Literal da falha técnica de snapshot corrente ausente. |
| study/presentation/schemas.ts | 1773/1774/1791/1792/1793/1794/1795/1797/1798/1812/1818/1819/1823/1830/1831/1837/1839/1840/1841/1842/1843/1844/1846/1847 |24 mutantes das mesmas famílias de âncoras/length, URLs, variantes de direitos, múltiplos versículos/versões, interpretações vazias e metadados OpenAPI descritas abaixo. Resultados estáticos reutilizados não foram promovidos a prova de reexecução pelos56 testes posteriores. |
| study/presentation/study-error.filter.ts | 1862/1863 | Component do log, não status/corpo HTTP. |

runtime-config:170/171/172 enfraquecem só a combinação hash/quantidade, mantendo outras condições; os casos existentes usam parâmetros desconhecidos em simultâneo ou a mesma identidade física. Faltam contraexemplos independentes de fragmento na URL de comparação e duplicação apenas de schema.174 troca >1 por >=1; falta aceite positivo de base distinta com exatamente uma opção schema.177/178/180 retiram a discriminação das chaves, mas os casos ambíguos existentes têm também quantidade>1; falta opção desconhecida única.179/181/182 tornam a discriminação mais restritiva para schema válido, sem teste positivo independente correspondente.190 muda o marcador interno loopback para vazio, preservando igualdade dos aliases ordinários; não afirmar equivalência para URL sem hostname.191 troca lowerCase por upperCase no ramo não-loopback; a igualdade ASCII continua consistente nas duas URLs, sem alegar equivalência universal Unicode. Código atual recusa os alvos ambíguos e a mesma base física, antes de conectar; não foi reproduzida concessão indevida no produto. Os12 estados mantêm-se Survived, sem os descartar por redundância parcial.

A investigação da nomenclatura parametrizada refutou perda de parâmetros: o runner usa fullName, mas o filtro testNamePattern executa todas as linhas com esse nome; prova Jest real5/5,1,494s, no TEST_REPORT. A representação agrupada de nomes não demonstra que só uma linha foi executada. Nenhuma correção de harness foi implementada com base nessa hipótese. A matriz de guardas é cobertura parcial conhecida, não motivo para atribuir um defeito inexistente ao runner ou aceitar resultados inventados.

Os limites de sensibilidade ficam explícitos e não revelaram defeito novo de produção nesta revisão. Gate bruto global e recorte próprio passam estritamente85%, inclusive retirando todos Timeout do numerador próprio. Conteúdo sem curadoria permanece vazio por contrato; não fabricar interpretações para aumentar score. O fecho da sprint exige ainda a revisão T007, que confronta contratos, dados, segurança, proveniência e documentação.

## T006 — Auditoria da CI anterior, 2026-10-26

Fonte fda125f, CI39858487212; não valida as duas guardas corrigidas em912c600. Originais/digests/comandos no [TEST_REPORT](TEST_REPORT.md). Instrumentação independente com o motor instalado10.0.0 confirmou63 fontes/1871 candidatos, sem exclusões próprias;52 fontes com candidatos no JSON. As11 restantes têm zero candidatos: ports, erros sem corpo e composição em decorators não percorridos pelo motor. No recorte24 da T006,19 fontes têm candidatos e cinco não têm; nenhuma fonte com candidatos foi omitida. Zero candidato por ficheiro não é score individual nem dispensa integração/composição, que tem HTTP/Prisma reais.

Global1114 Killed/33 Timeout/109 Survived/615 CompileError,1147/1256=91,32165605095541%; recorte T006351/8/42/211,359/401=89,52618453865337%. Os42 sobreviventes próprios continuam no denominador. Sem os oito Timeout,351/401=87,53117206982543%. Análise do agente executor; os109 globais também incluem67 fora do recorte, cujas famílias anteriores de cânone/fontes/Study/acesso conservam análise nos relatórios S02/S03 e T005 abaixo. Não somar scores de execuções nem promover CompileError a deteção. Não existem RuntimeError/NoCoverage neste relatório.

Os IDs seguintes são do relatório anterior. A execução corrigida terá inventário próprio; estados estáticos reutilizados não são provas de reexecução dos casos novos. Responsável: agente executor da T006, revisão integrada pela T007. São limites de sensibilidade conhecidos; não há alegação de equivalência geral por um teste ter passado.

| Ficheiro / IDs | Causa observável, lacuna e limite |
|---|---|
| development-target47; runtime-config168 | Literais de diagnóstico sanitizado não verificados exatamente. Recusa do alvo é testada; mensagem vazia não concede acesso. As guardas foram corrigidas depois e exigem fonte/resultado novos. |
| verify-database-identity316 | Optional chaining de role depois do primeiro operando ter confirmado a existência da linha/db. Para a linha SQL ordinária é redundante; preservado Survived, como a família auditada em ERR-0006. Não generalizar a objetos com getters/doubles. |
| prisma-passage-link-repository1072/1073 | Retirar a chamada de lock ou trocar a chave por vazia não foi detetado pelos sete casos associados. Serialização concorrente da admissão é uma lacuna de sensibilidade, não equivalência; PK/conflito/idempotência têm provas reais, mas não demonstram a necessidade de cada lock. Código/lock mantidos. |
| prisma-passage-link-repository1091 | Remover orderBy não foi detetado porque as variantes curadas não exigiam uma ordem discriminante. Não altera filtro/propriedade das fontes, mas não demonstra a ordenação contratual de identidades distintas. |
| generate-structured-study1250 | Separador de linhas do contexto não foi comparado exatamente, embora os textos autênticos sejam verificados. |
| generate-structured-study1272/1274 | Condição de texto da comparação sempre verdadeira deixa texto vazio sem fonte; asserções do builder verificam estado/evidenceIds, não esse literal. A construção final Study exige texto não vazio, impedindo guardar esse mutante; é lacuna do builder isolado, sem afirmar equivalência ou uma chamada completa bem-sucedida. |
| prisma-study-repository1731 | Mensagem interna de snapshot corrente ausente: rejeição técnica está coberta, literal não. Não muda rollback/owner nem converte falha em ausência. |
| curated-passage-link859 | Âncora final do slug: lacuna na sensibilidade à cadeia completa deste relatório anterior, antes da matriz adicional de terminadores. Não afirmar que o mutante foi reexecutado ou morto pelos testes posteriores sem relatório novo. |
| schemas1749/1750 | Âncoras de translationId, lacuna de transporte no snapshot antigo; matriz adicional posterior é distinta. |
| schemas1767/1813 | Valores denied de rightsSnapshot e missing de availability não foram discriminados em todas as respostas HTTP. As decisões de direitos têm provas próprias de domínio/adapters; estes sobreviventes são do schema de saída. |
| schemas1768/1769/1770/1771 | Restrição HTTP(S) e aceitação de HTTP simples não foram discriminadas no schema de saída. O domínio também valida URLs e fixtures usam HTTPS. Redundância parcial não prova equivalência do schema isolado. |
| schemas1773/1774;1794/1795;1806/1807 | Remover âncora de UUID/bookCode/digest é limitado pela length exata do mesmo schema. Para strings ordinárias, o comprimento fixa a ocorrência completa; mantidos no score e sem remover operadores. |
| schemas1788/1799 | Versão decimal de vários dígitos e seleção bíblica de vários versículos não foram exigidas nesta via de resposta. São lacunas de casos positivos HTTP; domínio/cânone têm cenários próprios, que não substituem esse percurso. |
| schemas1815/1816/1817/1818/1819/1820 | Interpretações vazias por desenho S04 deixam objeto/classificações de interpretação não discriminados no HTTP; domínio tem classificações próprias. Não inserir conteúdo histórico fictício para matar estes mutantes. |
| schemas1822/1823 | Schema declarado de erro não é usado para serializar o filtro. Corpo HTTP exato tem asserções próprias, mas estas não discriminam os metadados OpenAPI de erro. |
| canon-passage-validator1050 | Promover todo erro não-not-found a SourceDomainError não foi discriminado para uma falha técnica deste adapter. Há propagação real de falha técnica nas bibliotecas/adapters de estudo, sem atribuir essa prova a este catch específico. |
| library-source-adapter1661/1665/1673/1682 | Presença exata da limitação de ausência, mensagens de indisponibilidade e separador entre racionales não são comparados em todas as variantes. Quote/digest/direitos/ausência são discriminados; limitação extra não autoriza quote nem cria associação. A concatenação com racionales distintos continua lacuna de sensibilidade. |
| study-error.filter1838/1839 | Objeto/chave component do log HTTP não é comparado; status e corpo de erro são verificados. Não expõe segredo neste mutante e não muda a autorização; observabilidade literal é a lacuna. |

O recorte passou o mínimo bruto prescrito mesmo sem Timeout. Isso não afirma100% de sensibilidade nem encerra a fonte corrigida. Limites de mensagens, ordenação, concorrência de admissão, exemplos positivos compostos e metadados OpenAPI ficam explícitos para a revisão; não foram encontrados novos defeitos no código de produção por esta análise. Nenhum teste foi reescrito para legitimar comportamento anterior, nenhum mutante/cache foi editado.

## T005, 2026-10-22

Resultado dirigido final PASS:319 Killed/4 Timeout/40 Survived/157 CompileError,520 candidatos,363 válidos. Score bruto323/363=88,98071625344353%; sem qualquer Timeout no numerador,319/363=87,87878787878788%. Zero RuntimeError/NoCoverage. Não remover sobreviventes por equivalência nem juntar caches de outros ficheiros ao score da tarefa.

| Ficheiro próprio | Killed | Timeout | Survived | CompileError |
|---|---:|---:|---:|---:|
| modules/study/domain/study.ts | 198 | 0 | 31 | 63 |
| infrastructure/access-token.ts | 41 | 0 | 6 | 48 |
| presentation/local-access.guard.ts | 10 | 0 | 2 | 12 |
| config/runtime-config.ts | 70 | 4 | 1 | 34 |

Comando real test:mutation:incremental -- stryker.s04-t005.config.cjs,7min35s, mantendo checker TypeScript e exclusão padrão de código gerado. Jest dirigido usa unitários porque este incremento implementa domínio puro/acesso técnico; não é prova de Application/HTTP de estudos. NODE_OPTIONS temporário --expose-gc --max-old-space-size=512 e logHeapUsage, sem .env alterado.354 resultados reutilizados pela ferramenta e166 reavaliados por mudança de testes; as quatro fontes correspondem ao código corrente. Configurações temporárias arquivadas em backend/reports/s04-t005-final-{jest,stryker}.config.cjs, com os caminhos relativos originais do diretório backend; não são configurações permanentes. T007 mantém escopo padrão completo e integração real.

Originais JSON/HTML/cache: reports/s04-t005-mutation-counterexamples-original.*, -cache.json e -final-scope-analysis.json. SHA256 do JSON4d097d2f828d4ff2d47a199ae272edd62270635d92580b0ee376960967276b99. O agregado com resultados de outros módulos não é esta métrica. A execução dirigida anterior completa falhou84,29752066115702%,302 Killed/4 Timeout/57 Survived/157 CompileError; originais e SHA no TEST_REPORT. Foram adicionados contraexemplos de requisitos existentes, sem alterar produção para melhorar score;17 sobreviventes passaram a Killed,15 no domínio e2 nas âncoras Bearer. Nenhum estado/cache foi editado manualmente.

## Sobreviventes de domínio

IDs/linhas referem-se ao relatório final desta tarefa. Os grupos seguintes cobrem os31 sobreviventes; as classificações distinguem redundância contextual de lacuna real. A aprovação do mínimo global não afirma eliminação de todas as lacunas.

| IDs / linha | Avaliação e limite |
|---|---|
| 217 /24 | Mensagem interna de StudyDomainError vazia. O tipo é verificado; o literal de diagnóstico interno não tem contraexemplo próprio. |
| 223 /25 | Retirar typeof de text muda potencialmente StudyDomainError para TypeError perante JSON não textual. Lacuna na classe do erro para esses valores; não é equivalência geral. |
| 231 /26 | O precheck text é redundante para strings que passam trim/regex, mas a remoção pode mudar a classe do erro de um valor não textual. Lacuna de defesa de reidratação. |
| 236,238 /26 | Igualdade com trim redundante perante a gramática ASCII integral, mantendo os restantes checks; não há normalização de valor aceite. Equivalência contextual, não dispensa o código. |
| 253 /28 | Precheck text redundante para URLs textuais HTTP(S) analisáveis. Objetos coercíveis fora do contrato tipado podem diferir; não declarar equivalência irrestrita. |
| 259 /28 | Retira HTTP das opções permitidas; os dados genuínos atuais usam HTTPS. Lacuna de exemplo positivo HTTP, mantendo o suporte no código. |
| 262 /30 | Retira Array.isArray dos ids; forEach continua a rejeitar estruturas incompatíveis, mas pode mudar a classe do erro. Lacuna de erro tipado para JSON malformado. |
| 279,281,284,286,287 /41 | Redundâncias entre tipo/comprimento/regex64 e âncoras. As âncoras são redundantes quando o comprimento exato permanece; remover simultaneamente partes de tipo/comprimento pode aceitar valores coercíveis de JSON. Lacunas residuais de tipo, sem assumir equivalência de todos os cinco. |
| 291,293,294,296 /43 | Guards do objeto de permissões antes do loop. Estados desconhecidos continuam recusados; null/objetos incompatíveis podem mudar a classe do erro. Lacuna de reidratação, sem conceder permissões no código original. |
| 303 /44 | Retira denied do enum. store/display/quote denied já são recusados por regra própria; um positivo com index/sendToAi denied não foi exercitado. Lacuna de operação independente, não equivalência geral. |
| 371,376,377,388 /76 | Redundâncias de precheck/comprimento/âncoras do UUID para strings, pois a regex restante fixa36 caracteres. Valores JS coercíveis fora do contrato podem diferir; snapshot/transportes futuros continuam a exigir validação. |
| 390,395,397 /77 | Precheck/trim de subject redundantes para strings que passam a gramática integral; a remoção do precheck também pode afetar a classe do erro não textual. Não aceitar owner fornecido pelo cliente por esta análise. |
| 404 /78 | Precheck textual de createdAt redundante com comparação estrita ao ISO canónico nos valores textuais suportados. Objetos não representáveis em JSON não foram provados equivalentes. |
| 416,418,421,423,424 /80 | Comprimento/âncoras parcialmente duplicados na regex de três caracteres; retirar guardas de tipo pode aceitar coerção numérica. Lacuna residual de JSON não textual; normalização inválida coerente já tem contraexemplo próprio e matou os mutantes pertinentes. |

## Sobreviventes de acesso e configuração

| IDs / ficheiro | Avaliação e limite |
|---|---|
| 117 /access-token | Mensagem genérica interna vazia; assinatura/claims e classe AuthenticationError continuam verificadas. Mensagem HTTP401 será prova própria de T006. |
| 127,129 /access-token | Comparação com trim redundante na gramática integral ASCII do subject, mantendo typeof/regex. Casos com espaços/newline são recusados; nenhum trim é aplicado ao subject aceite. |
| 171 /access-token | requiredClaims redundante neste perfil: sub tem verificação própria, iat é exigido por maxTokenAge e exp passa validação própria obrigatória. Os três casos ausentes têm teste com assinatura genuína. Não extrapolar para outro perfil JOSE. |
| 202,203 /access-token | exp<=iat é defesa duplicada com iat<=agora e exp>agora já verificadas por JOSE, num relógio válido deste perfil; igualdade também é expirada. Não afirmar equivalência perante relógio injetado inválido fora do uso aprovado. |
| 541,543 /local-access.guard | Trim redundante com a expressão integral Bearer/compact JWT. Os novos contraexemplos com token genuíno embutido mataram as duas remoções de âncoras; estes dois sobreviventes não removem as âncoras. |
| 93 /runtime-config | Nome interno loopback vazio continua a normalizar os mesmos hosts na comparação entre alvos, sem mudar o destino ou divulgar a URL. Equivalência contextual já analisada em S02. |

Os quatro Timeout de runtime-config são conservados na categoria original. Não atribuir deteção por asserção ou causa específica de infraestrutura sem prova causal; o limite inferior exclui todos e ainda passa87,88%. CompileError fica separado do denominador de mutantes válidos; não é deteção. Nenhuma exclusão adicional de produção foi criada para obter PASS.

A CI do checkpoint d10e198 teve mutação padrão integral90,83245521601685% em78min46s e fontes próprias conferidas; é execução anterior à correção/contraexemplos, descrita separadamente no [TEST_REPORT](TEST_REPORT.md). Não é substituta deste score dirigido, nem fecho dos gates de persistência/HTTP T006/T007.
