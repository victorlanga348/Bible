# Estado operacional do Bíblia App

Atualizado: 2026-10-21. Branch feat/biblia-backend. S00/S01 DONE e commitadas; S02 DONE com escopo reduzido: T004/T005 entregues, T006/T007 adiadas no BACKLOG por «termina, o que falta vou adicionar depois». Encerramento aprovado; commit S02 PENDING, sem pedido específico de commit/push/merge ou S03.

## Fontes, história e aprovações

/docs é normativo; [README](../../../README.md), [AGENTS](../../../AGENTS.md), [governança](../../documentation-governance.md), [sprints](../../sprints/README.md), [gates](../../quality/quality-gates.md). Uma tarefa por vez, sem subagentes. Trilhas A/B/C não autorizam paralelismo.

Base histórica d1d25b7 (merge documental PR1); S00-T002–T007 aprovadas e encerradas pelo «sim», commit principal74d8b6ca685cc99271c803d931c2ac371d99e0a9, registo posterior b458c0b. DOC-0001/S00-T001 e specs SS-001/FQ-001/SR-001/SH-001 preservadas; estas specs continuam rascunho.
S01 encerrada/commitada por «segunda sprint aprovada, continue com a proxima apos o commit»: principal1702cc073e76c0bc3225d19f07fc69b7d0f80861, registo d0036ab. A interrupção ocorreu após conclusão do commit; retoma conferiu HEAD/árvore e não repetiu.
S02 inicialmente BLOCKED por escolhas/contratos; após «avanca» foi apresentada SPEC v0.2 concreta. O «ok» seguinte aprova explicitamente esse recorte/contratos/plano T005; não inferir escolha religiosa nem repetir perguntas já decididas.

[ADR-0001/0002](../../architecture/adr/README.md) históricas; ADR-0003/0004 aplicáveis, sem mudança de stack. Nove sprints backend S00–S08; frontend adiado/S09 histórico. [Rastreabilidade](../../roadmap/traceability.md) e [histórico](../../roadmap/HISTORY.md) preservam IDs. Módulos biblical-canon, source-library, study, cross-references, ai-assistant, study-workspace; S04 determinística/S05 LLM-RAG real.

## Realidade executável

Fundação em backend/: Node24.16/npm11.13, TS6 strict, Nest12, Zod4, Prisma7/pg, PostgreSQL17.11 em Docker Desktop Linux local. Dois serviços dev/test separados em loopback55432/55433; credenciais distintas só nos ficheiros ignorados, nunca no chat. Sem deploy ou CI remota executada. Schema técnico app e fixture persistence_probe, sem modelos bíblicos ainda.
S01:60 Jest (36 unit/7 integração/17 E2E), tooling13, typecheck/lint/build PASS; linhas100%, branches94,54%; mutação integral118/123 =95,9349593495935%,5 sobreviventes/3 timeouts analisados no relatório próprio. Estes números não comprovam features futuras.

S02-T004 DONE: Bíblia Livre/porbr2018, pt-BR, protestant-66, ordem/versificação do XML do fornecedor. ZIP4379838 bytes, SHA2561f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682; XML5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db. Inventário real66 livros/1189 capítulos/31102 versículos, sem lacunas/duplicações numéricas. Aviso CC BY4.0/créditos preservado. EXT-003 resolvida só para snapshot/usos S02; sem GPG independente/IA/imagens/áudio/comentários.
Corpus completo em backend/data/ ignorado; fixture versionável autêntica GEN1:1/JHN3:16–18, texto XML exato incluindo espaços finais. TXT tem aliases BibleWorks/diferenças espaços/colchetes; usar XML USFM aprovado, sem fundir/normalizar texto ou executar SQL do ZIP.

S02-T005 DONE técnico: oito ficheiros Domain de entidades/referência/parser/invariantes/erro; sem dependências/framework/ports vazios. RED87 → GREEN53/87 → regressão152 (128 unit,7 integração,17 E2E), tooling13 e estática/build PASS. Linhas161/161=100%, branches86/89=96,62%; Domain80/80 linhas e34/34 branches. Mutação incremental288:206Killed/3Timeout/6Survived/73CompileError, bruto209/215=97,20930232558139%; Domain91/92=98,91304347826087%. Dry run152,172 resultados S01 reutilizados/116 novos, fontes do relatório iguais a src. Sobrevivente novo: mensagem interna de erro; mantido no score, sem contrato literal aprovado. Sem Application/importação/consulta/API bíblica ou IA implementadas.

## Experiência confirmada

OneDrive: Dirent classificou ficheiros como links e Jest não descobriu testes; haste.enableSymlinks e watchman=false corrigiram. Configuração atual mantém VM modules/roots src-test; [ERR-0001](../errors/ERR-0001-s01-toolchain.md). Zero testes descobertos não é PASS.
Stryker incremental usava cache/JsonReporter no mesmo caminho; dois writers confirmados no código instalado geraram JSON inválido. Cache agora reports/mutation/incremental.json, final mutation.json; repetição válida/gate aprovado. Artefacto inválido preservado, sem score aceite da tentativa falhada. [ERR-0002](../errors/ERR-0002-stryker-report-collision.md).
Leituras de erro JSON devem limitar trechos para não despejar uma linha enorme. Não editar relatório para fabricar aprovação.
Histórico Git: mmap ao ler índice reverso contornado numa publicação anterior com pack.readReverseIndex=false temporário; não prova corrupção geral, não apagar objetos/resetar configuração global. Tentativa antiga apply_patch com operações duplicadas falhou sem edição; usar Update File para o mesmo caminho.
Sem padrões/experiência IA inventados para preencher índices.

## Próximos passos e limites

[Plano T006](../../sprints/S02/tasks/S02-T006-integration.md) preservado para futura retoma, adiada expressamente pelo utilizador junto com T007: Application/ports específicos, adapters reais, migração/importação atómica/idempotente, consultas/navegação e cinco contratos HTTP já aprovados. Nenhuma implementação T006 iniciada ou dependência nova instalada. T007 ainda depende dela. O fecho reduzido não entrega integração bíblica; rever esse impacto antes de S03 e obter autorização própria, com commit S02 ainda pendente.

[Relatório S02](../../sprints/S02/TEST_REPORT.md) e [revisão](../../sprints/S02/REVIEW.md) separam provas Domain da futura integração. Commit S02 PENDING. Ações externas EXT-001–006 continuam pertinentes por momento (IA/orçamento, isolação PG, fontes, acesso/retenção, deployment); não pedir segredos no chat.
