# S01 — Domínio Bíblico

## Objetivo
Refinar regras e implementar apenas o domínio aprovado, independente de tecnologia externa.

## Estado e aprovação
BACKLOG — proposta, sem aprovação de início ou implementação.
Sem datas de início/fim atribuídas. Responsáveis e revisores técnicos futuros por designar; aprovador inicial: utilizador.
Aprovação do escopo, specs e planos de tarefa: pendentes e separadas.

## Dependências e trilhas
Dependências: [S00](../S00/README.md)
Trilhas: B; A no harness. Trilhas não implicam serviços separados nem autorização de paralelismo.

## Critérios de entrada
S00 encerrada com aprovação; plano de S01, requisitos e decisões necessários aprovados.
Contratos necessários não aprovados bloqueiam a implementação dependente.

## Entregáveis e critérios de saída
Refinar conceitos, invariantes, seleção/comparação e specs de domínio; preparar toolchain de testes aprovada; verificar compatibilidade StrykerJS; implementar regras aprovadas por TDD.
Critérios detalhados em [acceptance](acceptance.md); tarefas elegíveis a DONE só com gates aplicáveis satisfeitos. Relatório, pendências e roadmap atualizados; aprovação explícita de encerramento antes de marcar a sprint DONE.

## Navegação
[Escopo](scope.md) · [Backlog e tarefas](backlog.md) · [Aceitação](acceptance.md) · [Retrospectiva](retrospective.md).
Specs e referências: [Regras](../../product/business-rules.md); [Contextos propostos](../../architecture/bounded-contexts.md); [Specs em rascunho](../../specs/README.md).
Processo: [sprints](../README.md), [gates](../../quality/quality-gates.md), [dependências globais](../../roadmap/dependencies.md).
