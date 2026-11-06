# S10-T006 — Vistoria conjunta e conclusão verificável

Estado: IN_PROGRESS. Pedido do utilizador em 2026-10-31: revisão com as skills de Codex e agy, repartir trabalho, corrigir lacunas e terminar com menor sobrecarga. Autoriza colaboração nesta tarefa; preserva main, branches anteriores, segredos, dados e ausência de publicação/serviços pagos.

## Plano antes de código

Fonte funcional: SPEC S10, T003_WORKFLOWS_SPEC (incluindo adenda), contratos HTTP existentes. Não ampliar endpoints, corpus, modelos ou dependências. O estado DONE anterior não substitui novas provas.

1. Codex: auditar implementação e UX com impeccable; reparar por TDD os percursos comprovadamente incompletos (referência no leitor, versão ao reabrir estudo, notas/contexto, cancelamento/corridas, conversas persistidas, workspace paginado/CAS/eliminação, acesso mobile/teclado).
2. agy: revisão independente de requisitos, evidências e CI, somente leitura inicialmente. Depois, documentação delimitada se atribuída explicitamente. Nunca ambos a escrever o mesmo ficheiro. Codex coordena execução e valida achados; nenhuma troca de branch.
3. Testes afetados RED/GREEN por comportamento; regressão/cobertura global uma vez no marco, build/lint/arquitetura e prova browser/API/PostgreSQL de teste. Mutação frontend global obrigatória no CI para evitar carga excessiva local. Backend inalterado pode conservar evidência cuja identidade seja comprovada.
4. Relatar PASS/FAIL/BLOCKED/NOT_RUN, comandos e limites. Fechar apenas com gates demonstrados. Login com conta Google humana permanece adiado, sem novo pedido nem prova presumida. Expansão generativa é futura; o perfil extrativo atual conserva os seus limites.

## Decisões, alternativas e riscos

Adenda2026-11-06: reforçar testes da rejeição real de confirmação Google (Promise rejeitada) e da confirmação tardia após desmontagem. O contrato `setSession=false` representa invalidação/cancelamento; não é a forma de sinalizar falha de identidade. Uma primeira hipótese de fase presa confundiu esses casos e foi descartada ao conferir o provider; nenhuma mudança de produto é necessária ou autorizada por essa hipótese. Preservar validação estrita, erro recuperável existente e ausência de onAccess tardio, sem endpoint, segredo ou consentimento pessoal novo.

Reutilizar componentes, hooks e contratos evita dependências e migrações; exige coordenar identidade/versão no App. Manter cópias de estudo/contexto independentes foi rejeitado pelas respostas tardias e versões erradas. Listas usam cursores do servidor, sem carregar todo o acervo. O rascunho de nota fica preservado em conflito; nenhuma repetição automática de escrita. Cancelamento invalida a publicação cliente e chega ao transporte, sem prometer rollback de persistência.

Os testes de componentes podem usar doubles técnicos identificados; não substituem prova nativa. Teste novo não versionado `context-panel-notes.spec.tsx` pertence ao trabalho herdado e é preservado. O utilizador confirmou outra sessão e decidiu deixar apenas esta coordenação ativa.

## Diagnóstico inicial real

- Branch `feat/biblia-integracao`, HEAD `855de77`; build frontend PASS, lint zero erros/cinco avisos, arquitetura backend 9/9 PASS.
- `rtk npm run test:coverage -- --maxWorkers=1`: FAIL, 192 PASS/2 FAIL/194. Um timeout em persisted-study-flow passou isoladamente (6/6), sem causa definitiva atribuída; teste herdado de notas falha porque a interface ainda é informativa. Não existe cobertura aprovável desta execução.
- CI frontend atual mede/muta somente sessão (11 fontes), insuficiente para os componentes/hooks adicionados em T003. A adenda T003 exige inventário global.
- O detector impeccable identificou somente Inter como fonte comum; é escolha explicitamente aprovada no design existente, não defeito a corrigir. A vistoria funcional confirmou seletores sem nomes, versículos só clicáveis, painel mobile oculto, referência sem propagação ao leitor e ausência de interface de conversas persistidas.

## Critérios de conclusão

Percursos previstos pela adenda T003 acessíveis e persistidos; isolamento/versão/CAS e respostas tardias testados; navegador desktop/mobile com PostgreSQL real identificado; cobertura >=90% linhas/85% branches e mutação bruta >85% com inventário global/revisão; docs e README refletem os resultados atuais, sem herdar PASS de revisão diferente.

Relatório desta tarefa será registado em `T006_TEST_REPORT.md`. Não declarar conclusão por este plano.

## Retoma autorizada — 2026-11-06

Pedido explícito: «faça a tua parte coordenando a agy e documente exatamente tudo que eu tenho que fazer». Permissão integral reafirmada, incluindo agy. A autorização atual sucede à restrição histórica de não colaboração, somente nesta tarefa. Codex coordena alterações/testes/CI; agy recebe revisão independente em leitura e preparação das instruções humanas, sem trocar branch, ler segredos, fazer Git ou escrever nos ficheiros de código. Aprovações operacionais adicionais não são exigidas pelo projeto para o trabalho já autorizado.

Sequência: preservar e verificar alterações herdadas; completar conversas persistidas com os contratos existentes via RED/GREEN; corrigir apenas lacunas comprovadas; validar regressão/cobertura/estática, prova browser/API/PostgreSQL de teste e mutação global em CI; sincronizar estados e publicar somente checkpoints identificados, sem afirmar DONE com gates pendentes. O guia humano fica em `docs/operations/USER_ACTIONS.md`, distinguindo ações obrigatórias, condicionais e futuras, comandos reais, resultados esperados e dados que podem ser comunicados sem segredos.

Vantagens: reaproveita implementação e evidências de fontes idênticas; revisão independente reduz releituras. Desvantagens/riscos: alterações herdadas sem prova RED não podem ser legitimadas retroativamente; agy pode estar indisponível; análise global pode revelar lacunas adicionais. Mitigações: regressão herdada identificada, novo RED antes de cada comportamento novo, atribuições sem sobreposição, logs/digests e resultados verdadeiros. Alternativa rejeitada: encerrar usando as métricas antigas limitadas à sessão. Não alterar modelos, corpus, dependências, main nem serviços alheios.

Lacunas adicionais confirmadas na execução: desvincular estudo eliminado/GET recusado/criação pendente; oferecer consulta atual após409de versão; distinguir `restricted` e mostrar direitos/limitações de análises; permitir escolha da fonte admitida e leitura por teclado; não anunciar falha de transporte de excertos como busca vazia. Cada comportamento novo recebeu RED causal e GREEN próprios. Fixture Josephus copiada para o frontend somente para manter testes/mutação isolados; não amplia corpus operacional. Automação frontend passa do recorte de sessão ao inventário global e mantém limites/reinstrumentação obrigatórios.
