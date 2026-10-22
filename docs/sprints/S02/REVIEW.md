# S02 — Revisão e encerramento do escopo reduzido

Estado vigente2026-10-22: complemento T006/T007 em execução por autorização geral posterior, com T006 em validação e sprint IN_PROGRESS. Persistência/importação integral/five contratos reais implementados e testados;513 regressões PASS,100% linhas/97,05% branches. Mutação final e revisão integrada T007 pendentes, sem DONE antecipado. A revisão abaixo preserva somente o encerramento reduzido anterior; ver TEST_REPORT e TASKS vigentes.

Data:2026-10-21. Estado: DONE no recorte corpus/domínio/parser. Aprovação de redução de escopo e encerramento: utilizador, «termina, o que falta vou adicionar depois», após relatório de T004/T005 e explicação das pendências T006/T007. Commit principal S02 `c0c24b9f48aba7926dea05207a7263a97b7fc7b0`, realizado após «se terminou pode finalizar e ir para a proxima» em2026-10-21, depois desta revisão/pergunta de fechamento;44 ficheiros do escopo, árvore limpa após commit. Hash registado posteriormente. Continuação para preparação S03 autorizada após commit, sem aprovação implícita de novos contratos/planos. Sem push/merge.

## Entrega e decisão

T004 admite a Bíblia Livre/porbr2018 com origem, checksum, aviso/licença, catálogo e fixtures reais. T005 implementa Translation, Book, Chapter, Verse, PassageReference e parser estrutural puro, sem afirmar existência no banco. Regras/gramática do «ok» à SPEC v0.2 preservadas.

A decisão atual retira migração/importação, Application/consultas/navegação, cinco rotas e sua aceitação integrada do escopo de fecho. T006/T007 ficam BACKLOG para adição posterior pelo utilizador. Vantagem: concluir a entrega validada agora; custo: leitura bíblica HTTP e persistência continuam indisponíveis. Alternativa de completar o plano integral foi apresentada anteriormente; o utilizador escolheu adiar o restante. Nenhuma tecnologia/contrato novo foi implementado ou dependência instalada.

## Evidência e gates do recorte entregue

[TEST_REPORT](TEST_REPORT.md): RED87 esperado → GREEN53/87 → regressão152 PASS, com92 testes novos de Domain. TypeScript/lint/build/tooling13 aprovados; linhas100%, branches96,62%; Domain100%/100%. Stryker incremental:288 mutantes,172 reutilizados da integral S01/116 novos; score bruto209/215=97,21%, Domain91/92=98,91%. JSON válido e fontes dos14 ficheiros iguais a src, novamente conferidos no fecho.

Sem NoCoverage/RuntimeError/Pending; sobreviventes e3 timeouts analisados/mantidos no cálculo. Novo sobrevivente altera mensagem interna sem contrato literal aprovado. Colisão cache/relatório Stryker corrigida e repetição válida documentadas no ERR-0002; tentativa falhada não contada como PASS.

| Gate | Resultado no escopo de encerramento | Evidência/limite |
|---|---|---|
| 1 | APROVADO | SPEC/plano T005 aceites antes do código; utilizador autorizou agora redução/encerramento |
| 2 | APROVADO | RED/GREEN/refactor e regressão documentados |
| 3 | APROVADO | Estática/build/arquitetura e cobertura verificadas |
| 4 | NÃO APLICÁVEL ao incremento de Domain puro | Sem persistência/HTTP novos no recorte; regressão técnica real S01 passou. Integração bíblica adiada continua NOT_RUN |
| 5 | APROVADO | Stryker válido >85%, sem exclusões artificiais; sobreviventes analisados |
| 6 | NÃO APLICÁVEL | Sem IA |
| 7 | APROVADO tecnicamente | Escopo/critério/tarefas/índices/README/contexto sincronizados e checks documentais do fecho no TEST_REPORT |

Não há dispensa de falha de comportamento entregue ou redução de thresholds. T006/T007 e critérios originais não executados conservam estado e aplicabilidade futura. A revisão só aprova o incremento realmente entregue.

## Impactos, riscos e continuação

PLAN/SPEC registam a decisão sem apagar os contratos originais. Critérios novos AC05–07 identificam o recorte final; AC01–04 originais permanecem históricos e não integralmente satisfeitos. TASKS mantém as pendências numa fonte única. Roadmap/dependências/rastreabilidade registam o adiamento e não tratam S03 como automaticamente pronta.

Domain sem Nest/Prisma/Zod/ambiente/imports externos/ciclos; texto autêntico preservado, corpus ignorado separado de fixture versionável. Sem edição bíblica artificial, equivalência entre versões ou execução de SQL do fornecedor. Créditos/CC BY4.0 e hashes rastreáveis; sem alegação GPG independente.

Limites: não há Application, migração/importação no banco ou API bíblica, IA, frontend ou CI remota comprovada. Antes de funcionalidades que precisem desses serviços, rever a dependência adiada. ADR-0003/0004 continuam aplicáveis; sem mudança arquitetural, sem alterações históricas S00/S01/DOC-0001.

Pergunta obrigatória de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
