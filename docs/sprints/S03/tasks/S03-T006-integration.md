# S03-T006 — Ingestão, pesquisa e HTTP reais

Estado vigente: DONE técnico em2026-10-21, após «vai enfrente» aceitar este plano/refinamento. READY → IN_PROGRESS → REVIEW → DONE com todos os critérios/gates aplicáveis comprovados. Pesquisa calculada sem GIN persistente e dependências aprovadas; não repetir o aceite. O pacote de proposta abaixo preserva o histórico. Encerramento/commit S03 e plano T007 continuam com aprovações próprias.

Data:2026-10-21. Trilha B, prioridade alta. Estado: BLOCKED no aceite deste plano/refinamento físico; T004/T005 DONE. Responsável proposto: agente executor, aprovador: utilizador. Plano revisável, sem implementação/migração T006 iniciada. Uma tarefa por vez; commit S03 PENDING.

## Objetivo e dependências

Persistir e recuperar o capítulo real já admitido de Josefo/Whiston, com proveniência/direitos/cobertura e os três contratos HTTP da SPEC v0.1. Application por ports próprios, Prisma/PostgreSQL e Nest/Supertest reais. Nenhuma dependência nova, IA, frontend, associação bíblica ou reativação S02-T006/T007.

Dependências satisfeitas: corpus/fixture/hashes/condições locais T004; entidades/regras T005 com RED/GREEN/gates; toolchain/guard/bases isoladas S01. Consultados ADR-0003/0004, fronteiras/gates/TDD/testes, erros ERR-0001/0002 e índices de padrões/armadilhas. Nenhuma skill especializada extra necessária para integrar esta stack já estabelecida.

## Refinamento físico proposto — precisa de aceite

A SPEC v0.1 propôs GIN de to_tsvector sobre text e, separadamente, armazenamento com ingest/store allowed mesmo se index estiver pending/denied. Um índice automático sobre todo text indexaria também essas linhas. Não implementar essa combinação sem esclarecer o desenho.

Proposta para o primeiro capítulo de4 excertos: adiar GIN persistente e calcular to_tsvector('english',text) somente na consulta de fonte autorizada para index/display/quote, usando plainto_tsquery/rank e a ordenação já aprovados. Preserva resultados/DTOs/regras, não cria vetor armazenado para conteúdo com index pendente/negado. É alteração explícita da proposta física v0.1, sujeita à aprovação deste plano antes de código, sem dispensa de direitos/integração/testes.

Vantagem: desenho simples e permissão respeitada, suficiente para4 registos. Custo: pesquisa calculada sem aceleração GIN; rever desempenho e admissão antes de ampliar o acervo. Alternativa: adicionar vetor derivado nullable e desenho transacional de atualização/revogação/permissão para indexação, com critérios próprios; mais esquema/comportamentos, não adotada automaticamente. Nenhuma alteração do Domain/DTO/gramática ou dos thresholds.

## Ficheiros e solução proposta

1. backend/prisma/schema.prisma e migração aditiva: dois modelos mapped para app.source_library_source e app.source_library_excerpt conforme SPEC. Campos de proveniência/direitos/limitações da Source; translator nullable, permissions JSON estrito do módulo; SourceExcerpt com originUrl nullable quando não disponível, locator/text/hash/order. PK/FK e UNIQUE(sourceId,locator)/(sourceId,order), checks de campos obrigatórios/hash/kind/permissions/positividade conforme contratos. order PostgreSQL bigint limitado a inteiro positivo seguro. retrievedAt conserva a representação original válida sem perder precisão do manifesto; escolher texto validado para fidelidade em vez de normalizar silenciosamente para milissegundos. Contagem derivada, sem coluna duplicada. Refinamento de GIN acima, nenhum índice especulativo adicional.
2. backend/src/modules/source-library/application/: ports específicos SourceCatalogPort (catálogo/metadados/identidade/direitos), SourceExcerptReadPort (identidade/pertença, leitura/listagem/pesquisa/contagem) e SourceImportPort (snapshot validado atómico). Tipos próprios/entidades, nunca Prisma/Nest/SQL no contrato. Casos listSources/listExcerpts/getExcerpt/importSnapshot; sem base repository genérico ou interface vazia.
3. Application filtra catálogo por canRead; valida existência/permissão antes de materializar texto para resposta. q ausente requer canRead e ordena por order/id; q presente requer canSearch, consulta lexical inglesa e rank descendente/order/id. Identidade de excerto permite apurar sourceId antes de carregar texto. Cobertura conta4 excertos realmente admitidos, não total inferido da obra; zero resultados/offset além do fim devolve vazio com limitações, sem conclusão histórica. Falha de DB continua erro, não vazio.
4. Infrastructure: adapters Prisma/queries parametrizadas, snapshot JSON preparado explicitamente dos dados admitidos (original/hashes/extrator rastreáveis, raw ignorado). Não descarregar HTML a cada pesquisa, executar SQL do fornecedor ou carregar fixture como acervo de produção. Importador local valida Source/SourceExcerpt, manifesto/hash real/cobertura/permissões e confronto com admissão antes da transação. Excertos de teste podem alimentar apenas a base de teste confirmada.
5. Uma transação por snapshot, id/hash iguais unchanged sem duplicar; id/hash diferentes conflito interno controlado, sem substituição. Duplicados/locator/ordem/permissão/hash inválidos não deixam linhas parciais. Serializar importações concorrentes da mesma fonte no adapter com lock transacional por identidade e constraints reais; comportamento importado/unchanged/conflito verificado por dois clientes reais. Sem Redis/fila/lock global em memória como prova de consistência.
6. Presentation/composição em source-library/{presentation,module.ts}, schemas Zod/OpenAPI, app.ts: as três rotas da SPEC, queries estritas q/limit/offset e envelope200/400/403/404/500. Direitos negados/pendentes403 somente no filtro específico do módulo para erro de acesso próprio; fonte/excerto ausente404. Erro inesperado delega sanitização500 existente. Não mudar o tratamento técnico S01 de HttpException403 desconhecida; regressão explícita comprova esse limite. Nenhuma importação/escrita HTTP pública.

## Alvo e limites operacionais

Só biblia_test em loopback55433, após guard/identidade S01 confirmar distinção de dev/produção. prisma:generate e db:migrate:test são scripts reais existentes. Limpeza apenas tabelas/fixtures de teste do módulo no alvo confirmado, sem remover ficheiros de fixture. Não migrar/importar dev, apagar volumes, expor serviço ou pedir segredos no chat.

Pode ser acrescentado script local db:import:sources:test para o CLI guardado, se este plano for aprovado; ainda não existe nem foi executado. Artefacto de uso completo e dados de teste permanecem separados mesmo tendo o mesmo capítulo admitido. Nenhum servidor HTTP externo de fontes é dependência do runtime local.

## Critérios e RED → GREEN → REFACTOR

| Critério | Prova real exigida |
|---|---|
| T006-AC01 | Migração/Prisma criam dois modelos em app, sem public indevido; PK/FK/unicidade/checks rejeitam estado inválido |
| T006-AC02 | Importação preserva quatro textos/locators/hashes/metadados/aviso/limitações e não publica conteúdo sem direitos |
| T006-AC03 | No-op id/hash, conflito, falha parcial, duplicados e concorrência não deixam snapshot parcial ou duplicado |
| T006-AC04 | Leitura/pesquisa PostgreSQL reais: ordem/empates/limit/offset/hasMore/cobertura, consulta sem correspondência, entradas malformadas e direitos pending/denied |
| T006-AC05 | Três contratos Nest/Supertest reais e Zod/OpenAPI coerentes, erros sanitizados e zero vazamento; falha de banco distingue-se de ausência |
| T006-AC06 | Regressão S01/S02/T005 e schema app dos modelos reais; cobertura/mutação/estática/arquitetura/docs aprovadas |

Escrever e executar testes RED por família antes do comportamento: validação/importação; persistência/transação; casos Application/consulta/permissões; transporte. Stubs compiláveis podem suportar RED, falta de tabela/cliente/serviço não é RED de regra. Migração/estrutura têm verificações executáveis próprias. GREEN mínimo, REFACTOR preservando contratos e repetindo regressão/arquitetura. Application usa adapters reais, doubles só unidades locais identificadas que não comprovam integração.

Fixtures persistentes autênticas: variações de metadados/direitos/entradas adversariais são cenários negativos explícitos, não fontes/textos históricos fictícios. Casos de direito alterado criados apenas no setup do alvo de teste para comprovar bloqueio, sem inventar permissão de uso. Não executar suites destrutivas simultâneas.

Scripts reais: test:unit, test:integration, test:e2e, test:coverage, typecheck, lint, build, test:tooling/test:architecture, test:mutation/incremental. Linhas>=90%, branches>=85%, mutação bruta>85% com todo src próprio, sem exclusões artificiais; JSON/cache separados e sobreviventes analisados. IA não aplicável. T007 fará revisão integrada própria; não substitui testes obrigatórios nesta tarefa.

## Riscos, gates e saída

Rights/indexação: refinamento físico acima precisa de aceite e testes de fontes não pesquisáveis, sem indexação automática. Fidelidade/deduplicação: confronto com hashes/fixture e transações/constraints reais. Transporte: filtro de acesso específico e regressão S01 evitam alterar semântica global. Contagem/ranking/paginação: expectativas derivadas do capítulo real, sem asserções que só espelham SQL. Logs/segredos/limpeza: sanitização/guard e alvo confirmado. Stryker: paths distintos, sem ocultar warnings ou tirar código do escopo.

Estado atual: implementação/testes T006 NOT_RUN; gates1/2/3/4/5/7 pendentes de aceite/execução, gate6 não aplicável sem IA. Aprovação solicitada deste plano e refinamento físico, não novamente da candidata/SPEC/T004/T005 já aceites. T006 DONE só após critérios/gates/report/review e docs/README/MegaBrain sincronizados. Sem autorização de encerramento/commit S03, T007 detalhada, S04, push ou merge.

## Fechamento técnico

T006-AC01–06 PASS no recorte aprovado, conforme [TEST_REPORT](../TEST_REPORT.md) e [REVIEW](../REVIEW.md): duas tabelas/constraints/migrações reais; quatro textos/proveniência/aviso/digests; idempotência/conflito/rollback/concorrência e recuperação após desconexão; pesquisa/paginação/cobertura/direitos; Nest/Supertest/Zod/OpenAPI e erros; regressão/estática/arquitetura/cobertura/mutação/documentação.

439 testes PASS; linhas100%/branches97,07%; mutação bruta99,08883826879271% (435/439), zero RuntimeError/NoCoverage. Gates1/2/3/4/5/7 PASS;6 não aplicável sem IA, NOT_RUN e nunca PASS fictício. Falhas de CHECK/null e harness/cache foram corrigidas/reavaliadas; ERR-0003–0006 registam provas e limites. Só biblia_test confirmado foi migrado/importado, nenhuma dependência nova. S02-T006/T007 e associações bíblicas continuam adiadas.

À conclusão T006, T007 tinha [plano revisável](S03-T007-verification.md) para revisão integrada e preparação do original no CI, ainda não executado; sprint IN_PROGRESS, commit PENDING. Estado posterior: o utilizador aprovou T007, agora DONE técnico e sprint REVIEW; consultar TEST_REPORT/REVIEW vigentes. Encerramento/commit continuam PENDING.
