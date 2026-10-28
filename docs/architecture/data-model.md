# Modelo de dados

Decisão2026-10-28/S06-T004: [modelo/consistência S06](../sprints/S06/SPEC.md) aceite antes de código: ai-assistant terá ai_conversation (documento JSONB imutável até20turnos+contador CAS), ligado a análises do mesmo módulo por identidade pública, sem FK/SQL para study/source-library. Migração futura aditiva somente T006 após domínio T005; nada aplicado nesta decisão.

Fecho S04 verificado2026-10-26: modelo/persistência descritos abaixo implementados, sem nova alteração de schema nesta revisão.907 testes/CI40338249693/Prisma/PostgreSQL reais, rollback/owner/versionamento e gates atuais aprovados no [relatório S04](../sprints/S04/TEST_REPORT.md). S04 DONE; o modelo futuro de IA/conversas/workspace continua dependente dos seus contratos. Notas seguintes históricas.

Estado vigente S04-T0062026-10-22: migração aditiva202610220002 aplicada e verificada em PostgreSQL17.11 de teste e16.14/bible_db do PC, cinco migrações totais. source-library possui também source_library_passage_link (FK só para o próprio excerto, intervalo/edição/código canónico sem FK externa, índice de seleção); study possui study_record e study_version, owner privado, UUID, JSONB objeto, versão BigInt positiva segura, PK estudo/número, índice owner/data/id e cascade somente dentro do módulo. Transações de criação/revisão e controlo otimista/rollback verificados com PostgreSQL real. Modelo/limites na [SPEC S04](../sprints/S04/SPEC.md), provas no [relatório](../sprints/S04/TEST_REPORT.md). Cânone66/1189/31102 preservado; fonte operacional uma obra/quatro parágrafos e uma associação curada. Gates finais S04 pendentes; notas seguintes históricas.

Atualização2026-10-22: o complemento S02 implementa app.canon_translation/book/chapter/verse com chaves compostas, relações e constraints da SPEC. Migração/importação integral e consultas reais verificadas em teste PostgreSQL17 e desenvolvimento PostgreSQL16.14;66/1189/31102 e todos os textos confrontados com snapshot autenticado. Gates finais em curso, sem afirmar encerramento antes da mutação/revisão. Source-library continua proprietário das suas duas tabelas, sem acesso SQL cruzado. Os estados de preparação abaixo são históricos; detalhes canónicos em [S02](../sprints/S02/SPEC.md) e [relatório](../sprints/S02/TEST_REPORT.md).

Estado: mapa conceptual para os restantes módulos; responsabilidades consolidadas em S00 por ADR-0003. Modelo lógico das quatro tabelas biblical-canon aprovado na SPEC v0.2 S02; transposição Prisma/migração ainda não implementada.
As designações abaixo não são contratos de persistência.

Histórico da preparação S02-T004, proposta v0.2 de 2026-10-21: a [SPEC S02](../sprints/S02/SPEC.md) concretiza quatro tabelas propostas de propriedade biblical-canon, chaves/relações/constraints, metadados de proveniência e transação/idempotência de importação. Não há schema/migração de negócio aprovado ou implementado; o namespace técnico da S01 já existe. Campos propostos permanecem na SPEC para revisão antes de transposição para Prisma.
Aceite posterior: o «ok» do utilizador aprovou a SPEC v0.2/recorte e plano T005. Domain/referências puros foram implementados; transposição física das tabelas/migrações/casos de aplicação só na T006 com plano detalhado aprovado. Nada nesta implementação de entidades comprova persistência de negócio; o corpo conceptual abaixo permanece para os restantes módulos.

## Conceitos a modelar

S03 SPEC v0.1 e refinamento T006 aprovados: Prisma/migrações implementam app.source_library_source e app.source_library_excerpt, com PK/FK, unicidade de locator/ordem por fonte, checks de campos/digests/permissions. Ordem bigint limitada a inteiro positivo seguro; retrievedAt texto preserva precisão original. Permissões JSON têm seis chaves/estados estritos, incluindo rejeição SQL de null por migração corretiva. Fonte/excertos entram numa transação com lock por identidade e idempotência id/hash. Pesquisa lexical calculada só após autorização, sem GIN persistente. Aplicado/verificado apenas em biblia_test; sem FK/acesso direto a tabelas biblical-canon ou associação bíblica validada. Critérios e provas em S03-T006/TEST_REPORT.
| Conceito | Necessidade de produto | Restrições a esclarecer |
|---|---|---|
| Passagem e versão | Localizar o texto estudado | Cânone, versificação, direitos e identificação |
| Estudo | Reunir análise e limitações | Ciclo de vida, critérios de completude e falhas parciais |
| Afirmação e evidência | Relacionar conclusão e suporte | Distinção entre referência válida e suporte efetivo |
| Fonte e localização | Verificar o material utilizado | Proveniência, edição, licença e disponibilidade |
| Interpretação | Representar leituras divergentes | Rótulos, fundamento e incerteza |
| Pergunta e resposta | Continuar uma investigação | Associação ao estudo e proveniência das novas respostas |
| Histórico | Recuperar estudos anteriores | Identidade, acesso, retenção e eliminação |

## Invariantes de domínio a detalhar nas specs
- Uma referência apresentada como validada deve ter verificação rastreável.
- Evidência recuperada e texto gerado devem permanecer distinguíveis.
- Falta de fontes deve poder ser representada sem inventar suporte.
- Consulta de histórico não deve regenerar respostas silenciosamente.
- Condições de utilização das fontes devem acompanhar decisões de armazenamento e apresentação.

## Aprovação do modelo lógico e físico
Antes de criar Prisma, documentar entidades, atributos justificados, identificadores, cardinalidades, nulabilidade, integridade referencial, transações, índices, retenção e migração/recuperação.
Relacionar cada escolha com a spec e os testes necessários. Rever [histórico](../specs/study-history.md), [fontes](../specs/source-retrieval.md) e [autenticação](../integrations/auth.md).

Cada migração futura deve atualizar este documento e ter execução real num PostgreSQL isolado. Não tratar esta descrição como schema implementado.

## Propriedade modular consolidada
biblical-canon: Book/Chapter/Verse/Translation e referência; source-library: Source/SourceExcerpt e direitos/proveniência; study: Study/StudySection/Interpretation/Evidence/versionamento; cross-references: ligações justificadas entre passagens; ai-assistant: conversas/mensagens e orquestração; study-workspace: notas/favoritos e recuperação de estudos/sessões.
Identidades, cardinalidades, campos e limites transacionais permanecem por especificar. Workspace referencia estudo por contrato e não duplica a propriedade do estudo; conversa não equivale à versão do estudo.
Não criar schema de negócio na S01 para aparentar persistência real. A prova técnica de persistência terá contrato próprio e dados controlados, sem textos bíblicos/históricos fictícios.
