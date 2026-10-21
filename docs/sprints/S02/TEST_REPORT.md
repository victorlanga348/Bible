# S02 — Relatório de testes

Data: 2026-10-21. Sprint DONE com escopo reduzido a corpus/domínio/parser T004/T005 por decisão explícita «termina, o que falta vou adicionar depois». SPEC v0.2/plano T005 aprovados antes do código; revisão de escopo v0.3 registada. T006/T007 adiadas no BACKLOG; consultas/importação/HTTP bíblicos ainda não implementados.
Branch feat/biblia-backend; base d0036ab, após commit principal S01 1702cc0. Encerramento do recorte e commit aprovados; principal S02 `c0c24b9f48aba7926dea05207a7263a97b7fc7b0`, `feat(sprint-02): implement biblical canon`,44 ficheiros selecionados e árvore limpa após commit. Hash registado posteriormente; menções PENDING abaixo são históricas. Sem push/merge. Resultados abaixo são da árvore de trabalho, não de uma release ou CI remota.

## Ambiente e comandos reais

Windows/PowerShell, Node24.16.0, npm11.13.0, TypeScript6.0.3, Jest30.5.2, Stryker10.0.0, PostgreSQL17.11 em Docker Desktop local. Bases dev/test isoladas, ambas saudáveis; regressão de integração usa o alvo de teste protegido da S01. Sem dependência nova, fornecedor pago ou IA. Leituras estruturadas usam Node/Python/PowerShell nativos por não terem equivalente RTK; comandos npm/Git usam RTK quando compatível. Logs e relatórios locais em backend/reports/, ignorados pelo Git.

| Execução em backend/ | Estado | Evidência |
|---|---|---|
| rtk npm run test:unit -- --testPathPatterns=biblical-canon | FAIL esperado — RED | Duas suites/87 falhas por comportamento ainda ausente em stubs compiláveis; s02-t005-red-01.log, exit1. Não eram falhas de sintaxe/import/ambiente |
| rtk npm run test:unit -- --testPathPatterns=biblical-canon/reference | PASS — GREEN referência | 53 testes; s02-t005-green-reference.log |
| rtk npm run test:unit -- --testPathPatterns=biblical-canon | PASS — GREEN entidades | 87 testes; s02-t005-green-01.log |
| rtk npm run test:coverage | PASS — regressão/refactor | 7 suites/152 testes: 128 unitários (92 novos), 7 integrações e17 E2E técnicos reais; s02-t005-coverage-01.log |
| rtk npm run typecheck; rtk npm run lint; rtk npm run build | PASS | Zero erros; typecheck/lint repetidos após reforços de regressão |
| rtk npm run test:tooling | PASS | 13 checks: arquitetura7 e gate de mutação6; inclui análise AST/ciclos dos novos ficheiros |
| rtk npm run test:mutation:incremental — tentativa01 | FAIL | 288 mutantes avaliados, mas cache e JsonReporter escreviam no mesmo caminho; JSON inválido e gate exit1. O score textual não foi aceite |
| rtk npm run test:mutation:incremental — tentativa02 | PASS | Cache separado do relatório; dry run152 PASS, 172 resultados S01 reutilizados/116 mutantes novos. Duração3min47s, gate exit0; s02-t005-mutation-02.log |
| Node/fs: parsing independente das duas saídas e comparação com src | PASS | JSON final e cache válidos, mesmos resultados; zero diferenças entre source do relatório e14 ficheiros próprios |
| CI remota | NOT_RUN | Sem push autorizado; execução local não comprova CI remota |
| Integração/API/importação do módulo biblical-canon | NOT_RUN | Pertence à T006/T007. Os 24 testes reais acima verificam regressão técnica da fundação, não estes comportamentos |
| IA | NOT_RUN; não aplicável | Domínio/parser sem chamadas/modelos de IA |

## TDD e cobertura

Os testes de gramática/invariantes foram escritos primeiro, executados contra assinaturas/stubs lançando erro de comportamento ausente, e só depois implementados. RED87, GREEN53 de referência e GREEN87 do conjunto ficam preservados nos logs. Helpers específicos evitam repetir validações; nenhuma abstração genérica, SDK/framework, port vazio ou adapter de catálogo foi introduzido no Domain.

Depois de GREEN, cinco reforços verificam prefixo de código inválido e impossibilidade de invalidar identidades/texto por escrita posterior. São regressões sobre comportamento existente, sem alegar novo RED original. Resultado final T005:92 testes (referência55, entidades37). Verse preserva os quatro textos autênticos byte a byte no valor JSON, incluindo espaços finais; parser estrutural não afirma existência.

Cobertura global: linhas161/161 =100%; branches86/89 =96,62%; statements183/183 =100%; funções26/26 =100%. Domínio novo: linhas80/80 e branches34/34 =100%. Escopo src/**/*.ts, excluindo apenas gerado conforme configuração existente. Resumo em reports/coverage/coverage-summary.json, cópia estável s02-t005-coverage-summary.json e lcov/HTML locais; não existe coverage-final.json nesta configuração (reporter json-summary).

## Mutação e análise

Relatório válido preservado em reports/s02-t005-mutation-final.json, além de reports/mutation/mutation.json e HTML. Cache separado reports/mutation/incremental.json. Escopo integral de código próprio mantido, sem alteração de operadores/exclusões/limiares. A execução é incremental: reutilizou172 mutantes da execução integral S01 e avaliou os116 novos, com dry run de toda a suite atual.

| Escopo | Total | Killed | Timeout | Survived | CompileError | Válidos | Score bruto |
|---|---|---|---|---|---|---|---|
| 14 ficheiros próprios | 288 | 206 | 3 | 6 | 73 | 215 | 209/215 =97,20930232558139% |
| Oito ficheiros Domain S02 | 116 | 91 | 0 | 1 | 24 | 92 | 91/92 =98,91304347826087% |

NoCoverage/RuntimeError/Pending: zero. CompileError é separado, não deteção; os24 novos são mutantes inválidos de tipos/retornos/estado obrigatório, rejeitados pelo checker TypeScript. Originais passam typecheck/build e dry run. Timeouts3 herdados permanecem com a classificação real; só Killed206/215 =95,81395348837209% também supera85%, portanto não determinam aprovação.

Novo sobrevivente137, canon-domain-error.ts:2, StringLiteral: esvazia a mensagem interna. As suites exigem a classe de erro e a recusa dos estados inválidos; a mensagem literal interna não faz parte da SPEC ou do envelope HTTP. Não se declara equivalência universal nem se cria teste que só copie a string. Mantido no denominador, sem defeito crítico de contrato identificado.

Restantes sobreviventes, ainda no denominador: app.ts:20/id4 remove logger:false (lacuna residual de observação de logs do framework); runtime-config.ts:32/id97 esvazia sentinela de loopback (cenários exercitados mantêm normalização); database.ts:15/ids122–123 remove/esvazia schema do adapter (ainda sem modelos Prisma, SQL técnico qualificado); health.controller.ts:27/id288 esvazia query de readiness (a conexão ainda é exercitada, sem consumo das linhas). Análise original detalhada no relatório S01; IDs do relatório atual explicitados para não os transportar por inferência. T006 deve verificar schema app com modelos reais.

Timeouts atuais109/runtime-config.ts:33,247/error.filter.ts:6 e295/health.controller.ts:31. Retirar envio de resposta pode deixar requisição pendente; os outros atingiram limite temporal sem causa isolada comprovada. Não renomear para Killed. Nenhum sobrevivente foi retirado do cálculo.

Incidente/correção: [ERR-0002](../../megabrain/errors/ERR-0002-stryker-report-collision.md). Artefacto inválido da tentativa01 preservado, sem reparação manual; tentativa02 confirmou duas saídas válidas e gate estrito >85%.

## Admissão e dados reais — T004

ZIP oficial porbr2018 obtido após aprovação; SHA-256 1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682. XML canónico 5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db. Inventário verificado:66 livros/1.189 capítulos/31.102 versículos, sem lacunas/duplicações numéricas. Aviso/créditos CC BY4.0 preservados; EXT-003 resolvida para snapshot/usos aprovados. Não se alega verificação GPG.

[Fixture real](../../../backend/test/fixtures/biblical-canon/porbr2018/README.md): manifesto/catálogo/aviso e GEN1:1,JHN3:16–18 exclusivos de teste, comparados ao XML sem trim/correção. ZIP completo fica em backend/data/ ignorado; nenhum SQL fornecido executado. XML usa códigos USFM; TXT usa aliases BibleWorks e contém diferenças de espaços/colchetes documentadas, sem fundir exports. Nenhum conteúdo bíblico gerado ou fixture usada como seed.

## Critérios e sete gates — alcance da T005

P01/P02/P03 PASS. Critérios do recorte final AC05/AC06/AC07 PASS, com evidências de admissão/Domain/gates/governança. Critérios originais AC01–04 não foram integralmente satisfeitos: casos I01–I03/H01 continuam NOT_RUN, fora do encerramento por adiamento explícito. A futura T007 conserva sua exigência de aceitação da integração. A tabela de gates abaixo vale também para o recorte corpus/Domain entregue.

| Gate | Resultado T005 | Evidência/alcance |
|---|---|---|
| 1 | APROVADO | «ok» à SPEC v0.2/recorte/plano; T004 concluída antes de código |
| 2 | APROVADO | RED87 → GREEN53/87 → regressão152 e arquitetura |
| 3 | APROVADO | Estática/build/tooling e cobertura acima dos mínimos |
| 4 | NÃO APLICÁVEL ao Domain puro | Sem persistência/HTTP novos; regressão real S01 passou, sem substituir futura prova S02 |
| 5 | APROVADO | Relatório válido, bruto global97,21% e Domain98,91%, análise de sobreviventes |
| 6 | NÃO APLICÁVEL | Sem IA |
| 7 | APROVADO tecnicamente | Documentos/estado/impactos sincronizados; validação documental final abaixo |

## Histórico da preparação e limites

Antes do «ok», T004 esteve BLOCKED: pesquisadas duas candidatas e concretizados SPEC v0.2, recorte/contratos/plano, sem atribuir escolhas religiosas ao utilizador. Checks documentais anteriores:16 Markdown/165 links e depois18/174, sem destinos ausentes. Nenhum resultado daquela preparação era teste de software. Primeira comparação do rótulo por pipe PowerShell falhou por acentos do script; repetida com escapes Unicode, sem alterar a fonte para satisfazer o check.

O plano aprovado da SPEC foi preservado como histórico; estado efetivo está em TASKS/README e neste relatório. A S02 foi depois encerrada com escopo reduzido, por decisão explícita registada no PLAN/REVIEW. Sem Application/rotas/migração/importação bíblica, novas dependências ou commit/push/merge.

Validação anterior à decisão de adiamento em2026-10-21: Node/fs + Git enumerou42 ficheiros modificados/novos,27 Markdown/195 links relativos, zero destinos ausentes e estados T004/T005 DONE, T006/T007 BLOCKED coerentes. Comparação em memória com passwords dos ficheiros locais ignorados: zero ocorrências nesses42 ficheiros; não é auditoria universal de segredos. git diff --check PASS, diff de S00/S01/DOC-0001/ADRs/.github vazio e índice Git sem staging. git check-ignore confirmou ZIP, ambientes e relatório ignorados. Python stdlib voltou a verificar ZIP/XML/aviso por hash, inventário completo/numeração e quatro textos exatos da fixture: PASS. Não houve teste novo de comportamento nesta conferência documental/de dados.

## Encerramento reduzido autorizado e conferência final

Atualização posterior: «se terminou pode finalizar e ir para a proxima» autoriza finalizar/commitar a S02 e continuar para preparação S03 após o commit. Commit permanece PENDING até a execução real e será registado depois sem autorreferência impossível. As menções anteriores de ausência de autorização descrevem os passos históricos. Sem push/merge ou execução de planos/contratos S03 ainda não apresentados.

O utilizador determinou «termina, o que falta vou adicionar depois» em2026-10-21. Escopo final: corpus/domínio/parser T004/T005. T006/T007 adiadas no BACKLOG sem sprint futura atribuída; integração/API continuam NOT_RUN. Critérios AC05–07 PASS no recorte; AC01–04 originais e casos I/H preservados como não integralmente satisfeitos. PLAN/SPEC v0.3/REVIEW registam impacto e decisão. Sprint DONE no recorte autorizado; commit PENDING sem pedido específico de commit, sem push/merge ou início de S03.

Alteração deste fecho exclusivamente documental: RED/GREEN adicional não aplicável, pois não houve comportamento/configuração executável novo. Não se repetiram suites já aprovadas sem mudança de código que justificasse a repetição. Node/fs comparou novamente as fontes dos14 ficheiros com o relatório Stryker válido: zero diferenças; contagens reais e cobertura preservadas. Evidência existente continua a aplicar-se ao incremento entregue.

Check final Node/fs + Git PASS:44 ficheiros modificados/novos,29 Markdown/234 links relativos, zero destinos ausentes; T004/T005 DONE e T006/T007 BACKLOG coerentes, critérios atuais AC05–07 PASS e antigos AC01–04 NOT_RUN preservados. Nenhuma alteração em S00/S01/DOC-0001/ADRs/.github; nenhum staging. Comparação limitada com passwords locais: zero ocorrências nos ficheiros alterados, sem alegação de auditoria universal. Artefacto local ignorado reports/s02-closure-docs.json. rtk git diff --check PASS; rtk git check-ignore confirmou ZIP/ambientes/relatório ignorados. Leituras e parsing nativos por não terem equivalente RTK; Git compatível via RTK. Sem alterações silenciosas ao escopo original: o adiamento está explícito nas fontes canónicas.
