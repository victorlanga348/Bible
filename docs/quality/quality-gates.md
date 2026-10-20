# Sete gates obrigatórios de qualidade

Atualização aprovada pelo «ok» de 2026-10-20 ao [PLAN S00](../sprints/S00/PLAN.md). Automação e aplicação inexistentes.

## Gate 1 — Especificação
Escopo de sprint, spec/contratos, plano da tarefa e dependências aprovados explicitamente. Aprovar sprint não aprova automaticamente tarefas/implementações futuras. Contrato necessário não aprovado bloqueia implementação dependente.

## Gate 2 — TDD
RED pela causa esperada, GREEN mínimo e REFACTOR com regressão/arquitetura verificados. Evidências antes/depois, nunca reconstruídas para legitimar código anterior.

## Gate 3 — Qualidade estática
TypeScript strict, zero erros de typecheck, zero erros ESLint, build e fiscalização arquitetural aplicáveis.
Line Coverage >= 90%; Branch Coverage >= 85%. Usar scripts reais do package.json; não inventar comandos nem presumir ferramentas.

## Gate 4 — Integração real
PostgreSQL independente de dev/produção, Prisma, migrações, repositórios, consultas, transações e restrições reais.
HTTP: NestJS inicializado/Supertest, contratos/schemas, entradas/saídas, erros, persistência e segurança. Fontes autênticas/licenciadas.
Credencial/serviço obrigatório ausente: BLOCKED, nunca PASS. Mocks/fakes não substituem comprovação permanente.

## Gate 5 — Mutação
Stryker Mutator obrigatório, prioritariamente Domain/Application. Provar compatibilidade de versões/Jest; score bruto > 85%, relatório e análise de sobreviventes.
85% exatos falham; sem mutantes válidos não há score aprovável. Não excluir arbitrariamente código próprio. Gerado, migrações e SDKs externos fora do cálculo; escopo/exclusões documentados. Ver [cálculo](mutation-testing.md).

## Gate 6 — IA
Contratos determinísticos, fornecedor real e avaliações próprias quando aplicáveis: fontes verificadas, suporte semântico, citações existentes, divergências/incertezas e limitações.
Corpus/rubrica/orçamento/critérios aprovados; cobertura e mutação não provam veracidade histórica. Ver [avaliação](../ai/evaluation.md).

## Gate 7 — Governança
Critérios evidenciados; docs/README, contratos, ADRs, tarefas, roadmap e MegaBrain sincronizados. Rever segurança, direitos e operação conforme impacto.
TEST_REPORT com comandos/data/ambiente/resultados, cobertura, mutação, sobreviventes, bloqueios e TDD; REVIEW técnico. Inspecionar segredos/dependências externas.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

## Resultados e fechamento
Por gate: PENDENTE/APROVADO/FALHADO/NÃO APLICÁVEL com evidência. Por execução/critério: PASS/FAIL/BLOCKED/NOT_RUN, aplicabilidade e motivo separados.
Gate obrigatório pendente/falhado/bloqueado impede DONE. Zero testes obrigatórios falhados/bloqueados. Não aplicabilidade não significa suite PASS.
Documentação pura: Gate 1 verifica autorização e Gate 7 executa checks documentais; Gates 2–6 não aplicáveis sem comportamento executável, sem métricas fictícias.
Configuração/migração têm verificações executáveis apropriadas. Ausência de ferramenta/serviço obrigatório não dispensa gate.
Sem código mutável real, justificar aplicabilidade e relatar métricas não medidas; não criar regras artificiais.
Apresentar relatório e aguardar aprovação explícita do encerramento/commit. Sprint fica REVIEW até aprovação. Push/merge e próxima sprint exigem autorização própria.
DOC-0001/S00-T001 preservam a política/evidência da sua data, sem aprovar gates atuais retroativamente.
