# S10-T003 — revisão final da mutação global

Revisão do agente em 2026-10-31, sem reclassificar mutantes. CI [41198918785](https://github.com/victorlanga348/Bible/actions/runs/41198918785), job 124530640753, revisão `6bc6fea86e67a869fdef5d2860848ca67360b419`. Resultado PASS estrito: **(1741 Killed + 2 Timeout) / (1741 + 2 + 307 Survived + 0 NoCoverage) = 1743/2050 = 85,02439024390245% >85%**. Margem pequena, sem arredondar 85% para PASS. 736 CompileError, zero RuntimeError; 2786 mutantes no total. Todos os sobreviventes continuam no denominador, inclusive os casos de invariância provável.

Auditoria independente: fontes retiradas de Git na revisão exata e reinstrumentadas com o instrumenter do frontend, operadores completos/sem ignorers. Inventário PASS: 32 fontes, 31 mutáveis, assinaturas/localizações/textos de 2786 mutantes idênticos. Inventário V8 comparado com todos os 31 TS/TSX src próprios PASS; vite.config.ts é exclusão automática do V8 para configuração, continua incluído em mutação e verificado por build/dev/preview. contracts.ts só tipos não gera mutantes, sem exclusão manual.

Checker TypeScript real classificou CompileError: exemplos incluem ToastType vazio, componente mutado retornando void incompatível com JSX e possível undefined. Não são RuntimeError convertidos nem mutantes removidos manualmente. Incremental oficial reutilizou 2136 e revalidou 650; seed completo anterior e identidade da toolchain verificados antes. Duração Stryker 32min00s; CI build/lint/Chrome/coverage/seed/mutação/upload SUCCESS.

Artefacto frontend-global-quality 13043160745: ZIP SHA256 **371c245afb39c05893c353853b0c6fc5f54bc72b0661f2df90dbf968ef8771c9**, conferido contra digest publicado. mutation.json SHA256 **ecbd6138f801bf471af081f306d474b247e42557f9b9906ac2c1f9578bbe9ac0**. Brutos intactos e sidecar de auditoria em LOCALAPPDATA/BibleAI/quality-artifacts/41198918785. Não versionar caches/dados privados.

Comandos reais: `npm run test:mutation:ci` na CI; `node backend/reports/audit-s10-global-baseline.cjs <raw-json> 6bc6fea86e67a869fdef5d2860848ca67360b419` no checkout candidato (auditor local ignorado), mais comparação Node de coverage-final com git ls-tree. [Configuração/decisões](QUALITY_PLAN.md) e [baselines FAIL preservados](T003_MUTATION_BASELINES.md).

## Os dois Timeout

- query-client.ts linha 13, BooleanLiteral false→true, id 2129: retry de 4xx deixa de terminar; razão real Hit limit reached (601/600), coveredBy 275–280.
- query-client.ts linha 15, ConditionalExpression→true, id 2130: retry torna-se incondicional; Hit limit reached (801/800), coveredBy 274/281–283.

Mesmas assinaturas/razões do baseline anterior, com IDs de testes atualizados. Deteção de não terminação por limite de hits, sem atribuir a timeout de infraestrutura/Chrome. Estados Timeout originais conservados.

## Revisão dos 307 sobreviventes

Inspecionados source/replacement/localização individuais do raw, resumidos por ficheiro abaixo. Há invariâncias de contador, dependências estáveis e defaults, mas também limitações reais dos testes em feedback, fronteiras, interleavings e apresentação. Nenhum sobrevivente é automaticamente chamado equivalente. O gate aprovado é agregado, não 100% de deteção; as provas nativas não substituem a distinção de cada mutante. Nenhum defeito adicional no programa sem mutação foi demonstrado nesta revisão. Conservar limitações e revalidar mudanças futuras, sem retirar estados do cálculo.

Todos os caminhos da tabela são relativos a frontend; contagens e IDs pertencem exclusivamente ao raw identificado acima.

| Ficheiro | Survived | Revisão e limite da prova |
| --- | ---: | --- |
| src/App.tsx | 38 | Rótulos/tipos de toast; invalidação mais ampla; limpezas/flags transitórias; geração monotónica e dependências estáveis; chaves React e alternativas de loading. Criação explícita, reabertura, CAS e owner têm provas; nem todas estas variantes são distinguidas. Decrementar o contador ainda altera a geração; não generalizar equivalência. |
| src/features/assistant/analysis-result.tsx | 1 | Chave React da evidência. Texto/direitos/estados são observados; identidade de reconciliação com várias evidências iguais não é distinguida. |
| src/features/assistant/context-panel.tsx | 77 | Guardas de abort/identidade parcialmente sobrepostas; limpezas, mensagens/toasts; chaves/dependências; opção fora da página, paginação anterior/pending, estado vazio/rodapé/ramos visuais. Decrementar a geração ainda distingue intenções. RED/GREEN e browser real comprovam DELETE tardio, sem demonstrar equivalência das restantes guardas/interleavings. |
| src/features/canon/reader-view.tsx | 19 | Fronteiras 39/40 livros, navegação entre livros, extremos de intervalo/cópia/retorno vazio; tamanho/largura/realce e skeleton. Percursos nativos não abrangem todas as opções CSS/fronteiras. Metadados da cópia têm verificação própria prevista em T005. |
| src/features/canon/reading-preferences.tsx | 1 | title auxiliar do botão de foco; nome acessível/alternância/Escape têm provas, mas o atributo title não é distinguido. |
| src/features/canon/reference-search.tsx | 2 | Rótulo/tipo da notificação; resolução e navegação são observadas, feedback exato não integralmente. |
| src/features/sources/sources-view.tsx | 23 | Loading/cancelamento inicial/dependências; seleção entre múltiplas fontes, rótulos/kind, abreviação de hashes e callback de fecho. Retry com contador decrescente ainda altera a dependência. Erros, respostas tardias, direitos, citação longa e controlo visível de fecho têm provas próprias. |
| src/features/studies/study-view.tsx | 2 | Tipo de toast e abreviação do hash de evidência. Não distinguem a totalidade do feedback; atribuição e evidência real são verificadas. |
| src/features/workspace/history-view.tsx | 36 | Mensagens/tipos de toast, trim de revisão, limpeza de erros/formulários, guardas de conflito alternativo, procura entre várias notas/versões, data/hora/ícone e cursores ao voltar/avançar. SQL/HTTP/browser confirmam persistência/CAS/drafts/cascatas, não todas as variantes transitórias. |
| src/server/api-proxy.ts | 1 | Âncora inicial do regex /api. Função chamada só no contexto /api pelo proxy; invariância nesse domínio, sem estender a chamadas arbitrárias. |
| src/shared/api/client.ts | 2 | Parse JSON inválido e mensagem genérica. Código/status/erro são exercitados; mensagem e undefined versus objeto vazio não são sempre distinguidos. |
| src/shared/api/hooks.ts | 11 | Invalidação mais ampla, nomes de queries desativadas/prefixos e opções de leitura de detalhe/conversa. Corpos/owner/abort/cache têm provas, mas não todas as distinções de granularidade/cancelamento de leitura. |
| src/shared/api/http-client.ts | 6 | Mensagens genéricas, clearTimeout sem handle, retorno de parse inválido e guarda browser no ambiente DOM. TimeoutError/cancelamento têm RED/GREEN; não reclassificar estados. |
| src/shared/api/query-client.ts | 3 | Guardas de forma do erro e configuração mutations com retry false (também default da biblioteca atual). Conservar os três sobreviventes; os dois loops separados são Timeout válidos. |
| src/shared/api/services.ts | 4 | Opções/corpo/método de serviços legados exportados de resolução/criação, em parte fora do consumidor novo. Rotas/hooks ativos têm provas; não excluir os serviços sobreviventes. |
| src/shared/auth/google-identity.ts | 5 | Listeners once e libertação do promise. Eventos repetidos não integralmente distinguidos; provas técnicas não equivalem a login humano. |
| src/shared/auth/google-sign-in.tsx | 9 | Mensagem de nonce inválido, envelope exchange, guarda active/finally e contador de retry. Backend verifica assinatura/nonce/sessão, sem substituir estes controlos cliente nem provar consentimento pessoal. |
| src/shared/hooks/use-session.tsx | 12 | Mensagens internas, contador crescente/decrescente, dependências estáveis, limpeza de controller, no-store e guardas tardias. Isolamento/401 têm provas; interleavings adicionais e opções de cache permanecem limitações. |
| src/shared/hooks/use-theme.tsx | 2 | Guardas typeof window no ambiente DOM. Temas guardados/sistema/inválido observados; SSR sem window não é abrangido. |
| src/shared/ui/button.tsx | 1 | displayName de diagnóstico, sem efeito visual ou de ação observado. |
| src/shared/ui/dialog.tsx | 5 | displayName e auxiliares Overlay/Title/Description vazios. Interação/tamanho/rolagem têm provas; todos os auxiliares/overlay não são integralmente distinguidos. Sem assumir equivalência funcional. |
| src/shared/ui/input.tsx | 2 | displayName e type default vazio (HTML interpreta como text, mas atributo difere). Erro/id/ref/descrições/CSS observados; estados preservados. |
| src/shared/ui/shell.tsx | 33 | Formulário local, preventDefault, menus/logout, atalhos, ícones, navegação móvel, foco e classes sem contexto. Sessão/mobile/painel observados; submenus/combinações de teclado/geometrias adicionais não integralmente. |
| src/shared/ui/toast.tsx | 11 | Remoção individual/dismiss, callbacks e substring do id aleatório. Cores/sinais/mensagem medidos; fechar uma entre várias notificações não integralmente distinguido. Sem prova geral de equivalência do id. |
| vite.config.ts | 1 | Prefixo vazio de loadEnv lê mais variáveis na configuração, mas continua a consumir só BIBLE_API_PROXY_TARGET; não publica automaticamente variáveis no bundle. Loopback/dev/preview verificados. |

## Outras provas da mesma revisão

CI: 396 testes/36 ficheiros PASS; V8 857/857 linhas (100%), 831/869 branches (95,62%), 350/350 funções (100%), 1047/1057 statements (99,05%). coverage-summary.json SHA256 d15002424171928bbfe049aaa0be3d2ee904aad4baa9877623201a8566bfbfd7. Chrome 156.0.8078.47, 45 contratos de apresentação reais. Build strict e lint zero erros/cinco avisos anteriores PASS. Percursos API/PostgreSQL e IA real separados, falhas históricas e Google humano adiado em [validação atual](T003_CURRENT_VALIDATION.md).

<details>
<summary>IDs dos 307 Survived no raw auditado</summary>

| Ficheiro | IDs |
| --- | --- |
| src/App.tsx | 31, 60, 152, 153, 156, 191, 13, 15, 25, 33, 35, 37, 39, 42, 43, 44, 45, 57, 62, 71, 74, 85, 88, 89, 100, 107, 108, 109, 127, 130, 131, 135, 136, 138, 140, 141, 159, 183 |
| src/features/assistant/analysis-result.tsx | 219 |
| src/features/assistant/context-panel.tsx | 315, 326, 327, 333, 334, 339, 340, 341, 347, 351, 352, 353, 367, 368, 371, 387, 388, 391, 393, 394, 395, 400, 402, 404, 409, 418, 423, 524, 525, 526, 531, 546, 251, 252, 253, 261, 287, 290, 336, 396, 427, 428, 430, 433, 435, 437, 447, 448, 473, 474, 475, 476, 481, 482, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 517, 520, 532, 551, 565, 620, 621, 640, 656, 660 |
| src/features/canon/reader-view.tsx | 680, 686, 710, 712, 730, 731, 740, 747, 751, 752, 753, 757, 758, 785, 796, 828, 837, 838, 839 |
| src/features/canon/reading-preferences.tsx | 868 |
| src/features/canon/reference-search.tsx | 884, 885 |
| src/features/sources/sources-view.tsx | 936, 937, 943, 959, 969, 970, 971, 979, 1005, 1010, 1019, 1025, 1026, 1027, 1028, 1029, 1033, 1039, 1042, 1043, 1044, 1045, 1046 |
| src/features/studies/study-view.tsx | 1075, 1145 |
| src/features/workspace/history-view.tsx | 1211, 1225, 1226, 1228, 1231, 1234, 1235, 1239, 1242, 1249, 1276, 1291, 1294, 1308, 1349, 1363, 1409, 1415, 1416, 1430, 1432, 1503, 1157, 1158, 1159, 1268, 1281, 1354, 1356, 1362, 1364, 1371, 1394, 1404, 1418, 1467 |
| src/server/api-proxy.ts | 1557 |
| src/shared/api/client.ts | 1618, 1637 |
| src/shared/api/hooks.ts | 1835, 1836, 1861, 1862, 1713, 1716, 1717, 1876, 1879, 1922, 1923 |
| src/shared/api/http-client.ts | 2057, 2063, 2099, 2015, 2022, 2072 |
| src/shared/api/query-client.ts | 2113, 2115, 2134 |
| src/shared/api/services.ts | 2170, 2171, 2172, 2186 |
| src/shared/auth/google-identity.ts | 2206, 2207, 2220, 2221, 2224 |
| src/shared/auth/google-sign-in.tsx | 2258, 2292, 2301, 2304, 2307, 2311, 2312, 2322, 2363 |
| src/shared/hooks/use-session.tsx | 2398, 2403, 2406, 2407, 2410, 2422, 2446, 2448, 2456, 2465, 2478, 2488 |
| src/shared/hooks/use-theme.tsx | 2502, 2519 |
| src/shared/ui/button.tsx | 2598 |
| src/shared/ui/dialog.tsx | 2599, 2605, 2608, 2609, 2611 |
| src/shared/ui/input.tsx | 2642, 2613 |
| src/shared/ui/shell.tsx | 2656, 2657, 2661, 2662, 2667, 2677, 2684, 2703, 2719, 2729, 2838, 2839, 2840, 2841, 2842, 2843, 2844, 2847, 2849, 2850, 2851, 2651, 2658, 2665, 2685, 2694, 2774, 2804, 2805, 2806, 2812, 2869, 2871 |
| src/shared/ui/toast.tsx | 2898, 2901, 2903, 2912, 2913, 2914, 2915, 2886, 2897, 2906, 2911 |
| vite.config.ts | 2921 |

</details>
