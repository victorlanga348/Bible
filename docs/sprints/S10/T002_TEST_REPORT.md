# S10-T002 — Evidências em curso

Estado IN_PROGRESS, sem fecho/gates presumidos. Contrato/ADR antes de código em [T002_SESSION_SPEC](T002_SESSION_SPEC.md). Uma tarefa ativa, branch feat/biblia-integracao; sem agentes/serviço remoto novo/migração/credencial nova/IA.

| Verificação | Resultado real |
|---|---|
| Bootstrap/origens RED |4FAIL33PASS/2suites14,563s: rota404 e duas origens5173 rejeitadas antes de código. Log s10-t002-bootstrap-red.log. |
| Bootstrap/origens GREEN |37PASS/2suites5,84s, mantendo RSA/nonce/CSRF/replay e origens negativas. |
| Sessão/proxy RED |11FAIL13PASS/24casos6,42s: sessão ativada sem backend/local-owner, variável VITE consumida, cookie sem rewrite e401 antigo encerra sessão. |
| Sessão/proxy GREEN |24PASS/2ficheiros3,07s. Header Bearer/cache-no-store e owner real confirmados. |
| Cache/UI privada |Primeiro harness falhou por matchMedia ausente no jsdom: não RED. Harness corrigido, RED real reteve private-a após logout. GREEN12PASS com regressão de sessão,4,24s. Novo QueryClient/estado por geração e callback antigo isolado. |
| UI Google |RED3FAIL por controlo de entrada inexistente; GREEN com demais casos19PASS/4ficheiros7,26s. SDK/fetch são doubles técnicos declarados, sem alegar conta Google. |
| Carregamento GSI |Scaffold indisponível; RED corrigido3FAIL1PASS sem rejeições não tratadas; GREEN incluído acima. Um script oficial/pedidos concorrentes, falha/repetir e limite15s. Primeira tentativa do harness tinha rejeições não tratadas, preservada. |
| Confirmação de identidade |Novo RED1FAIL12PASS: confirmação200 com outro owner mantinha sessão. GREEN13PASS3,09s; owner diferente agora limpa sessão. Nova fixture de newline já era corretamente rejeitada, sem alegar RED para ela. |
| Inventário de mutação |Scaffold RED2FAIL1PASS, GREEN13PASS incluindo os10casos adversários anteriores. Modo session exige11fontes sem retirar transporte. |
| Backend afetado |85PASS/5suites12,791s: identidade, serviço, callback antigo, bootstrap/OpenAPI e exchange Nest/RSA/JWKS HTTP real/PG de teste/owners/replay. Build backend PASS. |
| Build frontend |strict PASS,2157módulos/bundleBbbA-fFL/CSSYw85QaNK. Requer nova prova depois dos últimos ajustes. |
| Chrome desktop/mobile |Primeira execução BLOCKED/2FAIL no arranque: admissões IA pinadas procuradas a partir de cwdfrontend. Não é RED nem modelo inválido comprovado; helper passa a usar cwdbackend como produção e restaura ao fechar. Nova execução2PASS/1,1min, duas viewports/SDK técnico/RSA/JOSE/cookie/proxy/me/workspace PG reais e troca para owner local distinto. |

Browser não faz escrita/limpeza no banco: biblia_test/biblia_test conferidos antes do servidor32123; JWT/chaves técnicos efémeros, sem .env de desenvolvimento, sem tokens em storage/URLs/logs. API e Vite próprios fecharam; portas3000/32123/5173 sem listeners após o runner. Screenshots antes do acesso, revistos nos dois tamanhos; GSI técnico não comprova aparência/callback do fornecedor real. Traces/vídeo desligados para proteger tokens. Corpus de teste vazio gera404 de leitura; não apresentar esse teste de sessão como nova prova do leitor integral.

Skill React best practices consultada após editar múltiplos TSX: componentes estáveis fora de render, handlers explícitos, inicialização lazy de QueryClient, cleanup/corridas, dependências de effects, carregamento GSI só na ação de acesso e sem dependência nova. Identidade visual preservada; modal/detalhes e labels em português com foco/erros recuperáveis.

Cobertura/mutação completas do recorte T002 e gates estáticos/governança ainda em medição, não PASS. Código frontend/backend novo requer gates próprios;93,33% da T001 é histórico para as fontes entretanto alteradas. Conta Google real continua NOT_RUN/BLOCKED por teste humano adiado; não repetir convite nem pedir segredos.

Medição inicial do recorte completo:122testes PASS, mas86,32%linhas79,47%branches FAIL. Sem excluir módulos: regressões reais de navegação/controlos, cache/retry/frescura e falhas de bootstrap/exchange/confirmação elevaram para148PASS/22ficheiros64,50s,257/257linhas100% e259/266branches97,36%/10módulos. Esses novos testes verificam comportamento existente; não são RED de novas alterações de produção. Build posterior dos testes encontrou opção exact não suportada no getByRole do Testing Library; removida, pois a correspondência por nome string já é exata, sem casts/flags relaxados. Build PASS.

Revisão de effects detetou um aviso novo de leitura de ref no cleanup. Refatoração concentra invalidação/abort do trabalho pendente num callback próprio, preservando leitura do controller atual;30regressões afetadas PASS, build strict PASS e lint0erros/mesmos7warnings históricos. Novo bundleBjqJ8hiW/CSSYw85QaNK; preview nativo atualizado desktop/mobile2PASS54,2s. Nova cobertura da fonte após esse refactor e mutação de11fontes ainda por executar; gates globais não presumidos.

Backend: typecheck/lint/arquitetura PASS e100tooling PASS12,985s após trazer os quatro ficheiros CI de b31d3ce por seleção, como previsto no plano; sem merge/publicar draft. CI passa a observar feat/biblia-integracao. Auditoria documental real75ficheiros/22Markdown/129links PASS/zeroUTF8/segredos/whitespace/ficheiros fora do manifesto. Preparar checkpoint identificável para executar CI da revisão nova; T002 permanece IN_PROGRESS até os gates obrigatórios da tarefa, sem confundir commit com fecho.

Checkpoint8e748b9 publicado/remoto conferido; [CI backend41126297344](https://github.com/victorlanga348/Bible/actions/runs/41126297344) iniciou nessa revisão, não PASS presumido. Cobertura final após refactor148PASS/22ficheiros,256/256linhas100% e259/266branches97,36%,83/83funções; dez módulos runtime presentes. Stryker local instrumentou11fontes/862mutantes, dry-run148PASS57s, mas tentativa interrompida com39/862verificados e sem score aceite. Log parcial s10-t002-session-mutation.log conservado, nenhum resultado reutilizado.

Decisão operacional e memória medida em QUALITY_PLAN: levar execução integral a CI isolada com concorrência2, preservando fontes/pacotes/checker/perTest/operadores/limites/inventário. Novo workflow frontend/YAML parseado com js-yaml existente, nomes dos scripts conferidos no package.json, actions pinadas e permissões somente leitura PASS. Não exige modelo, chave ou serviço pago novo, nem faz deploy. Código de aplicação/build permanece igual ao checkpoint8e748b9; metadados CI novos exigem execução real própria. Aguardar e auditar relatórios completos antes de fechar a tarefa.
