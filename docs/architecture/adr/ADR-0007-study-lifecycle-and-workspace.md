# ADR-0007 — Ciclo de vida do estudo e eliminação modular

Aceite pelo agente delegado2026-10-29 antes da implementação S07, sob autorização integral vigente. Complementa ADR-0003/0005/0006 e [SPEC S07](../../sprints/S07/SPEC.md). Sem nova tecnologia/dependência.

## Contexto

Notas/favoritos e respostas podem competir com eliminação de estudo/conversa. Validar existência e gravar filho numa segunda operação permite órfãos; transação durante inferência retém pools/locks por minutos. Tabelas de módulos diferentes não devem ser consultadas/apagadas por outro proprietário. Os bancos principal e vetorial continuam distintos; o índice contém fontes, não filhos de estudo.

## Decisão

study_record recebe lifecycle active/deleting, default active para os estudos existentes. StudyLibrary expõe beginDelete/finishDelete e guardActive(owner,id,write), além de listagem própria de metadados. O guard é uma capacidade técnica específica para a consistência deste ciclo, implementada no repositório de study com SELECT FOR UPDATE da sua linha dentro de transação curta. Verifica owner/active antes do callback. Callback faz somente persistência pequena de um módulo e retorna; não recebe transaction/Prisma/table de study. Cada módulo continua a executar suas próprias consultas. Deadline/timeout do banco continuam aplicáveis; falha aborta a confirmação.

Workspace orquestra marca deleting → AI cleanup próprio → workspace cleanup próprio → study finish/cascade só versões. Não há promessa de atomicidade distribuída; há estado durável e repetição idempotente das fases. Somente a conclusão de todas as fases permite204. Falha503 deixa deleting, excluído de leituras normais e de qualquer nova escrita dependente, até repetir DELETE. Outro owner/ausente404. Versão append usa condição active. O guard cobre escrita de conversa, análise, CAS do turno, nota/favorito; inferência e builder permanecem fora. Caso a eliminação comece durante o modelo, o guard final rejeita persistência/confirmação e os caminhos existentes de compensação são preservados.

Metadados de histórico são paginados pelo proprietário, sem join em tabelas de outro módulo e sem regeneração. Relações de passagens são canónicas/privadas independentes de study e não são filhos apagados por DELETE do estudo. Notas/favoritos só se associam a estudo/versão, eliminando ambiguidade de retenção quando uma conversa isolada some.

## Alternativas e consequências

FK/SQL cruzados violam propriedade modular; transação longa durante IA esgota recursos; checar existência sem coordenação perde a corrida; ocultar uma projeção não prova remoção de filhos. Um lock externo/Redis não é necessário: a linha de estudo e PostgreSQL existente fornecem a serialização curta. Tombstone exige retomada após crash, documentação de operação e testes de falha/repetição. O callback deve ser limitado a persistência e comprovado por testes; S08 verifica recuperação/performance/quotas. O consumidor usa port explícito; não criar framework genérico de locking.

## Validação exigida

PostgreSQL real com barreiras de escalonamento comprova bloqueio/ordenação/cancelamento, não doubles de repositório. Corridas de cada escrita dependente contra beginDelete e ausência de filhos após204; falha de cleanup deixa deleting e segunda chamada retoma. Asserts de que nenhuma geração ocorre sob lock, owners/paginações isolados, estudo original preservado fora da eliminação técnica própria, fontes revogadas sem quote em cache. Migração aditiva testada e backup/preservação antes de desenvolvimento. Gates completos de código novo antes de DONE.
