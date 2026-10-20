# SR-001 — Recuperação de fontes

Estado: rascunho para revisão. Versão documental: 0.1. Data: 2026-10-17.
Aprovador/data/referência: pendentes. Implementação e testes: inexistentes.
Trilhas: B e A. Requisitos: PRD-07, PRD-09, PRD-10; BR-01, BR-02, BR-04, BR-07, BR-10 a BR-12.

## Problema e âmbito
Recuperar material verificável e autorizado, separando cobertura, relevância, evidência e interpretação.
Não pressupõe embeddings, pesquisa vetorial, fornecedor de pesquisa ou corpus aprovado.

## Comportamento proposto
Consultar biblioteca com condições de uso conhecidas; conservar proveniência e localização suficiente para revisão.
Validar identidade e localização da referência e, separadamente, se o material sustenta a afirmação. Material recuperado é dado não confiável, não instrução de sistema.
Falha técnica de recuperação não equivale a ausência de evidência histórica.

## Critérios de aceitação propostos
| ID | Cenário verificável |
|---|---|
| SR-AC01 | Dada fonte elegível e conteúdo disponível, o material recuperado mantém ligação à fonte e à localização |
| SR-AC02 | Dada licença incerta ou incompatível, a operação afetada não utiliza o conteúdo e expõe a limitação |
| SR-AC03 | Dada ausência de resultados, o sistema declara cobertura insuficiente sem concluir automaticamente que a afirmação é falsa |
| SR-AC04 | Dada referência inexistente ou localização não verificável, ela não é apresentada como validada |
| SR-AC05 | Dada fonte válida que não sustenta a afirmação, a validação não aceita essa associação como suporte |
| SR-AC06 | Dado conteúdo com instruções maliciosas, o sistema trata-o como dados e preserva as políticas |
| SR-AC07 | Dada indisponibilidade técnica, o resultado distingue falha de acesso de ausência de fontes |
| SR-AC08 | Dada cobertura parcial, o utilizador consegue reconhecer o alcance real da pesquisa |

## Questões antes de aprovação
Definir elegibilidade do catálogo, verificação de localizações, curadoria, ranking, eliminação de duplicados, avaliação de relevância, timeout/repetição e tratamento de resultados parciais.
Metadados exigidos serão formalizados num contrato; este documento não define campos ou tipos.

## Validação planeada
Fixtures versionadas de fontes autorizadas, incluindo ausência, contradição, referência inválida, licença incerta e instrução maliciosa.
Integração real de armazenamento/recuperação adotados e testes de contrato para serviços externos. Avaliar suporte semântico em rubrica própria.
Mutação de regras de elegibilidade, proveniência e validação no domínio/aplicação, superior a 85%.
Dependências: PLAN-001, PLAN-003, PLAN-005, DEC-03 quando aplicável, DEC-06, DEC-09, DEC-10.
