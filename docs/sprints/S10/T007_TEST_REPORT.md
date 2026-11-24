# S10-T007 — Relatório de cadastro e entrada por email

Estado: IN_PROGRESS; mutação em execução, sem fecho inferido. Data2026-11-24, Windows/Node24.16.0, branch `feat/biblia-integracao`. [Contrato/plano](T007_ACCOUNT_SPEC.md), [ADR](../../architecture/adr/ADR-0013-application-password-accounts.md).

## Evidência já executada

- RED: frontend sem botão «Criar conta»; HTTP `/auth/register`404 após confirmar PostgreSQL de teste. A primeira tentativa com banco parado e o harness sem ThemeProvider não contam como RED; foram corrigidos antes da falha funcional comprovada.
- GREEN: cadastro/entrada reais, email normalizado, hash scrypt, JWT e `/auth/me`; estudo criado/lido após reentrada e404 para outro proprietário.
- RED adicional: respostas400 sem `Cache-Control: no-store`; GREEN por cabeçalho declarativo nas duas rotas, incluindo erros de validação anteriores ao handler.
- RED de remoção do token manual: teste encontrou «Usar um token local» no diálogo. GREEN: retirados estado, campo, formulário e submissão de token;43testes de acesso afetados PASS. O teste de fronteira de sessão passou a entrar por email, conservando confirmação pendente, falha recuperável e repetição. Google continua opcional.
- PostgreSQL de teste `127.0.0.1:55433/biblia_test`, papel `biblia_test` verificado antes de limpeza; somente container de teste existente foi iniciado. `npm.cmd run prisma:generate` e `npm.cmd run db:migrate:test` PASS. `npm.cmd run db:migrate:dev` PASS aplicando apenas a nova migração aditiva em `bible_db`; sem apagar dados do utilizador.
- Backend: `npm.cmd run test:coverage -- --runTestsByPath test/e2e/password-auth.spec.ts test/e2e/google-auth.spec.ts test/unit/password-hash.spec.ts test/unit/password-auth-policy.spec.ts --collectCoverageFrom=src/infrastructure/password*.ts --collectCoverageFrom=src/presentation/password-auth.controller.ts` PASS45testes/4suites; cobertura das quatro fontes novas100%linhas/91,07%branches. Não é cobertura global do backend.
- Frontend: `npm.cmd run test:coverage -- --maxWorkers=1` PASS370testes/48ficheiros;986/987linhas=99,89%,929/970branches=95,77%. A execução anterior encontrou referências antigas nos testes e timeout de encerramento do Chrome; referências atualizadas e contexto Chrome fechado explicitamente, com deadline de teardown60s. Nenhum teste foi removido. Registam-se também falhas transitórias de tempo durante execuções concorrentes; regressão final completa PASS.
- Build/typecheck/lint backend PASS; arquitetura9testes e tooling100testes PASS. Build/lint frontend PASS, zero erros e os quatro avisos preexistentes; tooling13testes PASS. Nenhuma dependência instalada.
- Navegador: `node node_modules/@playwright/test/cli.js test --config reports/accounts/playwright.config.ts --workers=1` PASS2casos (Chrome desktop e Pixel5/Chrome), Nest/JWT/Prisma/PostgreSQL reais. Cadastro, estudo `GEN 1:1` da fixture autêntica, logout, reentrada email/palavra-passe e abertura pelo histórico; sem senha/JWT no armazenamento persistente. Google externo bloqueado apenas no teste deste percurso, não substituído por sucesso. Falhas iniciais do harness (campo extra no catálogo, nome de input e intervalo de versos ausente na fixture) corrigidas sem alterar conteúdo bíblico ou comportamento de produção.
- Instância local existente: OpenAPI em127.0.0.1:3000 anuncia as duas novas rotas. Frontend em127.0.0.1:5173 mantido; testes nativos usaram Vite separado5174/API32123, sem parar o serviço do utilizador.
- Skill impeccable aplicada ao formulário existente; detector nos dois alvos de acesso retornou `[]`. Capturas desktop/mobile inspecionadas; diálogo rolável sem overflow horizontal.

## Mutação e limites de escopo

Backend de contas aprovado no [CI45383232192](https://github.com/victorlanga348/Bible/actions/runs/45383232192), fonte `98d515e`:53testes,79/79linhas,53/56branches;193mutantes nas5fontes,111Killed/4Timeout/19Survived/59CompileError, zeroNoCoverage/RuntimeError. Score bruto115/134=85,82089552238806%, estritamente superior a85%. Artefacto `application-account-quality` descarregado e fontes comparadas byte a byte com normalização CRLF. Execução local anterior:112Killed/4Timeout/18Survived/59CompileError=86,56716417910448%; é diagnóstico de snapshot anterior dos testes, não substitui o CI atual. [Revisão dos19sobreviventes](T007_MUTATION_REVIEW.md).

Depois da remoção do token manual, foi criado perfil Playwright versionado e adaptados os percursos antigos para contas próprias. Quatro percursos atuais Chrome desktop/mobile PASS. O workflow independente passa a medir também o frontend: regressão/cobertura global e mutação integral do componente de senha e `shell.tsx`, sem excluir mutadores. A execução local parcial de406mutantes foi interrompida para liberar recursos ao navegador e não aprova o gate; aguarda-se o job final. Os resultados globais da revisão anterior à remoção são históricos e permanecem separados.

Nova regressão local:370asserções PASS, suite `native-styles` FAIL apenas no encerramento de Chrome (hook60s) durante execuções concorrentes; não contada como regressão aprovada. Repetição final sequencial pendente. O percurso de workspace antigo precisou ainda trocar a fixture canónica básica pela fixture autêntica de Génesis já admitida para IA, que inclui os quatro versos exigidos pelas curadorias. A composição nativa verifica banco/papel `biblia_test` antes de reinicializar somente as quatro tabelas canónicas dessa tradução de teste; dados/serviços de desenvolvimento preservados. Nenhuma alteração do runtime/modelos de IA.

Atualização de execução: fonte funcional enviada em `6b9f59e`; [frontend global45374635432](https://github.com/victorlanga348/Bible/actions/runs/45374635432) passou build/lint/coverage e está em mutação. [Backend geral45374635293](https://github.com/victorlanga348/Bible/actions/runs/45374635293) permanece na obtenção do original histórico; nenhum PASS inferido. Acrescentado job de contas independente, mantendo os pipelines globais. O perfil específico passou52testes/5suites com100%linhas/94,64%branches; o caso adicional de custo do hash dummy e os6casos de transporte passaram juntos (18testes). O arranque de mutação força53testes atuais; medição final ainda em curso.

Foram corrigidos os globs `<rootDir>` que omitiam os testes unitários apenas no sandbox Windows e a configuração isolada Jest/watchman; a descoberta real agora lista os mesmos5ficheiros no workspace e no sandbox. Tentativas com27testes não aprovam este gate. Perfis finais preservam checkers/typescript, limites e todos os193mutantes gerados nas5fontes. Reciclagem do runner a cada25mutantes limita memória; tentativas locais anteriores com heap limitado precisaram de reinício automático pelo Stryker e não são convertidas em deteções. Sem redução do escopo, exclusão de sobreviventes ou alteração manual de resultados.

Comandos reais: `node node_modules/@stryker-mutator/core/bin/stryker.js run stryker.accounts.config.cjs`, em cada pacote. Backend: todas as quatro fontes novas de autenticação e composição `app.ts`. Frontend: componente novo e `shell.tsx` completo. As outras três alterações frontend são exclusivamente texto orientador, sem alteração de regras; seus testes e a regressão completa foram executados. Nenhum mutador, linha ou sobrevivente excluído. Fontes dos módulos de estudo/IA/Google restantes não mudaram; os relatórios anteriores permanecem históricos, sem atribuir-lhes medições das contas novas.

Análise inicial encontrou um erro de tipo na configuração temporária Stryker e tentou tratar HTML de artefactos como TypeScript. Configurações reproduzíveis versionadas restringem a desativação de verificações a TypeScript e omitem apenas artefactos/saídas da cópia de sandbox. Fontes mutáveis mantidas integralmente. Execuções interrompidas/iniciais com falha não contam como score.

## Gates e revisão

| Gate | Aplicabilidade | Estado atual |
|---|---|---|
| 1 Especificação/plano | Conta própria solicitada pelo utilizador | PASS, contrato documentado antes do código |
| 2 TDD | Novo comportamento e cabeçalhos | PASS, RED/GREEN acima |
| 3 Estática/cobertura | Fontes modificadas, frontend completo | PASS, valores acima |
| 4 Integração/migração | Conta, identidade e estudo real | PASS, HTTP/PG e2e e dois percursos nativos |
| 5 Mutação | Fontes novas e composição de acesso | NOT_RUN, análise em curso; sem score aprovado ainda |
| 6 IA | Não há alteração de IA/corpus/modelos | Não aplicável; nenhuma inferência repetida nem PASS fictício |
| 7 Governança | Docs/contratos/segredos/alterações | IN_PROGRESS; auditoria preliminar PASS117links/zero segredos; fecho após mutação |

Codex desenhou, implementou e executou as verificações. Antigravity foi chamado pela CLI instalada/revalidada em modo `plan`, com prompt exclusivamente textual e sem ferramentas/escrita/delegação. Resposta verificável em uma interação (~34s): recomendações de concorrência, hash dummy, unicidade, preservação da senha, IP direto e cancelamento. Propostas revistas e incorporadas em testes de segurança; nenhum código do auxiliar integrado. Chamadas anteriores interrompidas/sem resultado não servem de prova.

Alterações preexistentes preservadas: `README.md`, `backend/package.json`, `docs/operations/DEV_STARTUP.md`, `scripts/dev.cjs`, `scripts/dev.test.cjs`. RTK usado para npm/Git/Docker; leituras PowerShell e `git diff --check` nativo conforme fallback/ERR-0021. Sem segredos em relatórios versionados, sem serviço pago/deploy/merge/force push.

Pergunta de auditoria: «Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?» Resposta atual: cadastro, hash/limites, migração, UI/copy e harness estão registados; conclusão/score ainda pendentes. Limites do produto: uso local, sessão em memória de1h, sem recuperação/verificação de email e sem união de contas Google por email.
