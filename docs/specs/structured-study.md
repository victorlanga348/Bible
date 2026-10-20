# SS-001 — Estudo estruturado

Estado: rascunho para revisão. Versão documental: 0.1. Data: 2026-10-17.
Aprovador/data/referência: pendentes. Implementação e testes: inexistentes.
Trilhas: B, com A e C. Requisitos: PRD-01 a PRD-05, PRD-09; BR-01 a BR-08, BR-10 a BR-12.

## Problema e âmbito
Produzir análise contextual e comparativa de uma passagem selecionada, com evidências e limites visíveis.
Seleção detalhada, versificação e comparação entre seleções dependem de PLAN-009. Esta spec não define campos, secções obrigatórias de API ou endpoints.

## Pré-condições propostas
Seleção inequívoca segundo catálogo aprovado e condições de utilização conhecidas. Recuperação segue [SR-001](source-retrieval.md).
Não presumir que todas as passagens têm fontes suficientes.

## Comportamento proposto
Aplicar a [metodologia](../product/study-methodology.md), separando texto bíblico, material recuperado e análise gerada.
Analisar contexto imediato, argumento do livro, história/cultura, autoria, destinatários e propósito. Identificar incertezas e divergências.
Quando houver comparação, justificar a relação em vez de a deduzir apenas por semelhança verbal. Após o estudo, disponibilizar continuidade segundo [FQ-001](free-questions.md).

## Critérios de aceitação propostos
| ID | Cenário verificável |
|---|---|
| SS-AC01 | Dada uma seleção válida e fontes autorizadas, o estudo identifica a passagem e distingue texto, evidência e interpretação |
| SS-AC02 | Dadas evidências históricas disponíveis, as afirmações históricas apontam para suporte verificável; sem suporte suficiente, a limitação é explícita |
| SS-AC03 | Dada discussão de autoria, destinatários ou propósito, atribuições e hipóteses são sinalizadas, sem certeza fabricada |
| SS-AC04 | Dada uma passagem, a resposta considera contexto imediato e argumento do livro, ou declara a limitação que impede a análise |
| SS-AC05 | Dadas leituras divergentes sustentadas, a resposta identifica a divergência e não a apresenta como consenso |
| SS-AC06 | Dada ligação a outra passagem, a resposta explica o fundamento e distingue leitura messiânica/escatológica de alegação histórica |
| SS-AC07 | Dada fonte ausente ou referência não validada, a resposta não inventa suporte nem apresenta validação inexistente |
| SS-AC08 | Dado estudo disponível, a continuação mantém associação ao estudo conforme FQ-001 |

## Falhas e questões em aberto
Antes de aprovação, decidir seleção inválida, tamanho máximo, falha de recuperação/geração, validação rejeitada, resultado parcial, repetição de pedidos e critérios de persistência.
A política de entrega parcial ou bloqueio depende da gravidade do defeito e da [avaliação](../ai/evaluation.md); não há resposta de erro HTTP definida.

## Plano de validação para implementação
RED por critério de comportamento e pelo motivo esperado; GREEN mínimo; REFACTOR com testes.
Integração: aplicação NestJS real, recuperação e persistência reais aplicáveis; fornecedor externo no ciclo controlado.
Avaliações: casos com evidência suficiente, ausência de fontes, divergência, comparação indevida e distinção escatológica.
Mutação: regras de classificação, validação e coordenação no domínio/aplicação; score superior a 85%.
Dependências: PLAN-001 a PLAN-007 e PLAN-009; decisões de fontes, fornecedor e contratos.
