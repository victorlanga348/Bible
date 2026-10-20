# Estado operacional do Bíblia App

Atualizado: 2026-10-17. Estado: atualização documental concluída e validada; S00 em REVIEW para aprovação de encerramento; implementação não iniciada.
Operação atual: [S00-T001](../../sprints/S00/tasks/S00-T001-atualizacao-governanca.md), plano aprovado pelo «ok» do utilizador após inspeção.
Histórico: [DOC-0001](../../tasks/DOC-0001-inicializacao-governanca.md), preservado com os resultados anteriores.

## O que existe
Documentação de produto/arquitetura/IA, quatro specs em rascunho, governança, templates, S00–S09 e roadmap operacional.
Não há código, package.json, schema, migrações, corpus aprovado, integrações ou ambientes provisionados.
Somente a operação documental atual foi autorizada; backlogs futuros não são planos aprovados.

## Convenções e continuidade
Ler [AGENTS](../../../AGENTS.md), [governança](../../documentation-governance.md), [sprints](../../sprints/README.md) e [gates](../../quality/quality-gates.md).
Preferir rtk instalado e compatível; usar equivalente nativo quando necessário. A obrigatoriedade anterior foi substituída pelo novo pedido, sem editar RTK.md externo.
Uma tarefa aprovada de cada vez, salvo autorização explícita; preservar limites e exigir spec/plano aprovados antes de código.
Português na documentação e nas descrições de commits. Não inventar contratos, fontes, testes, decisões ou aprovações.

## Mapa
Sem módulos de código. [Contextos](../../architecture/bounded-contexts.md) continuam propostos.
Trilha A: backend/persistência/infraestrutura; B: domínio/inteligência bíblica; C: frontend/UX/integração. Não equivalem a serviços separados.
IDs novos Sxx-Txxx e estados BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE; [IDs antigos](../../roadmap/traceability.md) preservados.

## Decisões vigentes
[ADR-0001](../../architecture/adr/ADR-0001-stack-e-limites-arquiteturais.md): stack e limites originais, sem alteração.
[ADR-0002](../../architecture/adr/ADR-0002-adocao-condicional-strykerjs.md): StrykerJS sob compatibilidade por validar; nada instalado.
[DEC-01 a DEC-10](../../architecture/stack.md): escolhas por resolver, com DEC-08 agora uma escolha condicionada cuja validação técnica continua pendente.
Sem versões, runner, fornecedor/modelos, frontend, embeddings, acesso, deploy, traduções/licenças, cânone ou retenção assumidos.

## Limites e problemas conhecidos
Sem aplicação para testar. Corpus e licenças ainda não aprovados. Specs e contratos ainda por rever; seleção/comparação têm lacunas documentadas.
S04 só prepara regras/casos de uso por ports; geração real deve ser comprovada em S05.
Nenhum incidente de aplicação registado. Ausência de incidentes não é auditoria.

## Próximos passos
1. Consultar relatório de S00-T001 e estado de aprovação de encerramento de S00.
2. Não começar S01 sem escopo/plano e specs necessários aprovados e predecessor encerrado.
3. Refinar regras de domínio e proposta de toolchain; validar compatibilidade de StrykerJS em S01-T002.
4. Resolver decisões de conteúdo/dados antes das tarefas dependentes; não executar automaticamente o roadmap.
