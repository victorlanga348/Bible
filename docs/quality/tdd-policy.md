# TDD estrito — RED–GREEN–REFACTOR

Estado: obrigatório para toda alteração de comportamento. Aplicação ainda não implementada.
Antes de código: identificar sprint/tarefa, obter spec e plano aprovados e consultar documentação, MegaBrain e skills relevantes.

## RED
1. Identificar o comportamento e critério da spec.
2. Escrever o teste antes de implementar.
3. Executar o teste.
4. Confirmar falha pela razão esperada.
5. Registar comando, ambiente, saída e causa observada da falha.

Falha por sintaxe, indisponibilidade de serviço ou configuração não comprova RED do comportamento.
Se o teste passar inicialmente, investigar a lacuna antes de implementar.

## GREEN
1. Implementar apenas o mínimo necessário.
2. Executar novamente o teste e os testes afetados.
3. Confirmar aprovação com evidência.
4. Não incluir funcionalidades fora da spec ou alterações não relacionadas.

## REFACTOR
1. Melhorar o desenho interno sem alterar comportamento.
2. Executar novamente os testes de proteção.
3. Verificar [dependências arquiteturais](../architecture/dependency-rules.md).
4. Se surgir novo comportamento, voltar à aprovação da spec/plano e a um novo RED.

É proibido implementar primeiro e escrever testes posteriormente para simular TDD. A ordem e as evidências devem ser verificáveis, não reconstruídas como narrativa fictícia.

## Não aplicabilidade e infraestrutura
Documentação sem comportamento executável pode justificar ciclo não aplicável; validar estrutura, links, estados e coerência.
Preparar harness não dispensa TDD das funcionalidades subsequentes.
Falha ou impossibilidade de executar teste obrigatório não é não aplicabilidade nem aprovação.

Usar [componentes reais](testing-strategy.md), [mutação](mutation-testing.md) e [gates](quality-gates.md).
O [template de tarefa](../tasks/template.md) regista cada fase e os comandos reais existentes, sem scripts presumidos.
