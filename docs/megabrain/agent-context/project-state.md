# Estado operacional do Bíblia App

Atualizado: 2026-10-20. Branch feat/biblia-backend, base d1d25b7 (merge documental já feito pelo utilizador no PR #1). Consolidação S00 aprovada pelo «ok» após PLAN; relatório, encerramento e commit aprovados pelo «sim» após TEST_REPORT/REVIEW. S00 e tarefas S00-T002 a T007 DONE. Commit principal: a registar após gravação. Sem push/merge autorizado nesta operação.

## Realidade e fontes
Somente documentação, governança, seis módulos descritos, backlog S00–S08, ações externas e plano S01. Sem package.json, código, schema/migrações, corpus, integração real ou ambiente de aplicação provisionado.
[README](../../../README.md), [AGENTS](../../../AGENTS.md), [governança](../../documentation-governance.md), [sprints](../../sprints/README.md), [gates](../../quality/quality-gates.md) e [relatório S00](../../sprints/S00/TEST_REPORT.md).
Specs SS-001/FQ-001/SR-001/SH-001 continuam rascunho e byte a byte preservadas; inicialização DOC-0001 e S00-T001 preservadas. Mudança documental não aprova comportamento.

## Decisões e planeamento
ADR-0001/0002 históricas intactas; [ADR-0003](../../architecture/adr/ADR-0003-backend-modular-e-stack-prescrita.md) regista monólito, seis módulos, stack/testes prescritos. Versões/compatibilidade por validar.
Trilhas atuais: A domínio/regras; B infraestrutura/integrações; C qualidade/documentação. Uma tarefa por vez, sem agentes paralelos autorizados.
Nove sprints backend; frontend adiado e S09 histórico. 28 tarefas históricas preservadas, 34 futuras novas e seis de consolidação, sem reciclar IDs. [Rastreabilidade](../../roadmap/traceability.md), [histórico](../../roadmap/HISTORY.md).
Módulos: biblical-canon, source-library, study, cross-references, ai-assistant, study-workspace. S04 determinística; S05 LLM/RAG real.

## Pendências e evidências operacionais
[EXT-001 a EXT-006](../../external-actions/REQUIRED_ACTIONS.md): IA/modelos/orçamento, PostgreSQL isolado, cânone/licenças, fontes/corpus, acesso/retenção, deployment.
Cliente Docker instalado, motor Linux indisponível na inspeção; nenhuma conexão PostgreSQL comprovada. Não pedir segredos no chat.
Na publicação documental anterior houve mmap failed ao ler índice reverso; push funcionou com configuração temporária pack.readReverseIndex=false. Isto confirma o contorno observado, não demonstra corrupção do banco de objetos nem causa de todas as falhas possíveis. Não apagar objetos, resetar histórico ou alterar configuração global.
Tentativa de edição S00-T002 foi rejeitada por operações duplicadas no mesmo caminho; corrigida com Update File e verificação. Não é incidente de aplicação.
Nenhum padrão de implementação, experiência de IA ou métrica de aplicação comprovados; não inventar lições para preencher diretórios.

## Próximos passos
Validação documental executada e relatório/encerramento/commit aprovados. Gravar o commit principal com a mensagem prescrita e registar depois o seu hash numa atualização documental adicional, deixando a árvore limpa sem autorreferência impossível. Saída reproduzível e limites da validação no TEST_REPORT; nenhuma suite de aplicação executada.
S01 ainda BACKLOG: [PLAN](../../sprints/S01/PLAN.md) precisa de autorização própria; S01-T004 detalha contratos/matriz/isolamento antes de instalar/codificar. Não fazer push, merge ou iniciar S01 automaticamente.
