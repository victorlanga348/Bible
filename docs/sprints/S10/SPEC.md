# S10 — Contrato de integração local

Adenda aceite por decisão delegada2026-10-30 antes de código. Fontes: [S09](../S09/SPEC.md), [Google S08-T008](../S08/GOOGLE_AUTH_SPEC.md), [contratos API](../../integrations/api-contracts.md). Em substituição à URL direta por omissão da S09, usar /api no cliente. Não alterar endpoints/campos de domínio.

## T001 — Comunicação

1. Ambos os clientes HTTP existentes usam /api por omissão e resolvem URLs relativas à origem da página; preservam método, query, JSON e Bearer. VITE_API_URL explícito continua suportado como configuração confiável, sem inventar credenciais.
2. Vite dev e preview encaminham somente /api ou /api/... para http://127.0.0.1:3000, removendo apenas esse prefixo. /apix não é rota de API. Não reescrever Origin, não habilitar CORS global ou hosts universais.
3. BIBLE_API_PROXY_TARGET opcional, somente no servidor Vite, permite backend de teste próprio; aceitar apenas HTTP de loopback sem credenciais/query/fragmento/path adicional. Configuração inválida falha com mensagem genérica, sem imprimir valor.
4. Dev local usa127.0.0.1:5173/strictPort; preview tem o mesmo proxy e binding local. Nenhum segredo deve ser introduzido em variáveis VITE. Artefacto estático sozinho não inclui um servidor proxy.
5. Testes de transporte usam servidores HTTP técnicos reais identificados; não são prova PostgreSQL/Google/IA. Prova nativa de leitura usa API real/corpus autêntico sem escritas; prova formal de persistência usa somente PostgreSQL de teste identificado em T003.

Referência primária consultada: [Vite server.proxy](https://vite.dev/config/server-options#server-proxy). Query permanece na reescrita; headers de autenticação não são registados.

## Incrementos seguintes

T002 deve fixar contrato de login/retorno/nonce/validação de origem e sessão antes de implementar; manter [ADR-0009](../../architecture/adr/ADR-0009-google-id-token-local-access.md), sem ligar owners por email ou persistir tokens em storage. T003 fixa ações e contratos reais antes de corrigir cada fluxo. T004 não autoriza trocar o modelo pinado, fontes ou envio remoto sem a adenda própria e provas. API paga não é pré-requisito assumido.
