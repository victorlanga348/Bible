# Architecture Decision Records

| ADR | Estado e alcance |
|---|---|
| [ADR-0001](ADR-0001-stack-e-limites-arquiteturais.md) | Aceite historicamente; stack/limites originais, preservada |
| [ADR-0002](ADR-0002-adocao-condicional-strykerjs.md) | Aceite historicamente; escolha condicionada preservada; evolução na ADR-0003 |
| [ADR-0003](ADR-0003-backend-modular-e-stack-prescrita.md) | Aceite documentalmente em 2026-10-20; monólito, seis módulos e stack prescrita, sem implementação |
| [ADR-0004](ADR-0004-fundacao-executavel-s01.md) | Aceite na revisão final S01 em 2026-10-21; matriz, módulos Node20, isolamento e ferramentas |
| [ADR-0005](ADR-0005-estudos-privados-e-versoes.md) | Aceite por decisão delegada2026-10-22; implementação S04 verificada/encerrada2026-10-26,907 testes/CI e gates atuais |
| [ADR-0006](ADR-0006-ia-local-e-indice-reconstruivel.md) | Decisão estrutural delegada2026-10-26; runtime local/índice próprio, perfil final condicionado à viabilidade/avaliação S05-T004 |
| [Template](template.md) | Modelo para novas decisões |

Próximo ID: ADR-0013. ADR-0011 reservado ao rascunho Gemini preservado fora desta branch; nenhuma aceitação implícita desse escopo. Não reescrever ADR aceite para apagar história; criar sucessora ligada e indicar alcance.
Aprovação exige decisor, data e origem verificável. Specs definem comportamento; ADR não aprova endpoint/schema ou instalação. Pendências na [stack](../stack.md).

- [ADR-0007 — Ciclo de vida e workspace](ADR-0007-study-lifecycle-and-workspace.md): aceite pelo agente delegado2026-10-29, antes de S07; guard curto por estudo e eliminação modular repetível.

- [ADR-0008 — Capacidade opaca de transação curta](ADR-0008-short-main-database-write-scope.md): aceite antes de S07-T006; implementação/gates finais comprovados, sem expor Prisma entre módulos.

- [ADR-0009 — Google ID token e acesso local](ADR-0009-google-id-token-local-access.md): aceite delegado2026-10-30 antes de S08-T008, pedido explícito pós-release.

- [ADR-0010 — Compilador frontend compatível com os gates](ADR-0010-frontend-toolchain-compatibility.md): decisão S10-T001 após falha real do compilador7; fixar6.0.3/strict e comprovar runner/checker, sem dispensar mutação.

- [ADR-0012 — Google na interface e fronteira de sessão](ADR-0012-frontend-google-session.md): decisão delegada S10-T002 antes de código; GSI/runtime/whitelist local e isolamento de UI/cache por sessão.
