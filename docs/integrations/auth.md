# Autenticação e autorização

Atualização operacional S04-T0062026-10-22: JWT/guard ligados às três rotas privadas e comprovados em Nest/Supertest/PostgreSQL e HTTP real contra bible_db do PC. Chave jwtSecret existente foi efetivamente usada para emitir/verificar token local, sem exposição/alteração. CLI real npm run auth:token -- subject em backend carrega .env explicitamente e imprime o token só à saída solicitada pelo operador; usar npm run --silent auth:token -- subject para saída limpa. Falha de emissão é sanitizada. Sem chave, rotas privadas401 e leitura pública preservada; assinatura errada/expiração/owner alheio verificados. O estudo operacional inicial pertence a local-owner e retém versões1/2. Nenhum login Google ou fornecedor IA é inferido. Gates finais S04 pendentes; cronologia seguinte histórica.

Atualização2026-10-22: DEC-04 resolvida para acesso pessoal local na [SPEC S04](../sprints/S04/SPEC.md) e [ADR-0005](../architecture/adr/ADR-0005-estudos-privados-e-versoes.md), por decisão do agente sob autorização integral. JWT HS256/JOSE6.2.13 usa jwtSecret existente, mínimo32 bytes UTF-8, issuer biblia-local, audience biblia-backend, sub ASCII estrito, iat/exp inteiros e validade máxima1h. Assinatura/claims são verificados no servidor; ausência de chave falha fechado. T005 tem RED/GREEN criptográfico real e guard técnico; ligação a HTTP privado/persistência permanece T006, sem prova inferida de unitários.

Emissão será apenas por ferramenta local; nenhum endpoint público por username. Owner vem exclusivamente do subject validado e recurso de outro owner devolve404. Rotação da chave invalida tokens anteriores após reinício; sem refresh/revogação seletiva. GOOGLE_CLIENT_ID preservado não implementa login Google. Contas remotas/OAuth não são exigidas neste recorte. Histórico é retido localmente sem expiração automática na S04; gestão/eliminação pertence a S07. As questões seguintes preservam a preparação anterior e continuam pertinentes a ampliações futuras.

## Questões para decisão
- Quem pode aceder à aplicação e aos estudos?
- Que informação pode sair do ambiente pessoal?
- Como isolar dados no histórico e nas perguntas?
- Que operações exigem autenticação e autorização?
- Como expirar/revogar acesso e recuperar de perda de credenciais?
- Qual a política de retenção e eliminação associada à identidade?

## Critérios a detalhar
A decisão deve permitir impedir acesso indevido e evitar mistura de contextos. Respostas de erro, contratos e estados de UI serão definidos após aprovação.
Testar fluxo autorizado e negado com aplicação real e persistência real quando aplicável; não limitar a verificação à interface.

## Dependências
[SH-001](../specs/study-history.md), [modelo](../architecture/data-model.md), [segurança](../audits/security.md), DEC-10 e PLAN-003.
Não criar tabelas de utilizadores, tokens ou endpoints de sessão nesta etapa.
