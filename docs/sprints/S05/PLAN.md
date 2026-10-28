# S05 — IA e RAG

Execução2026-10-28 concluída sob delegação vigente: T004–T007/gates/14casos reais e revisão PASS; [fecho](T007_COMPLETION_REPORT.md). Plano anterior preservado abaixo.

## Plano de execução delegado — 2026-10-26

Preparação T004 concluída por provas/revisão delegada: [SPEC](SPEC.md)/[ADR-0006](../../architecture/adr/ADR-0006-ia-local-e-indice-reconstruivel.md)/[perfil local-extractive-v1](../../ai/profiles/local-extractive-v1.json), dez casos v6 conformes/pins/limites/destino local documentados. T005 READY, T006/T007 dependentes; nenhum código de produto implementado. Distribuição engine assinada Ollama0.40.11/b11845 e GGUF registry Q4_K_M escolhidos pelos resultados, preservando baselines falhadas e discrepância de rótulo. Opção inicial unsigned seguinte histórica e bloqueada pelo Windows, nunca fallback. Auditorias reais/configuração/documentos no TEST_REPORT/REVIEW.

S04 encerrada/publicada90241d5f8038a6d5225d1de7558d224534506b97; S05 BACKLOG→READY→IN_PROGRESS, uma tarefa ativa S05-T004. A autorização integral/reafirmação do utilizador delega decisões, dependências, instalação gratuita, implementação/validação/fecho/commit/push sem nova pergunta. Não autoriza score fictício nem custos pagos. Este plano concreto precede instalações/código; rascunho S00 seguinte histórico.

Objetivo: integrar geração/embeddings/recuperação reais com proveniência, acesso e direitos atuais, respeitando módulos. Ordem: T004 comprova runtime/modelos/pgvector/direitos e fixa SPEC/ADR/rubrica; T005 implementa ports/adapter/limites/falhas por TDD; T006 integra armazenamento vetorial e recuperação por contratos públicos; T007 executa avaliações semânticas reais e gates/fecho. Nenhuma sucessora começa antes da saída da predecessora.

Decisão preparatória do agente: testar llama.cpp CPU b11815 e GGUF oficiais Qwen2.5-1.5B-Instruct-Q4_K_M/Qwen3-Embedding-0.6B-Q8_0 nos pins/digests de FEASIBILITY, depois de reconferir metadados/licenças. Instalação portátil em %LOCALAPPDATA%/BibleAI, fora de Git/OneDrive, arquivos/modelos total aproximado1,78GB; disco livre observado28,35GB, CPU i3-1005G1/quatro threads/RAM8GB. Um modelo ativo de cada vez, loopback, credencial local aleatória real em ficheiro ignorado fora do Git, sem chave em argumentos/logs. Começar com contexto pequeno e limites de tempo/output, medir memória/latência/dimensão/qualidade; parâmetros finais dependem da prova. Sem envio remoto do corpus. Downloads de pesos não demonstram inferência.

Pgvector0.8.7: inspecionar artefacto/ABI16/permissões reais e ferramentas C++ antes de instalar extensão nativa de forma aditiva/reversível, sem substituir o PostgreSQL nem dados. Prova inicial em base isolada, sem fixtures no desenvolvimento; decidir explicitamente imagem de teste/CI compatível depois. Se inviável, documentar causa e avaliar alternativa local compatível antes de alterar arquitetura. Não tocar em containers/processos domus observados no mesmo Docker. Só processos próprios conferidos podem ser parados; Docker Desktop mantém outros projetos ativos.

HTTP nativo/SDK: o backend já usa fetch/TypeScript/Zod, sem pacote ai. A skill ai-sdk foi consultada como comparação; um adapter HTTP do protocolo local fixado evita dependência/plataforma adicional e permite timeout/limites/erros explícitos. A escolha definitiva será documentada na SPEC/ADR antes de produto. Não instalar SDK só para ler API não utilizada. Qualquer dependência efetivamente necessária recebe versão/licença/justificação antes de instalação.

Dados/direitos: manter a fixture S03 sendToAi pending. Antes de enviar texto ao runtime, rever licença/aviso do original e admitir separadamente destino local/operações de geração/indexação; sem chave paga inexistente. Provas iniciais de protocolo podem usar apenas frases técnicas claramente identificadas, sem alegar conteúdo bíblico/histórico admitido. Semântica usa quatro parágrafos originais, perguntas com suporte/sem suporte/injeção e justificações de avaliação pelo agente, sem alegar revisão humana.

Vantagem local: sem cobrança/transferência remota, artefactos/prompt controlados. Custos: RAM/latência/qualidade reduzida de modelo pequeno. Alternativas: runtime/modelo maior só após perfil que caiba; fornecedor pago depende de credencial/orçamento disponíveis. Mitigação: serializar modelos, autenticar servidor, limitar input/contexto/output/tempo, conferir digests e bloquear afirmações/citações sem suporte. Falha real de recurso/qualidade mantém tarefa/gate pendente, não baixa critérios.

Saída T004: embeddings e geração realmente reproduzidos, pgvector em alvo isolado, admissões/contratos/rubrica/limiares/dependências registados antes do produto. RED/GREEN não aplicável a pesquisa documental/probes de infraestrutura; testes de comportamento do produto só depois de SPEC concreta, antes da implementação. Gates de software90% linhas/85% branches/>85% mutação e IA real separados. Comandos de probes ignorados são registados pelo comando real, sem inventar script npm; package.json permanece fonte dos scripts de produto. [Ficha T004](tasks/S05-T004-feasibility-contracts.md), [viabilidade](FEASIBILITY.md).

Estado: RASCUNHO para refinamento; sprint BACKLOG. Documento preparado em S00, sem autorização de execução.
Branch: feat/biblia-backend. Commit: PENDING. Dependência: S04 encerrada e nova aprovação.

## Objetivo e escopo
Estudo gerado por fornecedor real é fundamentado em fontes recuperadas e verificáveis.
LLMProvider port e adapter real; embeddings/pgvector, RAG, geração estruturada, referências existentes/suporte, limites de tokens/custos/execução, timeout/falhas e avaliações.

## Fora do escopo
Frontend, módulos de sprints posteriores, serviços adicionais, merge/push/publicação automática. Aprovar este roadmap não aprova specs, contratos ou imports.
Em S04 não exigir LLM; em S05 não aceitar integração estática como real.

## Tarefas, contratos e ficheiros
Ordem e dependências em [TASKS](TASKS.md). Antes de cada tarefa refinar spec, ports, entradas/saídas Zod/HTTP/OpenAPI, erros, persistência e critérios de segurança pertinentes, sem inventar assinaturas/fields neste rascunho.
Ficheiros previstos: documentação da tarefa/spec, módulo afetado com domain/application/infrastructure/presentation/module.ts, testes e migrações justificadas. Caminhos concretos e dependências aprovados no plano detalhado antes da edição.
Contratos aprovados não existem ainda. Domain independente de NestJS/Prisma/SDKs e Application de adapters; nenhum acesso direto a dados de outro módulo.

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
Scripts reais de package.json serão identificados depois de existir aplicação; não há comandos de suite aprovados neste rascunho.
Executar sete gates aplicáveis, registar por critério comando/ambiente/data/resultado e artefactos, produzir [TEST_REPORT](TEST_REPORT.md) e [REVIEW](REVIEW.md), aguardar aprovação de encerramento/commit. Não iniciar sprint seguinte sem autorização própria.
