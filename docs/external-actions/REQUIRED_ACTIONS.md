# Ações externas necessárias

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
Estado: ACTION_REQUIRED
Sprint afetada: S08

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
