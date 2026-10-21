# Ações externas necessárias

Atualizado: 2026-10-21, S01 DONE após aprovação final. PostgreSQL local isolado operacional e validado; nenhuma integração IA ou corpus implementado. Credenciais PostgreSQL geradas localmente e ignoradas pelo Git, sem valores neste registo.
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
Estado: ACTION_REQUIRED
Sprint afetada: S02

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

Validação pendente:
Dados reais de livros/capítulos/versículos, diferenças de versificação, casos válidos/inválidos, navegação e API com atribuição e direitos respeitados.

Critério de desbloqueio:
Cânone/versificação e edições/usos aprovados, origem/licenças registadas e corpus reproduzível disponível; executar testes reais previstos.

## EXT-004 — Fontes e corpus de avaliação

ID: EXT-004
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
Plano de Source/SourceExcerpt, proveniência, pesquisa e avaliação; catálogo atual vazio.

Validação pendente:
Ingestão/pesquisa real, referências existentes e suporte efetivo, casos sem cobertura, divergências, curadoria/rubrica e direitos preservados.

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
