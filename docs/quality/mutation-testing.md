# Mutation testing

Stryker Mutator obrigatório pelo pedido mestre e PLAN S00. Stryker10 instalado/configurado em S01; resultados e compatibilidade no [relatório S01](../sprints/S01/TEST_REPORT.md), sem aprovação antecipada. ADR-0002 preserva a decisão anterior; evolução no [índice ADR](../architecture/adr/README.md).

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

S05-T006,2026-10-28: CI reparte o escopo completo em seis jobs/bancos descartáveis próprios, concurrency1. `npm run test:mutation:shard -- 0` (índices0–5) mantém operadores/checker/perTest/limiares; `npm run test:mutation:merge` regenera todos os mutantes pelo Instrumenter10 e exige correspondência exata de localização/operador/replacement, fontes/revisão/fingerprint de testes/configuração, sem omissões/sobreposições ou partições incompletas. Gate agregado: >85 bruto global/AI e zeroRuntimeError/NoCoverage. Saídas reports/mutation/mutation.json e shards-audit.json; IDs prefixados por partição, estados preservados. Worker reciclado25avaliações para conter crescimento observado. Cache separado por partição não comprova gate; comando integral permanece. Decisão/provas no [plano T006](../sprints/S05/tasks/S05-T006-rag-persistence-http.md) e [relatório](../sprints/S05/TEST_REPORT.md).

Partições concluem **análise**, não aprovação de qualidade. Threshold85 permanece no Stryker; o wrapper distingue exit1 exclusivamente por score local<85 de erro técnico. Não exige85 por divisão arbitrária: o gate normativo é global e AI estritamente>85, incluindo a recusa de85exatos. RuntimeError/estado incompleto/exit inesperado/ausência de mutantes válidos não são absorvidos; NoCoverage mantém o estado original para o gate agregado que exige zero. Compatibilidade de relatório inclui o default Jest enableFindRelatedTests=true materializado pelo plugin. Bridge do checkpoint a7790 permite cache/seed do incremental original de40632374321 somente com fingerprint idêntico do harness; fonte/testes atuais continuam reconfrontados pelo Stryker e inventário completo pelo agregador. Sem cache, download de artefacto requer apenas actions:read, sem novo segredo. Seed nunca comprova PASS.

Correção posterior ao resultado reutilizado40646817640: RuntimeError/NoCoverage são invalidados **somente no cache**, para obrigar nova avaliação. Bytes anteriores/digest/entradas são conservados em incremental-before-revalidation.json e cache-revalidation.json; outros estados/metadata não mudam. Relatórios finais/originais não são normalizados nem têm erros convertidos em deteção: a nova execução deve produzir cada mutante e cumprir o gate. Bridge atual9d50/40646817640 substitui a anterior a7790 sob o mesmo fingerprint verificado, conservando análise válida e evitando refazer resultados imutáveis.
Relatório: localização, operador, comportamento, cobertura, teste em falta, equivalência eventualmente comprovada, responsável e tarefa.
Investigar timeouts excessivos e defeitos críticos de fontes/acesso/licenças mesmo com score suficiente.
Guardar comando real, versão, revisão, escopo, exclusões, categorias, score bruto e artefactos. Não inventar relatórios/score.
Incompatibilidade/toolchain incompleta bloqueia gate aplicável, sem troca/dispensa silenciosa.
Documentação pura: não aplicável, sem score medido. Ver [gates](quality-gates.md).
