# Histórico do roadmap anterior

Retrato anterior à consolidação de 2026-10-20. Não é fila ativa nem autorização. Os estados e trilhas abaixo são históricos, sem efeito sobre o ciclo atual. IDs não serão reutilizados. S00-T001 continua DONE no registo ativo.

Baseline Git: `d1d25b7f509ee7b887d53f945550d3f8c2a957d3`. Conteúdo integral anterior recuperável com `git show d1d25b7f509ee7b887d53f945550d3f8c2a957d3:caminho`. DOC-0001, S00-T001 e ADR-0001/0002 preservados.

## S00 — Fundação e Governança

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S00-T001 | Atualizar governança e preparar sprints/roadmap | Transversal | Alta (proposta) | DONE | Nenhuma tarefa anterior | [Governança](../documentation-governance.md) |

## S01 — Domínio Bíblico

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S01-T001 | Refinar e aprovar regras, contextos e specs de domínio | B | Alta (proposta) | BACKLOG | S00-T001 | [Regras](../product/business-rules.md); [specs](../specs/README.md) em rascunho |
| S01-T002 | Validar toolchain e compatibilidade de StrykerJS | A/B | Média (proposta) | BLOCKED | S01-T001 | Spec técnica a aprovar; [mutação](../quality/mutation-testing.md) |
| S01-T003 | Implementar invariantes e políticas de domínio aprovadas | B | Média (proposta) | BLOCKED | S01-T002 | Spec de domínio detalhada a aprovar; [metodologia](../product/study-methodology.md) |

## S02 — Persistência e Contratos

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S02-T001 | Aprovar modelo, acesso, retenção e contratos de persistência/histórico | A/B/C | Alta (proposta) | BACKLOG | S01-T003 | [SH-001](../specs/study-history.md); [modelo](../architecture/data-model.md); [API](../integrations/api-contracts.md) |
| S02-T002 | Preparar NestJS, Prisma, PostgreSQL e migrações reais | A | Média (proposta) | BLOCKED | S02-T001 | Spec técnica de bootstrap a aprovar; [ambientes](../operations/environments.md) |
| S02-T003 | Implementar repositórios e HTTP de histórico aprovados | A/B | Média (proposta) | BLOCKED | S02-T002 | [SH-001](../specs/study-history.md) e contratos HTTP ainda não aprovados |

## S03 — Biblioteca Bíblica

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S03-T001 | Aprovar cânone, edições, licenças, SR-001 e recuperação | B/A | Alta (proposta) | BACKLOG | S02-T003 | [SR-001](../specs/source-retrieval.md); [cânone](../biblical-library/canon-and-versions.md) |
| S03-T002 | Implementar catálogo e recuperação de fontes autorizadas | A/B | Média (proposta) | BLOCKED | S03-T001 | [SR-001](../specs/source-retrieval.md); contrato de recuperação pendente |
| S03-T003 | Verificar proveniência, cobertura e referências em integração real | B/A | Média (proposta) | BLOCKED | S03-T002 | [SR-001](../specs/source-retrieval.md); [fundamentação](../ai/grounding-and-citations.md) |

## S04 — Estudo Estruturado

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S04-T001 | Aprovar SS-001 e contratos internos de geração/validação | B/A | Alta (proposta) | BACKLOG | S03-T003 | [SS-001](../specs/structured-study.md); [orquestração](../ai/orchestration.md) |
| S04-T002 | Implementar regras e casos de uso de estudo por ports | B | Média (proposta) | BLOCKED | S04-T001 | [SS-001](../specs/structured-study.md), contratos internos pendentes |
| S04-T003 | Validar regras, fontes e persistência sem simular integração de IA | A/B | Média (proposta) | BLOCKED | S04-T002 | [SS-001](../specs/structured-study.md); [SR-001](../specs/source-retrieval.md) |

## S05 — Integração de IA

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S05-T001 | Aprovar fornecedor/modelos, contrato e avaliação da IA | B/A | Alta (proposta) | BACKLOG | S04-T003 | [Fornecedor](../integrations/llm-provider.md); [avaliação](../ai/evaluation.md) |
| S05-T002 | Implementar adapter real e validação de respostas | A/B | Média (proposta) | BLOCKED | S05-T001 | [SS-001](../specs/structured-study.md); contrato de IA pendente |
| S05-T003 | Executar integração real e avaliações de fundamentação | B/A | Média (proposta) | BLOCKED | S05-T002 | [Avaliação](../ai/evaluation.md); [fontes/citações](../ai/grounding-and-citations.md) |

## S06 — Perguntas Livres

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S06-T001 | Aprovar FQ-001, contexto e persistência de perguntas | A/B/C | Alta (proposta) | BACKLOG | S05-T003 | [FQ-001](../specs/free-questions.md); [SH-001](../specs/study-history.md) |
| S06-T002 | Implementar perguntas e associação ao estudo/histórico | A/B | Média (proposta) | BLOCKED | S06-T001 | [FQ-001](../specs/free-questions.md), contrato HTTP pendente |
| S06-T003 | Validar continuidade contextual e novas evidências em integração | B/A | Média (proposta) | BLOCKED | S06-T002 | [FQ-001](../specs/free-questions.md); [SR-001](../specs/source-retrieval.md) |

## S07 — Frontend

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S07-T001 | Aprovar frontend, navegação/comparação e UX acessível | C/B | Alta (proposta) | BACKLOG | S06-T003 | [Explorador](../pages/passage-explorer.md); [espaço de estudo](../pages/study-workspace.md); specs detalhadas pendentes |
| S07-T002 | Implementar interface e integração com API real | C | Média (proposta) | BLOCKED | S07-T001 | [Páginas](../pages/README.md); contratos de UI/API pendentes |
| S07-T003 | Verificar estados, responsividade e acessibilidade | C/A | Média (proposta) | BLOCKED | S07-T002 | [Responsividade](../design/responsive.md); [acessibilidade](../audits/accessibility.md) |

## S08 — Integração Ponta a Ponta

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S08-T001 | Aprovar cenários ponta a ponta, ambiente e dados | A/B/C | Alta (proposta) | BACKLOG | S07-T003 | [Specs](../specs/README.md); plano ponta a ponta a aprovar |
| S08-T002 | Executar percursos reais e tratar defeitos por TDD | A/B/C | Média (proposta) | BLOCKED | S08-T001 | [SS-001](../specs/structured-study.md), [FQ-001](../specs/free-questions.md), [SR-001](../specs/source-retrieval.md), [SH-001](../specs/study-history.md) |
| S08-T003 | Consolidar evidências e regressões ponta a ponta | A/B/C | Média (proposta) | BACKLOG | S08-T002 | [Gates](../quality/quality-gates.md); critérios de S08 |

## S09 — Hardening e MVP

| ID | Título original | Trilha histórica | Prioridade histórica | Estado histórico | Dependências históricas | Referência histórica |
|---|---|---|---|---|---|---|
| S09-T001 | Aprovar critérios de MVP, ambiente e auditorias | A/B/C | Alta (proposta) | BACKLOG | S08-T003 | [PRD](../PRD.md); [segurança](../audits/security.md); [acessibilidade](../audits/accessibility.md) |
| S09-T002 | Executar hardening, regressão e recuperação autorizados | A/B/C | Média (proposta) | BLOCKED | S09-T001 | [Auditorias](../audits/README.md); [runbooks](../operations/runbooks.md) |
| S09-T003 | Emitir relatório de prontidão e solicitar encerramento | Transversal | Média (proposta) | BACKLOG | S09-T002 | [Gates](../quality/quality-gates.md); critérios de S09 |
