# S10-T007 — Cadastro e entrada com conta da aplicação

Estado: IN_PROGRESS. Pedido explícito do utilizador: poder criar uma conta na região de login para fazer um estudo estruturado, sem depender do Google. Execução na branch `feat/biblia-integracao`, sob autorização operacional vigente; alterações preexistentes de arranque preservadas.

## Plano e critérios

1. RED: HTTP real deve oferecer cadastro/entrada e a janela deve oferecer «Criar conta»; comprovar falha antes da implementação.
2. GREEN: persistir uma conta própria no PostgreSQL, guardar hash scrypt assíncrono, emitir a sessão existente e confirmar `/auth/me`; apresentar formulários acessíveis de entrada/cadastro.
3. REFACTOR/validação: erros, duplicados/concorrência, limites, isolamento de proprietários, regressão Google/token, build/lint/arquitetura, cobertura, mutação e navegador.

Dependências: NestJS, Zod, Prisma/PostgreSQL, `node:crypto`, JWT/guard e sessão em memória existentes. Sem instalação. Alternativa Google exclusiva não satisfaz o pedido; serviço externo acrescentaria uma dependência desnecessária para uso pessoal local. A conta própria exige proteger palavras-passe e manter migração; mitigação por scrypt, limites e testes reais. IA e corpus não mudam; gate IA não aplicável.

## Contrato

- `POST /auth/register`: JSON estrito `{ email, password }`, 201 com `{ accessToken, tokenType: "Bearer", expiresIn: 3600 }`. Email validado, aparado e convertido para minúsculas, máximo254 caracteres. Palavra-passe15–128 caracteres, sem aparar/truncar. Duplicado409, entrada inválida400.
- `POST /auth/login`: mesmo JSON, 200 com a mesma sessão; credenciais incorretas401 com mensagem comum para email inexistente/palavra-passe errada.
- Transporte local: origem explícita loopback na porta API ou5173, JSON obrigatório, sem credenciais em URL/logs. Erros de origem403; indisponível503; excesso429. Respostas de autenticação `Cache-Control: no-store`.
- Contas: UUID, email único, hash `scrypt-v1$salt$derivedKey`, criação. scrypt N32768/r8/p3, sal16bytes aleatório, chave64bytes, maxmem64MiB, comparação constante. Hash dummy para conta inexistente. Limite10tentativas/IP/15min, mapa limitado1024IPs, no máximo2operações criptográficas concorrentes por instância. Chave JWT obrigatória antes de qualquer gravação.
- JWT/guard existente: `sub=account-<uuid>`, validade1h; acesso privado e isolamento continuam por owner verificado. Sem vínculo automático a Google ou migração de estudos de outras identidades.
- UI: entrada email/palavra-passe, ação «Criar conta», confirmação de palavra-passe apenas no cadastro, estados de envio/erro/repetição e opção de voltar a entrar. Cadastro confirma `/auth/me` e fecha a janela quando autenticado. Senhas e tokens não vão para armazenamento persistente do navegador; fechar a janela cancela pedidos pendentes.
- Google e acesso técnico existentes preservados. Sessão continua em memória enquanto a página estiver aberta. Sem envio/verificação de email nem recuperação de palavra-passe neste incremento pessoal local; sem publicação pública.

## Referências

Validação de contas independente em `.github/workflows/accounts.yml`: PostgreSQL real, migrações, testes HTTP/criptográficos e mutação das quatro fontes novas mais `app.ts`, sem descarregar o corpus histórico não alterado. Os workflows globais permanecem ativos e os seus resultados são registados separadamente. O perfil Jest partilha os limites existentes e usa globs portáveis para não omitir testes no sandbox Windows; reciclagem do runner a cada25mutantes limita o crescimento de memória sem reduzir o escopo ou alterar outcomes.

Este pedido amplia explicitamente os recortes anteriores de autenticação, sem os reescrever retroativamente: [auth](../../integrations/auth.md), [sessão](T002_SESSION_SPEC.md), [gates](../../quality/quality-gates.md). Parâmetros scrypt: [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html); API criptográfica: [Node.js](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback).
