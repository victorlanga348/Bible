# Ações externas necessárias

Atualizado: 2026-10-20, S00-T005. Nenhuma integração, corpus ou ambiente de aplicação implementado. Não foram verificadas variáveis/credenciais privadas; não se presume que existam.
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
Estado: ACTION_REQUIRED
Sprint afetada: S01 e suites de persistência posteriores

Ação necessária:
Aprovar mecanismo de isolamento e disponibilizar PostgreSQL de teste independente de dev/produção. Se Docker for aprovado, iniciar o motor Linux e autorizar recursos necessários.

Local:
Ambiente local/CI de teste aprovado, sem acesso a dados reais. Na inspeção, dockerDesktopLinuxEngine indisponível.

Variável:
Nomes/validação a definir no contrato técnico S01-T004; nenhuma ligação ou credencial aprovada. Não presumir nomes nem valores existentes.

Como obter:
Escolher PostgreSQL local isolado ou container/serviço autorizado na decisão técnica; criar base/utilizador exclusivos de teste e fornecer configuração segura. Não contratar serviço ou baixar imagem sem escopo aprovado.

Implementação preparada:
Plano de isolamento, migrações, transações, constraints e limpeza segura; nenhum schema/migração/ligação criado.

Validação pendente:
Arranque, conexão Prisma, migração real numa base vazia, persistência/consulta, transação/rollback, restrição, limpeza e comprovação de isolamento.

Critério de desbloqueio:
Ambiente aprovado disponível, identidade do alvo de teste comprovada e todas as verificações reais executadas; sem isso, integração obrigatória BLOCKED.

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
