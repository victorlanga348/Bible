# S10-T006 — Revisão da mutação global

Estado: IN_PROGRESS. Esta estrutura de revisão não aprova a execução corrente. [Plano de medição](QUALITY_PLAN.md), [resultados e falhas reais](T006_TEST_REPORT.md). Fonte atual em análise: cebc1d6, [CI42224340418](https://github.com/victorlanga348/Bible/actions/runs/42224340418), com force global após introdução de contratos visuais Chrome/CSS.

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

CI42224340418/cebc1d6 terminou **FAIL** em78min9s de mutação. Auditoria independente reinstrumentou35fontes, conferiu34ficheiros mutáveis/3037assinaturas e fontes: integridade PASS, qualidade FAIL. Counts:1842Killed/2Timeout/381Survived/812CompileError/zeroNoCoverage/zeroRuntimeError. Score bruto1844/2225=**82,87640449438203%**, abaixo do requisito. Nenhum estado foi alterado. Reutilização **0/3037**, confirmada no log force.

Artefacto13511044626, ZIP SHA256 `d43764a10b485dcc8c66711fee2cf1691ce30606692a71993e50b1890c45ed96`; JSON `5a25792d3c0ca607d8752342920d85f473ca17c3eddca59a05daf91ac09197c0`. Guard/ledger locais `s10-t006-global-native-audit{,-ledger}.json`. Chrome Linux156.0.8078.79; manifesto visual SHA256 `7ae83ffe19f5971f94586f516b8e2ffadc92b83d313ffede1640be124da17c38`. CSS e harness conferidos. Dados brutos preservados em `backend/reports/s10-global-quality-cebc1d6`.

As duas funções estáticas de overlay/título agora foram detetadas. Restam somente quatro estáticos `displayName` (ids2819/2842/2845/2867), sem efeito observado no DOM de produção; continuam Survived e no denominador. Timeouts2328/2329 são retries tornados ilimitados, ambos `Hit limit reached (801/800)`; deteção causal, sem atribuição fictícia a RAM.

Lacunas observáveis encontradas: limites dos grupos canónicos e navegação entre livros; seleção externa de intervalos e cópia parcial; catalogue/excertos pendentes versus vazios e resposta obsoleta de filtros; transmissão de identidade/referência entre vistas; feedback após escritas/CAS; transporte exato. Novas regressões afetadas passaram; resultado de mutação seguinte permanece NOT_RUN até CI. Não inferir score pela quantidade de testes. Guardas redundantes com abort do transporte, fallbacks de chaves desativadas e callbacks após desmontagem exigem análise de alcançabilidade, não estados artificiais para matar mutantes.

Workflow seguinte usa este relatório integral apenas como seed verificado. Helper/10testes e verificação adversarial do código real do workflow aceitaram os bytes exatos e rejeitaram corrupção de relatório/manifesto/toolchain; mudança legítima de Chrome/CSS/fonte/harness elimina só o incremental e força análise completa. Gate global e auditoria continuam obrigatórios, inclusive porque o seed original falhou. S10-T006 permanece IN_PROGRESS.
