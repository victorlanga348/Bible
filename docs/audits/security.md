# Segurança da release pessoal local

Revisão S08 executada2026-10-29 no escopo da [SPEC](../sprints/S08/SPEC.md), sem alegação de pentest externo/conformidade ou scanner de vulnerabilidades não executado. Provas: [CI/relatório](../sprints/S08/TEST_REPORT.md), [inventário](../operations/environments.md), [runbooks](../operations/runbooks.md).

| Superfície | Verificação e resultado |
|---|---|
| Acesso privado | PASS: JWT HS256/issuer/audience/iat/exp/validade1h, chave ausente/errada/expirada/rotação; owner por recurso,401/404, sem emissão pública por username |
| Transporte/contratos | PASS: Nest/Supertest/Zod/OpenAPI, entradas extra/IDs/versões/cursors/bytes Unicode/páginas/CAS e erros sanitizados; múltiplas evidências/offsets e dados reais |
| Persistência | PASS: PostgreSQL isolado, migrações/constraints/transações/revisões/rollback; guard de alvos e routing; fontes/módulos não acedem a tabelas alheias no produto |
| IA/direitos | PASS no recorte admitido: runtime autenticado loopback/pins, fontes revalidadas/retiradas/digests, limites de contexto/cancelamento/lease e avaliações adversariais reais herdadas por identidade |
| Recuperação | PASS: cópia descartável/labels/identidade/mounts, TimeZone original, arquivos/vetores/constraints/HTTP, cleanup/preservação integral |
| Segredos/operação | PASS nas verificações documentais: .env/modelos/dados/reports ignorados, comparação de segredos reais sem exposição, logs sanitizados e runbooks; dependências pinadas/Jest-Stryker reais |

API fica em127.0.0.1, runtime autenticado local, uma operação IA por lease. Limites existentes: páginas1..50/nota1..8000bytes/conversa20turnos/duas perguntas anteriores no contexto de recuperação, sem ferramenta executável ou fetch remoto de fontes via HTTP. Não há quotas/rate limiter/OAuth de serviço público implementados. Rolepostgres principal é a identidade local existente, não configuração recomendada de alojamento público.

Corpus restrito a porbr2018 e quatro parágrafos da mesma obra Josefo/Whiston; seleção de uma frase inglesa e limitações explícitas. Fontes não são testemunhos independentes nem prova de consenso. Publicação remota/comercial/mundial não está coberta por este aceite.

Achado operacional confirmado: fuso omitido no restauro provocou incoerência SQL/JSON com adapter pinado; recuperação correta conserva TimeZone, dados e expectativas. [ERR-0026](../megabrain/errors/ERR-0026-restore-timezone.md). Os429mutantes sobreviventes são limitações de sensibilidade dos testes, analisadas sem reclassificação; não são prova de vulnerabilidade do código original. Nenhum defeito crítico conhecido ou teste obrigatório bloqueado permanece no ambiente aprovado. Outro ambiente/exposição requer auditoria própria.
