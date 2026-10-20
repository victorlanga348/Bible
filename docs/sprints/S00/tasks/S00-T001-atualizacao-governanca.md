# S00-T001 — Atualizar governança e preparar sprints/roadmap

Estado: DONE.
Prioridade: alta, conforme pedido imediato. Data de registo: 2026-10-17.
Sprint: [S00](../README.md). Trilha: transversal (A/B/C).
Responsável: agente executor desta sessão. Revisor/aprovador: utilizador.
Spec normativa da operação: [governança documental](../../../documentation-governance.md) e pedido de atualização nesta sessão.
Specs de funcionalidades afetadas por navegação/referência: SS-001, FQ-001, SR-001, SH-001; permanecem em rascunho e os seus ficheiros não são alterados.

## Contexto e inspeção
A documentação anterior tinha etapas R0–R6, IDs PLAN-*, dez gates, StrykerJS candidato e rtk obrigatório.
Inspeção focada em governança, qualidade, tarefas, stack/ADRs e MegaBrain. Consultados erros, padrões e armadilhas: nenhum registo de incidente/padrão de aplicação existia.
Catálogo de skills verificado; nenhuma skill específica é necessária para esta atualização documental. Não foram delegadas tarefas a subagentes.
Estado Git inicial: main associada a origin/main, README.md modificado e AGENTS.md/GEMINI.md/docs ainda não versionados. Sem package.json ou aplicação.

## Plano e aprovações
Plano apresentado após inspeção: atualizar regras e 19 documentos existentes, criar S00–S09 com cinco documentos cada, roadmap, correspondência de IDs, ficha desta tarefa e ADR de StrykerJS condicionada.
O utilizador aprovou com «ok», autorizando apenas a operação documental e a preparação do planeamento.
Sprint/escopo e plano documental: aprovados nessa confirmação. Requisitos normativos: fornecidos pelo utilizador.
Specs e planos de implementação futuros: não aprovados. Encerramento de S00: não aprovado.

## Solução e alternativas
Aplicar a estrutura pedida com fonte de estado nas sprints e fonte de marcos em produto, sem backlogs concorrentes.
Alternativa de renumerar os IDs antigos foi rejeitada no plano para preservar links e evidências. Alternativa de instalar ferramentas agora está fora do escopo.
Vantagens: aprovações, dependências e qualidade verificáveis. Desvantagens: maior manutenção documental, mitigada por índices e correspondência explícita.

## Riscos e mitigações
- Duplicação de estado/normas: definir fontes canónicas e validar resumos.
- Perda de histórico: preservar ADR-0001, specs e DOC-0001 byte a byte; manter PLAN-* como referências.
- S04 confundida com geração operacional: separar ports/regras da integração real de S05.
- StrykerJS tratado como compatível: manter DEC-08 como validação pendente, sem instalar.
- Tarefas futuras interpretadas como aprovadas: sprints BACKLOG; tarefas dependentes de specs/contratos pendentes BLOCKED.

## Dependências e escopo
Antecedente: DOC-0001; não é uma tarefa a executar novamente.
Não há dependência de application runtime ou fornecedor para esta alteração documental.
Não criar código, schema, migrações, corpus, chamadas de IA, package.json, dependências, commit, push ou deploy.

## Critérios de aceitação
- S00-T001-AC01: AGENTS contém todas as regras operacionais; GEMINI aponta para os seis documentos obrigatórios.
- S00-T001-AC02: S00–S09 têm cinco documentos exigidos e critérios/gates próprios, sem datas ou retrospectivas inventadas.
- S00-T001-AC03: tarefas têm IDs únicos, seis estados permitidos, trilha, prioridade, dependências e spec/referência pendente explícita.
- S00-T001-AC04: sete gates coerentes; StrykerJS condicionado, cálculo preservado e score estritamente superior a 85%.
- S00-T001-AC05: ligações válidas, dependências sem ciclos, PLAN-* rastreáveis e documentos históricos/especificações preservados.
- S00-T001-AC06: nenhuma funcionalidade ou ferramenta instalada; evidências e contexto atualizados; sprint não encerrada sem aprovação.

## Plano de validação
RED/GREEN/REFACTOR: NÃO APLICÁVEL, pois não existe comportamento executável alterado.
TypeScript/ESLint/build: NÃO APLICÁVEL, sem código/package.json; não inventar scripts.
Integração PostgreSQL/Prisma/NestJS/fornecedor: NÃO APLICÁVEL, sem aplicação/adapters afetados.
Mutação e avaliação IA: NÃO APLICÁVEL, sem código mutável ou geração. Nenhum score ou teste de aplicação será declarado.
Validação documental: estrutura, conteúdo, links, IDs, estados, campos, DAG, rastreabilidade, sete gates, preservação de ficheiros e diff.

## Resultado dos sete gates
| Gate | Resultado | Evidência ou motivo |
|---|---|---|
| 1 — Especificação | APROVADO | Pedido normativo e plano documental aprovados pelo «ok» do utilizador |
| 2 — TDD | NÃO APLICÁVEL | Sem comportamento executável |
| 3 — Qualidade estática | NÃO APLICÁVEL | Sem código/package.json; validação Markdown no Gate 7 |
| 4 — Integração real | NÃO APLICÁVEL | Sem infraestrutura ou funcionalidade implementada |
| 5 — Mutação | NÃO APLICÁVEL | Sem código executável; não há score |
| 6 — IA | NÃO APLICÁVEL | Sem chamadas ou respostas geradas |
| 7 — Governança | APROVADO | Estrutura, links, estados, DAG, rastreabilidade, preservação e diff verificados; relatório abaixo |

## Evidências de execução
Inspeção com `rtk git status --short --branch` e leitura UTF-8 de ficheiros relevantes por Python/rtk proxy.
Snapshot SHA-256 dos 78 documentos anteriores em docs recolhido antes das alterações; comparação textual independente confirmou as três alterações de raiz.
Primeiro verificador inline, invocado por `rtk proxy python -c`: código de saída 0, sem falhas. Confirmou estrutura, links, estados, dependências e preservação.
Nessa passagem S00-T001 ainda estava IN_PROGRESS; foi promovida após aprovação da validação documental, com S00 em REVIEW.
`rtk git diff --check`: código de saída 0. Ficheiros ainda não versionados foram também inspecionados pelo verificador Python.
O comando reproduzível abaixo executa o verificador final deste documento, sem criar script ou dependência no repositório.

| Verificação | Resultado |
|---|---|
| Ficheiros obrigatórios originais | 51 presentes |
| Documentos Markdown atuais | 139 |
| Documentos novos nesta operação | 58 |
| Documentos existentes alterados nesta operação | 19 |
| Documentos anteriores de docs preservados byte a byte | 62 |
| Sprints / documentos obrigatórios por sprint | 10 / 50 |
| Tarefas | 28: 1 DONE, 11 BACKLOG, 16 BLOCKED |
| Links relativos | 755 verificados na versão final; nenhum quebrado |
| IDs, estados e campos obrigatórios | Válidos |
| Dependências | Sem referências inexistentes ou ciclos |
| Gates normativos | Sete, com não aplicabilidade documentada |
| Specs, ADR-0001 e DOC-0001 | Preservados byte a byte |
| Ficheiros de produção ou dependências criados | Nenhum |

Revisão de coerência: specs permanecem em rascunho; DEC-08 é condicionada; planeamento não aprova tarefas futuras; S00 aguarda encerramento.
Não foram executados testes de aplicação, typecheck, ESLint, build, integração, mutação ou avaliações de IA: alteração apenas documental, sem aplicação.
Validação estrutural não comprova qualidade histórica, direitos de obras por aprovar ou compatibilidade de ferramentas.

## Documentação afetada e histórico
19 documentos existentes atualizados: AGENTS/GEMINI/README, índice e governança/glossário, cinco documentos de qualidade, três de tarefas, roadmap de produto, stack/índice ADR e índice/contexto MegaBrain.
58 documentos novos previstos: 50 de sprints, índice de sprints, quatro de roadmap, índice/ficha de tarefas S00 e ADR-0002.
Os quatro ficheiros de specs, ADR-0001 e DOC-0001 ficam preservados; links antigos resolvem pela correspondência de IDs.

## MegaBrain
Contexto operacional atualizado. Nenhum incidente de aplicação ocorreu nesta operação; não criar erros ou lições fictícios.
Normas continuam em AGENTS/docs oficiais; MegaBrain apenas liga essas fontes e preserva continuidade.

## Definition of Done
Critérios acima verificados; Gate 7 aprovado por execução documental; gates não aplicáveis justificados; estados, evidências, report e contexto sincronizados.
A tarefa passou a DONE após validação documental sem falhas. S00 permanece REVIEW para aprovação explícita de encerramento, independentemente de esta tarefa estar DONE.

## Verificação obrigatória de fechamento
**"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
Resposta de revisão: não foi identificada alteração fora da documentação/README; todas as alterações desta operação estão registadas. Não confundir conclusão desta operação com aprovação de S01 ou publicação.

## Inventário da operação

19 documentos existentes atualizados e 58 novos, conforme plano. Novos caminhos:

```text
docs/architecture/adr/ADR-0002-adocao-condicional-strykerjs.md
docs/roadmap/README.md
docs/roadmap/dependencies.md
docs/roadmap/master-plan.md
docs/roadmap/traceability.md
docs/sprints/README.md
docs/sprints/S00/README.md
docs/sprints/S00/acceptance.md
docs/sprints/S00/backlog.md
docs/sprints/S00/retrospective.md
docs/sprints/S00/scope.md
docs/sprints/S00/tasks/README.md
docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md
docs/sprints/S01/README.md
docs/sprints/S01/acceptance.md
docs/sprints/S01/backlog.md
docs/sprints/S01/retrospective.md
docs/sprints/S01/scope.md
docs/sprints/S02/README.md
docs/sprints/S02/acceptance.md
docs/sprints/S02/backlog.md
docs/sprints/S02/retrospective.md
docs/sprints/S02/scope.md
docs/sprints/S03/README.md
docs/sprints/S03/acceptance.md
docs/sprints/S03/backlog.md
docs/sprints/S03/retrospective.md
docs/sprints/S03/scope.md
docs/sprints/S04/README.md
docs/sprints/S04/acceptance.md
docs/sprints/S04/backlog.md
docs/sprints/S04/retrospective.md
docs/sprints/S04/scope.md
docs/sprints/S05/README.md
docs/sprints/S05/acceptance.md
docs/sprints/S05/backlog.md
docs/sprints/S05/retrospective.md
docs/sprints/S05/scope.md
docs/sprints/S06/README.md
docs/sprints/S06/acceptance.md
docs/sprints/S06/backlog.md
docs/sprints/S06/retrospective.md
docs/sprints/S06/scope.md
docs/sprints/S07/README.md
docs/sprints/S07/acceptance.md
docs/sprints/S07/backlog.md
docs/sprints/S07/retrospective.md
docs/sprints/S07/scope.md
docs/sprints/S08/README.md
docs/sprints/S08/acceptance.md
docs/sprints/S08/backlog.md
docs/sprints/S08/retrospective.md
docs/sprints/S08/scope.md
docs/sprints/S09/README.md
docs/sprints/S09/acceptance.md
docs/sprints/S09/backlog.md
docs/sprints/S09/retrospective.md
docs/sprints/S09/scope.md
```

## Validação reproduzível

Comando efetivamente utilizado para a conferência final:

```powershell
rtk proxy python -c "from pathlib import Path
text = Path('docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md').read_text(encoding='utf-8')
exec(text.split(chr(96)*3+'python\n',1)[1].split('\n'+chr(96)*3,1)[0])"
```

O verificador usa a baseline desta operação. É específico desta entrega: alterações posteriores podem requerer nova baseline e aprovação própria. Exclui blocos de código da resolução de links Markdown.
Os três documentos de raiz foram comparados separadamente com os conteúdos iniciais; o cálculo de 19 inclui essas três alterações confirmadas.

<details>
<summary>Verificador Python, sem dependências externas</summary>

```python
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re, json, hashlib, sys
sys.stdout.reconfigure(encoding='utf-8')
root = Path.cwd()
baseline = {'docs/documentation-governance.md':'2bd5d4d0d5accaf7decf64127ba44a958dc1d638ac0d110dde0432049a252ca4','docs/glossary.md':'223d2b6366a805aa79b9226dc039b3d0ecabf59b32810c0a6509e16ec83119c3','docs/PRD.md':'61bd8b0eb93a5dc741c501abd69143709868ac6f437a9f213b46af0b7733aea4','docs/README.md':'5ca8aacc7c3ac576986ac335f1e476cbe89038449a4f515064c9bf55c8bd988a','docs/ai/evaluation.md':'7a3bb0fc58f273ab98983a852368c01c9da830e82f6cced188b58747ab74d795','docs/ai/grounding-and-citations.md':'608f08ae2cd5be5bfc0a316534ad95a11b1d9d56171a95d1e4d1f4bf350552ec','docs/ai/orchestration.md':'33097e093800e9364ecbc9a648fd86e7f7b3a0b6c43dcf4fa841a012c8a75e1e','docs/ai/prompts.md':'1389331b95ea82b5e493d5ce7383cc462d444d398196899f260d5b8490cff488','docs/ai/README.md':'f04c5f8610a07864c2f95aeda415c7c92d2ca78abacec5eec58f08e7dd9c23e9','docs/ai/safety-and-limits.md':'db919e0c5c2981a0b3057de80177907841797df0bf4572e9cb628c624de8eee3','docs/architecture/bounded-contexts.md':'b835713bf387022032a93d0ed2938ff3a3ec48252b7a19b6a8ddfb8b6766eed7','docs/architecture/data-model.md':'ac05c92b40ce80eba076e5b7cbc4d6148fc2c6941b1920914e4200407ac10782','docs/architecture/dependency-rules.md':'bd8e1c9ced4ea51d47c00eafd66a033f7da5183b76196c5c6654758f9041121e','docs/architecture/README.md':'a1ef69db5cb6a3f7a7ee55585e0ae5ae1a9ea2926325fe039cfa3617a5aafc73','docs/architecture/stack.md':'456b809485a5eca574126f7e9f573acc5e4e1477120d303d936f4da26877e992','docs/architecture/system-overview.md':'1b72f77a1294abebd3b01dec7bab5b0bbe647c0e6774b1ec36a41512c226eb22','docs/audits/accessibility.md':'1840ac44ab7e70080e17c803ecf176b3d2a222c053ec647e7c9e3d68512b08ae','docs/audits/README.md':'d754a0b1247e9364d48356034814f32bd1fc202cf6b55ed020b5f536cc179666','docs/audits/security.md':'16f0b1dd0621a7cfc39b06d26de44bd9979b7bdf2e0419a58363591b9477c3fd','docs/biblical-library/canon-and-versions.md':'c01b1696ab858c32be6affc0a382bc52d20402325b255a9b888751a2374f2b2c','docs/biblical-library/historical-context.md':'af653bc48179798d38a23ab9b5375f3d97ebe3ddbb8165013a614339401440e2','docs/biblical-library/interpretation-policy.md':'22007a5ae8effd25ea4caca3a71ce1e30c0eee471d435536d352dea58a410ef7','docs/biblical-library/README.md':'9c4a80da2da832dc9c4dc34a9f8701857ef1289f518e166c9e08a19d7674a9a1','docs/biblical-library/source-catalog.md':'5e88787dc253d0e412edcbb5dc9f62fbd640d5b21420ae8fb32c91a52b554ef0','docs/components/citation-card.md':'3c19333eaa2dc702a81e769430ebb9416ba55651afe69456593a8c3809e21c73','docs/components/README.md':'79cd8aaafaf8db2fac4d60fcda801dd825b7be9f44640c41f686fa2975c8d06f','docs/components/study-panel.md':'d0a5ee8e3f604baed6a972a28be0dbb72fb33d1d6cad8bd9c90c9b8b2462b5e5','docs/copywriting/microcopy.md':'fc6314964cc445cfb89369d000bf67430c57b34d946faf2c459b5843be53e137','docs/copywriting/README.md':'fa87e7f1bdd0d8aff2ee057ddec18f9842f3e27b1c9596e87bd83102b974ff00','docs/design/README.md':'16f4b7f2ca5df734733e2b336e30eca75fad725c2daa3ea42e7f23e793fe1d68','docs/design/responsive.md':'8570269bd197aaae6d26017677ff161b7484773065b8c41bf637e953961fe1b1','docs/design/tokens.md':'020cac193f5fa0aca4d670a676ba1ac24e4d3cf6932d3109b7976a2225d72667','docs/integrations/api-contracts.md':'6fa77644ab681dc34801a4a9cabea7e32886c50365bb5b20232e25a9859912d0','docs/integrations/auth.md':'5966efb926e2e367f09bfa6193ddf13bc5666be5f25c9d10698c07d7f112bd7b','docs/integrations/llm-provider.md':'cad839fad09d36b9d84f96a3d60f867c419833b35e174a68e30f5cd31251c3df','docs/integrations/README.md':'89a7167657d93d676dd1def8cf81163d494fcb6e5c4c743ef60c581ad0b9afb7','docs/megabrain/README.md':'b6e16c88074185e9c5fb73ad1db43e87fc836b5420ad7cf5f2075aefb875e9d5','docs/operations/environments.md':'024604e03727543ca000f2b7e0b2fc667533380ca3d65868e88e62fa7f25e782','docs/operations/observability.md':'6a4a4d2858c7b25ba0ef8ca3c5b822383e85448331df4ffe3c30af69df4d9689','docs/operations/README.md':'8898f30ad0caeada875f228e33aaab8b65a49fa4762551136211fdefc87845d2','docs/operations/runbooks.md':'750c0bb66c7d0f3fcdc9ad49c5c91c00c20c95fa864b5761759bdc9ddedebf20','docs/pages/passage-explorer.md':'a0de9f3e0acef6d6fa1a21589fd43930a4bf4a53221393ec6233ed4a140fd604','docs/pages/README.md':'876f4d2a957873eccba41da5b0a91f1b679c9e7e25ff423990357e97ccabac26','docs/pages/study-workspace.md':'86a1ef338c23bc3093f5f0a37494ca36c6e7b27b7de6a292ded30cc023c92ea1','docs/product/business-rules.md':'cec2c6f1dd85ed89f617f7c06e696cbdc1d0a873515246c7b3596f90683a7ede','docs/product/README.md':'7c5883a4978900b85c49b2e97ce6dd821af7eef9496631a1155f8ac60b98f8d8','docs/product/roadmap.md':'b61b12761ba4a199d67080d73ede8a9e87ae4b1a67bd91f465ae104a5e4e8913','docs/product/source-policy.md':'db7ce80c5bf1b74b2c64c93b3330cea4feaab83cb6b9273f1da15c1f61df67f3','docs/product/study-methodology.md':'728788edb27e1091ec572e023864c3a727d30c8326e25a3a4e31d670254acf95','docs/quality/mutation-testing.md':'2dffdd27dea319f79a25bfed37ca0f8e296face0e468201cad14d90a5b1b0e7b','docs/quality/quality-gates.md':'d2132bde0b8cec5f9866681e33880e512459c78fdec1cad14bb053edbffee85b','docs/quality/README.md':'eaa0b005de6cb2561cc9469d9a469940b28964244ee9d144bcab42f4f30534a1','docs/quality/tdd-policy.md':'ad531b476648ba82750f1e3dfd132471227f532a8260547e2501791db9b3fabb','docs/quality/testing-strategy.md':'f159731dbd878552d8d38e1eb45d58ba759b82275605749e422e98308e399757','docs/specs/free-questions.md':'5e23665425d16bfc2284378b671e96ed0fb481078421330589a9cb86458384a2','docs/specs/README.md':'dfb0f6f2392c55274c265fba2efcebc76739c648f252aec394c78d8acd92cc1d','docs/specs/source-retrieval.md':'6b243ef31c6cf0694f0cf6725f6702d93d4b57b579fee29653b25f4d03c050a2','docs/specs/structured-study.md':'114e067fac2877dbae48b3b26ef76ac422061a50cd6749a193c5f2f0f74351bd','docs/specs/study-history.md':'dd608c42c8e5e9a479a38056d8c84d8cd64fd3a85b3accdd476d8492eee262a9','docs/tasks/backlog.md':'548638e6e7c78b57f3506aa96155b657f08ca249816d0886efb67ef0c26056c9','docs/tasks/DOC-0001-inicializacao-governanca.md':'367e36a96440fa6fb7a0cef05ca7f7268d2b85571328bafba57f631297faaf7a','docs/tasks/README.md':'ebc0c49f3f7acf9fd35b0162a58edc1f6e4715e2dbb57e9ebb59960df10a1a12','docs/tasks/template.md':'3a9ebe334c40c192f2058c41ee06e52596d63adb697b2b73f701645d3adf4eb6','docs/megabrain/agent-context/project-state.md':'0d7904f4775bda518812643c5b52fad4f3f5479840ec397cf09336e60fddd879','docs/megabrain/agent-context/README.md':'ef5041a60105e6dc2dd41f2532f0121d1e3a94ad81434ea32bdefeabd0aa179f','docs/megabrain/errors/README.md':'eea619e008e48e6f72fa1d76c58e7d9ea7b44ae1ddae1b4dfd74999d3c1e50b7','docs/megabrain/investigations/README.md':'52eaa61a0bfe946c765ba023dce773521ad22b8aeb954c5aceb354e8ed31ac50','docs/megabrain/lessons/README.md':'5c1832acc3d09a6b78145e45d04cd60f0e183e5e026da262b4412947451e5d11','docs/megabrain/patterns/README.md':'a4cb16f876e5c2a7eb73b169116205241b9dc7168ce48c784a1043c2746c1e4a','docs/megabrain/pitfalls/README.md':'e4890757cebfd039670273858f2f18e541497a2cc75175724de36a351d414a55','docs/megabrain/templates/approved-pattern.md':'287864e6861db6e08ab784a629afe6274b0ee5bfe55a795b23227ae8c9d0009b','docs/megabrain/templates/error-report.md':'3239b665be44af6225895929e6fe4bf2be1cd87874594ed1a14d10b57452e104','docs/megabrain/templates/lesson-learned.md':'1a681c368d845fd973477d9e7cd18d3c7b22bca4bbcff1fb5f937821b0c75b19','docs/megabrain/templates/README.md':'54b4a71dbad2be147baeddb64fd154871903ae2235e3566c261a380622d7379f','docs/megabrain/templates/technical-investigation.md':'6c87d7957e8200f27e771fda3ea1e75804cafa542b6006b7e8571876c8781128','docs/architecture/adr/ADR-0001-stack-e-limites-arquiteturais.md':'f2ddf6555df9f8343bd65514188c5331d20e1aba0fff2600723ed13691be9bcc','docs/architecture/adr/README.md':'d9d8dc5b11d66e714fce25f8cf480aec8fa04e60edb190e957bcf1aa3f4d561d','docs/architecture/adr/template.md':'eb0b77cb17b6d3e7e925ce1209c6c2e39f2f1a75bda1f79de9cf750ad13f18ab'}
allowed = set(['AGENTS.md','GEMINI.md','docs/documentation-governance.md','docs/quality/README.md','docs/quality/tdd-policy.md','docs/quality/testing-strategy.md','docs/quality/mutation-testing.md','docs/quality/quality-gates.md','README.md','docs/README.md','docs/glossary.md','docs/tasks/README.md','docs/tasks/template.md','docs/tasks/backlog.md','docs/product/roadmap.md','docs/architecture/stack.md','docs/architecture/adr/README.md','docs/megabrain/README.md','docs/megabrain/agent-context/project-state.md'])
expected_new = set(['docs/sprints/S00/README.md','docs/sprints/S00/scope.md','docs/sprints/S00/backlog.md','docs/sprints/S00/acceptance.md','docs/sprints/S00/retrospective.md','docs/sprints/S01/README.md','docs/sprints/S01/scope.md','docs/sprints/S01/backlog.md','docs/sprints/S01/acceptance.md','docs/sprints/S01/retrospective.md','docs/sprints/S02/README.md','docs/sprints/S02/scope.md','docs/sprints/S02/backlog.md','docs/sprints/S02/acceptance.md','docs/sprints/S02/retrospective.md','docs/sprints/S03/README.md','docs/sprints/S03/scope.md','docs/sprints/S03/backlog.md','docs/sprints/S03/acceptance.md','docs/sprints/S03/retrospective.md','docs/sprints/S04/README.md','docs/sprints/S04/scope.md','docs/sprints/S04/backlog.md','docs/sprints/S04/acceptance.md','docs/sprints/S04/retrospective.md','docs/sprints/S05/README.md','docs/sprints/S05/scope.md','docs/sprints/S05/backlog.md','docs/sprints/S05/acceptance.md','docs/sprints/S05/retrospective.md','docs/sprints/S06/README.md','docs/sprints/S06/scope.md','docs/sprints/S06/backlog.md','docs/sprints/S06/acceptance.md','docs/sprints/S06/retrospective.md','docs/sprints/S07/README.md','docs/sprints/S07/scope.md','docs/sprints/S07/backlog.md','docs/sprints/S07/acceptance.md','docs/sprints/S07/retrospective.md','docs/sprints/S08/README.md','docs/sprints/S08/scope.md','docs/sprints/S08/backlog.md','docs/sprints/S08/acceptance.md','docs/sprints/S08/retrospective.md','docs/sprints/S09/README.md','docs/sprints/S09/scope.md','docs/sprints/S09/backlog.md','docs/sprints/S09/acceptance.md','docs/sprints/S09/retrospective.md','docs/sprints/README.md','docs/roadmap/README.md','docs/roadmap/master-plan.md','docs/roadmap/dependencies.md','docs/roadmap/traceability.md','docs/sprints/S00/tasks/README.md','docs/architecture/adr/ADR-0002-adocao-condicional-strykerjs.md','docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md'])
files = sorted(list(root.glob('*.md')) + list((root / 'docs').rglob('*.md')))
contents = {p.relative_to(root).as_posix(): p.read_text(encoding='utf-8') for p in files}
errors = []
links = 0
for name, content in contents.items():
    if not content.strip():
        errors.append('empty:' + name)
    if any(line.rstrip() != line for line in content.splitlines()):
        errors.append('whitespace:' + name)
    if any(marker in content for marker in ['\ufffd', '\u00c3\u00a7', '\u00c3\u00b5']):
        errors.append('encoding:' + name)
    markdown = re.sub(r'^' + chr(96)*3 + r'.*?^' + chr(96)*3 + r'[ \t]*(?:\n|\Z)', '', content, flags=re.M|re.S)
    for target in re.findall(r'\[[^\]\n]+\]\(([^)\n]+)\)', markdown):
        parsed = urlsplit(target.strip().strip('<>'))
        if parsed.scheme or target.startswith('//'):
            continue
        links += 1
        destination = ((root / name).parent / unquote(parsed.path)).resolve() if parsed.path else (root / name)
        if not destination.is_file():
            errors.append('link:' + name + ':' + target)
        elif parsed.fragment:
            headings = re.findall(r'^#{1,6}\s+(.+)', destination.read_text(encoding='utf-8'), re.M)
            slugs = [re.sub(r'[^\w\s-]', '', h.lower()).replace(' ', '-') for h in headings]
            if unquote(parsed.fragment) not in slugs:
                errors.append('anchor:' + name + ':' + target)
required = {
    '.':'AGENTS.md GEMINI.md README.md',
    'docs':'README.md PRD.md documentation-governance.md glossary.md',
    'docs/architecture':'stack.md system-overview.md bounded-contexts.md data-model.md dependency-rules.md',
    'docs/product':'business-rules.md study-methodology.md source-policy.md roadmap.md',
    'docs/ai':'orchestration.md prompts.md grounding-and-citations.md evaluation.md safety-and-limits.md',
    'docs/biblical-library':'canon-and-versions.md source-catalog.md historical-context.md interpretation-policy.md',
    'docs/integrations':'auth.md api-contracts.md llm-provider.md',
    'docs/design':'tokens.md responsive.md',
    'docs/pages':'study-workspace.md passage-explorer.md',
    'docs/components':'study-panel.md citation-card.md',
    'docs/copywriting':'microcopy.md',
    'docs/quality':'tdd-policy.md testing-strategy.md mutation-testing.md quality-gates.md',
    'docs/audits':'security.md accessibility.md',
    'docs/operations':'environments.md observability.md runbooks.md',
    'docs/tasks':'template.md backlog.md',
    'docs/specs':'structured-study.md free-questions.md source-retrieval.md study-history.md',
    'docs/megabrain':'README.md'
}
mandatory = [(Path(folder)/name).as_posix() for folder,names in required.items() for name in names.split()]
errors += ['missing:' + name for name in mandatory if name not in contents]
sprint_ids = ['S' + str(i).zfill(2) for i in range(10)]
states = {'BACKLOG','READY','IN_PROGRESS','BLOCKED','REVIEW','DONE'}
tasks = {}
sprint_edges = {}
counts = {state:0 for state in sorted(states)}
for sprint in sprint_ids:
    folder = 'docs/sprints/' + sprint + '/'
    for name in ['README.md','scope.md','backlog.md','acceptance.md','retrospective.md']:
        if folder + name not in contents:
            errors.append('sprint_file:' + folder + name)
    readme = contents.get(folder + 'README.md','')
    dep_line = next((line for line in readme.splitlines() if line.startswith('Depend\u00eancias:')), '')
    sprint_edges[sprint] = re.findall(r'\[(S\d{2})\]', dep_line)
    if not dep_line:
        errors.append('sprint_dependencies:' + sprint)
    acceptance = contents.get(folder + 'acceptance.md','')
    for gate in range(1,8):
        if '| ' + str(gate) + ' |' not in acceptance:
            errors.append('sprint_gate:' + sprint + ':' + str(gate))
    if len(set(re.findall(sprint + r'-AC\d{2}',acceptance))) != 4:
        errors.append('sprint_acceptance:' + sprint)
    retro = contents.get(folder + 'retrospective.md','')
    if sprint != 'S00' and 'n\u00e3o realizada' not in retro:
        errors.append('future_retrospective:' + sprint)
    backlog = contents.get(folder + 'backlog.md','')
    for line in backlog.splitlines():
        if not re.match(r'\| S\d{2}-T\d{3} \|',line):
            continue
        cells = [value.strip() for value in line.split('|')[1:-1]]
        if len(cells) != 7:
            errors.append('task_fields:' + line)
            continue
        task_id,title,track,priority,state,deps,spec = cells
        if task_id in tasks or not task_id.startswith(sprint + '-'):
            errors.append('task_identity:' + task_id)
        if state not in states:
            errors.append('task_state:' + task_id + ':' + state)
        else:
            counts[state] += 1
        if not all([title,track,priority,spec]):
            errors.append('task_fields_empty:' + task_id)
        if state == 'BLOCKED' and task_id + ':' not in backlog:
            errors.append('blocked_without_reason:' + task_id)
        if sprint != 'S00' and state in {'READY','IN_PROGRESS','REVIEW','DONE'}:
            errors.append('future_authorization:' + task_id)
        tasks[task_id] = {'deps':re.findall(r'\bS\d{2}-T\d{3}\b',deps),'state':state}
def validate_graph(graph,label):
    visited,active = set(),set()
    def visit(node):
        if node in active:
            errors.append('cycle:' + label + ':' + node)
            return
        if node in visited:
            return
        active.add(node)
        for dependency in graph.get(node,[]):
            if dependency not in graph:
                errors.append('unknown_dependency:' + label + ':' + dependency)
            else:
                visit(dependency)
        active.remove(node)
        visited.add(node)
    for node in graph:
        visit(node)
validate_graph({key:value['deps'] for key,value in tasks.items()},'tasks')
validate_graph(sprint_edges,'sprints')
if len(tasks) != 28 or counts['IN_PROGRESS'] > 1:
    errors.append('task_count_or_parallelism')
dep_rows={}
for line in contents.get('docs/roadmap/dependencies.md','').splitlines():
    if re.match(r'\| S\d{2}-T\d{3} \|',line):
        cells=[value.strip() for value in line.split('|')[1:-1]]
        dep_rows[cells[0]]=re.findall(r'\bS\d{2}-T\d{3}\b',cells[1])
if dep_rows != {key:value['deps'] for key,value in tasks.items()}:
    errors.append('dependency_map_mismatch')
for i in range(1,12):
    legacy='PLAN-' + str(i).zfill(3)
    for name in ['docs/tasks/backlog.md','docs/roadmap/traceability.md']:
        if legacy not in contents.get(name,''):
            errors.append('legacy:' + legacy + ':' + name)
for link in ['AGENTS.md','docs/documentation-governance.md','docs/quality/tdd-policy.md','docs/quality/quality-gates.md','docs/sprints/README.md','docs/megabrain/README.md']:
    if '(' + link + ')' not in contents['GEMINI.md']:
        errors.append('gemini:' + link)
if re.findall(r'^## Gate (\d)',contents['docs/quality/quality-gates.md'],re.M) != [str(i) for i in range(1,8)]:
    errors.append('seven_gates')
question='Existe alguma altera\u00e7\u00e3o no projeto que n\u00e3o esteja refletida em /docs ou no README?'
for name in ['AGENTS.md','docs/documentation-governance.md','docs/sprints/README.md','docs/quality/quality-gates.md']:
    if question not in contents[name]:
        errors.append('mandatory_question:' + name)
changed = []
preserved = []
for name,digest in baseline.items():
    path=root/name
    if not path.is_file():
        errors.append('baseline_deleted:' + name)
    elif hashlib.sha256(path.read_bytes()).hexdigest() != digest:
        changed.append(name)
        if name not in allowed:
            errors.append('unauthorized_change:' + name)
    else:
        preserved.append(name)
actual_new = set(contents).difference(baseline).difference({'README.md','AGENTS.md','GEMINI.md'})
if actual_new != expected_new:
    errors.append('new_file_inventory:' + str(sorted(actual_new.symmetric_difference(expected_new))))
for name in ['docs/specs/structured-study.md','docs/specs/free-questions.md','docs/specs/source-retrieval.md','docs/specs/study-history.md','docs/architecture/adr/ADR-0001-stack-e-limites-arquiteturais.md','docs/tasks/DOC-0001-inicializacao-governanca.md']:
    if name not in preserved:
        errors.append('protected_file:' + name)
directories=[Path('docs')] + [p for p in Path('docs').rglob('*') if p.is_dir()]
errors += ['directory_readme:' + p.as_posix() for p in directories if not (p/'README.md').is_file()]
non_docs=[p.as_posix() for p in Path('docs').rglob('*') if p.is_file() and p.suffix != '.md']
non_docs += [p.as_posix() for p in root.iterdir() if p.is_file() and p.suffix != '.md']
if non_docs:
    errors.append('non_documentation_files:' + str(non_docs))
if Path('package.json').exists():
    errors.append('unexpected_package_json')

for sprint in sprint_ids:
    readme=contents['docs/sprints/' + sprint + '/README.md']
    actual=next((line.split()[0] for line in readme.splitlines() if re.match(r'^(BACKLOG|READY|IN_PROGRESS|BLOCKED|REVIEW|DONE)\b',line)),None)
    for name in ['docs/sprints/README.md','docs/roadmap/master-plan.md']:
        row=next((line for line in contents[name].splitlines() if line.startswith('| [' + sprint)), '')
        if actual is None or not re.search(r'\| ' + actual + r' \|',row):
            errors.append('sprint_status_summary:' + sprint + ':' + name)
current_task=contents['docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md']
task_state=re.search(r'^Estado: (\w+)\.',current_task,re.M).group(1)
if task_state != tasks['S00-T001']['state']:
    errors.append('task_status_document')
task_row=next((line for line in contents['docs/sprints/S00/tasks/README.md'].splitlines() if line.startswith('| [S00-T001]')), '')
if '| ' + task_state + ' |' not in task_row:
    errors.append('task_status_index')
if task_state == 'DONE':
    if '| 7 \u2014 Governan\u00e7a | APROVADO |' not in current_task:
        errors.append('done_without_governance_gate')
    if not contents['docs/sprints/S00/README.md'].split('## Estado e aprova\u00e7\u00e3o',1)[1].lstrip().startswith('REVIEW'):
        errors.append('sprint_closed_without_approval')

result={'mandatory_original_files':len(mandatory),'markdown_files':len(files),'new_documents':len(actual_new),'modified_existing_documents':len(changed)+3,'preserved_original_docs':len(preserved),'relative_links_checked':links,'sprints':len(sprint_ids),'sprint_core_files':50,'tasks':len(tasks),'task_states':counts,'seven_gates':7,'dependency_cycles':sum(e.startswith('cycle:') for e in errors),'errors':errors}
print(json.dumps(result,ensure_ascii=True,indent=2))
sys.exit(1 if errors else 0)
```

</details>
