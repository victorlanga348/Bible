# S04-T007 — Verificação integral e encerramento

Estado: BLOCKED na predecessora; plano preparado, depende de T006 concluída. Autorização integral dispensa nova pergunta de permissão, não os gates.

Revisar a SPEC/contratos/ADRs/propriedade e confrontar dados/autorização/associações/quote com artefactos primários. Executar percurso seleção real → serviços de cânone/fontes → Study persistido → versão/owner/direitos → resposta HTTP. Acrescentar teste composto somente se as provas existentes não cobrirem o percurso; não reconstruir RED para comportamento já implementado.

Verificar sete gates aplicáveis, typecheck/lint/build/arquitetura, regressão, linhas>=90%, branches>=85%, Stryker bruto>85%, relatórios íntegros/sobreviventes, zero falha obrigatória. IA não aplicável à S04, sem PASS fictício. Separar preparação/resultado local de execução CI remota e investigar erros reais. Não baixar limiares/exclusões para encerrar.

Sincronizar PLAN/TASKS/ACCEPTANCE/TEST_REPORT/REVIEW, README, índices/roadmap, EXT/ADRs/MegaBrain. Auditoria de fechamento: "Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"; registar resposta técnica com base no diff, sem atribuir resposta humana inexistente nem interromper a autorização já concedida. Commit feat(sprint-04): implement structured studies após gates/revisão, hash posterior e push autorizado; main/segredos preservados.

Risco principal: um estudo formalmente correto aparentar análise histórica completa. Revisão exige cobertura/limitações visíveis, nenhuma interpretação inventada e distinção clara entre relato da fonte, texto bíblico e afirmação verificada. Alternativa de fechar sem dados/integrações reais é rejeitada. Avançar S05 somente depois desta saída real.
