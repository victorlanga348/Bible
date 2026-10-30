# Ações externas necessárias

Estado atual2026-10-30/S08-T008: nova ação EXT-007 Google login, consentimento real NOT_RUN/BLOCKED até o utilizador testar. Implementação/gates automáticos podem avançar. O utilizador respondeu «Vou testar depois» ao convite para http://localhost:3000/auth/google; não repetir pergunta nem pedir token/segredo. Conferir no Console do web client existente as origens http://localhost e http://localhost:3000 (ou PORT), branding/consentimento/test users se exigidos. GOOGLE_CLIENT_ID e jwtSecret já presentes, nenhum client secret requerido no fluxo GSI. Critério de desbloqueio: entrar com conta real e confirmar token local/acesso privado; erro deve ser informado apenas por mensagem, nunca credencial. [Contrato](../sprints/S08/GOOGLE_AUTH_SPEC.md)/[plano](../sprints/S08/tasks/S08-T008-google-login.md). Resoluções anteriores abaixo não encerram esta nova ação.

Estado vigente2026-10-29/S08: EXT-001(modelos),002(bancos),003(cânone),004(fontes/avaliações),005(acesso/retenção) e006(operação/recuperação) RESOLVED no recorte pessoal local. [Provas finais](../sprints/S08/TEST_REPORT.md)/[runbooks](../operations/runbooks.md). Nenhuma ação/chave do utilizador pendente para esta entrega. S08 DONE técnico; publicação remota/outro ambiente/fuso ou direitos adicionais fora do escopo. Estados mais antigos abaixo são históricos, não reabrem ações já resolvidas.

Resolução S07-T006: prova nativa/revisão/preservação PASS, CI40900841329 oito SUCCESS; o pedido anterior sobre OneDrive deixou de ser necessário e nenhuma ação sobre o serviço foi executada. Não há ação/segredo pendente do utilizador para este incremento local. [Fecho](../sprints/S07/T006_COMPLETION_REPORT.md).

Estado S07-T0062026-10-29: provas locais limitadas por memória (V8OOM/134; menos de1GB físico livre observado). Pedido específico assíncrono pendente para encerrar temporariamente e reabrir OneDrive, por instrução de preservar serviços alheios no [AGENTS](../../AGENTS.md). Nenhuma ação sobre esse serviço executada; não são necessárias credenciais. Enquanto pendente, CI remota continua e testes técnicos locais usam limite temporário de heap, sem alterar timeouts/modelos. Critério de desbloqueio: resposta explícita sobre essa ação ou recursos libertados pelo utilizador; uma inspeção readiness PASS isolada não aprova o turno nativo anteriormente503.


Resolução local2026-10-29: S06/9turnos nativos e revisões PASS, acesso/retention/eliminação e bancos reais comprovados no [fecho](../sprints/S06/T007_COMPLETION_REPORT.md). EXT-001/004/005 satisfeitas para este recorte local pessoal, sem ação/segredo adicional do utilizador. Direitos de publicação, ambiente de release e políticas S07/S08 exigem as respetivas provas; não se tornam PASS por esta avaliação. Autorizações de execução já vigentes; fontes e recursos locais não devem ser reprovisionados sem necessidade.

Resolução local2026-10-28: S05/14avaliações reais+revisão e gates concluídos, [fecho](../sprints/S05/T007_COMPLETION_REPORT.md). EXT-001/004 satisfeitas no recorte local admitido, sem ação/chave adicional do utilizador; direitos públicos/remotos e avaliações futuras S06/S08 exigem provas próprias. Não repetir provisionamento local já verificado.

Estado T0062026-10-27T18:44Z: sem nova ação/segredo do utilizador. Configuração privada real acrescentada preservando valores anteriores; migração principal6 e admissão operacional própria importadas. Indexação nativa1911tokens/11vetores1024/1profile no banco AI separado PASS; corpus/fonte legada/local-owner preservados por hashes. Prova HTTP nativa em execução e14avaliações/gates correntes continuam pendentes. Regressões locais posteriores encontraram prazos sob pressão de memória e não são PASS; verificar fonte estável em CI, sem enfraquecer requisitos. [Estado breve](../megabrain/agent-context/project-state.md), [provas](../sprints/S05/TEST_REPORT.md).

Atualização T0062026-10-27T10:05Z: nenhuma ação/segredo do utilizador necessário para migrações locais atuais. Teste descartável próprio foi recriado com PG17.11/pgvector0.8.7 pinado e recebeu6migrations app+1ai; banco separado bible_ai/bible_ai_owner/loopback55436 recebeu1migration ai, zero fonte/perfil/chunk importados. Antes/depois .env e bible_db16.14/5migrations/66livros/1189capítulos/31102versículos/fontes/estudo preservados. Provider T005 já tem fecho válido; RAG/HTTP/inferência integrada/14 avaliações/gates da sprint continuam pendentes, não dispensados por infraestrutura disponível. [Operação/provas](../integrations/local-ai.md), [relatório T006](../sprints/S05/TEST_REPORT.md).

Atualização S05-T0042026-10-26: runtime local assinado/autenticado/modelos/pins/licenças, embeddings1024 e pgvector/teste/desenvolvimento persistente comprovados, perfil extrativo v6 viável10/10. Sem ação/segredo adicional do utilizador para a preparação local; credenciais reais próprias em ficheiros ignorados fora do Git. EXT-001/004 ficam resolvidas apenas quanto a recursos/admissão local de pré-avaliação; adapter/produto/CI/dados de teste/14 avaliações/gates continuam por implementar/comprovar em S05. Fixture/linhas legadas sendToAi pending preservadas, sem alegar admissão remota. [Perfil](../ai/profiles/local-extractive-v1.json), [admissão limitada](../sprints/S05/DATA_ADMISSION.md), [provas](../sprints/S05/TEST_REPORT.md). Estados históricos das fichas seguintes são subordinados a este recorte, não exigem nova criação de conta/chave paga.

Atualização2026-10-26: S04 encerrada com907 testes locais/CI40338249693 e mutação corrigida aprovados. PostgreSQL nativo/corpus/.env preservados e base de teste reconstruída/migrada/verificada, sem ação adicional do utilizador. Integração IA/S05 continua por preparar/comprovar, sendToAi pending; a autorização integral permite investigar solução local gratuita, não inventar credencial/chamada/modelo ou declarar avaliação semântica PASS. [Revisão S04](../sprints/S04/REVIEW.md). Notas seguintes históricas.

Atualização S04-T0062026-10-22: nenhuma ação do utilizador necessária para PostgreSQL/identidade local atuais. bible_db do PC agora tem cinco migrações, corpus bíblico preservado, uma obra/quatro parágrafos operacionais, associação GEN1:1/Josefo I.1.1 e estudo local-owner em duas versões, verificados por HTTP real. Chave jwtSecret do .env usada sem alteração/exposição; GOOGLE_CLIENT_ID preservado sem login Google. Backup pré-migração ignorado e provas em reports/s04-native-*. Integração IA/S05 continua pendente, sendToAi pending; não atribuir chamadas reais a esta prova determinística. [Relatório S04](../sprints/S04/TEST_REPORT.md).

Fecho integral S02 em2026-10-22: EXT-002 comprovada no PostgreSQL16.14 do PC/5432/bible_db e PostgreSQL17.11 de teste/CI, quatro migrações e corpus66/1189/31102 autêntico; CI39778403173 passou todos os gates aplicáveis. Sem ação adicional do utilizador para a base/corpus atuais. Estudo/autenticação local e IA seguem S04/S05, ainda sem afirmar consumo de jwtSecret/GOOGLE_CLIENT_ID ou chamada de IA. Estados históricos abaixo devem ser lidos com as atualizações da respetiva ação e os relatórios atuais.

Execução vigente2026-10-22: autorização geral para terminar sprints/commits/push sem nova permissão, com qualidade e segredos preservados. EXT-002 agora inclui migração/consulta da base local e corpus bíblico integral; IA ainda não implementada e sem credencial externa, com investigação de inferência local gratuita em preparação. Estados de2026-10-21 abaixo são históricos; resultados atuais estão nas atualizações da ação/sprint respetiva.

Atualizado: 2026-10-21. S00–S03 encerradas após os aceites próprios; S03 tem biblioteca independente de fontes implementada e validada no alvo isolado de teste. Corpus S02 local/domínio presentes, integração bíblica adiada e nenhuma integração IA. Configuração e credenciais locais ignoradas pelo Git, sem valores neste registo.
Responsável por cada ação/decisão: utilizador; agente prepara e valida apenas no escopo aprovado. Não enviar segredos pelo chat, commit ou log. Estados de ações: ACTION_REQUIRED até evidência de desbloqueio; resultados de testes são separados.

## EXT-001 — AI Provider

ID: EXT-001
Componente: AI Provider e embeddings
Estado: ACTION_REQUIRED
Sprint afetada: S05; integração/avaliações de S06/S08

Ação necessária:
Escolher fornecedor, modelos de geração/embeddings, orçamento/quotas e tratamento de dados; autorizar acesso e configurar credenciais no ambiente apropriado.

Local:
Configuração local não versionada e gestor de segredos de CI/deployment após escolha; nenhum ficheiro de segredos criado.

Variável:
Pendente do contrato aprovado do adapter. LLM_API_KEY é exemplo do pedido mestre, não prova de chave configurada.

Como obter:
Após escolher fornecedor, usar os seus procedimentos oficiais de criação de conta/projeto e credencial; documentar URLs, modelo, limites e rotação nessa tarefa. Não inventar procedimento de fornecedor ainda indefinido.

Implementação preparada:
Apenas plano modular, limites, ports/adapter e avaliações previstos documentalmente; nenhum adapter implementado.

Validação pendente:
Contrato determinístico, chamada real autorizada, embeddings/recuperação, citações/suporte e avaliações com corpus/rubrica aprovados; falhas/timeout/limites reais.

Critério de desbloqueio:
Decisões e orçamento aprovados, credencial configurada fora do Git, adapter implementado no escopo e testes reais aprovados. Sem isso, teste/gate correspondente BLOCKED.

## EXT-002 — PostgreSQL isolado

ID: EXT-002
Componente: PostgreSQL de desenvolvimento e testes
Estado: RESOLVED (ambiente local S01; CI remoto ainda NOT_RUN)
Sprint afetada: S01 e suites de persistência posteriores

Ação necessária:
Utilizador escolheu Docker Desktop local. Motor Linux iniciado; PostgreSQL dev/test separados estão saudáveis. Não é necessária intervenção adicional para os testes locais S01.

Local:
backend/compose.yaml; dev 127.0.0.1:55432/biblia_dev, testes 127.0.0.1:55433/biblia_test. CI tem serviço efémero separado e workflow configurado; execução remota não comprovada.

Variável:
DATABASE_URL, BIBLE_DEV_DB_PASSWORD e BIBLE_TEST_DB_PASSWORD em backend/.env; TEST_DATABASE_URL e NODE_ENV=test em backend/.env.test. Valores privados não versionados. Contrato em docs/sprints/S01/SPEC.md.

Como obter:
Procedimento reproduzível em backend/README.md. Palavras-passe locais distintas geradas com fonte criptográfica; imagem oficial PostgreSQL17 fixada por digest. Nenhum serviço contratado.

Implementação preparada:
Compose real, adapter Prisma/pg, migração versionada, guard de alvo e identidade, fixture exclusiva de testes, integrações e HTTP reais.

Validação pendente:
Verificações locais executadas: migração em base vazia, leitura/escrita parametrizada, PK/CHECK, commit/rollback, limpeza e identidade. Resultado PASS no relatório S01. Workflow remoto NOT_RUN sem push autorizado; não o declarar validado.

Critério de desbloqueio:
Cumprido localmente: ambiente disponível, identidade biblia_test/biblia_test comprovada e sete integrações reais aprovadas, incluindo fecho físico de sessão. Em 2026-10-21, após reiniciar Docker e recriar tmpfs, migração reaplicada e suite real aprovada. A resolução desta ação não aprova os restantes gates nem o encerramento da sprint.

### Atualização operacional — PostgreSQL instalado no PC

Em2026-10-21, após o utilizador indicar o PostgreSQL instalado no PC e pedir «voce nao consegue criar a base de dados daqui mesmo?», foi criada a base de desenvolvimento `bible_db`, owner `postgres`, no servidor local PostgreSQL16.14/porta5432 já indicado por DATABASE_URL. Inspeção prévia confirmou servidor/identidade e ausência da base; operação explícita `CREATE DATABASE "bible_db" OWNER "postgres"`, sem remoção/substituição de base existente. Ligação posterior PASS, current_database=bible_db/current_user=postgres. Credenciais vieram do `.env` ignorado, sem valores expostos ou alterados.

Resultado inicial: base criada e acesso confirmado; naquele momento schema `app`, tabelas/migrações e acervo de desenvolvimento ainda ausentes/NOT_RUN. Artefacto local ignorado: backend/reports/local-development-database-created.json. A criação não aplicou as migrações.

Atualização2026-10-22 após autorização geral de execução/commits/push: confirmado bible_db/postgres/5432 e zero relações de utilizador antes de provisionar. Acrescentado somente schema=app à DATABASE_URL no `.env`, preservando as demais chaves/valores. CLI Prisma já instalada executou migrate deploy com ambiente explícito development/DATABASE_URL e TEST_DATABASE_URL removida do processo filho; não se reutilizou o comando guardado de teste. Três migrações aplicadas e verificadas em app._prisma_migrations. Prova real Nest/Prisma/Supertest no PostgreSQL16.14: GET /health/ready200 e GET /sources200 com catálogo vazio; PASS. Nenhuma fixture importada para desenvolvimento nem alteração no banco de teste. Log sanitizado e resumo em backend/reports/local-development-migrations.log e local-development-provisioned.json. Essa prova valida o provisionamento/leitura vazia, não substitui os testes de todas as regras S03 no PostgreSQL17. Google/JWT continuam sem implementação até tarefas próprias. Autorização e sequência atual em [execução integral](../roadmap/completion-execution.md).

Atualização complementar S02 em2026-10-22: quarta migração biblical_canon aplicada em bible_db/5432, corpus integral ZIP/XML autenticado importado (não os excertos de teste),66 livros/1189 capítulos/31102 versículos e todos os textos persistidos verificados. Nest/Prisma/Supertest reais confirmaram readiness, catálogo, passagem e resolução200 no PostgreSQL16.14. Não altera env nem banco de teste nessa operação. Resumo reports/local-canon-provisioned.json e log local-canon-migrations.log sanitizado; score final de mutação do incremento ainda em curso, sem aceitação antecipada de release.

## EXT-003 — Cânone e traduções

ID: EXT-003
Componente: biblical-canon
Estado: RESOLVED para snapshot e usos S02 v0.2; implementação/gates da sprint separados
Sprint afetada: S02

Atualização 2026-10-21, S02-T004: S01 encerrada/commitada e continuação S02 autorizada. Cânone/edição solicitados ao utilizador; ainda sem decisão. Pesquisa de condições declaradas para Bíblia Livre/porbr2018 e BPM/porbrbsl na [SPEC S02](../sprints/S02/SPEC.md), sem seleção, download ou incorporação de corpus. Esta pesquisa não resolve a ação nem aprova os usos.
Após «avanca», pacote v0.2 proposto na SPEC: obter/verificar Bíblia Livre/porbr2018 e catálogo de66 livros, preservar edição/atribuição/licença/proveniência e limitar usos ao backend local previsto. Aprovação do pacote e inspeção do artefacto/aviso continuam pendentes; não há hash/importação nem resolução de EXT-003 por inferência.

Ação necessária:
Decidir cânone, versificação, identidades de livros e traduções/edições; fornecer dados autênticos com permissões verificadas para os usos concretos.

Local:
Registo editorial em docs/biblical-library/canon-and-versions.md e catálogo de origem/licenças; fixtures autorizadas versionadas quando houver plano de importação aprovado.

Variável:
Não aplicável a decisão editorial; eventual configuração do importador ainda não definida.

Como obter:
Identificar edições e respetivos detentores/fontes, obter texto e condições autorizadas, documentar proveniência e restrições antes de copiar/indexar/exibir/enviar a IA. Acesso público por si só não comprova autorização de todos esses usos.

Implementação preparada:
Responsabilidade modular, parser/validação/importação previstos; nenhum texto ou catálogo importado.

Preparação documental refinada em S02-T004: PLAN, SPEC rascunho, ficha da tarefa, alternativas/riscos e matriz de critérios. Nenhum adapter/parser/modelo/API bíblico executável criado. Depois das escolhas, concretizar contratos e verificar o artefacto/usos para aprovação antes de implementação.

Validação pendente:
Dados reais de livros/capítulos/versículos, diferenças de versificação, casos válidos/inválidos, navegação e API com atribuição e direitos respeitados.

Critério de desbloqueio:
Cânone/versificação e edições/usos aprovados, origem/licenças registadas e corpus reproduzível disponível; executar testes reais previstos.

Resolução em 2026-10-21: «ok» explícito após pacote v0.2 e plano T005. ZIP porbr2018 obtido, aviso incluído confirma CC BY4.0/créditos, hash real `1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682`; XML canónico/catalogação confirmam66 livros/1.189 capítulos/31.102 versículos. Manifesto/aviso/fixture em backend/test/fixtures/biblical-canon/porbr2018; corpus completo local ignorado. Diferenças TXT/XML foram diagnosticadas e o texto do XML foi preservado sem correção. Usos admitidos limitados à SPEC aprovada, sem imagens/áudio/comentários, IA ou incorporação de fontes históricas. A resolução não é PASS de importação no banco/API; T005/T006/T007 exigem as provas próprias. Histórico anterior acima preserva a cronologia, não o estado atual.

## EXT-004 — Fontes e corpus de avaliação

Atualização2026-10-21: preparação S03 autorizada após S02 c0c24b9; [SPEC/plano T004](../sprints/S03/SPEC.md) propõem Josefo/Whiston/Gutenberg2848 e capítulo inicial, com condições por operação, localização/cobertura e limitações explícitas. Pesquisa primária efetuada, mas recorte/contratos/curadoria ainda aguardam aceite; corpus/aviso/hash/fixture não obtidos/admitidos. OpenStax permanece alternativa com requisitos de IA próprios. Estado ACTION_REQUIRED preservado, sem assumir licença universal ou integração/evaluação resolvidas.

ID: EXT-004

Atualização T006/T007 aprovadas: importação, pesquisa e HTTP reais implementados/validados localmente no recorte admitido; gates em TEST_REPORT S03. Original HTML completo permanece ignorado; o workflow passa a provisioná-lo por HTTPS e SHA-256 fixo antes das suites. Download real e rejeição de falha/bytes alterados foram verificados localmente; CI remota NOT_RUN. Não há bloqueio local de fonte/credencial para o capítulo atual, nem autorização de IA ou ampliação. Desenvolvimento não foi migrado/importado. T007 validou o `.env` do utilizador e sincronizou apenas `BIBLE_TEST_DB_PASSWORD` com a credencial de `.env.test`/base já validada; demais valores preservados e Compose resolvido conferido, sem expor segredos ou recriar containers.

Resolução parcial verificada em2026-10-21 após «vai enfrente»: capítulo1 do Livro I de Josefo/Whiston/Gutenberg2848 admitido para ingest/store/index/display/quote locais e fixture versionável de teste. HTML SHA098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99;4 parágrafos/localizações reais, aviso integral de export irmão e condições/revisão local no manifesto/README da fixture source-library. sendToAi pending; não resolve corpus/avaliações/integrações IA ou outras obras. Estado geral ACTION_REQUIRED preservado para ampliações/IA, não bloqueia o recorte documental/local já admitido. Esta resolução de curadoria não era prova de integração; T006 posterior foi aprovada e verificada no recorte local, conforme atualização acima.
Componente: source-library e avaliações IA
Estado: ACTION_REQUIRED
Sprint afetada: S03/S05/S08

Ação necessária:
Aprovar fontes históricas/académicas autênticas, proveniência/localização, cobertura/divergências e permissões de ingestão/citação/envio ao fornecedor; curar casos de referência.

Local:
docs/biblical-library/source-catalog.md, política de fontes e futuro corpus de teste autorizado.

Variável:
Não aplicável à curadoria; credenciais de acesso a fontes, se necessárias, serão especificadas sem valores.

Como obter:
Selecionar obras/edições verificáveis, obter acesso e condições concretas, identificar excertos/localizações e revisão humana. Nenhuma fonte foi selecionada ou licença verificada nesta consolidação.

Implementação preparada:
Source/SourceExcerpt, proveniência/permissões, importação/pesquisa/HTTP locais T004–T006 verificados com a fixture admitida. Acervo maior e avaliações semânticas/IA continuam futuros.

Validação pendente:
Para ampliações/IA: novos corpora/usos, referências e suporte efetivo, divergências, curadoria/rubrica e direitos. A integração lexical local T006 já passou; não resolve suporte semântico SR-AC05.

Critério de desbloqueio:
Fontes/usos/corpus aprovados e disponíveis, com testes/avaliações reais executados. Não criar história/citação fictícia para substituir dados ausentes.

## EXT-005 — Acesso e política de dados

Atualização de recorte2026-10-28/S06-T004: decisões de autenticação local/owner JWT já implementadas e comprovadas em S04/S05; retenção/eliminação/limites privados de conversa aceites pelo agente delegado na [SPEC S06](../sprints/S06/SPEC.md). Nenhuma chave, conta ou decisão adicional do utilizador para esta entrada local. Contratos de acesso/retention de conversa estão decididos antes de código; testes reais de conversa/eliminações S06-T006/T007 ainda pendentes e exposição/deployment S08 continuam por verificar. ACTION_REQUIRED histórico abaixo refere-se às condições futuras ainda não demonstradas, não a nova aprovação necessária para T005.

ID: EXT-005
Componente: proteção do uso privado, histórico, conversas e envio a fornecedores
Estado: ACTION_REQUIRED
Sprint afetada: antes da exposição/dados pessoais; S05/S06/S07 e release S08

Ação necessária:
Decidir autenticação/autorização, acesso inicial, retenção/eliminação, recuperação e dados que podem sair para IA. Uso pessoal não implica acesso anónimo.

Local:
docs/integrations/auth.md e decisões DEC-04/DEC-10; configuração segura depois de aprovado o mecanismo.

Variável:
Pendente do mecanismo/contrato; nenhum segredo de autenticação definido ou criado.

Como obter:
Aprovar política e mecanismo adequados ao ambiente; após escolha documentar geração/armazenamento/rotação e procedimento de acesso/revogação correspondente.

Implementação preparada:
Pendências e critérios de acesso isolados documentalmente; sem utilizadores/tokens/sessões/endpoints implementados.

Validação pendente:
Fluxos autorizado/negado reais, isolamento de dados, retenção/eliminação e ausência de exposição de segredos; verificação dos dados enviados ao fornecedor.

Critério de desbloqueio:
Política/mecanismo e contratos aprovados, configuração segura e testes reais pertinentes aprovados antes de exposição ou uso dos dados.

## EXT-006 — Deployment e operação

ID: EXT-006
Componente: ambiente de disponibilização e operação
Estado: DECIDED para release pessoal local; validação NOT_RUN
Sprint afetada: S08

Decisão2026-10-29 do agente delegado: ambiente pessoal local existente, custo incremental zero/sem serviço pago, JWT/loopback e limites atuais, backups privados/restauro isolado/metas na [SPEC S08](../sprints/S08/SPEC.md). Não requer chave/conta/permissão adicional do utilizador; validações técnicas continuam obrigatórias. Publicação remota é ampliação futura separada. Texto de preparação abaixo histórico.

Ação necessária:
Escolher ambiente, acesso, custos autorizados, segredos, backups/recuperação e critérios mensuráveis de disponibilidade/desempenho. Autorizar publicação separadamente.

Local:
docs/operations e configuração do ambiente escolhido, ainda não provisionado.

Variável:
Pendente do ambiente/contrato; não existe configuração de deployment aprovada.

Como obter:
Depois de aprovar ambiente/fornecedor, documentar procedimentos oficiais, recursos/permissões e segredos necessários; não contratar ou publicar antecipadamente.

Implementação preparada:
Plano de hardening/release e registo de decisão; nenhum deployment, serviço ou pipeline operacional executado.

Validação pendente:
Prontidão de configuração/segurança, arranque real, persistência/IA, desempenho básico, backup e restauro no ambiente autorizado; suites completas e relatório final.

Critério de desbloqueio:
Ambiente/políticas aprovados, acessos configurados com segurança e validações obrigatórias reais aprovadas. Deployment publicado apenas após autorização específica, sem pendências críticas.

Checkpoint6a5142e/CI40900841329: foundation PASS2133testes/102suites83,516s,83tooling,100%linhas97,56%branches; seis shards de mutação em execução, nenhum gate agregado presumido. Artefacto backend-quality12909088496/381551bytes/SHAa03a7a33c3a07bfd7da76850f32bd7b914a178f175fe746a0bfa972ad4e2bb0f baixado/verificado. Prova nativa repetida após readiness real PASS: raw r5T0gk REVIEW/SHA cb85ea08fee35cf58c7a4160334cc8a8e7a77bf74a6dd57682147ef1f60c83c5, todos cinco checks PASS incluindo turno nativo/commit/reabertura/cleanup; wrapper034bb327… REVIEW/preservação14tabelas+índice PASS. Revisão semântica separada ainda pendente/T007. Raw503anterior permanece FAIL, causa exata não estabelecida. Pedido de fechar OneDrive deixou de ser necessário para esta prova; nenhuma ação sobre o serviço foi executada e eventual autorização tardia não exige executá-la.
