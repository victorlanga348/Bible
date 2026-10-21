# S02 — Cânone Bíblico

## Decisão vigente de encerramento — escopo reduzido

Em2026-10-21 o utilizador determinou: «termina, o que falta vou adicionar depois». Aprova a redução do escopo de fecho a T004/T005 (corpus admitido, entidades/referência/parser puros e seus gates) e o encerramento dessa entrega. Sprint DONE após revisão documental; evidências no TEST_REPORT/REVIEW. Não altera gramática, invariantes ou texto implementados.

T006/T007 saem do escopo de encerramento e ficam BACKLOG para o utilizador retomar posteriormente; migração/importação, Application/consultas/navegação/API bíblica e sua aceitação integrada continuam não implementadas/NOT_RUN. Não atribuir outra sprint/data nem declarar essas capacidades concluídas. Critérios finais AC05–07 explicitam o recorte; AC01–04 originais permanecem rastreáveis.

Impacto: a entrega validada pode ser encerrada agora, mas não oferece leitura bíblica HTTP/persistência. Dependências futuras de integração continuam por resolver; S03 não recebe autorização automática. Alternativa original era executar T006/T007 antes do fecho; a decisão atual escolhe o adiamento. Não há alteração de stack, threshold ou exclusão de código para ocultar falhas.

Esta atualização documental de encerramento exige checks de links/estados/escopo/diff e confronto das evidências existentes com as fontes; sem comportamento novo para TDD adicional. Commit S02 PENDING, sem pedido específico de commit, push ou merge.

## Histórico do plano integral e da aprovação T005

O plano abaixo preserva escopo/propostas/estados anteriores à decisão atual. As exigências de integração aplicam-se à retoma das tarefas adiadas, não ao recorte de encerramento definido acima.

Data do refinamento: 2026-10-21. SPEC v0.2/recorte/contratos e plano T005 APROVADOS pelo «ok» após apresentação concreta; corpus/aviso/fixture verificados, T004/T005 DONE tecnicamente e sprint IN_PROGRESS; plano T006 pronto para aceite. O pedido inicial «segunda sprint aprovada, continue com a proxima apos o commit» autorizou preparação, sem escolher detalhes por inferência; o aceite posterior é a origem da aprovação editorial/técnica.
Branch: feat/biblia-backend. Commit S02: PENDING, sem autorização de commit/push/merge. S01 DONE, commit principal `1702cc073e76c0bc3225d19f07fc69b7d0f80861`; registo posterior do hash em `d0036ab`. Domain/parser T005 implementados e verificados; Application/importação/HTTP bíblicos ainda não implementados. Resultados atuais no TEST_REPORT; [plano T006](tasks/S02-T006-integration.md) aguarda aprovação própria.

## Objetivo e escopo
API consulta e valida passagens reais da edição autorizada; navega por livros/capítulos/versículos sem confundir identificação canónica, numeração da edição e texto.
Book, Chapter, Verse, Translation, value objects, parser, validade de capítulos/versículos, navegação, importação autorizada e contratos REST/Zod/OpenAPI. Identidades, sintaxe, erros e limites serão concretizados na [SPEC](SPEC.md), depois das decisões editoriais e antes da aprovação/implementação.

## Fora do escopo
Frontend, módulos de sprints posteriores, serviços adicionais, merge/push/publicação automática. Aprovar este roadmap não aprova specs, contratos ou imports.
Em S04 não exigir LLM; em S05 não aceitar integração estática como real.

## Tarefas, contratos e ficheiros
Ordem e dependências em [TASKS](TASKS.md). Antes de cada tarefa refinar spec, ports, entradas/saídas Zod/HTTP/OpenAPI, erros, persistência e critérios de segurança pertinentes, sem inventar assinaturas/fields neste rascunho.
Ficheiros previstos: documentação da tarefa/spec, módulo afetado com domain/application/infrastructure/presentation/module.ts, testes e migrações justificadas. Caminhos concretos e dependências aprovados no plano detalhado antes da edição.
Contratos v0.2 aprovados na SPEC, ainda sem HTTP/persistência do módulo implementados. Domain independente de NestJS/Prisma/SDKs e Application de adapters; nenhum acesso direto a dados de outro módulo.

## Entradas e sequência verificável

| Entrada | Estado real | Critério de desbloqueio |
|---|---|---|
| S01 encerrada/commitada | Cumprida | Commit e relatório disponíveis |
| DEC-09: cânone, nomes/identidades e versificação | Cumprida para recorte v0.2 |66 livros do XML/catalogação confirmados; sem equivalência presumida entre edições |
| DEC-06 / EXT-003: edição, corpus e direitos | Resolvida para snapshot/usos S02 | Pacote/aviso obtidos e verificados, hashes e fixture reais, após aceite explícito |
| Contratos de parser, domínio, HTTP, importação e persistência | SPEC v0.2 aprovada | Testes de software ainda exigem execução; contratos não são implementação |
| Plano/dependências de S02-T004 | Cumprida, tarefa DONE | Aceite explícito, [ficha](tasks/S02-T004-canon-contracts.md) e admissão verificadas |
| Toolchain/PostgreSQL | Fundação S01 comprovada | Confirmar disponibilidade/identidade para os testes novos; não transferir PASS S01 para S02 |

Preferências solicitadas ao utilizador; nenhuma tradição/tradução inferida do idioma. Duas edições candidatas pesquisadas na SPEC, sem seleção/download/importação. Nenhuma dependência/serviço novo proposto.
O parágrafo anterior é o histórico da preparação inicial: o «ok» posterior seleciona/admite o pacote v0.2 explicitamente; ZIP/XML e fixture foram obtidos/verificados. A prova de importação no banco/navegação/API continua para T006/T007. Nenhuma dependência/serviço novo foi adicionado.

| Tarefa | Entrega e condição de saída |
|---|---|
| S02-T004 | Cânone/edição/direitos, SPEC/modelo/API/plano/critérios aprovados; EXT-003 resolvida para o acervo escolhido |
| S02-T005 | Entidades/referência/parser de Domain; plano proposto abaixo, TDD puro e fronteiras demonstrados; ports executáveis apenas quando necessários à T006 |
| S02-T006 | Application com adapters reais, importação/persistência/consulta/navegação, apresentação e composição; migração/plano aprovados e PostgreSQL real com constraints/transações/proveniência |
| S02-T007 | HTTP/gates/relatório/revisão, mutação analisada e documentação coerente; aprovação de encerramento antes de commit |

Uma tarefa por vez. T005–T007 recebem fichas próprias quando predecessoras e plano estiverem aprovados. Preparação atual altera apenas docs/índices/contexto. Após aprovação, caminhos previstos: backend/src/modules/biblical-canon/{domain,application,infrastructure,presentation}/ e module.ts quando necessário; backend/test/{unit,integration,e2e}/biblical-canon/; fixtures autênticas/licenças em backend/test/fixtures/; schema/migrações e composição quando justificados. Não criar pastas/classes vazias.

## Alternativas e impacto

| Opção | Vantagem | Desvantagem/condição |
|---|---|---|
| Um cânone/uma edição no primeiro incremento | Menor matriz de importação/referência/texto a verificar | Adia cobertura adicional; recorte deve ser explícito e escolhido pelo utilizador |
| Vários cânones/edições desde o início | Cobertura mais ampla | Mais identidade/versificação/licenças/testes; rever escopo e contratos antes de escolher |
| Parser próprio da sintaxe aprovada | Sem dependência adicional e regras escondidas | Exige matriz explícita de formatos/aliases; não tentar aceitar qualquer referência livre |
| Parser/importador externo | Possível reutilização de formato | Justificar dependência/licença/compatibilidade; nenhuma instalação aprovada |

Proposta técnica: preservar stack/convenções da S01 e acordar primeiro o corpus/recorte. Não há recomendação de tradição religiosa nem defaults editoriais implícitos. A escolha de edição não autoriza automaticamente envio futuro a IA.

Histórico da proposta antes do «ok» (já aceite conforme cabeçalho): refinamento v0.2 após «avanca», então PARA APROVAÇÃO: [SPEC](SPEC.md) propõe catálogo de 66 livros da Bíblia Livre/porbr2018, edição explícita, códigos USFM, referências/intervalos dentro de um capítulo, cinco operações REST e persistência/importação transacional especificadas. É recorte editorial proposto, sem atribuir crença ou escolha ao utilizador. Autorizar o pacote inclui obter/verificar o artefacto e o seu aviso antes da admissão; não há checksum/corpus obtido nesta fase. Alternativas permanecem documentadas. Contratos e recorte têm agora proposta concreta, sem estarem aprovados.

Impacto na sequência proposto explicitamente: T005 fica em Domain/ports, T006 reúne casos Application e adapters reais. Isto evita depender em T005 de uma integração cuja migração/repositório só existiria em T006, mantendo a exigência de Application com infraestrutura real. IDs e resultado de sprint preservados; nenhuma implementação foi iniciada. O utilizador deve rever esta decomposição juntamente com a SPEC.

## Plano T005 apresentado e posteriormente aprovado/executado

Dependências antes de iniciar: aceite da SPEC v0.2/recorte, artefacto/aviso obtidos e conferidos, proveniência/fixture de teste autêntica registadas, T004 concluída. Não marcar READY/DONE antes dessas provas. A aprovação desta proposta não comprova o conteúdo do pacote ainda não obtido.

Ficheiros previstos: backend/src/modules/biblical-canon/domain/book.ts, chapter.ts, verse.ts, translation.ts, passage-reference.ts e reference-parser.ts, mais erro de domínio específico se necessário ao resultado; testes correspondentes em backend/test/unit/biblical-canon/. Port de catálogo específico em application/ports/ apenas quando o contrato de consulta for concretizado para T006, sem interfaces genéricas vazias em T005. Não alterar composição/Prisma/HTTP nesta tarefa pura.

Sequência verificável:
1. Aprovar critérios de gramática/normalização e invariantes das cinco entidades na SPEC; usar dados reais do snapshot quando o teste representar texto bíblico.
2. RED por comportamento: parser válido/normalizado, entrada malformada ou formato não admitido, zeros/sinais/decimais/número inseguro, intervalo invertido e estado inválido de entidade. Escrever teste antes, executar script real `test:unit` filtrado para o módulo e guardar falha esperada; não contar import/sintaxe/ambiente como RED.
3. GREEN mínimo de cada caso; parser não consulta DB nem adivinha catálogo. Testes de existência, navegação e persistência ficam em T006, sem chamar unidade de integração.
4. REFACTOR: rever duplicação mínima sem criar abstração genérica; executar typecheck/lint/build, unitários/regressão afetada e test:architecture/test:tooling. Cobertura e Stryker devem incluir todo comportamento próprio novo; avaliar/explicar sobreviventes, sem retirar código difícil.

Vantagem: verificar domínio independente e sintaxe antes de adapters. Custo/limite: isto não entrega consulta real; os casos de aplicação só podem passar com adapters reais na T006. Nenhuma nova dependência proposta. Aceitação T005: regras de domínio/parser aprovadas e testadas em RGR; zero import externo proibido/ciclo; thresholds e gates aplicáveis satisfeitos; nenhum dado textual inventado. A implementação permanece bloqueada até aceite do pacote e admissão T004.

| Risco | Mitigação/evidência |
|---|---|
| Fonte acessível mas uso não autorizado | Verificar condições do artefacto por operação e aprovação em EXT-003 antes de incorporação |
| Edição em revisão ou alterada a montante | Mostrar estado editorial, fixar snapshot e checksum real após obtenção autorizada; não inventar hash |
| Numeração/versificação divergente | Validar sobre dados reais da edição, sem completar versículos ou criar equivalências por aproximação |
| Parser ambíguo | Aprovar formatos/aliases/normalização/falhas; testar antes do código |
| Importação parcial/duplicada | Aprovar política de repetição/transação e testar constraints/rollback reais |
| Limpeza indevida/acoplamento | Guard/identidade S01, base/fixture exclusiva de teste e fiscalização de propriedade modular |
| Expansão de escopo | Novas edições/comportamentos exigem aprovação de impacto; não antecipar estudo/IA/fontes históricas |

## Testes e Red → Green → Refactor
Para cada comportamento aprovado: teste antes; RED por causa esperada e saída guardada; GREEN mínimo; REFACTOR com regressões/fiscalização arquitetural.
Domínio puro sem serviços; Application com infraestrutura real como padrão; Prisma/PostgreSQL/migrações/repositórios/transações/restrições reais; HTTP NestJS/Supertest; fixtures autênticas/autorizadas e limpeza segura.
IA separa contratos determinísticos, integração real e avaliações semânticas com fontes verificadas. Falta de credencial deixa teste/gate BLOCKED.

## Aceitação, riscos e alternativas
Critérios em [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md). Limites: linhas >=90%, branches >=85%, mutação bruta >85%; zero erros de tipagem/lint e nenhum teste obrigatório falhado/bloqueado.
Riscos: contratos incompletos, direitos/dados indisponíveis, credenciais/infraestrutura em falta e regressões. Mitigar aprovando contratos/dados, ações externas e testes antes de código. Não substituir por fixtures fictícias.
Alternativa de antecipar módulos ou usar fakes como aceitação rejeitada; preservação de fronteiras custa contratos/mapeamentos, reduzindo acoplamento. Versões e custos exigem investigação/aprovação antes do uso.
Dependências externas em [REQUIRED_ACTIONS](../../external-actions/REQUIRED_ACTIONS.md); dados/acesso/retensão/fornecedores conforme momento afetado.

## Validação e aprovação
Scripts reais existentes, a partir de backend/: `npm run test:unit`, `test:integration`, `test:e2e`, `test:coverage`, `test:architecture`, `test:tooling`, `typecheck`, `lint`, `build`, `prisma:generate`, `db:migrate:test` e `test:mutation`. Não executar suites destrutivas em paralelo; guard/migração apenas na base de teste, sem migrar dados reais por conveniência. Ver ERR-0001 para descoberta OneDrive/VM modules. Código próprio novo entra em Stryker; gerado/migrações/SDKs excluídos conforme política.
Histórico da preparação documental anterior ao «ok»: RED/GREEN de comportamento não aplicável; validar links/estados/rastreabilidade/diff. Pesquisa de metadados não é aprovação editorial nem teste de importação. Contratos/fixtures aprovados precedem cada RED de implementação. Não fixar contagens bíblicas de memória. IA não aplicável à S02; execução remota de CI tem evidência própria.
Executar sete gates aplicáveis, registar por critério comando/ambiente/data/resultado e artefactos, produzir [TEST_REPORT](TEST_REPORT.md) e [REVIEW](REVIEW.md), aguardar aprovação de encerramento/commit. Não iniciar sprint seguinte sem autorização própria.
