# TDD estrito — RED → GREEN → REFACTOR

Atualização documental aprovada pelo «ok» de 2026-10-20 ao PLAN S00. Aplicação não implementada.

## RED
Identificar critério/spec aprovados. Escrever teste antes do comportamento, executar e guardar comando real, ambiente, saída sanitizada, data e motivo da falha esperada.
Sintaxe inválida, dependência ausente ou serviço indisponível não demonstram RED. Se o teste passar inicialmente, investigar antes de implementar.

## GREEN
Implementar o mínimo do comportamento testado, executar teste/regressões afetadas e guardar prova de aprovação. Não ampliar escopo.

## REFACTOR
Melhorar desenho sem mudar comportamento; repetir testes e [fiscalização arquitetural](../architecture/dependency-rules.md). Novo comportamento exige novo RED e aprovação necessária.

## Estrutura e infraestrutura
Configuração, bootstrap e migrações terão verificações executáveis adequadas no plano. Harness não autoriza regras antecipadas.
Não escrever testes depois para simular TDD, esconder defeitos ou ignorar falhas.
Documentação pura: justificar não aplicabilidade e executar estrutura, links, estados/coerência. Não declarar suites não executadas PASS.
Ver [testes reais](testing-strategy.md), [gates](quality-gates.md) e [template](../tasks/template.md).
