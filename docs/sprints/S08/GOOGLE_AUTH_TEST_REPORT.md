# S08-T008 — Relatório Google Sign-In

IN_PROGRESS2026-10-30, implementação preparada para teste real do utilizador. [Contrato](GOOGLE_AUTH_SPEC.md)/[plano e RED/GREEN](tasks/S08-T008-google-login.md). O utilizador respondeu «Vou testar depois»; Google real permanece NOT_RUN/BLOCKED. Nenhum token/credencial/PII foi pedido ou gravado em prova. Não declarar DONE ou autenticação real Google PASS por chaves técnicas.

Checkpointf3bd642/CI41071764566 FAIL no provisionamento bíblico, antes de typecheck/suites: fornecedor reempacotou ZIP e atualizou catálogo; hashes divergentes preservados, XML/aviso iguais. [Correção de dependência CI](CI_ADMITTED_INPUT_ARCHIVE.md) usa draft privado no mesmo GitHub com exatos originais admitidos/hashes intactos. Download e preparação real do consumidor já PASS/snapshot14c2103d… idêntico; leitura pelo token mínimo da CI ainda deve ser provada. Fonte Google/IA/manifestos/dados não alterados para aceitar o fornecedor novo. Worktree isolada backend evita interferir no frontend paralelo do utilizador.

## Resultados locais do checkpoint

| Verificação | Estado | Prova |
|---|---|---|
| Configuração client/secret | PASS | RED7FAIL1PASS antes de consumir/validar Google, GREEN8/8 |
| RS256/issuer/audience/iat/exp/nonce/azp/algoritmo/assinatura | PASS técnico | RSA efémero real/JOSE, positivos e negativos; não são tokens Google |
| Desafios/CSRF/origem/cookie/replay/TTL/capacidade/owner/JWT local | PASS técnico | Assinaturas RSA+HS256 reais, consumo concorrente único, expires-in1h, sem ligação por email |
| Nest/HTTP/OpenAPI/DB real | PASS | Entrada e intercâmbio, JWKS HTTP técnico, ownerGoogle persiste estudo real/nega outroGoogle eCLI/cleanup, erros400/401/503 sanitizados |
| Controlador do navegador | PASS técnico | DOM/fetch doubles identificados: exchange+confirmação/cópia deliberada/limpeza/erros; sem alegar browser real |
| Regressão afetada | PASS | `npm run test -- --runTestsByPath …`125testes8suites/48,197s, log s08-t008-affected-regression; inclui acesso local e startup |
| Typecheck/lint/build | PASS | Comandos reais viaRTK, exit0/2026-10-30T14:21:48Z–14:22:34Z; logs s08-t008-final-* |
| Tooling/arquitetura | PASS | `npm run test:tooling`89/89/10,347s,2026-10-30T14:22:47Z |
| Discovery/JWKS Google oficiais | PASS rede real | HTTPS200, issuer/JWKS/algRS256 oficiais conferidos sem credenciais |
| Asset GSI por probe Node | BLOCKED diagnóstico | Não foi possível completar o fetch no cliente Node; causa não estabelecida, não demonstra resultado do browser real. Original preservado |
| Página de servidor local | PASS | GETlocalhost:3000/auth/google200, fonte GSI e cookie/nonce em resposta runtime, sem expor valores nos logs |
| Conta Google→token local→HTTP privado | NOT_RUN/BLOCKED | Consentimento humano adiado expressamente; EXT-007 em REQUIRED_ACTIONS |
| Suites integrais/cobertura/mutação nova | NOT_RUN | CI do novo checkpoint ainda por executar; f71a735 é histórico, não valida estes ficheiros |

### Comandos e artefactos

Logs locais ignorados `backend/reports/s08-t008-*.log`, comandos por fase na ficha. Runtime/testes Windows/Node24.16.0/npm11.13.0/JOSE6.2.13/Nest12.2.0/PostgreSQL17.11 teste isolado; testes autenticação não requerem inferência. Nenhum pacote/migração novo. `git diff --exit-code ef8b87b -- backend/src/modules/ai-assistant backend/admissions backend/prisma backend/prisma-ai docs/ai/profiles` exit0: IA/modelos/prompt/fontes/schema inalterados, avaliações nativas anteriores incorporáveis por identidade, sem repetir modelo.

Primeiro teste do verificador usou scaffold que rejeitava tudo e falhou causalmente antes de verificar assinatura. Depois da aceitação RSA mínima,24testes negativos falharam antes das guardas/normalização de falhas. Serviço23casos:22FAIL1PASS antes da implementação; todos aprovados depois, mais regressão de expiração entre await/consumo. HTTP devolvia404 antes dos handlers; página/JS/me passaram antes de implementar exchange, que teve9FAIL causais antes do handler. Newline2PASS sem mudança é regressão, não RED (nome antigo do log não altera estado). Regressores do controlador JS foram acrescentados após o primeiro contrato de entrega do script, não são apresentados como RED original da lógica interna.

Servidor de verificação próprio PID408/processo explícito e ficheiro `reports/s08-t008-native-google-c39c0cfe-42d5-44e6-842f-9573dfdd5570.json`: guarda apenas status/tempos/hashes das fontes, sem tokens/claims/email. Executa o verificador de produção com JWKS Google fixo e, se o utilizador entrar, confirma JWT local e GETprivado PostgreSQL sem gravações. Estado atual NOT_RUN, nenhuma tentativa. Abertura automática de navegador foi bloqueada pela política de execução; URL manual entregue. Registar encerramento antes de concluir a tarefa para não deixar recurso próprio sem acompanhamento.

## Gates e limitações

Gate1 aprovado: pedido explícito/contrato/ADR-0009/plano antes de código. Gate2 tem evidências causais dos critérios acima e regressões identificadas sem RED retroativo. Gate3 local PASS, cobertura integral nova pendente. Gate4 protocolo/DB PASS, conta Google real BLOCKED. Gate5 mutação/inventário/sobreviventes novos pendentes. Gate6 IA nova não aplicável/sem mudança de modelos/casos; evidências anteriores preservadas por identidade. Gate7 checkpoint documental PASS2026-10-30T14:27:21.330Z/28ficheiros próprios13Markdown110links/zero alertas; nova conferência após estado AGENTS. Auditor global anterior FAIL por whitespace em novo SPEC S09 alheio, preservado; manifesto explícito separa PLAN/SPEC S09 fora de T008, sem alterar gates de produto ou apagar falha. Nenhum segredo/migração/pacote novo.

Sem frontend completo/refresh/revogação seletiva/múltiplas instâncias/link de contas. Desafios vivem nesta instância300s/128pendentes; sessão local1h. Segredo existente preservado, client ID é identificador público do protocolo. A conta Google nova não herda estudos do owner CLI. Configurar no Console as origens localhost/porta e test users quando exigido; não confundir client ID de login com chave de IA. Autenticação de conta real deve continuar bloqueada até prova concreta posterior, mesmo que a CI passe.
