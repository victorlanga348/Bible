# S02 — Persistência e Contratos

## Objetivo
Preparar persistência real e interfaces aprovadas, incluindo histórico sem presumir autenticação.

## Estado e aprovação
BACKLOG — proposta, sem aprovação de início ou implementação.
Sem datas de início/fim atribuídas. Responsáveis e revisores técnicos futuros por designar; aprovador inicial: utilizador.
Aprovação do escopo, specs e planos de tarefa: pendentes e separadas.

## Dependências e trilhas
Dependências: [S01](../S01/README.md)
Trilhas: A; B e C na revisão. Trilhas não implicam serviços separados nem autorização de paralelismo.

## Critérios de entrada
Domínio necessário aprovado/testado; plano da sprint e modelo/acesso/contratos aprovados para cada implementação.
Contratos necessários não aprovados bloqueiam a implementação dependente.

## Entregáveis e critérios de saída
Aprovar modelo físico, acesso/retenção e contratos; bootstrap NestJS/Prisma/PostgreSQL; migrações e repositórios reais; persistência e consulta de histórico conforme SH-001.
Critérios detalhados em [acceptance](acceptance.md); tarefas elegíveis a DONE só com gates aplicáveis satisfeitos. Relatório, pendências e roadmap atualizados; aprovação explícita de encerramento antes de marcar a sprint DONE.

## Navegação
[Escopo](scope.md) · [Backlog e tarefas](backlog.md) · [Aceitação](acceptance.md) · [Retrospectiva](retrospective.md).
Specs e referências: [SH-001](../../specs/study-history.md); [Modelo proposto](../../architecture/data-model.md); [Contratos pendentes](../../integrations/api-contracts.md).
Processo: [sprints](../README.md), [gates](../../quality/quality-gates.md), [dependências globais](../../roadmap/dependencies.md).
