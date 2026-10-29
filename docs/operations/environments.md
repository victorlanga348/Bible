# Ambiente de release pessoal local

Inventário verificado2026-10-29, fonte normativa [SPEC S08](../sprints/S08/SPEC.md)/[evidência](../sprints/S08/evidence/release-verification.json). Windows64bits/8GB, Node24.16.0/npm11.13.0; monólito NestJS12.2.0/TS6.0.3/Zod4.6.7/Prisma7.10.1. REST/Swagger12.0.2, pg8.23.1, Jest30.5.2/Supertest7.3.1/Stryker10.0.0. Versões completas no [package](../../backend/package.json)/lockfile.

| Recurso | Identidade verificada | Conteúdo/configuração |
|---|---|---|
| Principal nativo | localhost:5432/bible_db/rolepostgres/PG16.14 |schemaapp/nove migrações;TimeZoneAfrica/Johannesburg |
| Índice próprio |127.0.0.1:55436/bible_ai/rolebible_ai_owner/PG17.11/vector0.8.7 |schemaai/uma migração;TimeZoneEtc/UTC;1profile11chunks1024dimensões |
| Teste próprio |127.0.0.1:55433/biblia_test/rolebiblia_test |containerbiblia-backend-postgres-test-1/PG17.11/vector0.8.7/tmpfs;fixtures exclusivas |
| Cópia de recuperação S08 |127.0.0.1:55437/biblia_release_main_s08+biblia_release_ai_s08 |container/labels/nonce próprios/tmpfs, removido após prova;fusos dos respetivos originais |
| API |127.0.0.1:3000 |loopback,JWT local,health/live+ready/docs/openapi.json |

Imagem do índice/restauro/CI: pgvector0.8.7-pg17-bookworm SHA256ac08538c6f8b9904c33c8224c5e5706dbe760aca29db1d096972b4052c22a75d. Principal preservado:66livros1189capítulos31102versículos,2sources8excerpts5links,14estudos15versões/zero análises/conversas/recursos workspace técnicos residuais. Dumps da prova incluem recursos novos não vazios dos seis módulos, removidos só após backup; originais integralmente iguais antes/depois.

Configuração consumida: NODE_ENV,PORT,DATABASE_URL,TEST_DATABASE_URL,jwtSecret,BIBLE_AI_HOME,BIBLE_AI_DATABASE_URL. Schemaapp principal/ai índice; query de routing fora da gramática admitida é recusada pelos comandos guardados. Passwords locais codificadas na URL, nunca no Git/chat/log. POSTGRES_* e GOOGLE_CLIENT_ID não substituem essas entradas nem habilitam OAuth. Rolepostgres é a identidade local existente, sem alegação de política de roles de serviço público.

Runtime/modelos em LOCALAPPDATA/BibleAI, fora Git/OneDrive. Perfil local-extractive-v1 SHA256cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f; promptsource-sentence-selection-v6/runtime9ff0d7e90; Qwen3-1.7B Q4_K_M SHA2563d0b790534fe4b79525fc3692950408dca41171676ed7e21db57af5c65ef6ab6; embedding0.6B Q8_0 SHA25606507c7b42688469c4e7298b0a1e16deff06caf291cf0a5b278c308249c3e439. CPU2threads/uma operação/contexto2048/output128. [Admissão e operação](../integrations/local-ai.md).

TimeZone é parte obrigatória da recuperação. O adapter pinado serializa Date sem offset e normaliza o offset lido; trocar o fuso em dados existentes altera a leitura e pode quebrar coerência SQL/JSON. Conservar Africa/Johannesburg no principal e Etc/UTC no índice, sem modificar os servidores existentes. Auditorias comparativas usam SET TIME ZONE UTC apenas na sua conexão. [Incidente confirmado](../megabrain/errors/ERR-0026-restore-timezone.md). Outro ambiente/fuso exige revisão/migração própria.

Dados operacionais vêm de admissões em backend/admissions; test/fixtures não alimenta desenvolvimento. Originais em data são autenticados antes de preparar/importar. Jurisdição e direitos cobrem o recorte pessoal local; não há autorização de publicação mundial/remota presumida. Não parar Docker Desktop/WSL/OneDrive/Domus ou serviços desconhecidos.
