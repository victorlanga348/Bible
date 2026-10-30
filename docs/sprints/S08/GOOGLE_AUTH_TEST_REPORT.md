# S08-T008 — Relatório Google Sign-In

BLOCKED2026-10-30 apenas pela integração humana Google adiada pelo utilizador. Código e gates automáticos atuais PASS: [CI41078164874](https://github.com/victorlanga348/Bible/actions/runs/41078164874), revisão executável db7f08d4825fef20e28e0462dcca55902b53cc7e, nove jobs SUCCESS. [Contrato](GOOGLE_AUTH_SPEC.md)/[plano e RED/GREEN](tasks/S08-T008-google-login.md). O utilizador respondeu «Vou testar depois»; conta real permanece NOT_RUN/BLOCKED, sem pedir novamente ou presumir PASS. Nenhum token/credencial/PII foi pedido ou gravado em prova.

Falhas anteriores preservadas: f3bd642/CI41071764566 FAIL por ZIP/catálogo atualizados no fornecedor; 31823b2/CI41076553056 FAIL ao consumir draft sob Contents:read. A [correção documentada](CI_ADMITTED_INPUT_ARCHIVE.md)/db7f08d comprovou na CI o retrieval isolado Contents:write, sem dependências/testes/DB, e consumo read-only nas suites. Exatos originais/hashes/snapshot14c2103d…/66livros1189capítulos31102versículos preservados. Não alterar pins para aceitar o fornecedor novo nem publicar o draft. Worktree backend isolada evita interferir no frontend do utilizador.

## Resultados atuais e evidências locais

| Verificação | Estado | Prova |
|---|---|---|
| Configuração client/secret | PASS | RED7FAIL1PASS antes de consumir/validar Google, GREEN8/8 |
| RS256/issuer/audience/iat/exp/nonce/azp/algoritmo/assinatura | PASS técnico | RSA efémero real/JOSE, positivos e negativos; não são tokens Google |
| Desafios/CSRF/origem/cookie/replay/TTL/capacidade/owner/JWT local | PASS técnico | Assinaturas RSA+HS256 reais, consumo concorrente único, expires-in1h, sem ligação por email |
| Nest/HTTP/OpenAPI/DB real | PASS | Entrada e intercâmbio, JWKS HTTP técnico, ownerGoogle persiste estudo real/nega outroGoogle eCLI/cleanup, erros400/401/503 sanitizados |
| Controlador do navegador | PASS técnico | DOM/fetch doubles identificados: exchange+confirmação/cópia deliberada/limpeza/erros; sem alegar browser real |
| Regressão afetada | PASS | `npm run test -- --runTestsByPath …`125testes8suites/48,197s, log s08-t008-affected-regression; inclui acesso local e startup |
| Typecheck/lint/build | PASS | Comandos reais viaRTK, exit0/2026-10-30T14:21:48Z–14:22:34Z; logs s08-t008-final-* |
| Tooling/arquitetura | PASS | Inicial89/89; após helper de CI100/100local8,290s e CI2,858s, incluindo11testes reais de I/O/transporte do helper |
| Discovery/JWKS Google oficiais | PASS rede real | HTTPS200, issuer/JWKS/algRS256 oficiais conferidos sem credenciais |
| Asset GSI por probe Node | BLOCKED diagnóstico | Não foi possível completar o fetch no cliente Node; causa não estabelecida, não demonstra resultado do browser real. Original preservado |
| Página de servidor local | PASS | GETlocalhost:3000/auth/google200, fonte GSI e cookie/nonce em resposta runtime, sem expor valores nos logs |
| Conta Google→token local→HTTP privado | NOT_RUN/BLOCKED | Consentimento humano adiado expressamente; EXT-007 em REQUIRED_ACTIONS |
| Suites integrais/cobertura | PASS | CI2332testes113suites;2386/2386linhas100%,1664/1701branches97,82%; TypeScript/lint/build/migrações reais exit0 |
| Mutação e inventário | PASS | 6874mutantes/138fontes/113mutáveis;4452Killed62Timeout466Survived1894CompileError; zeroRuntimeError/NoCoverage |
| Scores e sobreviventes | PASS | Global4514/4980=90,6425702811%; IA2132/2370=89,9578059072%; [466sobreviventes revistos](GOOGLE_AUTH_MUTATION_REVIEW.md), sem reclassificação |

### Comandos e artefactos

Logs locais ignorados `backend/reports/s08-t008-*.log`, comandos por fase na ficha. Windows local e Ubuntu24.04CI/Node24.16.0/npm11.13.0/JOSE6.2.13/Nest12.2.0/PostgreSQL17.11 isolado; testes de autenticação não requerem inferência. Nenhum pacote/migração novo. IA/modelos/prompt/fontes/schema permanecem iguais à release anterior; metadata ci-archive é a única adição em admissions, sem alterar manifestos. Avaliações nativas anteriores incorporadas por identidade, sem repetir modelo. Na CI: instalação estrita, prisma:generate, provisão autenticada, db:migrate:test, typecheck, lint, test:tooling, test:coverage, seis test:mutation:shard, test:mutation:merge e test:mutation:ai-gate; todos scripts reais/exit0. [Digests dos downloads e auditoria independente](GOOGLE_AUTH_MUTATION_REVIEW.md).

Primeiro teste do verificador usou scaffold que rejeitava tudo e falhou causalmente antes de verificar assinatura. Depois da aceitação RSA mínima,24testes negativos falharam antes das guardas/normalização de falhas. Serviço23casos:22FAIL1PASS antes da implementação; todos aprovados depois, mais regressão de expiração entre await/consumo. HTTP devolvia404 antes dos handlers; página/JS/me passaram antes de implementar exchange, que teve9FAIL causais antes do handler. Newline2PASS sem mudança é regressão, não RED (nome antigo do log não altera estado). Regressores do controlador JS foram acrescentados após o primeiro contrato de entrega do script, não são apresentados como RED original da lógica interna.

Servidor de verificação próprio PID408/porta3000, na pasta original, diagnóstico `reports/s08-t008-native-google-c39c0cfe-42d5-44e6-842f-9573dfdd5570.json`: apenas status/tempos/hashes, sem tokens/claims/email. Verificador de produção/JWKS Google fixo, confirmação de JWT local e GETprivado PostgreSQL sem gravações após consentimento. Inspeção antes da entrega:NOT_RUN/zero tentativas. Mantido deliberadamente disponível para o teste posterior; não alegar recursos encerrados. Não inicia modelos. Paragem exclusiva pelo marcador do launcher, preservando serviços frontend alheios. Abertura automática do navegador foi bloqueada pela política; URL manual entregue, sem contornar a recusa.

## Gates e limitações

Gate1 PASS: pedido explícito/contrato/ADR-0009/plano antes de código. Gate2 PASS: evidências causais e regressões identificadas sem RED retroativo. Gate3 PASS: estática/build/arquitetura/cobertura integral atuais. Gate4 protocolo/DB PASS, conta Google real BLOCKED. Gate5 PASS: inventário/assinaturas/score/revisão dos466sobreviventes. Gate6 nova inferência não aplicável, motivo: nenhum modelo/perfil/caso alterado; evidências nativas anteriores preservadas por identidade. Gate7 auditoria final de documentos próprios/links/UTF8/segredos/whitespace antes de stage, diagnóstico reports/s08-t008-doc-audit.json; commit guard exige PASS. Auditor global anterior FAIL por whitespace S09 alheio permanece no histórico; não editar/stage frontend/S09 nem apagar a falha. Não declarar tarefa DONE enquanto Gate4 humano estiver bloqueado.

Sem frontend completo/refresh/revogação seletiva/múltiplas instâncias/link de contas. Desafios vivem nesta instância300s/128pendentes; sessão local1h. Segredo existente preservado, client ID é identificador público do protocolo. A conta Google nova não herda estudos do owner CLI. Configurar no Console as origens localhost/porta e test users quando exigido; não confundir client ID de login com chave de IA. Autenticação de conta real deve continuar bloqueada até prova concreta posterior, mesmo que a CI passe.

Auditoria documental final PASS2026-10-30T16:03:26.161Z:42ficheiros próprios/23Markdown208links, zero missing/secretHits/whitespace/UTF8/outsideTaskChanges, staging vazio. Interrogações restantes revistas: apenas URLs de configuração e pergunta de auditoria legítimas. Documento atualizado com o resultado, sujeito à conferência final antes de stage. Identidade dos executáveis contra db7f08d exit0; fecho documental não requer repetir CI/inferência.

Entrega atual: código publicado por f3bd642, correções CI31823b2/db7f08d; documentação posterior não altera executáveis validados. [Guia prático da IA](../../integrations/ai-next-steps.md): recorte local existente não exige chave paga, ampliação requer novo perfil/fontes/avaliações e eventual conta/chave privada apenas se escolhida API externa. Google client ID não é chave de IA.
