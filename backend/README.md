# Backend Bíblia App

Release pessoal local S00–S08 concluída tecnicamente2026-10-29. [Fecho](../docs/sprints/S08/T007_COMPLETION_REPORT.md), [provas](../docs/sprints/S08/TEST_REPORT.md), [inventário](../docs/operations/environments.md) e [recuperação](../docs/operations/runbooks.md). Histórico anterior conservado no Git f71a735; esta entrada substitui instruções de sprints antigas.

NestJS12.2.0/TypeScript6.0.3 strict/Zod4.6.7/Prisma7.10.1/PostgreSQL. Seis módulos: biblical-canon, source-library, study, cross-references, ai-assistant e study-workspace. REST/OpenAPI, consultas parametrizadas e transações curtas; inferência fora do lock. CI40912125811:2249testes107suites89tooling,100%linhas97,94%branches, mutação90,96%global89,87%IA/zeroRuntimeError+NoCoverage.

## Instalação e configuração

Usar Node24.16.0/npm11.13.0. Executar nesta pasta:

```powershell
npm ci --ignore-scripts --strict-peer-deps
npm run prisma:generate
npm run build
```

Em instalação nova, copiar `.env.example` para `.env` e `.env.test.example` para `.env.test`, preenchendo credenciais somente nos ficheiros locais ignorados. No ambiente já provisionado, preservar esses ficheiros e os bancos existentes. Não há migração nem importação automática no arranque.

| Configuração consumida | Uso |
|---|---|
| NODE_ENV | development ou test |
| PORT | API local, padrão3000 |
| DATABASE_URL | Principal; neste PC localhost:5432/bible_db?schema=app |
| TEST_DATABASE_URL | Somente teste;127.0.0.1:55433/biblia_test?schema=app/rolebiblia_test |
| jwtSecret | Chave local >=32bytes para JWT; sem chave as rotas privadas recusam autenticação |
| BIBLE_AI_HOME | Diretório absoluto privado do runtime/modelos admitidos, fora Git/OneDrive |
| BIBLE_AI_DATABASE_URL | Índice real em127.0.0.1:55436/bible_ai?schema=ai/rolebible_ai_owner |

Passwords de URL exigem codificação. DATABASE_URL é a fonte da ligação, não interpolação dos campos auxiliares POSTGRES_*. GOOGLE_CLIENT_ID não habilita OAuth. BIBLE_DEV_DB_PASSWORD/BIBLE_TEST_DB_PASSWORD pertencem ao Compose, não mudam passwords de volumes já criados. [Configuração e fusos dos bancos](../docs/operations/environments.md).

## Arranque e uso

```powershell
npm start
```

Servidor em `http://127.0.0.1:3000`; `GET /health/live` verifica processo e `GET /health/ready` verifica conexão principal. Readiness não certifica corpus, migrações ou modelos. Swagger em `/docs/`, contrato em `/openapi.json`. Ctrl+C encerra HTTP e conexões próprias. Configuração inválida produz diagnóstico sanitizado.

Em outro terminal local, o operador pode emitir token:

```powershell
npm run auth:token -- local-owner
```

Usar o resultado apenas em `Authorization: Bearer <token>`. É saída deliberada do operador: não enviar ao chat/Git/log. HS256/issuerbiblia-local/audiencebiblia-backend/validade1h; owner é o subject. Rotação de jwtSecret e reinício invalidam tokens anteriores. Não existe emissão pública por username.

API inclui leitura/pesquisa do cânone e fontes, criação/versões de estudos, análises e conversas privadas, relações com evidências, notas CAS, favoritos por versão e histórico paginado. Contratos específicos no OpenAPI e nas [specs de sprints](../docs/sprints/README.md). Owner alheio404; token inválido401; conflitos CAS409; falha técnica503. Não confundir insuficiência de evidência com indisponibilidade técnica.

## Dados e IA

Principal: Bíblia Livre/porbr2018 integral66/1189/31102, fontes operacionais e nove migrações. Preparação canónica `python scripts/prepare-canon.py` usa admissão em `admissions/biblical-canon/porbr2018/manifest.json`, ZIP/XML/aviso/catálogo autenticados em `data/`; não depende de fixtures. Ausência/adulteração impede preparação. Test/fixtures permanece exclusivamente para testes.

Importações operacionais guardadas: `npm run db:import:sources:dev`, `npm run db:import:ai:dev`, indexação `npm run ai:index:dev`; consultar pré-requisitos/argumentos em [IA local](../docs/integrations/local-ai.md) e admissões. Não reprovisionar dados existentes para arrancar. Migrações próprias: `npm run db:migrate:dev` e `npm run db:migrate:ai:dev`, somente após backup/identidade/plano.

Perfil local-extractive-v1/source-sentence-selection-v6, Qwen3-1.7B Q4_K_M/embedding0.6B Q8_0/1024dimensões, runtime pinado9ff0d7e90. Uma operação por lease, dois threads CPU/contexto2048/output128. Quatro parágrafos da mesma obra Josefo/Whiston; uma frase inglesa com atribuição e limitações, sem consenso histórico presumido. Sem runtime/índice, nova geração503; leitura e eliminação de dados já persistidos não executam modelos. Não executar modelos junto de suites locais pesadas.

Avaliações reais existentes: `npm run ai:evaluate:local`, `npm run ai:evaluate:conversations`; provas `npm run ai:verify:rag` e `npm run ai:verify:conversations`. Guardam brutos antes de cleanup e exigem revisão semântica separada; não repetir casos já aceites sem motivo. [Resultados S05](../docs/sprints/S05/T007_COMPLETION_REPORT.md), [S06](../docs/sprints/S06/T007_COMPLETION_REPORT.md) e [S08](../docs/sprints/S08/TEST_REPORT.md).

## Verificação

Teste usa PostgreSQL independente; confirmar biblia_test/rolebiblia_test/porta55433 antes de operações. Apenas o serviço de teste do Compose é necessário:

```powershell
docker compose up -d --wait postgres-test
npm run db:migrate:test
npm run typecheck
npm run lint
npm run build
npm run test:tooling
npm run test:coverage
npm run test:mutation
npm run test:mutation:ai-gate
```

Também existem test:unit/integration/e2e/architecture. Integrações e mutação exigem originais autenticados/migrações, não dados históricos inventados. Não correr suites destrutivas simultâneas na mesma base. Nomes reais dos serviços no [Compose](compose.yaml). Nunca usar limpeza de volumes para limpar testes nem parar serviços de outros projetos.

Limites: linhas>=90%, branches>=85%, mutação bruta>85%global/IA, zeroRuntimeError/NoCoverage. CI usa seis partições e agregação de inventário/assinaturas. Incremental só reutiliza evidência compatível e não dispensa gate completo da revisão. Reports/dist/generated/node_modules/dados e segredos ficam fora Git. [Política de mutação](../docs/quality/mutation-testing.md).

## Operação

[Runbooks](../docs/operations/runbooks.md) incluem backup/restauro real, fusos obrigatórios, falhas503 e conservação de evidências. Backups privados fora Git/OneDrive; não restaurar por cima de bible_db/bible_ai nem do banco de testes. A prova S08 usou um container próprio descartável e verificou HTTP/constraints/vetores, com dados anteriores intactos. Release é pessoal local; publicação remota/OAuth/frontend requerem escopo próprio.
