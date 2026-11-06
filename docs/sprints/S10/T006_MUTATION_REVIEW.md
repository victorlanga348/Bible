# S10-T006 — Revisão da mutação global

Estado: revisão técnica concluída, 2026-11-06. Fonte **d3e4438**, [CI42268953701 PASS](https://github.com/victorlanga348/Bible/actions/runs/42268953701), [evidência final](evidence/T006-global-quality.json) e [ledger completo dos311sobreviventes](evidence/T006-survivors.json). [Plano de medição](QUALITY_PLAN.md), [execuções/falhas históricas](T006_TEST_REPORT.md). Nenhum resultado bruto foi reclassificado.

## Condições de aceitação

Reinstrumentar todas as35fontes TypeScript/TSX/Vite atuais e comparar fontes, inventário de ficheiros e multiconjunto completo de assinaturas com o JSON bruto. Operadores/checker/limiares não mudam. Rejeitar RuntimeError, NoCoverage, estados incompletos, denominador vazio e score bruto<=85%, sem arredondamento. CompileError não pertence ao denominador; Killed/Timeout são deteção; Survived permanece no denominador, inclusive se a revisão encontrar equivalência.

Conferir SHA do ZIP/JSON e proveniência da execução/revisão. Revisão de sobreviventes descreve observabilidade, contrato, cobertura existente e risco residual; não altera estados nem remove mutantes para elevar score. Integridade de inventário PASS não é aprovação de qualidade.

## Critérios de análise por grupo

| Grupo | Verificação e consequência |
|---|---|
| CSS e variantes visuais | Medir geometria, foco, seleção, contraste e responsividade no Chrome com HTML dos componentes instrumentados e CSS do build. Asserções de classes ou JSDOM sem estilos não demonstram esses efeitos. Sobrevivente visual restante é lacuna ou efeito decorativo delimitado, não equivalência automática. |
| Guardas de DTO/identidade e estado | Comparar com contratos reais e cenários possíveis. Separar redundância sobre dados válidos de perda de proteção/corrida; não inventar entrada histórica inválida para elevar deteção. |
| Cache/transporte | Verificar seleção de recurso/versão, parâmetros, métodos, abort e invalidação seletiva, incluindo preservação de dados alheios. Doubles técnicos não substituem as provas HTTP/PG nativas. |
| Dependências React e gerações | Examinar estabilidade efetiva das dependências e comparações dos contadores. Contadores usados só por igualdade podem admitir direções distintas; não criar testes de constantes internas. Qualquer efeito em limpeza/owner/resposta tardia exige regressão observável. |
| Metadados de desenvolvimento | `displayName` pode não alterar o DOM/comportamento de produção; manter estado bruto e indicar o âmbito dessa equivalência. |
| Timeouts | Ler motivo bruto e mutação. Os dois casos anteriores atingiram o hit limit801/800 ao tornar retries ilimitados; não foram classificados por suposição de pouca RAM. Rever motivos atuais independentemente. |

## Estáticos do relatório anterior

f33758e/CI42212247108 tinha seis sobreviventes estáticos: Button.displayName(id2819), DialogHeader.displayName(2842), DialogFooter.displayName(2845), Input.displayName(2867), forwardRef de DialogOverlay(2836) e DialogTitle(2848). IDs referem-se somente àquela revisão.

As duas funções alteram elementos visuais/acessíveis reais; os novos testes devem detetar a sua perda. Adicionar testes não revalida automaticamente estáticos no modo incremental. Por isso esta execução usa force integral. Não chamar essas duas funções equivalentes nem reutilizar a sua classificação anterior como aprovação. Os quatro nomes de desenvolvimento continuam sujeitos ao relatório atual e não são excluídos do score.

## Resultado corrente

Fonte finald3e4438/CI42268953701 PASS, inventário/assinaturas reinstrumentados novamente. RawJSON `22a41ff2ab31b2856efd878aece4dda76e9cce35c54935f03e564391fabad493`, ZIP `323a119f4cc69bdb49c76b82c96f76280b4404f665b0aaf1473f16c64ba7b6ba`.351testes, mesmas contagens/score86,02247191011236%;3037/3037resultados reutilizados em46s, ambiente visual idêntico. Comparação com921ca7c: zero mudanças em fontes/estados de mutantes; revisão311e limites abaixo conservados. Ledger versionado aponta à fonte final.

Marco921ca7c: **1912Killed/2Timeout/311Survived/812CompileError**, zeroNoCoverage/RuntimeError; **1914/2225=86,02247191011236%**. Reinstrumentação independente das35fontes atuais e3037assinaturas PASS. Artefacto13526963574: ZIP SHA256 `57c1c9c2666a67d6d744c48fee8ed018dd1bea01fb71081552ec2b85e538f0f4`, JSON `2d29a31e0f7adf0e2414966116e5acc84ec666f9a5e6faf9cf14de3ef9b3f330`. Reutilização2915/3037,4min57s, ambiente visual idêntico e verificado.

Comparação integral com a revisão abaixo: somente2504(Google),2686 e2699(sessão) passaram deSurvived paraKilled; demais sobreviventes e suas fontes permanecem idênticos. Assim, a revisão por grupos abaixo aplica-se aos311atuais, com grupo Google/sessão/tema reduzido de31para28. Nenhum sobrevivente novo. Timeouts finais2328/2329: retries ilimitados detetados, motivos exatos `Hit limit reached (803/800)` e `(801/800)`. Quatro displayName estáticos permanecem no denominador. Conclusão final: gate/revisão PASS dentro dos limites documentados, sem exclusões ou aprovação universal de todas as variantes visuais.

Marco aprovado posterior: **CI42260812862/21ee138**,1911/2225=85,88764044943821%,1909Killed/2Timeout/314Survived/812CompileError, zeroNoCoverage/RuntimeError. Fontes e assinaturas reinstrumentadas PASS; rawJSON `3d624e57ebc9c111c407490154397d0cdb3b6b403f5cabc30cddfb2b1e48b6ca`, ZIP `b8c27b6a684ee65e9d2ed789b035e7322803514909347e6b73c131cc1e950c16`. Os parágrafos seguintes descrevem a medição anterior e as correções. Revisão dos sobreviventes atuais e últimos testes permanecem em curso.

CI42224340418/cebc1d6 terminou **FAIL** em78min9s de mutação. Auditoria independente reinstrumentou35fontes, conferiu34ficheiros mutáveis/3037assinaturas e fontes: integridade PASS, qualidade FAIL. Counts:1842Killed/2Timeout/381Survived/812CompileError/zeroNoCoverage/zeroRuntimeError. Score bruto1844/2225=**82,87640449438203%**, abaixo do requisito. Nenhum estado foi alterado. Reutilização **0/3037**, confirmada no log force.

Artefacto13511044626, ZIP SHA256 `d43764a10b485dcc8c66711fee2cf1691ce30606692a71993e50b1890c45ed96`; JSON `5a25792d3c0ca607d8752342920d85f473ca17c3eddca59a05daf91ac09197c0`. Guard/ledger locais `s10-t006-global-native-audit{,-ledger}.json`. Chrome Linux156.0.8078.79; manifesto visual SHA256 `7ae83ffe19f5971f94586f516b8e2ffadc92b83d313ffede1640be124da17c38`. CSS e harness conferidos. Dados brutos preservados em `backend/reports/s10-global-quality-cebc1d6`.

As duas funções estáticas de overlay/título agora foram detetadas. Restam somente quatro estáticos `displayName` (ids2819/2842/2845/2867), sem efeito observado no DOM de produção; continuam Survived e no denominador. Timeouts2328/2329 são retries tornados ilimitados, ambos `Hit limit reached (801/800)`; deteção causal, sem atribuição fictícia a RAM.

Lacunas observáveis encontradas: limites dos grupos canónicos e navegação entre livros; seleção externa de intervalos e cópia parcial; catalogue/excertos pendentes versus vazios e resposta obsoleta de filtros; transmissão de identidade/referência entre vistas; feedback após escritas/CAS; transporte exato. Novas regressões afetadas passaram; resultado de mutação seguinte permanece NOT_RUN até CI. Não inferir score pela quantidade de testes. Guardas redundantes com abort do transporte, fallbacks de chaves desativadas e callbacks após desmontagem exigem análise de alcançabilidade, não estados artificiais para matar mutantes.

Workflow seguinte usa este relatório integral apenas como seed verificado. Helper/10testes e verificação adversarial do código real do workflow aceitaram os bytes exatos e rejeitaram corrupção de relatório/manifesto/toolchain; mudança legítima de Chrome/CSS/fonte/harness elimina só o incremental e força análise completa. Gate global e auditoria continuam obrigatórios, inclusive porque o seed original falhou. S10-T006 permanece IN_PROGRESS.

## Revisão integral dos sobreviventes do marco21ee138

Inspeção dos314itens por fonte e intervalos exatos (colunas do schema são base1), não apenas pelo texto da linha. O ledger local `s10-current-survivors-exact.json` mantém id/fonte/posição/substituição. Este marco continua no denominador aprovado; nenhuma das classificações abaixo modifica o JSON bruto. Os cinco testes posteriores podem alterar a distribuição final, que será conferida na CI seguinte.

| Grupo de fontes | Survived | Observação e limite da revisão |
|---|---:|---|
| App | 9 | Dependências estáveis, referência obrigatória em DTO válido e chave de montagem. Cenários reais de identidade/seleção e troca de passagem passaram; a variação de key continua como sensibilidade residual, não equivalência presumida. |
| ContextPanel e ConversationPanel | 49 | Guardas de abort/identidade correlacionadas com o transporte, limite20 também imposto pela ausência do formulário, conteúdo supported com evidência obrigatória, estado inicial oculto e mensagens/loading. Há lacunas observáveis de carregamento, busy e prevenção do scroll por seta; não executar handlers desativados para forçar estados impossíveis. |
| Leitor, preferências e procura | 15 | Indicador visual de cópia/temporizador, guardas de seleção sem botão visível e chaves/labels residuais. Grupos39/40, capítulos inclusivos, fronteiras entre livros, intervalo externo, teclado/cópia parcial e metadados reais passaram. |
| Referências cruzadas | 9 | Pluralização, apresentação e textos auxiliares. Relação/enums/versão e interpretação literal continuam cobertos; não é certificação de todas as variantes de cópia. |
| Fontes | 9 | Guardas do catálogo após desmontagem não publicam em outra instância; estado inicial normalizado pelo efeito, tipo alternativo fora do catálogo admitido e contador de retry usado apenas para mudança. A corrida entre filtros, hashes/atribuição e fecho do texto integral foram detetados/testados. |
| Estudos | 38 | Contadores usados por igualdade admitem direções distintas; guardas de pending/seleção sobrepõem ações desativadas. Mantêm-se lacunas de labels, callback duplicado, erro tardio e alguns estados de loading. Reabrir/versão/CAS/cancelar e fonte original foram conferidos por testes e percurso nativo; não fabricar conteúdo para testar labels. |
| Histórico e anotações | 58 | Predicado correto de seleção de nota, cursores após eliminação, fecho de diálogos, estado inicial de rascunho e mensagens. A suite não distingue todas as combinações de várias notas/cursor+eliminação/Escape. API/id/versão/CAS originais inspecionados e percursos nativos passam; essas diferenças de sensibilidade permanecem registadas. |
| API, hooks, cache, proxy e Vite | 24 | Fallbacks de chave em queries desativadas, invalidação por superconjunto, guards de erro/browser e mensagens de transporte. Invalidação mais ampla é lacuna observável de consultas alheias, não equivalência global. Métodos/rotas/DTO, erro/timeout e parâmetros críticos passaram; runtime proxy permanece loopback. |
| Google, sessão e tema | 31 | Guardas de plataforma, dependências/ref/counters e validação de DTO; lacunas de confirmação tardia/geração/503/504 motivaram os cinco testes seguintes. Guardas correspondentes estão corretas no código original. Seleção de tema a partir de storage/preferência e alguns textos não têm sensibilidade completa. |
| Primitivas UI e shell | 72 | Quatro displayName estáticos sem efeito DOM; variantes de ícone/cor, feedback, close/limpeza e navegação mobile. O Radix pode esconder um toast mesmo sem remover o item React: não chamar isso equivalência de memória. Layout, foco, contrastes mínimos e ações testadas passam; não se garante deteção de toda decoração/estado interno. |
| Total | **314** | Todos os sobreviventes permanecem no score bruto. |

Conclusão do marco: inventário íntegro, score estritamente>85 e percursos normativos comprovados; não foi identificado defeito funcional no código original que exija bloquear o marco. Há cobertura residual imperfeita explicitada acima, permitida pelos limiares aprovados. Isto não converte cada sobrevivente em equivalente nem prova ausência universal de defeitos. As duas mutações Timeout continuam a ser retries ilimitados detetados pelo hit limit801/800. Revisão final deve conferir a distribuição da revisão921ca7c e conservar essas limitações.

### Detalhe da revisão delegada

Agy reviu33sobreviventes desses quatro ficheiros, somente leitura/exit0. Codex conferiu intervalos exatos no relatório bruto:2267 altera só `typeof window`, portanto não transforma todos os erros em401 no browser, como sugerido;2686 remove a guarda de geração, podendo permitir logout por identidade obsoleta diferente, não por identidade igual.2511/2512 não bloqueiam permanentemente a UI: uma falha mostra repetir, cujo novo efeito cria outra variável `exchanging`.2699 diz respeito a ApiError não401; não equivale a todo erro de rede. Não adotar automaticamente essas classificações propostas.

Reforços reais: rejeição de confirmação Google permite repetir; resultado após desmontagem não chama onAccess; recheck503/504 conserva sessão e identidade obsoleta inconsistente não limpa owner novo.26testes de sessão e23de confirmação/auth-ui PASS. Doubles técnicos declarados. O provider rejeita Promise nas falhas reais e retornafalse na invalidação/cancelamento; a hipótese inicial de recuperação emfalse era um modelo de teste incorreto, foi descartada e não gerou alteração runtime. Registar a correção, sem chamar essa primeira falha RED de produto nem a proposta agy prova executada.
