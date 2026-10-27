# IA local — operação em implementação

Estado2026-10-27: S05-T006 IN_PROGRESS. Provider T005 já tem prova real própria; índice/recuperação/HTTP integrado e catorze avaliações do produto continuam pendentes. Não interpretar configurações/migrações como disponibilidade da funcionalidade. [SPEC](../sprints/S05/SPEC.md), [plano concreto](../sprints/S05/tasks/S05-T006-rag-persistence-http.md), [admissão](../sprints/S05/DATA_ADMISSION.md), [provas](../sprints/S05/TEST_REPORT.md).

## Bancos, configuração e limites

Banco principal continua PostgreSQL16.14/bible_db, schema app e cliente Prisma primário; somente ai-assistant é proprietário da tabela aditiva app.ai_analysis. Sem FK/consulta para tabelas study/source/canon nesse repositório. Snapshot guarda pergunta/decisão/referências/digests/offsets/proveniência/limitações, nunca quote, texto de fonte, prompt bruto, resposta bruta ou vetor da pergunta. Owner vem do JWT, não do pedido.

Índice de desenvolvimento independente: PostgreSQL17.11/pgvector0.8.7, bible_ai/bible_ai_owner, schema ai, loopback55436, container próprio biblia-ai-index-development e volume persistente biblia-ai-index-development-v1. Não instalar extensões/DLLs nem alterar ACL do PostgreSQL16. Migration ai cria embedding_profile/source_chunk e extensão no seu banco; FK só interna, vector1024/norma1±0,0001, sem índice ANN. Busca exata por cosseno segue operadores/funções da [documentação oficial pgvector0.8.7](https://github.com/pgvector/pgvector/blob/v0.8.7/README.md). Cliente próprio gerado em src/generated/prisma-ai, pool2/query5s/statement2s; cliente app conserva pool5. Modelos jamais executam em paralelo com suites pesadas neste PC8GB.

Teste/CI: servidor descartável biblia_test/biblia_test em imagem imutável pgvector0.8.7-pg17-bookworm SHA256ac08538c6f8b9904c33c8224c5e5706dbe760aca29db1d096972b4052c22a75d. app e ai são schemas/clientes/migrations distintos nesse servidor de teste, sem dispensar os dois bancos reais em desenvolvimento. URL ai de teste é derivada somente após assertTestTarget e troca exclusivamente schema=app por schema=ai; BIBLE_AI_DATABASE_URL de desenvolvimento nunca decide o alvo de teste. Limpeza só em alvo identificado e tabelas próprias; lock de integração/mutação existente continua ativo.

BIBLE_AI_HOME opcional é caminho absoluto confiável para runtime/modelos/key fora do Git; BIBLE_AI_DATABASE_URL opcional usa exclusivamente a identidade/porta/schema de desenvolvimento acima. Não fornecer esses campos via HTTP, não guardar chaves em argumentos/logs. Ausência de configuração não carrega modelos implicitamente. Home relativo/ambíguo, URI remota, identidade codificada, schema/porta errados, fragmentos ou opções adicionais de routing são rejeitados. NODE_ENV test força o índice ao biblia_test já protegido. Credenciais reais já provisionadas permanecem nos ficheiros ignorados existentes; não pedir/criar segredos no chat.

## Comandos existentes

- `npm run prisma:generate`: gera ambos clientes a partir de schemas distintos, sem contactar banco.
- `npm run db:migrate:test`: build, identidade real do biblia_test, seis migrações app e migration ai via script protegido. Serviço próprio de teste deve estar disponível, com extensão da imagem pinada.
- `npm run db:migrate:ai:test`: apenas a migration ai no alvo de teste derivado e identificado.
- `npm run db:migrate:ai:dev`: apenas a migration ai, exigindo configuração real confiável e conferindo db/role/PG17.11/extensão0.8.7 antes de migrar. Não migra bible_db.
- `npm run ai:verify:local`: prova isolada real do provider T005; não é percurso RAG/DB/API ou as14 avaliações do produto.

Não existe ainda comando npm de indexação/importação AI nem endpoint de produto concluído. Eles serão acrescentados só depois de testes reais. Preparação de dados reproduzível: executar prepare-ai-sources.py com propósito local-ai/test-ai, HTML/TXT originais e diretório explícitos conforme READMEs das admissões. Guardas de propósito impedem promoção da fixture a desenvolvimento; fonte legacy continua sendToAi pending.

## Evidência de preservação

2026-10-27T10:05:15.100Z: migration ai aplicada ao banco independente de desenvolvimento; identidade bible_ai/bible_ai_owner/170011/extensão0.8.7, uma migration/zero profiles/zero chunks. Configuração real foi injetada em memória a partir do ficheiro próprio fora do Git. Auditoria antes/depois confirmou .env byte-idêntico, banco principal160014 com cinco migrations/66 livros/1189 capítulos/31102 versículos/uma fonte/quatro excertos/uma associação/um estudo/duas versões, ainda sem app.ai_analysis. Nenhuma importação, fixture ou inferência nessa execução. Originais ignorados reports/s05-t006-ai-development-migration.log e s05-t006-ai-development-migration-proof.json. A migration app.ai_analysis só foi aplicada ao teste nesta etapa; desenvolvimento principal receberá a adição quando o percurso real da T006 estiver pronto.
