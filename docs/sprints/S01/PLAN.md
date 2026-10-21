# S01 — Fundação Técnica

Plano técnico preparado em S00-T006, 2026-10-20. Estado: ESCOPO/INÍCIO DA SPRINT APROVADOS pelo utilizador: «pode iniciar essa sprint, antes de fazer o commit me pergunta se pode». Sprint DONE em 2026-10-21; revisão/escolhas técnicas/encerramento/commit aprovados: «segunda sprint aprovada, continue com a proxima apos o commit». Branch feat/biblia-backend. Commit AUTORIZADO; hash a registar após criação.
S00 encerrada/commitada. Após autorização de início, escolha de Docker Desktop local e orientação do utilizador para criar o backend, a execução avançou em backend/. As escolhas técnicas do agente estão em [SPEC](SPEC.md); não são apresentadas como aprovações individuais de versões pelo utilizador. Qualquer commit requer confirmação prévia.

## Objetivo
Aplicação NestJS inicia e comunica com PostgreSQL real isolado; comportamento técnico, persistência e HTTP são reproduzíveis e verificados, com ferramentas/gates configurados.

## Escopo e exclusões
NestJS, Node.js LTS compatível, TypeScript strict, PostgreSQL de teste/dev separados, Prisma/migrações, Zod de entrada/saída/configuração, OpenAPI/Swagger, tratamento de erros, logging sanitizado, Jest, Supertest, Stryker, build/lint/arquitetura e CI.
Sem modelo/corpus bíblico, geração IA, RAG/pgvector, módulos de negócio das sprints seguintes, frontend, Redis, microsserviços, filas externas, deploy, push ou merge. Não criar tabelas de negócio provisórias para aparentar progresso.

## Dependências e decisões de entrada
1. S00 encerrada e commitada; aprovação do escopo S01 e planos/specs das tarefas.
2. DEC-07/08: matriz de versões, dependências justificadas e compatibilidade Node/TypeScript/NestJS/Prisma/PostgreSQL/Jest/Stryker/Zod/OpenAPI; gestor de pacotes; formato de módulos/compilação e execução de testes.
3. EXT-002: PostgreSQL real descartável de teste disponível e distinto de dev/produção; aprovar container ou serviço, imagem/versão, credenciais seguras e limpeza. Docker cliente instalado não comprova motor nem banco operacional.
4. Aprovar contratos de configuração/arranque/erros/logging/HTTP e persistência técnica mínima antes dos testes de comportamento dependentes.

Versões, alternativas e contratos concretos: [SPEC](SPEC.md) e backend/package-lock.json. Docker Desktop Linux iniciado; dois PostgreSQL locais isolados estão operacionais. Resultados de compatibilidade são publicados no TEST_REPORT, sem antecipar gates pendentes.
Jest, Supertest, Zod e Stryker já são prescritos; a decisão de versões não reabre a escolha de ferramenta. Incompatibilidade bloqueia, sem troca silenciosa.

## Sequência de tarefas e ficheiros previstos
Fonte de estado: [TASKS](TASKS.md); novos IDs T004–T009 preservam os IDs anteriores no histórico. Responsáveis técnicos por designar; aprovador inicial utilizador. A domínio, B infraestrutura, C qualidade/documentação; execução sequencial.

| Tarefa | Entrega atómica e aprovação | Ficheiros previstos |
|---|---|---|
| S01-T004 | Spec técnica, matriz de versões/dependências, isolamento e contratos. Apresentar para aprovação antes de instalar/codificar | Documentação da tarefa/spec, stack/ADR se necessária, ambientes e ações externas |
| S01-T005 | Harness e toolchain: strict TS, lint/build, Jest/Supertest/Stryker e fiscalização de imports | package.json/lockfile, configurações TypeScript/lint/testes/mutação; ficheiros concretos após seleção aprovada |
| S01-T006 | Composição NestJS, configuração Zod, HTTP/OpenAPI, erros/logging | Entrypoint/composição, presentation/schemas, adapters técnicos e testes; estrutura de módulos apenas quando necessária |
| S01-T007 | Persistência técnica real e migração versionada | Configuração Prisma, schema mínimo aprovado, migração, adapter técnico e testes de integração |
| S01-T008 | Provar percursos reais e gates; preparar CI | Testes Supertest/Prisma, verificação arquitetural, cobertura/mutação e configuração CI aprovada |
| S01-T009 | Consolidar critérios/evidências, documentação operacional e REVIEW | Artefactos de S01, README, MegaBrain e pendências |

O pedido de avançar para o backend orienta a execução da fundação já autorizada. Critérios e resultados por tarefa são rastreados em TASKS/TEST_REPORT. Não autoriza negócio, alterações de stack ou a sprint seguinte.

## Contratos a concretizar e aprovar em S01-T004
| Área | Decisão que o contrato deve tornar verificável | Casos de teste previstos |
|---|---|---|
| Configuração | Nomes, obrigatoriedade, parsing Zod, limites e origem de variáveis sem valores sensíveis; alvo de teste reconhecível | Configuração válida; campo obrigatório ausente/inválido; erro sanitizado; teste não aceita alvo de dev/produção |
| Arranque/encerramento | Composição de dependências, política perante banco indisponível, libertação de recursos | Arranque real; falha prevista; encerramento não deixa ligações/processos da aplicação |
| HTTP e OpenAPI | Operação técnica mínima, método/rota, status, schemas de entrada/saída, erros e documentação publicados | Supertest verifica sucesso/validação/erro conforme contrato e coerência com OpenAPI |
| Erros/logging | Taxonomia técnica, mapeamento HTTP e contexto útil sem credenciais/stack indevida | Mesma falha tem resposta prevista; logs não expõem valores sensíveis nem dados privados |
| Persistência técnica | Recurso mínimo, schema/campos/tipos/constraint/transação justificados, propriedade e migração de teste | Escrita/consulta reais; constraint rejeita entrada inválida; rollback real; limpeza determinística |
| Isolamento | Identificação e proteção do banco de teste, autorização de limpeza e vida das fixtures | Rotina recusa alvo indevido antes de qualquer limpeza; cenários repetíveis sem resíduos |
| CI | Plataforma/runner, PostgreSQL isolado, segredos, comandos reais e publicação de artefactos | Mesmos gates em CI; não confundir configuração do workflow com execução remota aprovada |

Esta tabela conserva as áreas previstas no plano inicial; os contratos executados estão na SPEC. A prova de persistência usa metadados técnicos controlados e identificados, não conteúdo bíblico/histórico inventado. Nenhuma base real de utilização é migrada/limpa.

## Testes e RED → GREEN → REFACTOR
Preparar harness/configuração estrutural com checks executáveis adequados e evidência das limitações; não tratar erro de sintaxe/falta de dependência como RED de comportamento.
Para cada comportamento técnico aprovado: escrever e executar primeiro o teste; guardar RED pela causa esperada; implementar o mínimo e guardar GREEN; refatorar e repetir testes/imports.
Domain puro não precisa de banco; Application usa infraestrutura real como padrão. Neste bootstrap não criar domínio artificial. PostgreSQL, Prisma, migrações, repositório/adapter técnico, consultas, transações e restrições reais. NestJS/Supertest para HTTP real. Doubles não aprovam integração.
Dados técnicos determinísticos/versionados são exclusivos de teste, sem segredos; corpus bíblico/licenças não é necessário ao bootstrap técnico. Integrações IA não são aplicáveis à S01 e não serão simuladas.

## Cobertura, mutação e arquitetura
Linhas >=90%, branches >=85%, Mutation Score bruto >85%, zero erros TypeScript/lint, todos os testes obrigatórios aprovados e build/fiscalização arquitetural aplicáveis.
Definir antes da execução o escopo real de lógica própria: validação/configuração, tratamento de erros e proteção de isolamento pertinentes, além de Domain/Application se realmente introduzidos. Não criar classes/regras sem necessidade para gerar mutantes nem excluir comportamento próprio por ser adapter/composição.
Gerado, migrações e SDKs externos fora do cálculo; justificar cada exclusão adicional. Relatório com categorias, score sem arredondamento favorável e análise de sobreviventes. Sem código mutável real não declarar 100%: justificar aplicabilidade; incompatibilidade/incompletude não é escopo vazio.
Automação de fronteiras deve recusar dependências internas proibidas e ciclos, verificando o que existe; revisão documental da S00 não substitui esses checks executáveis.

## Critérios e validação ponto a ponto
Refinar [ACCEPTANCE_CRITERIA](ACCEPTANCE_CRITERIA.md) com IDs por caso técnico antes de implementar. Critério central: aplicação inicia e comunica com PostgreSQL real, com efeito persistido e isolamento comprovado.
Por critério: teste associado, comando real, ambiente/data/revisão, saída/artefacto, PASS/FAIL/BLOCKED/NOT_RUN e aplicabilidade/motivo. Resultados medidos no [TEST_REPORT](TEST_REPORT.md).
Executar unitários, integração real, E2E aplicáveis, typecheck/lint/build, cobertura, Stryker, imports, migrações, inspeção de segredos e ações externas. Scripts reais publicados em backend/package.json durante o bootstrap; comandos executados e resultados registados no relatório, sem presumir sucesso de ferramentas instaladas.
CI remota é evidência própria; sem execução remota, não declarar PASS. Credencial/serviço obrigatório ausente deixa gate BLOCKED e requer intervenção.

## Riscos, alternativas e mitigação
- Matriz incompatível: conferir documentação oficial e prova real, bloquear antes de aceitar; não substituir Jest/Stryker sem aprovação.
- PostgreSQL indisponível: EXT-002; aprovar/provar ambiente antes da integração. Alternativas local isolado/container/serviço exigem decisão, não contratação automática.
- Limpeza acidental de dados: contrato e teste da proteção do alvo antes da rotina; base descartável de teste.
- Coupling do bootstrap: limitar composição ao necessário; Domain/Application independentes de Prisma/NestJS/SDKs. Custo de mapeamentos é aceite para preservar fronteiras.
- Segredos/logs: configurações não versionadas, exemplos sem valores e validação de logs/artefactos; não pedir segredos no chat.
- CI configurada sem execução: reportar NOT_RUN/BLOCKED conforme causa; não alegar sucesso remoto a partir do local.

## Aprovação e saída
Após validação, [TEST_REPORT](TEST_REPORT.md) e [REVIEW](REVIEW.md), critérios/gates e documentação sincronizados. Antes da aprovação final Commit PENDING; depois de aprovação, `feat(sprint-01): bootstrap backend infrastructure` com ficheiros somente da sprint.
Sem push/merge/publicação sem autorização própria. Ações externas: [registo](../../external-actions/REQUIRED_ACTIONS.md). S01 DONE após validação técnica local e aprovação final explícita. Commit autorizado com a mensagem acima; continuação para S02 autorizada depois dele. Decisões de cânone/licenças e specs/contratos da próxima sprint continuam sujeitas a aprovação própria.
