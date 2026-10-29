# ADR-0008 — Capacidade opaca para escrita curta no banco principal

Aceite pelo agente delegado2026-10-29 antes de código S07-T006, após fecho T00526d1271. Precisão de ADR-0007/SPEC S07, sem mudar endpoints/dados/direitos nem adicionar dependências. Autorização integral vigente; decisão pertence ao agente.

## Problema e decisão

Executar a escrita do filho numa segunda transação enquanto a primeira bloqueia study é inseguro: o pool tem cinco conexões; callbacks concorrentes podem ocupar todas as conexões e esperar outra; um timeout pode libertar o lock do pai antes de o filho confirmar. Isto é risco do desenho, não incidente observado nem falha atribuída ao utilizador.

StudyStore.guardActive abre transação curta no PostgreSQL principal, faz SELECT FOR UPDATE apenas na sua linha owner/active e passa ao callback uma capacidade opaca WriteScope, definida em Application comum sem Prisma/Nest/ambiente. Infrastructure associa o objeto congelado a Database e TransactionClient numa WeakMap privada, revogando-o em finally. O repositório do filho resolve a capacidade e executa apenas o seu SQL na mesma transação/conexão. Capacidade forjada, expirada ou de outra Database falha antes de SQL. Sem capacidade, os repositórios preservam as transações independentes usadas por testes de persistência específica. Fluxos públicos de escrita dependente sempre usam o guard; não há fallback silencioso se a capacidade for inválida.

Isto precisa a frase anterior «sem transação entre módulos/bancos»: há uma transação curta compartilhada entre repositórios proprietários no mesmo banco principal, por port/capacidade explícitos; não há SQL de outro proprietário, Prisma no contrato nem transação distribuída com banco vetorial. Nenhuma inferência, fonte/fetch, builder ou entrega roda sob lock. Não é framework genérico de repositórios: três consumidores concretos são AI, notas e favoritos.

A eliminação permanece faseada e durável: study.beginDelete → AI.deleteForStudy → workspace.deleteForStudy → study.finishDelete. Cada fase de limpeza tem sua transação própria, sem modelo nem banco vetorial. Falha deixa deleting e503; repetição retoma. A mesma transação curta de escrita torna rollback/timeout atómicos com o lock do pai e impede filho tardio após a marca. Leituras/listas/append ocultam deleting. Análise confirma após inferência sob guard; conversa cria/confirma CAS sob guard, conservando compensação apenas da análise nova. A criação de análise e o CAS são fases separadas guardadas: eliminação entre ambas limpa análises e faz CAS recusar.

## Verificação e custos

Testes PostgreSQL reais comprovam rollback pai/filho, ausência de segunda conexão (cinco operações concorrentes), corrida com beginDelete, capacidades forjadas/expiradas/de outra Database, e cancelamento sem filho após marca. Barreira de escalonamento é explícita e limitada; não substitui persistência. Não usar sleep como prova de ordenação sem observar locks/eventos. Erro preserva causa no limite técnico e permanece sanitizado no HTTP. O custo é uma capacidade técnica e coordenação explícita entre ports; alternativa de mutex em memória não cobre processos e Redis/FK/SQL cruzados continuam rejeitados. Migração9 adiciona lifecycle default active; preservação compara campos antigos e afirma lifecycle=active nos registos anteriores, sem exigir hash idêntico de uma linha cujo schema ganhou coluna.
