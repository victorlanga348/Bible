# S00-T004 — Migrar roadmap e artefactos canónicos

Estado DONE. Sprint S00; trilha C; prioridade alta; responsável agente executor; revisor utilizador. Dependência S00-T003 satisfeita. Plano/escopo aprovados pelo «ok» de 2026-10-20, secções 3/6 do PLAN.
Consultados contexto/erros/padrões/armadilhas MegaBrain e ADRs antes da tarefa. Nenhum incidente de aplicação; não foram delegadas tarefas.

## Solução e aceitação
AC-004: nove sprints S00–S08 com cinco artefactos canónicos; entradas antigas remetem para uma fonte única. S09 histórico e frontend adiado. História das 28 tarefas preservada sem reutilização; 34 tarefas futuras novas começam em T004; seis tarefas documentais novas em S00.
Alternativa de duplicar árvores rejeitada. Correspondência explícita custa manutenção e evita mudança silenciosa de IDs; mitigar com grafo/links. Scripts temporários de edição fora do repositório, sem código de produção ou ferramenta instalada.

## Validação
2026-10-20, Windows/PowerShell: verificador Python inline por rtk executado após geração documental: 9 sprints, 45 artefactos, 41 tarefas ativas (incluindo S00-T001), 28 históricas, 777 links relativos; nenhuma referência quebrada, ID duplicado ou ciclo; exit 0. Reprodução final no TEST_REPORT.
Gate 1 APROVADO pelo plano; gates 2–6 NÃO APLICÁVEL por documentação; gate 7 APROVADO pela revisão estrutural/rastreabilidade/grafo/links. Validação final transversal repetida em S00-T007.
Nenhum resultado de suites de aplicação, infraestrutura real, cobertura ou mutação. S00 sem encerramento/commit aprovado; S01 continua BACKLOG.
