# S03 — Plano refinado da Biblioteca de Fontes

Estado vigente: T004–T007 DONE tecnicamente após os aceites e gates aplicáveis. [T006](tasks/S03-T006-integration.md) implementa biblioteca independente real, com refinamento aprovado sem GIN persistente; [T007](tasks/S03-T007-verification.md), aprovada pelo «aprovado» posterior, concluiu revisão integrada/CI local/configuração. Resultado440 testes/mutação99,09% no TEST_REPORT. Sprint DONE; encerramento/commit aprovados pelo «pode usar», após o relatório/revisão final e a pergunta obrigatória de fechamento. Hash será registado após criação. O pacote de proposta abaixo preserva o histórico anterior à execução.

Data:2026-10-21. Preparação autorizada por «se terminou pode finalizar e ir para a proxima», após S02 encerrada com escopo reduzido e commitada em c0c24b9; hash registado em ee55c4e. Estado vigente: APROVADO pelo «vai enfrente» quanto a escopo/SPEC/planos T004/T005; sprint IN_PROGRESS, T004/T005 DONE tecnicamente, integração T006/T007 pendente. Texto de proposta abaixo preserva o pacote revisto. Commit S03 PENDING, sem push/merge.

## Objetivo, recorte e dependências

Tornar fontes/excertos autênticos recuperáveis e citáveis com origem/localização/permissões/cobertura verificáveis. Proposta detalhada na [SPEC v0.1](SPEC.md): um capítulo de uma obra/edição inicial, catálogo/leitura e pesquisa textual PostgreSQL. Josefo/Whiston, Project Gutenberg2848, capítulo inicial admitido após aceite: artefacto/condições/hashes/fixture reais em backend/test/fixtures/source-library/josephus-antiquities-pg2848-en. Sem pesquisa/API de fonte implementada ainda.

Dependências existentes: Nest12/TS6 strict/Node24, Prisma7/PG17 real isolado, Zod/OpenAPI/Jest/Supertest/Stryker10, guard e arquitetura S01. Não há dependência/serviço novo ou IA. S02-T006/T007 permanecem adiadas: não existe contrato executável de existência de passagem para associar fonte-passagem com validação real. Proposta explícita: adiar essa associação e trabalhar na biblioteca independente; não reativar as tarefas bíblicas sem pedido.

SR-001 original continua rascunho, preservada. SPEC operacionaliza recuperação determinística e deixa suporte semântico de afirmação para S04/S05. Direitos por ingest/store/index/display/quote/sendToAi separados; acesso público não concede todas as operações.

## Tarefas e ordem

| Tarefa | Escopo proposto e saída verificável |
|---|---|
| S03-T004 | Aprovar SPEC/recorte/curadoria; verificar/admitir artefacto e condições por operação; manifesto/hash/cobertura/fixture autêntica, EXT-004 resolvida só para usos realmente demonstrados |
| S03-T005 | Domain puro Source/SourceExcerpt/invariantes/elegibilidade por permissão, TDD e gates. Componente histórica de associações fonte-passagem adiada explicitamente; sem Application/ports vazios/ORM/HTTP |
| S03-T006 | Application/ports específicos e adapters reais, duas tabelas/migração/ingestão atómica/idempotente, pesquisa nativa/contagens e três contratos HTTP. Plano detalhado próprio antes de código |
| S03-T007 | Prova integrada de contratos, origem/localização/fidelidade/cobertura/direitos; estática/build/arquitetura/cobertura/mutação e revisão/documentação. Plano detalhado próprio |

Fichas T004/T005 preparadas para aprovação concreta; não há implementação autorizada por inferência. Uma tarefa por vez, sem agentes paralelos. Ficheiros imediatos apenas docs/sprints/S03 e fontes documentais afetadas. Após aprovação/admissão: backend/src/modules/source-library/domain e test/unit/source-library; T006 só quando o seu plano estiver revisto/aprovado. Raw fora do Git, excertos/licenças de teste versionáveis após admissão; fixtures não alimentam produção.

## Alternativas, vantagens e custos

| Opção | Vantagem | Custo/limite |
|---|---|---|
| Biblioteca independente e um capítulo real (proposta) | Avança módulo de fontes sem reabrir S02, reduz matriz de direitos/extração para primeira prova | Sem ligação validada a passagens; cobertura deliberadamente pequena, deve ficar visível |
| Retomar S02-T006 antes de S03 | Permitiria validar existência na edição nas associações | Executaria trabalho que o utilizador pediu para adicionar depois; exige novo pedido/planeamento |
| Obra/corpus mais amplo ou várias edições | Amplia cobertura | Mais curadoria/direitos/numeração/fixtures; mudança de escopo antes de incorporar |
| Fonte moderna OpenStax | Alternativa com condições declaradas e contexto secundário | Condições atuais não tornam uso em IA livre; não incorporar por inferência |
| Pesquisa PostgreSQL nativa | Stack existente, consultas reais e ordenação verificáveis | Busca lexical inglesa inicial não prova suporte, consenso ou relevância semântica |

## Riscos e mitigação

Direitos/edição/formato divergentes: conferir aviso do artefacto/condições antes de copiar, interromper admissão se necessário; EXT-004 mantém obrigação de prova. Testemunho antigo/tradução não são verdade histórica automática; classificar, preservar limitações e texto, sem conclusão gerada.

Ligação bíblica indisponível: adiar explicitamente, sem parser sintático apresentado como validação de existência ou tabelas alheias. Português versus corpus inglês: idioma visível, sem tradução gerada ou stemming português presumido. Fonte única: cobertura real declarada, zero resultados não é prova de falsidade.

Indexação/permissão: testar bloqueio em ingestão/consulta/resultados; não vazar texto em erro/log. Importação parcial: manifesto/hash, constraints e transação/rollback/repetição reais. Limpeza: só teste guardado, sem dev/produção. Stryker: paths cache/relatório separados, um runner sobre banco partilhado, preservar denominador/analisar sobreviventes.

## Aceitação e validação

[Critérios](ACCEPTANCE_CRITERIA.md): fidelidade da fixture/origem/localização; invariantes/permissions; importação/pesquisa reais; contratos HTTP e cobertura explícita, sem aceite de suporte semântico automático. T004/T005 têm planos RGR próprios e a implementação depende da sua aprovação/admissão.

Scripts reais em backend/package.json: test:unit, test:integration, test:e2e, test:coverage, test:tooling/test:architecture, typecheck, lint, build, prisma:generate, db:migrate:test e test:mutation ou test:mutation:incremental. Zero falhas obrigatórias; linhas>=90%, branches>=85%, score bruto>85% com todo src próprio, compatibilidade Stryker/Jest comprovada novamente na execução. Integração real, nunca aprovação por doubles.

Preparação atual é documental: TDD/software gates não aplicáveis sem código/ambiente alterado; executar links/estados/coerência/diff, registar em TEST_REPORT. Nenhum score S03 medido. IA não aplicável à sprint; pesquisa/citação não assegura suporte semântico. Não executar suites já aprovadas só para atribuir números S02 à S03.

## Histórico do pacote apresentado e aprovação recebida

O utilizador aprovou escopo/recorte acima, SPEC v0.1 e planos/dependências concretos T004/T005 pelo «vai enfrente». Não repetir esta aprovação; futuros planos T006/T007 continuam próprios. Isto inclui verificar/admitir candidata/usos antes de código e adiar associações por dependência S02 ausente. Alternativa de edição/obra/associações altera impacto e exige atualização explícita. T006/T007 terão plano próprio; encerramento/commit/push/merge S03 não estão autorizados por este refinamento.
