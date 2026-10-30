# ADR-0012 — Google na interface e fronteira de sessão

Aceite por decisão delegada2026-10-30, pedido «continua» na feat/biblia-integracao. ADR-0011 está reservado ao rascunho Gemini preservado noutra branch/stashes; não o reutilizar nem aceitar esse escopo remotamente por inferência.

Problema: frontend aceita qualquer texto como sessão/local-owner e mantém cache/estado entre owners. Página Google backend já valida identidade, mas devolve token para cópia manual; popup direto perde comunicação com políticas COOP distintas. Não acrescentar framework de auth ou biblioteca à stack Nest/JOSE existente.

Decisão: GSI oficial no frontend, bootstrap runtime público do backend, exchange existente via proxy e duas origens locais5173 explicitamente admitidas. Cookie de desafio continua HttpOnly/Strict e é reescrito no proxy somente quanto ao Path. Sem CORS global, ID token em URL ou partilha por postMessage. Confirmar sempre /auth/me antes de usar token e owner. Nova geração de sessão recria cache/UI e invalida trabalho anterior.401 pede confirmação da sessão atual para não terminar acesso novo por pedido antigo. Detalhes/limites/provas em [contrato T002](../../sprints/S10/T002_SESSION_SPEC.md).

Vantagens: mantém verificador/segurança/owners existentes, botão oficial e memória somente; nenhuma dependência/secret/migração nova. Custo: origem frontend5173 precisa de autorização no Google Console e prova de conta humana continua adiada. Uma aplicação pública/origem diferente exige outro contrato; não ampliar whitelist arbitrariamente.

Verificação prevista: TDD, RSA/JWKS técnico/Nest/PG isolado/browser reais, timers/corridas/401/logout/cache e gates da tarefa; gates globais antes de fechar S10. Não confundir testes técnicos com conta Google real.
