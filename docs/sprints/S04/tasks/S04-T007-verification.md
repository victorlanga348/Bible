# S04-T007 — Verificação integral e encerramento

Estado final2026-10-26: DONE após gates/percurso/revisão e auditoria documental real sem segredo/link/whitespace/proibido; fecho da sprint delegado, sem pergunta de aprovação adicional. Commit/push autorizados, hash principal registado somente depois de criado. [Relatório](../TEST_REPORT.md)/[revisão](../REVIEW.md). Entradas seguintes históricas.

Atualização final2026-10-26: IN_PROGRESS→REVIEW, percurso e gates técnicos aprovados com evidência no [TEST_REPORT](../TEST_REPORT.md)/[REVIEW](../REVIEW.md).907 testes locais/CI, estática/build/tooling e mutação da fonte912c600 conferidos; nenhum comportamento novo nesta tarefa, TDD novo não aplicável. Aguarda somente auditoria documental final do fecho autorizado. A preparação/cronologia seguinte é histórica.

Estado vigente2026-10-26: READY→IN_PROGRESS após T006 DONE,907 regressões/CI corrigida, mutação global90,69% e própria87,71% com originais/fontes conferidos. Uma tarefa ativa. Plano seguinte executado sob autorização integral reafirmada pelo utilizador; não requer nova pergunta. Revisão do percurso já coberto em HTTP/integration e provas operacionais, sem reconstruir RED de comportamento existente. Relatório e encerramento dependem da auditoria final.

Estado: BLOCKED na predecessora; plano preparado, depende de T006 concluída. Autorização integral dispensa nova pergunta de permissão, não os gates.

Revisar a SPEC/contratos/ADRs/propriedade e confrontar dados/autorização/associações/quote com artefactos primários. Executar percurso seleção real → serviços de cânone/fontes → Study persistido → versão/owner/direitos → resposta HTTP. Acrescentar teste composto somente se as provas existentes não cobrirem o percurso; não reconstruir RED para comportamento já implementado.

Verificar sete gates aplicáveis, typecheck/lint/build/arquitetura, regressão, linhas>=90%, branches>=85%, Stryker bruto>85%, relatórios íntegros/sobreviventes, zero falha obrigatória. IA não aplicável à S04, sem PASS fictício. Separar preparação/resultado local de execução CI remota e investigar erros reais. Não baixar limiares/exclusões para encerrar.

Sincronizar PLAN/TASKS/ACCEPTANCE/TEST_REPORT/REVIEW, README, índices/roadmap, EXT/ADRs/MegaBrain. Auditoria de fechamento: "Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"; registar resposta técnica com base no diff, sem atribuir resposta humana inexistente nem interromper a autorização já concedida. Commit feat(sprint-04): implement structured studies após gates/revisão, hash posterior e push autorizado; main/segredos preservados.

Risco principal: um estudo formalmente correto aparentar análise histórica completa. Revisão exige cobertura/limitações visíveis, nenhuma interpretação inventada e distinção clara entre relato da fonte, texto bíblico e afirmação verificada. Alternativa de fechar sem dados/integrações reais é rejeitada. Avançar S05 somente depois desta saída real.
