# FQ-001 — Perguntas livres

Estado: rascunho para revisão. Versão documental: 0.1. Data: 2026-10-17.
Aprovador/data/referência: pendentes. Implementação e testes: inexistentes.
Trilhas: B, A e C. Requisitos: PRD-06; BR-01 a BR-12 conforme aplicáveis.

## Problema e âmbito
Permitir continuar a investigação após um estudo estruturado, preservando contexto e exigências de evidência.
Não define chat genérico independente, edição de mensagens, streaming ou limites de conversa.

## Comportamento proposto
Associar a pergunta a um estudo acessível. Separar contexto anterior de novas evidências e validar referências novas segundo [SR-001](source-retrieval.md).
Uma resposta anterior não se torna fonte por estar no histórico. Uma pergunta que revele erro anterior deve sinalizar a revisão, sem reescrever silenciosamente o estudo.

## Critérios de aceitação propostos
| ID | Cenário verificável |
|---|---|
| FQ-AC01 | Dada pergunta sobre estudo acessível, a resposta utiliza a passagem e o contexto corretos |
| FQ-AC02 | Dada necessidade de evidência nova, a resposta usa recuperação e validação ou declara a falta de suporte |
| FQ-AC03 | Dado pressuposto interpretativo controverso, a resposta identifica-o e apresenta limites sem o converter em facto |
| FQ-AC04 | Dada tentativa de instrução maliciosa numa pergunta ou fonte, a orquestração não altera as políticas de fundamentação |
| FQ-AC05 | Dada ausência de fontes, a resposta não inventa referências nem usa a própria resposta anterior como prova |
| FQ-AC06 | Dado erro identificado no estudo anterior, a resposta torna a correção visível e preserva proveniência |

## Falhas e decisões pendentes
Definir estudo inexistente/inacessível, pergunta vazia, pedidos fora do âmbito, limites de contexto, concorrência, cancelamento e indisponibilidade do fornecedor.
Persistência das perguntas e sua apresentação no histórico precisam de decisão explícita com [SH-001](study-history.md). Não há retenção ou acesso anónimo aprovado.

## Validação planeada
Testes de comportamento por critério; integração real de aplicação, contexto e repositórios; testes de contrato do adapter de IA e avaliações reproduzíveis.
Execuções reais do fornecedor em ciclo controlado, sem exigir chamadas pagas em todo ciclo local.
Mutação de regras de associação, acesso e validação aplicáveis, superior a 85%.
Dependências: SS-001, SR-001, DEC-02, DEC-04, DEC-10, PLAN-008.
