# Architecture Decision Records

ADRs explicam decisões relevantes e preservam alternativas e consequências. Specs definem comportamento; ADRs não substituem os respetivos critérios.

## Registo
| Documento | Estado | Origem |
|---|---|---|
| [ADR-0001](ADR-0001-stack-e-limites-arquiteturais.md) | Aceite por decisão explícita do utilizador | Stack e limites fornecidos no pedido mestre |
| [ADR-0002](ADR-0002-adocao-condicional-strykerjs.md) | Aceite com validação de compatibilidade pendente | StrykerJS por orientação explícita do utilizador |
| [Template](template.md) | Modelo | Usar para decisões futuras |

## Processo
Numerar sequencialmente `ADR-0002-descricao.md`; pesquisar decisões existentes antes de criar outra. Estados: proposto, aceite, rejeitado, substituído.
Uma decisão nova exige aprovador, data e referência verificável. Alterações relevantes a uma ADR aceite criam sucessora ligada, preservando o histórico.
Registar pendências na [stack](../stack.md); não produzir uma ADR aceite para cada pergunta em aberto.
