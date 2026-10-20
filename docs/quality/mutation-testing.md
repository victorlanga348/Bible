# Mutation testing

Stryker Mutator obrigatório pelo pedido mestre e PLAN S00 aprovado em 2026-10-20. Não instalado; compatibilidade com Node/TypeScript/Jest por provar. ADR-0002 preserva a decisão anterior; evolução no [índice ADR](../architecture/adr/README.md).

## Escopo
Priorizar Domain/Application e avaliar comportamento próprio de composição/adapters. Plano identifica ficheiros, operadores, runner/configuração, baseline e exclusões.
Gerado, migrações e SDKs externos fora do cálculo. Outras exclusões exigem motivo/impacto/revisão; nunca excluir código difícil, sem cobertura ou sobreviventes para elevar score.

## Cálculo preservado
Mutation Score bruto = 100 × detetados / válidos.
Detetados: mortos por testes + timeouts classificados como deteção pela ferramenta.
Válidos: detetados + sobreviventes + sem cobertura.
Registar categorias originais e confirmar mapeamento com a versão escolhida. Erros de compilação/execução/infraestrutura são separados/investigados, nunca deteções por conveniência.
Score estritamente > 85%, antes do arredondamento; 85% falha. Line Coverage >= 90%; Branch Coverage >= 85% são gates separados.
Sem mutantes válidos não há score aprovável. Justificar não aplicabilidade real; execução incompleta/falhada não é escopo vazio.

## Sobreviventes, evidência e bloqueio
Relatório: localização, operador, comportamento, cobertura, teste em falta, equivalência eventualmente comprovada, responsável e tarefa.
Investigar timeouts excessivos e defeitos críticos de fontes/acesso/licenças mesmo com score suficiente.
Guardar comando real, versão, revisão, escopo, exclusões, categorias, score bruto e artefactos. Não inventar relatórios/score.
Incompatibilidade/toolchain incompleta bloqueia gate aplicável, sem troca/dispensa silenciosa.
Documentação pura: não aplicável, sem score medido. Ver [gates](quality-gates.md).
