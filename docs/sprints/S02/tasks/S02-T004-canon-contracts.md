# S02-T004 — Aprovar cânone, licenças, parser e contratos HTTP

Data: 2026-10-21. Sprint [S02](../README.md), estado BLOCKED por decisões editoriais e aprovação do refinamento/spec/contratos. Trilha A/C; prioridade alta, predecessora das implementações. Preparação: agente executor; aprovador: utilizador. Branch feat/biblia-backend, uma tarefa por vez. Commit S02 PENDING.

Atualização de conclusão: DONE em 2026-10-21 após «ok» explícito ao pacote SPEC v0.2/plano T005, obtenção/verificação do ZIP/XML/aviso e fixture real. O estado BLOCKED acima é o histórico de entrada, não o estado atual; fonte de estado TASKS. Sem commit de sprint autorizado.

## Contexto e consulta

S01 DONE e commitada em `1702cc0`; continuação S02 autorizada após commit. PRD-01/PRD-10 e PLAN-009 exigem cânone/edição antes de catálogo/parser/importação. DEC-06/09 e EXT-003 abertas; sem textos/catálogo/contratos de negócio aprovados.

Consultados: [cânone](../../../biblical-library/canon-and-versions.md), [regras](../../../product/business-rules.md), [fontes](../../../product/source-policy.md), [modelo](../../../architecture/data-model.md), [módulos](../../../architecture/bounded-contexts.md), [API](../../../integrations/api-contracts.md), ADR-0003/0004 e dependências. MegaBrain: ERR-0001 (toolchain/OneDrive/isolamento); índices de padrões/armadilhas sem registos concretos aprovados. Nenhuma skill adicional necessária para este refinamento documental de domínio; sem escolha nova de stack/deployment/UI e sem subagentes.

## Proposta, ficheiros e exclusões

Refinar PLAN/SPEC, pesquisar candidatos verificáveis, recolher escolhas editoriais e concretizar contratos/modelo/critérios para aprovação. Candidatos na SPEC, sem admissão/importação. Não criar código, schema, endpoints, fixtures bíblicas, dependências ou módulos vazios nesta preparação.

Depois do pedido «avanca», a SPEC v0.2 apresenta um pacote concreto para aceite: Bíblia Livre/porbr2018 e os 66 livros do catálogo consultado; referências USFM e intervalos no mesmo capítulo; cinco contratos REST, DTOs, erros técnicos compatíveis S01, quatro tabelas de propriedade do módulo e importação atómica/idempotente. São propostas, sem atribuição de aprovação editorial ao pedido genérico. T005 é Domain/ports, T006 recebe Application/adapters reais para manter as dependências executáveis. Impacto e alternativas no PLAN; aprovação explícita pendente, sem implementação.

Ficheiros: PLAN/SPEC/TASKS/ACCEPTANCE_CRITERIA/TEST_REPORT/REVIEW S02, esta ficha, canon-and-versions, EXT-003, índices/roadmap/README e contexto operacional. Campos/assinaturas/rotas e ficheiros de código serão concretizados após escolhas, antes de aprovação/execução; esta lista não os aprova.

## Alternativas e efeitos

Um cânone/uma edição inicialmente reduz a matriz de importação/referência/texto, mas adia cobertura adicional que deve ser explícita. Vários cânones/edições ampliam cobertura e exigem mais licenciamento/versificação/modelação/testes, com revisão de escopo. Manter decisões pendentes evita pressupostos, mas impede implementar com critério verificável. Parser externo pode reutilizar formatos, com dependência/licença/compatibilidade a justificar; nenhuma instalação aprovada. Não se recomenda tradição religiosa por motivo técnico.

## Riscos, mitigações e dependências

Fonte em revisão/numeração divergente: fixar versão/inventário real e testar limites. Direitos incompletos: verificar artefacto/usos, manter EXT-003 aberta e não incorporar. Parser ambíguo: matriz de formatos/erros aprovada antes de comportamento. Acoplamento: Domain/Application puros/ports e revisão modular. Limpeza: guard/identidade e base exclusiva de teste da S01; não migrar dados reais por conveniência.

Dependências cumpridas: S01 encerrada/commitada, stack existente. Pendentes: escolhas do utilizador, admissão do corpus, contratos e aceite de PLAN/SPEC/plano. Desbloqueio: decisões/aprovações verificáveis e acervo autorizado; só então READY e execução aplicável.

## Critérios verificáveis

| ID | Resultado | Estado atual |
|---|---|---|
| S02-T004-AC01 | Cânone/edição/idioma/versificação e catálogo identificados/aprovados | PASS — pacote aprovado;66 livros e numeração do XML confrontados com catálogo |
| S02-T004-AC02 | Origem, direitos, atribuição e usos do corpus documentados/aprovados | PASS — ZIP/aviso obtidos, CC BY4.0 e créditos confirmados, hashes reais e fixture identificada |
| S02-T004-AC03 | Parser/normalização/limites, domínio, HTTP e persistência com contratos/critérios aprovados | PASS — SPEC v0.2/plano T005 aprovados pelo «ok»; não é PASS de implementação |
| S02-T004-AC04 | Preparação PLAN/SPEC/cânone/EXT-003 e estados coerentes, checks documentais executados, modelo/API propostos explícitos | PASS no escopo documental — v0.2 com18 Markdown/174 links válidos; não é aprovação de contratos nem conclusão da tarefa |

## TDD, estática, integração e mutação

Preparação documental: comportamento não alterado; RED/GREEN/REFACTOR de software não aplicável. Validar links/estados/rastreabilidade/diff e conteúdo. Pesquisa de metadados não é integração/importação. Não declarar PASS de domínio por escrever specs.

T005–T007 aplicarão TDD por comportamento aprovado: teste primeiro, falha esperada, GREEN mínimo e REFACTOR/arquitetura. Application usa infraestrutura real como padrão; Prisma/PostgreSQL/migrações/constraints/transações e Nest/Supertest reais, fixtures autênticas/licenciadas versionadas exclusivas de teste. Doubles não comprovam integração. Scripts reais no PLAN; sem comandos inventados. Linhas>=90%, branches>=85%, Stryker bruto>85%, sobreviventes analisados e zero falhas obrigatórias. IA não aplicável.

## Gates, evidências e saída

Gate1 PENDENTE de escolhas/aprovações. Gates2–6 não aplicáveis à alteração documental atual (execuções NOT_RUN), sem dispensar os gates da implementação S02. Gate7 da preparação APROVADO tecnicamente por checks documentais no TEST_REPORT; aceite de conteúdo/contratos ainda pendente. T004 não é DONE por existir SPEC rascunho; não iniciar T005 antes da aprovação. Nenhum erro de aplicação novo constatado: atualizar apenas contexto operacional no MegaBrain.

Pergunta obrigatória de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"** Encerramento/commit S02 requerem relatório/revisão e autorização própria.

Fechamento da tarefa: Gate1 APROVADO por aceite explícito/spec/artefacto; Gate7 APROVADO pelos registos/checks documentais/admissão e rastreabilidade. Gates2–6 não aplicáveis à preparação documental/dados, sem resultado fictício de software. XML efetivo/admissão na SPEC e README da fixture; nenhum problema de formato foi ocultado nem conteúdo editado. T005 só começa após este encerramento; T006 mantém plano detalhado próprio pendente.
