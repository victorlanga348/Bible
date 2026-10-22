# S04 — Análise de mutação

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
