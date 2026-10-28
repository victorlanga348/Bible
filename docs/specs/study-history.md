# SH-001 — Histórico de estudos

Concretização complementar2026-10-28: estudos S04 e análises S05 entregues; inclusão privada de perguntas/respostas posteriores aceite na S06-T004 conforme [SPEC S06](../sprints/S06/SPEC.md). Conversa fixa estudo/versão, mensagens ordenadas imutáveis, histórico sem regeneração/revalidação atual de direitos, eliminação própria e retenção local explícita. Parte S06 ainda NOT_RUN; critérios antigos preservados.

Estado: rascunho para revisão. Versão documental: 0.1. Data: 2026-10-17.
Aprovador/data/referência: pendentes. Implementação e testes: inexistentes.
Trilhas: A, B e C. Requisitos: PRD-08; proveniência e licenças transversais.

## Problema e âmbito
Permitir voltar a estudos realizados sem gerar novamente uma resposta nem perder a sua proveniência.
Não pressupõe contas, sincronização, exportação, pesquisa no histórico ou retenção ilimitada.

## Comportamento proposto
Consultar os estudos acessíveis segundo política aprovada. Recuperar conteúdo guardado distinguindo-o de nova geração.
Preservar as referências e limitações da geração original na medida permitida pelas licenças. Alterações de disponibilidade das fontes devem ser visíveis.
A inclusão de perguntas e respostas posteriores depende de decisão conjunta com [FQ-001](free-questions.md).

## Critérios de aceitação propostos
| ID | Cenário verificável |
|---|---|
| SH-AC01 | Dado estudo guardado e acessível, a consulta recupera o estudo correto sem chamada de geração |
| SH-AC02 | Dada lista sem estudos acessíveis, a interface comunica estado vazio sem erro fictício |
| SH-AC03 | Dado pedido fora da política de acesso, o conteúdo não é exposto |
| SH-AC04 | Dado estudo recuperado, referências e limitações registadas permanecem distinguíveis do estado atual da biblioteca |
| SH-AC05 | Dada falha de persistência, a aplicação não afirma que o estudo foi guardado |
| SH-AC06 | Dada consulta de estudo, dados de outro contexto de acesso não são misturados |

## Decisões pendentes
Definir quando guardar, estudos incompletos, identidade, ordenação, paginação, acesso, retenção, eliminação, atualização de referências e associação de perguntas.
Não criar campos de utilizador, datas ou estados sem aprovação do modelo e contratos.

## Validação planeada
RED/GREEN/REFACTOR por critério. PostgreSQL isolado com Prisma e migrações reais; aplicação NestJS real para integração HTTP; isolamento e recuperação após falhas.
Verificar que consultar não aciona geração através do contrato e da integração apropriados, sem depender de teste pago a cada consulta.
Mutação das regras de persistência, acesso e consulta aplicáveis, superior a 85%.
Dependências: PLAN-002, PLAN-003, PLAN-006, PLAN-008, DEC-04, DEC-06, DEC-10.
