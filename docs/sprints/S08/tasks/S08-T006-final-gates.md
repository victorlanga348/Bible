# S08-T006 — Gates finais da revisão de release

DONE técnico2026-10-29T18:58Z. Plano aceite por decisão delegada antes da execução, sob autorização integral. Dependência T005 DONE comprovada antes do início. Uma tarefa por vez, sem agentes. SPEC e sete gates permanecem inalterados.

Objetivo: verificar a revisão f71a7356b6fb445284d6713d47d7f6552f98d750 já executada pela CI40912125811, sem repetir suites ou avaliações idênticas para reconstruir evidência. Alterações posteriores limitadas a diagnósticos ignorados e documentação serão conferidas por diff. Nenhum contrato, src, Prisma, pacote, modelo, prompt, operador ou threshold pode mudar sob essa incorporação.

Sequência verificável:

1. Conferir oito jobs/steps SUCCESS e digests dos ZIPs oficiais de foundation e agregado de mutação; conservar originais privados e IDs/datas.
2. Comparar fontes embutidas/current/commit, inventário Stryker10 com operadores padrão e todas as assinaturas; verificar cobertura, denominador bruto, zero RuntimeError/NoCoverage, global e IA estritamente acima85%.
3. Rever transições dos509sobreviventes anteriores, todos os429atuais e os casos cujo Timeout anterior passou a Survived; manter estados oficiais e limitações reais. Incorporar revisões anteriores somente por identidade, sem alegar equivalência universal.
4. Conferir provas de acesso/owner/JWT/rotação/erros sanitizados/limites e migrações PostgreSQL/NestHTTP na suite completa; T005 fornece recuperação/desempenho e nova chamada nativa. Vincular revisão semântica separada ao digest bruto e conferir identidade das avaliações S05/S06/S07 preservadas.
5. Emitir evidência resumida/TEST_REPORT e verificar docs/links/UTF-8/segredos/diff. Gate obrigatório pendente impede DONE.

Ficheiros: relatório/revisão/evidência S08, estados canónicos e diagnóstico de auditoria ignorado. Sem implementação de produto prevista: TDD novo não aplicável à conferência documental; histórico RED/GREEN de T005 e módulos não é reconstruído. Se surgir defeito real, conservar FAIL, registar plano/critério e RED causal antes da correção mínima, com gates da revisão corrigida.

Vantagens: evidência da mesma revisão e ausência de consumo redundante. Custo: auditoria de artefactos e interpretação dos sobreviventes. Alternativas rejeitadas: score resumido sem JSON/denominador/fontes, retocar estados ou repetir IA até uma resposta favorável. Riscos de revisão antiga/arquivo incompleto mitigados por SHA/inventário/identidades e provas separadas. Critério de saída: sete gates aplicáveis aprovados e zero obrigação falhada/bloqueada, mantendo limites pessoais locais.

Resultado: [TEST_REPORT](../TEST_REPORT.md), [429sobreviventes](../MUTATION_REVIEW.md) e [evidência](../evidence/release-verification.json) conferidos. Oito jobs SUCCESS/2249testes107suites89tooling/100%linhas97,94%branches/global90,9646%IA89,8734%/zeroRuntimeError+NoCoverage. Digests oficiais/fontes/inventário132/107/6540 e110transições conferidos, nenhuma exclusão/reclassificação. Prova nativa e revisão semântica separada PASS; recuperação com TimeZone/HTTP/preservação/cleanup PASS, sem nova inferência ou suite redundante. Segurança/contratos das suites completas incorporados pela revisão executável idêntica, sem ação externa pendente local.

Gate7 da tarefa: `node backend/reports/check-completion-docs.cjs`2026-10-29T18:58:20.726Z PASS5Markdown18links/zero missing/secretHits/whitespace/prohibited/staged; `git diff --check` exit0. TDD de revisão documental não aplicável; requisitos e evidências comportamentais preservados. IN_PROGRESS→REVIEW→DONE delegado. T007 inicia somente agora para sincronização operacional/entradas e auditoria de fecho, sem alterações de produto.
