# S00-T006 — Preparar plano técnico da S01

Estado DONE. S00; trilhas B/C; prioridade alta; responsável agente executor, revisor utilizador. Dependência S00-T005 satisfeita; plano documental aprovado pelo «ok» de 2026-10-20.
Consultados ADRs, stack, MegaBrain/erros/padrões/armadilhas e EXT-002. Skill consultada no planeamento; não foi escolhido alojamento/serviço.

## Solução, critérios e limites
AC-007: PLAN S01 detalha objetivo/escopo/exclusões, seis tarefas, dependências, contratos técnicos a aprovar, ficheiros previstos, testes, RGR, cobertura/mutação/arquitetura, riscos, alternativas e critérios de saída.
Não selecionar versões sem documentação oficial/prova de compatibilidade. Proposta S01-T004 exigirá aprovação antes de instalar/codificar; nomes de rotas/campos/variáveis não inventados como aprovados. Nenhum NestJS/schema/migração criado.
Alternativa de bootstrap imediato viola aprovação sequencial; plano revisável permite decidir dependências. Custo de etapa de contratos mitigado por checklist explícita.

## Validação e gates
2026-10-20, Windows/PowerShell: verificação inline Python por rtk confirmou 15 marcadores de conteúdo e ausência de ficheiros não documentais na raiz; exit 0/errors vazio. Revisão manual do plano confirmou riscos/contratos/isolamento e ausência de execução da S01.
Gate 1 APROVADO; Gates 2–6 NÃO APLICÁVEL por documentação pura; Gate 7 APROVADO pela revisão/completude. Validação transversal repetida em S00-T007.
Sem typecheck/lint/build/suites, cobertura/mutação ou integração de aplicação executados. S01 BACKLOG e commit PENDING.
