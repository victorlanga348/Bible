# S04 — Revisão técnica

Checkpoint T0052026-10-22: revisão do domínio puro, imutabilidade, projeção sem owner, JWT JOSE real e fronteira do guard; RED/GREEN registado no TEST_REPORT. Regressão652/34 suites PASS e cobertura100% linhas/97,89% branches, estática/tooling PASS. Mutação dirigida pendente; T005 e sprint continuam IN_PROGRESS. A verificação de owner/rights pela Application/PostgreSQL/HTTP é trabalho T006, sem inferência de integração a partir do double de ExecutionContext. Ficheiros de configuração dirigida são temporários e não mudam o escopo padrão completo. Checkpoint pode ser publicado para CI sob autorização integral, sem declarar encerramento. .env preservado; nenhum segredo/token nos artefactos versionados.

Revisão T0042026-10-22: contratos/ADR-0005/dependência e limites de curadoria revistos pelo agente na autorização integral. T004 concluída documentalmente; T005/T006/T007 ainda sem implementação/provas. JWT local requer verificação criptográfica/claims no servidor e testes próprios, sem endpoint público de emissão. Metadados de origem não comprovam história; rightsSnapshot não autoriza entregar quote revogada. JOSE2/2 é só compatibilidade. Nenhum encerramento da sprint é inferido desta revisão; seguir RED antes de código. Notas a seguir preservam o template de S00.

Estado: NOT_RUN; sprint não executada, sem aprovação de encerramento. Commit PENDING.
A decomposição documental não comprova implementação, testes ou conformidade arquitetural executável.
Antes da revisão final verificar [critérios](ACCEPTANCE_CRITERIA.md), [relatório](TEST_REPORT.md), imports/fronteiras, migrações reais, segredos, ações externas, direitos e limitações. Evidenciar todos os gates aplicáveis e tratar falhas antes de pedir aprovação.
Riscos atuais: contratos ainda em rascunho e dependências específicas do [PLAN](PLAN.md). Não declarar release ou funcionalidades concluídas.
Pergunta de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
AGUARDANDO APROVAÇÃO: apenas planeamento; a execução precisa de pedido próprio depois de encerrada a sprint anterior.
