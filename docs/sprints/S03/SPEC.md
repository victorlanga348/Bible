# S03 — Proposta concreta de biblioteca de fontes v0.1

Estado vigente: v0.1 e adenda física T006 aprovadas pelos aceites de2026-10-21. T004–T007 DONE tecnicamente: ingestão/transações/pesquisa e três contratos HTTP reais, revisão integrada/CI local, sem GIN persistente, IA ou associação bíblica. T007 aprovada pelo «aprovado» posterior; sprint DONE, encerramento/commit aprovados pelo «pode usar» após revisão final. Nenhum contrato/comportamento novo em T007. A redação de proposta e referências à ausência de implementação abaixo preservam o histórico, sem invalidar os aceites posteriores.

Aceite em2026-10-21: «vai enfrente», em resposta ao pacote concreto de escopo/SPEC/planos T004/T005. Esses contratos/recorte e planos estão APROVADOS, incluindo associação bíblica adiada e distinção entre recuperação e suporte. Autoriza verificação/admissão de T004 e depois Domain T005 por TDD; não autoriza commit/encerramento S03, T006 detalhada, push ou merge. A redação de proposta a seguir preserva o pacote revisto; a verificação do artefacto e os testes precisam de provas próprias.

Data:2026-10-21. Estado: APROVADA v0.1 pelo «vai enfrente»; texto original de proposta preservado como histórico de decisão. Pedido «se terminou pode finalizar e ir para a proxima» autoriza preparar a S03 após commit S02, não estes novos contratos por inferência. Principal S02 c0c24b9, registo ee55c4e. Na preparação inicial não havia conteúdo/fixture/código. Após aceite T004 admitiu capítulo/fixture reais e T005 implementou Domain com gates; Application/DB/pesquisa/HTTP continuam não implementados. Nenhuma dependência instalada.

## Resultado, recorte e impacto da S02 reduzida

Biblioteca local de fontes/excertos autênticos, localizáveis e autorizados por operação; catálogo, leitura e pesquisa textual PostgreSQL, com cobertura/limitações explícitas. Source e SourceExcerpt pertencem exclusivamente a source-library. Sem IA, embeddings, pgvector, frontend, serviços externos adicionais, edição histórica ou conclusão automática sobre veracidade/suporte.

Proposta de recorte a aprovar: primeiro uma obra/edição em inglês e um capítulo curado, para provar ingestão/leitura/pesquisa reais com alcance declarado. Ampliar conteúdo exige admissão própria, não equivalência presumida. A biblioteca não será apresentada como acervo completo da Bíblia ou consenso académico.

S02-T006/T007 foram adiadas pelo utilizador. Por isso, ligação validada fonte-passagem fica também fora desta proposta de implementação S03 até haver contrato executável de existência do biblical-canon. Não criar associação só sintática com rótulo de validada, ler tabelas alheias ou implementar silenciosamente as tarefas adiadas. Título histórico T005 inclui associações, mas esta componente fica expressamente diferida para futura aprovação. Alternativa: retomar primeiro S02-T006; não adotada automaticamente. Esta redução e o seu impacto fazem parte do aceite solicitado.

## Curadoria e corpus candidato

Candidata recomendada para verificação/admissão posterior ao aceite: *Antiquities of the Jews*, Flavius Josephus, tradução inglesa William Whiston, distribuição Project Gutenberg #2848. O [registo oficial](https://www.gutenberg.org/ebooks/2848) identifica obra/autor/tradutor/idioma. O [texto publicado](https://www.gutenberg.org/files/2848/2848-h/2848-h.htm) fornece estrutura livro/capítulo e parágrafos numerados. Propor primeiro Livro I, capítulo1, texto principal; sem notas, imagens ou conteúdo agregado de outras edições. Não atribuir ano de composição/edição, autoria indiscutível ou cobertura histórica sem evidência própria.

O distribuidor declara domínio público nos EUA; as [condições](https://www.gutenberg.org/policy/terms_of_use.html) não garantem situação fora dos EUA e remetem para licença/permissões. Isto é evidência de candidatura, não aprovação universal de usos. Antes de copiar/indexar/reproduzir: conferir aviso do artefacto, condições por operação e aplicabilidade ao uso local aprovado. Direitos incertos mantêm a operação pendente e impedem a incorporação afetada; não fabricar autorização ou chaves. Usar acesso pontual/formato autorizado, respeitando condições e mirrors indicados, sem crawling em massa. Nenhuma transferência a fornecedor IA nesta sprint.

Alternativa investigada: OpenStax, *World History Volume1, to1500*, secção4.4. O [prefácio oficial](https://openstax.org/books/world-history-volume-1/pages/preface) declara CC BY-NC-SA4.0 e autorização escrita prévia para incorporação em ofertas de IA. Não propor como corpus automaticamente elegível para futuro RAG. Mantém-se candidata alternativa, sem admissão/download/fixture; escolha de obra moderna versus testemunho antigo exige curadoria, não substituição silenciosa.

Admissão T004: obter bytes e aviso somente após aceite; registar URL/data/SHA-256 reais, edição/limitações e inventário de localizações; preservar raw ignorado separado da fixture versionável de teste. Fixture autêntica deve permitir confrontar cada texto/localização com snapshot. Sem hash, contagem de parágrafos ou texto inventados nesta proposta. Divergência de fonte/licença/estrutura interrompe a admissão para esclarecimento.

## Dados e invariantes propostos

Admissão T004 executada após aceite: HTML oficial SHA098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99, quatro parágrafos reais de Livro I capítulo1, origem/aviso/licença/hashes/extração e revisão de usos locais em backend/test/fixtures/source-library/josephus-antiquities-pg2848-en/README.md e manifest.json. Matriz ingest/store/index/display/quote allowed no recorte; sendToAi pending. Conteúdo completo fica ignorado; fixture só de teste. Não é prova de persistência/pesquisa S03.

| Conceito/DTO | Campos propostos e motivo |
|---|---|
| Source / SourceView | id: identidade ASCII minúscula com números/hífen; title, author, translator (null se não identificado), language, edition: identificar obra/edição; kind: historical-work, modern-study ou commentary, classificação editorial sem garantia de verdade; originUrl, snapshotSha256, retrievedAt: proveniência real; rightsStatement, rightsUrl, attribution: condições/créditos; permissions: matriz abaixo; limitations: texto não vazio sobre alcance e perspetiva |
| SourceExcerpt / ExcerptView | id, sourceId: identidade e pertença; locator: localização canónica verificável no snapshot; order: posição positiva segura de extração; text: conteúdo exato extraído; textSha256: identidade do texto UTF-8; originUrl: link para revisão quando disponível. Sem referências bíblicas implicitamente validadas |
| CoverageView | sourceId, excerptCount, limitations: contagem real derivada e alcance declarado; resultado vazio não afirma falsidade histórica |

Campos obrigatórios não vazios, URLs absolutas válidas, data válida e SHA-25664hex. Números positivos seguros. id imutável identifica edição/snapshot, não apenas a obra abstrata. SourceExcerpt exige Source existente na Application, locator único por sourceId e order único; texto não vazio e hash igual aos bytes UTF-8 extraídos. Domain valida estrutura/invariantes sem filesystem/Prisma/Zod/Nest/ambiente; Infrastructure prova fidelidade ao artefacto.

permissions tem chaves ingest, store, index, display, quote, sendToAi; valores allowed, pending ou denied, com base documental no rightsStatement/rightsUrl e revisão T004. Não inferir permissão de uma operação pela outra. Importar exige ingest/store allowed; pesquisar exige index allowed; leitura/pesquisa não devolvem texto sem display/quote allowed; sendToAi não é utilizado nesta sprint e não será marcado allowed por ausência de uso. Não tratar consulta como validação jurídica automática.

Locator inicial proposto: book-1/chapter-1/paragraph-N, a partir da numeração real do artefacto verificado, não números de linhas do navegador. Preservar o texto principal; transformação HTML→texto e exclusão de notas devem ter regra/artefacto/alterações declaradas e comparação reproduzível antes de admissão. Sem tradução automática, remoção editorial de termos ou parágrafos sintetizados.

## Leitura, pesquisa e erros propostos

| Operação proposta | Entrada | Saída200 |
|---|---|---|
| GET /sources | Sem query | {sources: SourceView[]}, id ascendente; só fontes admitidas para leitura. Vazio é cobertura zero, falha de DB não vira vazio |
| GET /sources/:sourceId/excerpts | q opcional; limit opcional20,1..50; offset opcional0, inteiro>=0 | {excerpts: ExcerptView[], limit, offset, hasMore, coverage: CoverageView} |
| GET /source-excerpts/:excerptId | Sem query | {excerpt: ExcerptView, source: SourceView} |

Transporte estrito Zod, entradas/saídas/OpenAPI coerentes; parâmetros extra recusados. q presente: texto aparado não vazio, até200 caracteres, sem linguagem SQL/operadores próprios; limite justificado por custo de transporte, não regra histórica. q ausente lista por order/id; q presente usa plainto_tsquery('english',q), to_tsvector('english',text), rank descendente/order/id para empates. Não expandir idiomas ou alegar relevância semântica. hasMore calculado por registo adicional, sem limite oculto ou contagem inventada.

Reusar envelope S01 error{code,message}: sintaxe inválida400 VALIDATION_ERROR/Entrada inválida; fonte/excerto bem formado ausente404 NOT_FOUND/Recurso não encontrado; permissão negada/pendente403 FORBIDDEN/Operação não autorizada; falha inesperada500 INTERNAL_ERROR/Erro interno. O403 de negócio é nova semântica proposta no limite deste módulo; não mudar silenciosamente o comportamento técnico S01 que sanitiza HttpException inesperada para500. Plano detalhado T006 definirá mapeamento específico com regressão dos endpoints técnicos antes de implementar.

Nenhuma escrita ou importação HTTP pública. Fonte restrita não vaza texto em erro, log ou resultado de pesquisa. Registos podem existir internamente para auditoria de curadoria, mas acesso não autorizado não se converte em ausência de evidência histórica. Sem caches/HTTP externo durante a pesquisa: PostgreSQL local real contém apenas conteúdo previamente admitido.

## Persistência e ingestão propostas para T006

Duas tabelas em app: source_library_source (PK id, campos/metadados/direitos de Source) e source_library_excerpt (PK id, FK sourceId, UNIQUE sourceId/locator e sourceId/order, text/hash/URL). permissions em JSON validado pela fronteira do módulo; checks de IDs/texto/positividade relevantes na migração. Índice textual PostgreSQL GIN da expressão da pesquisa, justificado pela consulta; sem pgvector/Redis/filas.

Importador local explícito, manifesto+hashes+conteúdo+direitos validados antes da transação. Um snapshot por transação; id/hash iguais no-op, id com hash diferente conflito sem substituição, duplicação/localização inválida/falha parcial rollback integral. Não executar scripts/SQL recebidos. Testes só na base isolada guardada S01; alvo dev/produção e ingestão de uso exigem plano próprio. Fixture de teste não vira acervo de produção.

## Relação com SR-001 e aceitação

### Adenda física T006 — aprovada posteriormente

Aceite posterior em2026-10-21: «vai enfrente» aprova a adenda/plano T006. Refinamento físico vigente: pesquisa calculada sobre fonte autorizada, sem GIN persistente neste recorte. Contratos/DTOs/ordenação/permissions v0.1 preservados; próxima execução deve provar migração/importação/pesquisa/HTTP reais. Texto de proposta abaixo é histórico da decisão.

O plano T006 identifica tensão entre o GIN automático sobre text proposto acima e a permissão de armazenar conteúdo com index pending/denied. Propõe adiar GIN persistente no recorte de4 excertos e calcular pesquisa lexical somente para fonte previamente autorizada, mantendo operações/ranking/DTOs. Alternativa: vetor derivado condicionado com ciclo transacional de direitos. Requer aceite explícito do refinamento/plano antes de implementação; a aprovação v0.1 não foi silenciosamente alterada. Domain T005 não depende desse detalhe físico.

[SR-001 v0.1](../../specs/source-retrieval.md) permanece rascunho preservado, não globalmente aprovado/implementado por esta proposta. S03 propõe operacionalizar SR-AC01/02/03/04/06/07/08 na leitura/recuperação determinística: origem/localização, bloqueio por direitos, cobertura, distinção de erro e dados não confiáveis. SR-AC05 (se o texto sustenta uma afirmação) requer revisão/avaliação semântica própria em S04/S05; encontrar palavras não passa esse critério. Este limite está incluído na aprovação solicitada e não será ocultado por métricas de software.

Critérios concretos em ACCEPTANCE_CRITERIA e planos T004/T005. T004 admite corpus/usos/fixture e fecha contratos antes de código; T005 Domain puro, com RED/GREEN/refactor; T006 Application/adapters/Prisma/HTTP reais; T007 avaliação integrada/gates/relatório. Planos detalhados posteriores próprios, uma tarefa por vez. Cobertura>=90% linhas/>=85% branches, mutação bruta>85%, zero falhas obrigatórias e fiscalização de fronteiras. Fonte/serviço obrigatório ausente é BLOCKED.
