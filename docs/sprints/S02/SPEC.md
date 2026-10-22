# S02 — Especificação de cânone e consulta bíblica

## Retoma v0.4 — 2026-10-22

Autorização geral posterior do utilizador retoma T006/T007 antes adiadas. Os cinco contratos HTTP, DTOs, corpus/direitos e semântica v0.2 permanecem vigentes; o complemento implementa esses contratos e não adiciona pesquisa por palavra-chave. A composição poderá exportar o serviço Application de leitura/existência para outros módulos, sem acesso às tabelas alheias. Transformação JSON integral e hashes/manifesto canónico especificados no plano T006 refinado; histórico v0.3 abaixo preservado. Resultado desta retoma depende de gates reais, não da autorização.

## Revisão de escopo v0.3 — encerramento em2026-10-21

Decisão explícita do utilizador: «termina, o que falta vou adicionar depois». Escopo de entrega/encerramento S02 reduzido a admissão do corpus e Domain/parser T004/T005, com seus critérios/gates reais. Sem alteração de comportamento/invariantes/gramática já aprovados em v0.2. PLAN/TASKS/ACCEPTANCE_CRITERIA/TEST_REPORT/REVIEW registam impactos/evidências.

Migração/importação, Application/consultas/navegação, apresentação/cinco operações HTTP e respetiva aceitação integrada ficam adiadas em T006/T007 BACKLOG. A especificação desses comportamentos abaixo é preservada para futura retoma; não significa implementação, teste aprovado, execução autorizada agora ou nova sprint atribuída. Retomar exige rever plano/dependências.

O restante documento preserva a SPEC v0.2 aprovada e a admissão real. Afirmações anteriores sobre a sprint ainda aberta descrevem o estado antes desta revisão. O encerramento atual cobre o incremento puro entregue; nenhum PASS foi atribuído à integração ausente.

Data: 2026-10-21. Revisão v0.2 APROVADA pelo «ok» do utilizador após apresentação do pacote Bíblia Livre/66 livros, contratos e plano T005. Origem: PRD-01/PRD-10, PLAN-009 e PLAN S02. A redação de proposta abaixo preserva a decisão revista; este aceite autoriza verificar o corpus e iniciar o domínio por TDD, sem aprovar commit/push/merge ou alterar o escopo. Corpus/aviso verificados conforme registo de admissão abaixo; não há importação de banco ou API bíblica implementada ainda.

## Quadro inicial de capacidades/decisões do refinamento

Catálogo, identificação de capítulos/versículos, parser/validação de referências, leitura/navegação e importação reproduzível com proveniência. Estudo, comentários, IA e edição de texto bíblico não pertencem à S02.

| Área | Decisão pendente | Evidência/saída para aprovar |
|---|---|---|
| Cânone | Inicial e eventual suporte múltiplo; ordem/nomes | Aceite do utilizador e catálogo autêntico da edição, sem inferir tradição pelo idioma |
| Tradução/edição | Nome, idioma/dialeto, recorte e identidade | Origem, versão e estado editorial; não trocar por edição de nome semelhante |
| Versificação | Representar a numeração efetiva da edição | Preservar intervalos/omissões/subdivisões reais; não preencher texto ou supor equivalências |
| Parser | Formatos/aliases/abreviaturas, ambiguidades e normalização | Matriz de entradas reais e erros aprovada |
| Seleção/navegação | Intervalos e travessia de capítulos/livros, limites | Casos explícitos; nenhum máximo arbitrário |
| Domínio | Atributos/relações de Book/Chapter/Verse/Translation/referência | Justificação ligada à edição/consulta; tipos independentes de ORM/framework |
| Importação | Formato, preservação, repetição, transação e falhas | Artefacto autorizado com origem/data/checksum real, direitos e fixture; nenhum seed de produção implícito |
| HTTP | Rotas/métodos, campos Zod/OpenAPI, erros, ordenação/limites e acesso | Contrato concreto proposto após escolhas; não reutilizar erro técnico500 para esconder falhas de negócio |
| Persistência | Identidades/cardinalidades, constraints, índices e migração/recuperação | Modelo lógico/físico aceite; verificar namespace app com modelos reais conforme revisão S01 |
| Proveniência/direitos | Usos, atribuição, alterações e versão | Evidência por artefacto/operação e aprovação EXT-003; envio a IA depende também da S05 |

O quadro acima preserva as decisões que estavam abertas. O pacote v0.2 abaixo foi aceite expressamente pelo «ok» referido no cabeçalho; a implementação e os seus testes continuam a exigir evidência própria. Data-model/api-contracts canónicos apontam para esta SPEC sem duplicação de campos.

## Pesquisa inicial — candidatas sem admissão

Consulta: 2026-10-21, páginas de metadados/condições do distribuidor. Nenhum corpus ou fixture foi obtido/incorporado. As declarações abaixo são atribuídas às páginas; não são autorização jurídica universal para todo conteúdo/território/uso futuro.

| Candidata | Declaração consultada | Limitação |
|---|---|---|
| Bíblia Livre, distribuição porbr2018, português do Brasil | eBible identifica atualização de Almeida1819, Textus Receptus, autores e CC BY4.0; pede créditos e identificação de alterações | Trabalho em andamento, versão a identificar; imagens têm condições separadas. Verificar o aviso do artefacto antes de admissão |
| Bíblia Portuguesa Mundial, porbrbsl, português do Brasil | eBible declara domínio público | A página chama o texto de rascunho ainda em revisão. Escolha editorial/cobertura canónica pendentes; não supor que formatos diferentes têm o mesmo recorte |

Fontes primárias: [condições porbr2018](https://ebible.org/porbr2018/copyright.htm), [catálogo porbr2018](https://ebible.org/bible/details.php?id=porbr2018), [condições porbrbsl](https://ebible.org/porbrbsl/copyright.htm), [catálogo porbrbsl](https://ebible.org/bible/details.php?id=porbrbsl). A [Creative Commons](https://creativecommons.org/licenses/by/4.0/) descreve atribuição/alterações e remete para o texto jurídico; não aprova automaticamente uma fonte específica.

Recorte proposto v0.2: catálogo de 66 livros da distribuição Bíblia Livre/porbr2018, frequentemente designado cânone protestante, na ordem da própria edição. O número foi conferido no [índice do distribuidor](https://ebible.org/porbr2018/), que lista os livros de Gênesis a Apocalipse; não é uma contagem de memória nem uma preferência religiosa atribuída ao utilizador. Preservar a numeração efetiva do artefacto a verificar. A BPM permanece alternativa, sem admissão. Não misturar edições nem excluir livros silenciosamente para ajustar um recorte.

## Pacote v0.2 proposto — decisão editorial e direitos

- Uma edição inicial: `porbr2018`, nome Bíblia Livre, português do Brasil (`pt-BR`), recorte `protestant-66` identificado publicamente. Outros cânones/edições ficam para nova proposta de escopo; o sistema não apresentará esse recorte como catálogo universal.
- Autorizar, após aceite explícito, obter o export de texto disponibilizado pelo eBible e o respetivo aviso; confirmar formato, livros, numeração e condições incluídas antes de incorporar dados. Origem candidata VPL/SQL e USFM está publicada no catálogo de formatos; o SQL fornecido não será executado no banco do projeto.
- Guardar origem, data real de obtenção, SHA-256 real do artefacto, atribuição e versão identificada pelo fornecedor. Esses valores ainda não foram obtidos: não existe checksum/manifesto aprovado. Se o pacote divergir do catálogo/condições aqui revistos, interromper a admissão e esclarecer, sem mudar a edição silenciosamente.
- Propor armazenamento local, importação, leitura e reprodução do texto com créditos/licença visíveis; preservar indicações de alterações de formato. Sem imagens/áudio/comentários, revisão editorial do texto, redistribuição separada do corpus ou envio a IA nesta sprint. Conservar os termos do artefacto, além do link CC BY4.0.
- Acervo original autorizado e fixtures de teste têm destinos separados. As fixtures são excertos autênticos do snapshot, identificados/licenciados/versionados e exclusivos de teste; não são seed de produção nem substituem comprovação da importação do acervo.

Alternativa: outro cânone/edição ou vários desde já. Vantagem: cobertura editorial diferente/mais ampla. Custo: rever catálogo, numeração, licenças, matriz e contratos antes de código. A proposta incremental reduz essa matriz, sem argumento de superioridade religiosa.

## Referência e parser propostos

Identidade de livro: código USFM de três caracteres, conferido com a edição e a [tabela oficial de identificadores](https://ubsicap.github.io/usfm/identification/books.html), por exemplo GEN e JHN. Código não é número de ordem nem prova de equivalência entre versificações. Nomes de apresentação vêm do catálogo da edição.

Sintaxe inicial proposta: `CODE capítulo:versículo` ou `CODE capítulo:início-fim`, dentro do mesmo capítulo. Exemplos de sintaxe, sem reproduzir texto: `GEN 1:1`, `JHN 3:16-18`. Remover apenas espaço exterior e normalizar código ASCII para maiúsculas; manter exatamente um espaço interno, dois-pontos e hífen. Aceitar apenas algarismos decimais positivos seguros, sem zeros iniciais, sinais, decimais, expoente ou separadores alternativos; fim não pode preceder início. Código tem três caracteres ASCII alfanuméricos; existência é verificada no catálogo da edição.

Referência de domínio proposta: translationId, bookCode, chapter, fromVerse, toVerse. Versículo único tem fromVerse=toVerse; representação canónica usa intervalo apenas quando forem diferentes. Parser é puro: reconhece estrutura/normalização, sem acesso a Prisma, Zod, Nest, ambiente ou catálogo global; serviço de aplicação verifica existência na edição pelo port.

| Conceito de domínio proposto | Estado/invariantes necessários a T005 |
|---|---|
| Translation | Identidade/metadados de TranslationView; id/nome/origem/licença/atribuição não vazios, data de obtenção válida e checksum SHA-256 hexadecimal de64 caracteres do snapshot real; dados não são inventados pelo construtor |
| Book | translationId, code, name, order; nome não vazio, ordem positiva segura, código normalizado; pertença ao catálogo verificada pela aplicação |
| Chapter | translationId, bookCode, number; número positivo seguro, identidade sempre associada à edição/livro |
| Verse | Referência singular (fromVerse=toVerse) e text não vazio; texto real da edição, sem geração/correção no domínio |
| PassageReference | Campos/normalização da referência acima; números positivos seguros, fromVerse<=toVerse; nenhuma existência bíblica inferida pelo parser |

Invariantes recusadas devolvem erro próprio de domínio, sem dependências de framework; o transporte converte falha de entrada para400 conforme contrato. chapterCount/verseCount são projeções de consulta de T006, não estado duplicado obrigatório nas entidades. URLs/datas/checksum são dados de proveniência a validar, não autorização automática de uso concedida pelo domínio.

Nomes/abreviaturas livres, referências a vários capítulos/livros, listas separadas e inferência da edição não são formatos aceites nesta proposta. Justificativa: manter gramática e desambiguação verificáveis; expansão posterior exige proposta/aprovação. Solicitar referência bem formada a posição ausente devolve ausência, sem corrigir os números ou completar versículos.

## Semântica de consulta e navegação proposta

Toda consulta de texto declara translationId e bookCode; não escolher edição por defeito. translationId é identificador ASCII minúsculo com algarismos/hífen, começando por letra/algarismo; não é o nome livre da tradução. bookCode é normalizado para maiúsculas ASCII antes da validação e tem três caracteres alfanuméricos. Números são inteiros positivos seguros; não fixar limites bíblicos a partir de outra versão. Verificar existência antes de pedir ao adapter uma posição/intervalo.

Uma consulta sem intervalo devolve o capítulo completo, com os versículos presentes em ordem numérica. Um intervalo explícito tem de existir integralmente na edição: ausência de qualquer número pedido é NOT_FOUND, sem preencher texto ou devolver parcial silenciosamente. O texto devolvido é o mesmo texto canónico extraído do snapshot admitido; títulos, notas e markup não são anexados por inferência. Regras exatas de extração do formato ficam condicionadas à inspeção do artefacto e à preservação verificável; sintaxe/numeração não suportada no artefacto bloqueia a admissão, sem descarte silencioso.

Navegação é por capítulo, na ordem do catálogo: anterior/próximo dentro do livro e travessia para o último/primeiro capítulo do livro vizinho. Nas extremidades do acervo o vizinho é null. Não supor limites numéricos ausentes do snapshot. Nenhuma escrita HTTP ou importação pública é exposta.

## DTOs e operações HTTP propostos

REST local nas mesmas condições de acesso da S01 (loopback; exposição externa continua dependente de EXT-005). Entradas/saídas estritas Zod, publicadas em OpenAPI; propriedades adicionais de entrada são rejeitadas. Nomes abaixo são propostas v0.2, sem rota/handler implementados.

| DTO | Campos propostos e motivo |
|---|---|
| TranslationView | id, name, language, canonId: identificar edição/recorte; sourceUrl, sourceSha256, retrievedAt: rastreabilidade do snapshot; licenseId, licenseUrl, attribution: condições e créditos. Valores reais obtidos após admissão, sem valores fictícios |
| BookView | code, name, order, chapterCount: identidade, apresentação, ordenação e extensão efetivamente disponíveis |
| ChapterView | number, verseCount: catálogo de capítulos e quantidade real de versículos, sem confundir contagem com maior rótulo |
| PassageView | translationId, bookCode, chapter, verses (cada item number/text); previousChapter e nextChapter (bookCode/chapter ou null); attribution e licenseUrl acompanham a exibição do texto |
| ResolvedReferenceView | translationId, bookCode, chapter, fromVerse, toVerse, normalized; confirmação de existência sem gerar comentário/texto novo |

| Método/rota proposta | Entrada | Saída200 |
|---|---|---|
| GET /translations | Sem query | Objeto translations: TranslationView[], ordenado por id; só edições importadas/admitidas |
| GET /translations/:translationId/books | Sem query | Objeto books: BookView[], ordenado por order |
| GET /translations/:translationId/books/:bookCode/chapters | Sem query | Objeto chapters: ChapterView[], ordenado por number |
| GET /translations/:translationId/books/:bookCode/chapters/:chapter/verses | Sem query: capítulo completo; from/to decimais opcionais, ambos presentes ou ambos ausentes | PassageView; from=to representa seleção de versículo único |
| POST /references/resolve | Corpo estrito translationId/reference, ambos texto não vazio | ResolvedReferenceView; nenhuma escrita persistente |

Coleções pequenas do catálogo são devolvidas integralmente; não se inventa paginação neste recorte. Nenhuma pesquisa por palavra-chave foi adicionada. GET /translations devolve lista vazia quando não há edição admitida, mas falha de banco nunca se converte em lista vazia; pedir edição/livro/capítulo/versículo ausente devolve404.

Reutilizar o envelope técnico S01: error{code,message}. Sintaxe, tipos, query desconhecida, corpo extra ou intervalo invertido →400 VALIDATION_ERROR / Entrada inválida. Recurso bem formado mas ausente →404 NOT_FOUND / Recurso não encontrado. Falha inesperada/infraestrutura →500 INTERNAL_ERROR / Erro interno. Nenhum driver, SQL, caminho de ficheiro ou credencial aparece na resposta/log. Não há novos códigos de erro implícitos, nem alteração do significado dos endpoints técnicos S01.

## Persistência e importação propostas

O módulo biblical-canon é proprietário exclusivo das suas tabelas no namespace app. Proposta física a transpor para Prisma apenas após aprovação:

| Tabela proposta | Identidade/relações e atributos justificados |
|---|---|
| canon_translation | PK id; campos de identificação/proveniência/direitos de TranslationView; todos obrigatórios no snapshot admitido |
| canon_book | PK(translationId,code), FK translation; name não vazio, order inteiro positivo, UNIQUE(translationId,order) |
| canon_chapter | PK(translationId,bookCode,number), FK book; number inteiro positivo |
| canon_verse | PK(translationId,bookCode,chapter,number), FK chapter; number positivo, text obrigatório/não vazio |

ChapterCount/verseCount são derivados, sem colunas duplicadas que possam divergir. As identidades compostas suportam a consulta prevista; não criar índices extra sem consulta justificada. Domain/Application não recebem tipos Prisma, e outros módulos não acedem diretamente a estas tabelas. Não existe operação de eliminação/edição pública nesta proposta.

Importação explícita do artefacto admitido: validar manifesto, hash real, catálogo, conteúdo e duplicados antes de persistir; escrever uma edição num commit transacional, com rollback integral de falha. Reimportar id/hash iguais é idempotente; mesmo id com hash diferente é conflito e não substitui o acervo. Uma nova revisão exige identidade/aprovação próprias. Não executar SQL recebido do fornecedor; usar operações/queries parametrizadas do projeto.

Primeira prova em biblia_test com guard e identidade S01 antes de migração/limpeza. Migração dev/importação local de uso exigem alvo/plano próprios, sem reaproveitar fixture como acervo e sem tocar em produção. Extração/revisão do formato original não instala dependência por inferência; se o formato exigir biblioteca nova, justificar e pedir aprovação.

## Critérios v0.2 e sequência TDD proposta

P0: confirmar/autorizar pacote editorial/contratos acima; obter e verificar artefacto/aviso conforme admissão. Divergências impedem T004 DONE; não se declara integração real antes da prova.

T005: modelar entidades/identidades/referência e parser puros; testes da gramática/normalização/intervalos e valores inválidos antes do comportamento. Não criar ports vazios nem casos de aplicação que dependam de repositório ainda ausente. A validação de existência e a orquestração ficam em T006 com ports específicos/adapters reais. Refatorar e fiscalizar fronteiras, preservando comportamento.

T006: Application pelos ports, adapters de persistência/importação, composição e apresentação; validar existência/importação/constraints/rollback/repetição e consultas/navegação contra o snapshot real, com migração aprovada e guard. Application usa infraestrutura real como estratégia padrão; doubles locais identificados só apoiam unidade específica, sem substituir aceitação de integração. T007: provar os cinco contratos HTTP e schemas/erros, cobertura, Stryker e sobreviventes. Nenhum teste/score é presumido. Planos detalhados dependentes permanecem sujeitos a aprovação quando concretizados; não há tarefas em paralelo.

Aceitação verificável: parser canónico/erros conforme gramática; edição sempre explícita; texto e numeração confrontados com snapshot; importação atómica/idempotente e hash divergente recusado; cinco operações HTTP com200/400/404/500 conforme aplicabilidade; nenhum acesso modular proibido ou segredo exposto. Linhas>=90%, branches>=85%, mutação bruta>85%, estática/build/arquitetura e integrações reais aprovadas. Preparação atual continua documental; todas as expectativas de software são propostas e NOT_RUN/BLOCKED.

## Admissão e critérios

Antes da obtenção/incorporação, identificar edição/versão/origem e verificar autorização dos usos. Depois de autorização, obter artefacto, registar data/checksum real/condições/atribuição e inventariar livros/numeração. Separar fixture de teste do acervo de uso; não incluir áudio, imagens, notas ou comentários sem verificação própria. Nenhum hash, contagem bíblica ou excerto foi inventado nesta proposta.

[Critérios da sprint](ACCEPTANCE_CRITERIA.md) e [plano da tarefa](tasks/S02-T004-canon-contracts.md). Contratos/fixtures aprovados precedem testes de comportamento. Atualizar bidirecionalmente cânone, modelo, API e ADRs pertinentes após decisões; mudança de escopo/semântica exige aprovação própria.

## Admissão real do snapshot — 2026-10-21

Obtido o ZIP oficial por HTTPS, 4.379.838 bytes; SHA-256 `1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682`. Aviso incluído porbr2018_about.htm confirma CC BY4.0/créditos e identificação de alterações, preservado na fixture. O acesso Python sem User-Agent recebeu403; repetir com User-Agent convencional obteve200, sem credencial/serviço pago.

Formato canónico escolhido dentro do mesmo pacote aprovado: porbr2018_vpl.xml, SHA-256 `5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db`. O aviso do pacote identifica o XML como export com códigos SIL/UBS. Os 66 códigos/ordem XML correspondem ao catálogo publicado; inventário real de1.189 capítulos/31.102 versículos, identidades únicas e sem lacunas numéricas neste snapshot. Não há mudança do contrato USFM nem alteração de texto pelo projeto.

O TXT usa abreviaturas BibleWorks distintas e há diferenças entre exports em espaços/colchetes; não se declara igualdade byte a byte dos textos de ambos. Uma auditoria confrontou ordem e números e isolou essas diferenças; o conteúdo escolhido é o XML existente e será preservado exatamente, não uma fusão/correção de formatos. SQL incluído nunca executado; nenhum ficheiro externo carregado como instrução.

Artefacto completo local em backend/data/biblical-canon/porbr2018/, ignorado pelo Git; manifesto/catalogação/aviso e excertos autênticos exclusivos de teste em [fixture porbr2018](../../../backend/test/fixtures/biblical-canon/porbr2018/README.md). Quatro registos selecionados do XML, texto preservado incluindo espaços finais, sem conteúdo gerado. Obtenção e verificação não comprovam ainda importação/persistência/consulta do módulo.
