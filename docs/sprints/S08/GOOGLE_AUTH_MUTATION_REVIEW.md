# S08-T008 — Mutação e revisão dos sobreviventes

CI41078164874, revisão executável `db7f08d4825fef20e28e0462dcca55902b53cc7e`, nove jobs SUCCESS. Conferência local `node reports/audit-t008-ci.cjs 41078164874 db7f08d4825fef20e28e0462dcca55902b53cc7e` PASS:138fontes atuais iguais ao commit,113fontes mutáveis,6874assinaturas conferidas com Instrumenter Stryker10/operadores padrão. Seis partições/fingerprint `5851dcf7d92301513d9e55756f581213dc2f0ee31a38e46fcbf419f3c614f5fb`. Nenhuma exclusão, operador, threshold ou estado alterado.

4452Killed62Timeout466Survived1894CompileError, zeroRuntimeError/NoCoverage. Bruto global4514/4980=90,6425702811%; IA2132/2370=89,9578059072%. Ambos estritamente>85%. CompileError excluído do denominador e Timeout detetado conforme política vigente. Comparar pontuações não substitui a revisão dos casos abaixo.

Artefacto agregado12990349681:1317543bytes/SHA `9f66201a6eb8d9382b00f511f8875ac6b551ca92d00111cce5c4cf9f0d0ee776`; mutation.json SHA `6b248269b77c5aaa77b64ecb515cc9f307a15920c3e111283836da6192af778c`. Artefacto coverage12988482670:398531bytes/SHA `871ce7b5a250c025c182dd0e54f0d013ada44b5138c04514dc66868828445531`,100%linhas/97,82%branches. Downloads reais/bytes/digests/revisão do workflow conferidos; recebidos em LOCALAPPDATA/BibleAI/quality-artifacts/41078164874.

O primeiro auditor diagnóstico serializou objetos location inteiros e falhou por ordem de propriedades end/start, embora os valores coincidissem. Corrigido para comparar campos explícitos start.line/start.column/end.line/end.column, como o merge oficial. Nova auditoria PASS; não houve alteração do relatório, inventário ou código de produto. Não é RED de comportamento de autenticação.

## Comparação com a release anterior

Baseline f71a735/CI40912125811, mutation.json SHA `1e8864535e7cf6cb72a3ad4c0bec411a4634670ef05d64eb96ce0677ea50e5bc`.423sobreviventes mantêm identidade/estado da [revisão anterior](MUTATION_REVIEW.md). Seis antigos Survived passam a Timeout; cinco antigos Timeout passam a Survived;38sobreviventes pertencem à configuração/autenticação nova. Total423+5+38=466. Nenhum estado anterior é convertido manualmente em deteção/equivalência; deslocações de linha não são contadas como novas regras.

O diagnóstico privado `reports/s08-t008-ci-audit.json` preserva todos os466registos, transições, assinatura completa, fonte e contagens por ficheiro. `s08-t008-survivors-new.json` contém os43casos adicionais revistos integralmente abaixo. A coluna quantidade conta assinaturas, incluindo intervalos distintos com a mesma posição inicial.

## Revisão dos43casos adicionais

| Fonte/linhas | Quantidade | Mutação e avaliação |
|---|---:|---|
| runtime-config.ts:25 | 7 | Remoção de limites/trim/âncoras e troca de256por>=256. Regex continua a recusar espaços nos casos correntes; faltam isolamento do limite exato256e prefixo/sufixo não vazio junto de client válido. As guardas originais permanecem. |
| google-identity.ts:11 | 1 | Objeto de timeout/cache substituído por{}. Resolvedores técnicos não medem cache/renovação do JWKS Google de produção. Opções originais5000/30000/3600000preservadas; não alegar teste real desses intervalos. |
| google-identity.ts:16 | 1 | requiredClaims vazio. JOSE issuer/audience/maxTokenAge e validações manuais continuam a exigir as claims nos casos testados. Conservar lista explícita; não reclassificar como Equivalent. |
| google-identity.ts:19 | 3 | Fronteira sub255e retirada do trim.256é recusado; falta aceitação direta de255. Regex ASCII também recusa os espaços dos casos correntes. Guarda original continua a exigir trim e até255. |
| google-identity.ts:20 | 1 | exp<=iat torna-se exp<iat. Falta testar igualdade com datas ainda na tolerância. O caso exp<iat é coberto; implementação original recusa ambos. |
| google-identity.ts:23–24 | 2 | Texto fallback do código de erro e retirada da classificação ERR_JWKS_NO_MATCHING_KEY. Fallback continua fora dos prefixos aceites; falta isolar kid desconhecido e exigir401em vez de503. Assinatura/claims continuam recusadas; original classifica corretamente. |
| google-auth.controller.ts:12 | 2 | Retirada de âncora inicial nos schemas credential/CSRF. Entradas correntes inválidas continuam recusadas; faltam prefixos que preservem um sufixo sintaticamente válido. Âncoras originais intactas; serviço também exige desafio real. |
| google-auth.controller.ts:27/35/54; google-auth.filter.ts:13 | 4 | Valores de Referrer-Policy/Cache-Control esvaziados. Testes não isolam cada header de script/me/erro. Valores corretos permanecem no produto; ausência desses headers não é considerada equivalente. |
| google-auth.controller.ts:29/46 | 4 | Path inicial/limpeza e valor/HttpOnly do cookie apagado alterados. Há expiração MaxAge0, mas faltam asserts independentes de todos os atributos. Produto mantém Path/HttpOnly/SameSite e valor vazio; teste humano não substituído pelos testes HTTP. |
| google-auth.controller.ts:34 | 1 | Remoção do503no script quando Google desabilitado. Página/exchange desabilitados são cobertos; script desabilitado não isolado. Original tem guarda explícita. |
| google-auth.module.ts:12/14 | 2 | Fallback de client ausente e exports vazio. Serviço fica desabilitado por config, e controlador usa providers internos; falta consumidor externo que exija export. Composição original e503do script mantidos. |
| google-login.ts:19–21 | 3 | Literais fallback de origem/cookie/nonce alterados. Valores mutados continuam fora da lista de origens ou do formato/tamanho de um desafio emitido. Não são credenciais reais nem nova origem permitida. |
| google-login.ts:20 | 3 | Remoção de filtro/trim ou prefixo de cookie. Falta mistura de cookies não relacionados e espaços que exija cada operação individual. Cookie único correto e negativos correntes não isolam essas transformações. Parser original preservado. |
| google-login.ts:22 | 2 | Remoção das âncoras do nonce. Tamanho43, comparação constante e presença do nonce emitido continuam a recusar valores adversários testados. Manter validação ASCII explícita. |
| google-login.ts:25 | 2 | Retirada/alteração da expiração antes do await. Revalidação após verificar Google continua a impedir emissão expirada, inclusive no limite. Falta assert de não chamar o verificador num desafio já expirado. Ambas as guardas originais preservadas. |
| study.ts:41/43 | 2 | Antigos Timeout: âncora do SHA e guarda de rights retiradas. Comprimento64/regex de64ASCII limita a primeira; validações posteriores continuam na segunda. Código inalterado; não alegar que todos os objetos fora do tipo têm resultado equivalente. |
| prisma-canon-repository.ts:14/27 | 2 | Antigos Timeout: projeção _count e ordenação relacional esvaziadas. Fixtures correntes não distinguem cada projeção/ordem de inserção. Queries originais explícitas permanecem; não inferir ordenação garantida de SQL sem orderBy. |
| library-source-adapter.ts:26 | 1 | Antigo Timeout: aviso de ausência de associação passa a ser sempre adicionado. Falta assert de ausência desse aviso quando há links. Produto original condiciona corretamente; sem novo defeito demonstrado no código original. |

As lacunas ficam registadas para manutenção, sem as transformar em obrigações manuais do utilizador ou exigir100%de mutação. Não foi demonstrado defeito crítico no código original nesta análise. Todos os466estados Survived permanecem brutos; não há equivalência presumida para obter aprovação.

O callback do navegador é texto JavaScript entregue por fonte TypeScript: Stryker avalia o contêiner literal, não cada ramo do JavaScript emitido. Os testes DOM/fetch são técnicos e separados da integração humana. Scripts de provisionamento da CI têm100toolingtests totais,11do novo helper; o escopo Stryker de produto src/**/*.ts permanece exatamente o anterior. Conta Google real continua NOT_RUN/BLOCKED por decisão de testar depois. [Relatório completo](GOOGLE_AUTH_TEST_REPORT.md).
