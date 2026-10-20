# S00 — Critérios de aceitação

Fonte canónica; critérios aprovados no PLAN pelo «ok» de 2026-10-20. Verificações executadas em S00-T007; evidências e reprodução no TEST_REPORT. PASS refere-se à entrega documental, não a comportamento de aplicação.

| Critério | Condição | Evidência prevista | Estado |
|---|---|---|---|
| AC-001 | Branch dedicada e main preservada, sem merge/push | Verificador de refs; HEAD ainda d1d25b7; remoto main confirmado | PASS |
| AC-002 | Governança, trilhas e aprovações coerentes | Revisão do diff AGENTS/GEMINI/governança e estados | PASS |
| AC-003 | Seis módulos, dependências, ADR sucessora e história preservada | Revisão DDD/hexagonal e hashes dos nove documentos protegidos | PASS |
| AC-004 | Nove sprints/cinco artefactos, IDs únicos, histórico e DAG | Verificador: 45 artefactos, 41 tarefas ativas, 28 históricas, sem ciclos | PASS |
| AC-005 | Limiares e gates exatos, dados reais e bloqueios | Verificador dos sete gates e revisão das políticas, sem métricas fictícias | PASS |
| AC-006 | Ações externas completas, verdadeiras e sem segredos | Seis ações/11 campos, revisão do estado e varredura sem candidatos | PASS |
| AC-007 | Plano S01 revisável, sem execução | Verificador de conteúdo e ausência de código/package.json | PASS |
| AC-008 | Links, diff, relatório, review e contexto sincronizados | Verificador transversal e revisão dos relatórios/contexto | PASS |

Gates 1/7 aplicáveis à documentação; Gates 2–6 não aplicáveis por ausência de comportamento executável, sem métricas ou suites PASS. Obrigação futura de infraestrutura permanece pendente.
