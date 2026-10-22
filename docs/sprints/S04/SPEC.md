# S04 — Estudos determinísticos e acesso local

Refinamento delegado em2026-10-22 pela [autorização integral](../../roadmap/completion-execution.md). Contrato aceite para implementação pelo agente em T004, sprint IN_PROGRESS, código ainda NOT_RUN. S02-T006/T007 concluídas e commitadas cea1289. Decisões são do agente no escopo delegado; não se atribui aprovação individual anterior ao utilizador. SS-001 histórica é preservada e operacionalizada, com BR-01–12 e limites explícitos. [ADR-0005](../../architecture/adr/ADR-0005-estudos-privados-e-versoes.md). Sem LLM nesta sprint.

## Resultado e limites

Construir um estudo reproduzível a partir de referência realmente existente, texto da edição admitida, contexto do capítulo e evidências efetivamente autorizadas. As secções de argumento do livro, história/cultura, autoria/destinatários/propósito, comparação e interpretações declaram insuficiência quando não existe análise curada; não preencher lacunas com conhecimento inventado. Texto bíblico, citação de fonte e interpretação têm campos/tipos separados. Fonte Josefo é um relato antigo, não confirmação automática de um facto ou consenso.

Uma obra/quatro excertos não cobrem a Bíblia inteira. As associações fonte-passagem adiadas em S03 podem ser introduzidas agora porque biblical-canon confirma existência; somente relações curadas explícitas, sem inferência por coincidência de palavras. Fonte/posição e direitos são conferidos pelo contrato de source-library; nenhuma tabela de outro módulo é consultada.

## Identidade e acesso

Estudos são privados por subject de token local. Usar a chave existente `jwtSecret` do `.env` (mínimo32 bytes, nunca em log) com JWT HS256, issuer `biblia-local`, audience `biblia-backend`, sub ASCII1..64 e exp obrigatório; validade inicial3600s. Razão: persistência exige isolamento desde a primeira versão e SH-001 proíbe presumir anonimato. JOSE será usado como dependência de segurança em versão exata compatível verificada antes da instalação, evitando implementar criptografia JWT própria.

Precisão do contrato antes da implementação: sub segue `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`, sem espaços/controlos; iat e exp são claims obrigatórios e a emissão local fixa validade3600s. Verificar algoritmo/issuer/audience/idade/expiração, sem token público por username ou owner no body. Chave ausente mantém os recursos privados fechados; chave fornecida com menos32 bytes é erro de configuração genérico. Mensagem pública401: `Autenticação necessária.`. A prova JOSE6.2.13/Node24/Jest30 está na ficha T004; ainda não é prova de autenticação da aplicação.

O token será emitido por ferramenta local com a chave do ambiente, sem endpoint público que emita tokens apenas com um nome de utilizador. `npm` script só será documentado como executável depois de existir. Sem chave, acesso aos recursos privados falha fechado; endpoints técnicos e leitura bíblica/fontes já públicos em loopback conservam contrato. Sem token/token inválido/expirado401 UNAUTHORIZED / Autenticação necessária. Recurso de outro subject é404, sem revelar existência. GOOGLE_CLIENT_ID é preservado; login Google não é presumido a partir de um client id, nem é requisito de um backend pessoal com token local.

## Documento de estudo e versões

Study é identificado por UUID gerado na persistência; ownerId vem somente do token validado, nunca do body. Versões inteiras positivas são imutáveis. DTO StudyView: id, version, createdAt ISO, reference (translationId/bookCode/chapter/fromVerse/toVerse/normalized), passage (texto/créditos da seleção), sections, evidence, interpretations, limitations. OwnerId é critério interno de acesso, sem necessidade de o publicar na resposta.

StudySection: kind em immediate-context/book-argument/history-culture/authorship-audience-purpose/comparison/interpretations; status available/insufficient-evidence; text não vazio. Contexto imediato identifica e conserva o capítulo real; os restantes conteúdos somente reproduzem material curado verificado ou uma limitação explícita. Interpretation separa documented-fact/inference/tradition/hypothesis, text e evidenceIds; documented-fact exige evidência e não é inferido por uma citação meramente existente. Na construção determinística inicial interpretations fica vazio sem curadoria adequada.

Evidence conserva excerptId/sourceId/locator/quote/textSha256/attribution/rightsStatement/rightsUrl e permissões da recuperação, com availability available/restricted/missing na projeção de leitura. Histórico preserva snapshot da origem; GET revalida disponibilidade atual pelo módulo de fontes. Uma fonte agora negada/pendente não pode vazar quote armazenada ou conteúdo analítico derivado: a projeção redige esses conteúdos e explicita a limitação. Não modificar silenciosamente o snapshot persistido.

A projeção de direitos aplica-se também à resposta de criação/revisão, depois da gravação, para não devolver automaticamente um snapshot entretanto revogado. Retirar conteúdo derivado da fonte não retira o contexto bíblico autorizado. Uma falha técnica do módulo de fontes mantém-se falha técnica, sem a converter em missing/restricted. Esta verificação define o ponto de decisão da entrega; não promete atomicidade distribuída entre módulos.

## HTTP, concorrência e falhas

Todas as entradas/saídas estritas Zod/OpenAPI; conteúdo extra recusado400 VALIDATION_ERROR / Entrada inválida. Body máximo limitado pelo transporte existente; referência usa gramática S02, sem novo alias ou edição implícita.

| Operação | Entrada | Sucesso |
|---|---|---|
| POST /studies | {translationId, reference} e Bearer | 201 StudyView, versão1 guardada atomicamente |
| GET /studies/:studyId | UUID; version opcional inteiro positivo; Bearer | 200 versão solicitada ou última, com projeção de direitos atual |
| POST /studies/:studyId/versions | {expectedVersion} inteiro positivo; Bearer | 201 nova versão determinística para a mesma referência, snapshot novo sem apagar anteriores |

Seleção/recurso bem formado ausente404 NOT_FOUND / Recurso não encontrado. expectedVersion desatualizada ou limite de versão409 CONFLICT / Não foi possível criar esta versão. Falha de infraestrutura500 INTERNAL_ERROR / Erro interno; nunca afirma que guardou se a transação falhar. Construção consulta apenas serviços públicos de cânone/fontes; falha técnica não vira ausência de evidência. Repetir POST /studies cria outro estudo deliberadamente; versões da mesma identidade usam controlo otimista, uma gravação por versão.

## Persistência e composição

Propriedade study: study_record(id, owner_id, current_version, created_at) e study_version(study_id, number, document JSONB, created_at). PK/FK/unique por estudo/número e checks positivos; índice de owner/created_at/id justificado pelo histórico posterior. Create/revise num commit transacional, com update condicionado a expectedVersion e rollback se a versão não puder ser gravada. Tipos Prisma só na infraestrutura; Application recebe ports próprios e contratos públicos dos outros módulos.

Autenticação é infraestrutura técnica partilhada, não um sétimo módulo de domínio. Domain continua sem Nest/Zod/Prisma/SDK/ambiente. source-library será proprietário de qualquer associação introduzida; valida referências por serviço do cânone e não por FK/tabela alheia.

## Precisões preparatórias de integração

Associação curada de fonte pertence a um serviço público SourcePassageLinks de source-library, separado dos três ports já usados por SourceLibrary. Assim, a extensão não obriga os consumidores atuais a configurar dependências futuras. CuratedPassageLink contém identidade estável, excerptId, tradução/livro/capítulo/intervalo, nature narrative-parallel e rationale explícita; a associação só é admitida se o excerto existir e o cânone público confirmar a passagem. Não há endpoint público de escrita para curadoria nesta sprint. O armazenamento próprio pode referenciar a tabela de excertos do mesmo módulo, nunca tabelas do cânone. Recuperação por seleção considera sobreposição do intervalo no mesmo capítulo/edição; não infere novas relações por similaridade lexical.

Study consulta estes contratos através de adapters dos seus ports, recuperando texto/direitos pelo SourceLibrary público. Evidence usa excerptId como identidade verificável e conserva a associação/localizador/créditos; StudySection também contém evidenceIds para rastrear conteúdo derivado de fontes. Sem curadoria, não gerar interpretações. Contexto imediato vem do capítulo verdadeiro e mantém os créditos da edição, mesmo quando uma fonte histórica é posteriormente restringida.

Na projeção EvidenceView, quote é string quando available e null quando restricted/missing. Metadados de origem e direitos históricos permanecem distinguíveis do estado atual; nenhuma quote revogada ou secção dependente dela é devolvida. As secções afetadas tornam explícita a insuficiência e as interpretações que dependam dessa evidência deixam de ser expostas. O snapshot original persistido não é reescrito. Um erro técnico ao revalidar continua500; somente ausência ou proibição tipada permite missing/restricted. Essa redação não afirma que o conteúdo remanescente ganhou suporte novo.

Admissão operacional de Josefo deve reconstruir os quatro parágrafos do HTML autenticado, conferir digests/localizadores/aviso e preservar as condições analisadas; os caminhos de fixtures não são entrada do importador de desenvolvimento. A identidade da obra e os textos podem coincidir com os testes porque a origem é a mesma, mas proveniência operacional e propósito são registados separadamente. sendToAi permanece pending até a avaliação do destino real em S05. Não habilitar essa permissão apenas para ultrapassar um teste.

## Critérios verificáveis e riscos

Precisão do documento antes de T005: conteúdo persistido contém reference, passage, sections, evidence, interpretations e limitations. Reference usa tradução/código/capítulo/fromVerse/toVerse/normalized consistentes; passage contém verses(number/text), attribution e licenseUrl, sem repetir navegação. Study acrescenta id UUID, ownerId interno, version positiva segura e createdAt UTC ISO. Versões usam BigInt na persistência e número seguro no DTO; limite de versão é conflito409. Evidence usa excerptId como identidade, sourceId/locator/quote/textSha256/attribution/rightsStatement/rightsUrl e rightsSnapshot com as seis permissões históricas. Projeção acrescenta availability e permite quote null; documento armazenado conserva quote original. Section contém kind/status/text/evidenceIds; Interpretation contém classification/text/evidenceIds. Todos os objetos/arrays do domínio são copiados e imutáveis; ids de evidência referidos têm de existir. Exigir evidência para documented-fact é invariante estrutural e não prova semântica automática; o construtor determinístico inicial não cria interpretações sem curadoria.

Perfil de token inclui typ JWT e lifetime exp-iat no máximo3600s, com claims inteiros e verificação da idade/data. O subject vem exclusivamente do token verificado. jwtSecret ausente ou string vazia significa não configurada; outro valor fornecido requer32 bytes UTF-8, preservados sem trim. Falha da entrega por infraestrutura mantém500; conflito de expectedVersion ou impossibilidade de criar a próxima versão devolve409 CONFLICT, mensagem `Não foi possível criar esta versão.`. Substitui a proposta preparatória «Estado alterado; relê o recurso» antes de implementação, mantendo409 e sem alterar contratos entregues de outras sprints. Dados são retidos localmente sem expiração automática nesta sprint; gestão/eliminação do histórico pertence a S07, sem prometer retenção contratual ilimitada.

T004: contratos/decisões/dependências refinados e proveniência/direitos da associação conferidos. T005: RED/GREEN para Study/StudySection/Interpretation/Evidence e controlo de acesso; classificação e imutabilidade. T006: Application real/Nest/Prisma, versão atómica/concorrente, owner A/B,401/400/404/409/500, redigir fonte revogada e nunca inventar suporte; JWT local real com exp/issuer/audience/algoritmo verificados. T007: percurso referência → cânone/fontes → estudo/versionamento → recuperação, gates, docs e limites.

Limites de qualidade prescritos: linhas>=90%, branches>=85%, mutação bruta>85%, zero falha obrigatória; sem IA aplicável neste recorte. Fixtures são textos genuínos já admitidos; identidades de utilizador de teste são técnicas. Riscos: contexto insuficiente, vazamento de snapshot antigo, concorrência, token sem validade ou JWT de outro issuer; cada risco tem caso negativo obrigatório. Alternativa de histórico anónimo adiado foi rejeitada para evitar migração posterior de dados privados sem owner. Alternativa de OAuth remoto acrescentaria credenciais/interação não necessárias ao uso local; não adotada automaticamente.
