# S10-T003 — Fluxos integrados, contexto de estudo e cancelamento de IA

Decisão delegada2026-10-30, antes da implementação. Dependência T002 DONE (CI frontend 41131759411 PASS mutação 86,22%, CI backend 41126297344 PASS 90,71%). Cumpre os critérios AC03 e AC04 da [S10](ACCEPTANCE_CRITERIA.md).

## 1. Propagação do Contexto de Estudo ao Assistente

1. `StudyView` emite `onStudyChange(study: StudyViewDto | null)` sempre que um estudo for criado ou carregado com sucesso, além de notificar `null` em caso de erro terminal ou troca de referência em andamento.
2. `AppContent` mantém o estado do estudo ativo `{ id: string; version: number; reference: string } | null` compartilhado entre o painel central de estudo e a gaveta lateral do assistente.
3. `<ContextPanel activeStudyId={study?.id} activeStudyVersion={study?.version} />` recebe os identificadores do estudo corrente.
4. Quando nenhum estudo estiver ativo, o assistente orienta o usuário a selecionar ou gerar um estudo no leitor ou painel de estudos antes de submeter perguntas.
5. Quando um estudo estiver ativo, o rodapé exibe `Estudo Conectado` e a requisição `POST /studies/:studyId/ai-analyses` vincula `studyId` e `studyVersion` reais.

## 2. Cancelamento Efetivo de Inferência de IA (AbortController)

1. A mutação `useCreateAiAnalysis` aceita opcionalmente `signal?: AbortSignal` em seus parâmetros de chamada, encaminhando-o diretamente às opções da função de transporte `request<AiAnalysisDto>`.
2. O cliente HTTP de transporte propaga `signal` para a chamada global `fetch(url, { ..., signal })`.
3. Ao clicar no botão de cancelamento (Stop), `handleCancelGeneration()` invoca `abortController.abort()` no controlador ativo.
4. O fechamento da requisição HTTP pelo cliente emite o evento `'close'` na resposta Express do backend, acionando o `controller.abort()` registrado em `AiAnalysisController` e cancelando o slot de inferência na CPU.
5. Tratamento de exceção no frontend:
   - Se `signal.aborted` ou o erro for `AbortError`, o assistente exibe notificação informativa ("Inferência cancelada pelo operador.") e retorna sem apresentar alerta de falha de servidor.
   - Se a operação já tiver sido concluída com sucesso antes do cancelamento, o resultado persistido é preservado e nenhuma mensagem de cancelamento tardio é disparada.
6. Não é prometido rollback de análise de IA que já tenha completado a escrita no banco de dados antes da interrupção.

## 3. Gestão e Persistência no Workspace

1. Anotações: criação vinculada ao estudo corrente, edição atômica com CAS (`expectedRevision`) e remoção com diálogo de confirmação.
2. Favoritos: alternância idempotente por par `(studyId, version)`.
3. Limpeza determinística: troca de sessão limpa o cache e desmonta o estado das anotações e estudos do operador anterior.

## 4. Estratégia TDD e Critérios Verificáveis

1. **RED**: Teste de componente e hook comprovando a ausência do sinal de cancelamento em `useCreateAiAnalysis`, a falta de propagação do estudo ativo em `AppContent` e a falha de tratamento de `AbortError`.
2. **GREEN**: Implementação cirúrgica mínima em `hooks.ts`, `context-panel.tsx`, `study-view.tsx` e `App.tsx`.
3. **REFACTOR / GATES**: Typecheck strict, lint oxlint, testes de regressão Vitest, cobertura de linhas >= 90% e branches >= 85%.

## 5. Adenda de conclusão — 2026-10-31, antes das correções seguintes

Pedido «continue» retoma o trabalho aqui. As sete alterações herdadas foram copiadas para snapshot privado em backend/reports/s10-t003-resume-20261031-052128, com hashes; dois testes herdados passaram18,87s. Isso é regressão observada, não prova retroativa de RED. Não há outra escrita concorrente observada nesta retoma. Preservar trabalho existente e parar perante interferência nova. Não usar agentes.

O incremento inicial de quatro ficheiros não cobre integralmente AC03/AC04. As decisões abaixo são do agente sob autorização vigente, derivadas de S09/S10 e dos schemas backend existentes; não criam endpoints, dependências, migrações ou fontes/modelos de IA.

1. **Criação e consulta distintas.** Navegar ao painel de estudo só apresenta a passagem; criar exige «Gerar Estudo» ou a ação explícita de iniciar estudo no leitor. Esses eventos, sem POST em effect, criam uma única vez mesmo em StrictMode. Reabrir histórico/favorito passa id e versão reais e usa GET /studies/:id?version=..., sem gerar outro registo. App compõe criação, consulta e estudo ativo; StudyView apresenta o resultado/controlos. Id/versão/referência derivam da resposta real. Troca em andamento ou erro não deixam o assistente ligado a estudo anterior. Navegar entre painéis conserva o estudo ativo; logout/troca de owner conservam a fronteira privada de T002.
2. **Versões.** «Criar nova versão» usa POST /studies/:id/versions com {expectedVersion}. Sucesso atualiza o estudo/assistente;409não repete escrita e oferece consulta atual. Não alterar o conteúdo imutável de uma versão guardada nem inventar versão por referência.
3. **Workspace completo.** Notas usam a versão selecionada, não1fixo. Favorito é o par id/versão; a referência já existente na resposta backend deve aparecer e permitir abrir essa versão. Listas usam os cursores existentes e permitem avançar/voltar. CAS preserva o rascunho em409e oferece carregar a revisão atual antes de novo envio. Nota/estudo têm confirmação de eliminação e atualização de cache. DELETE /workspace/studies/:id usa a eliminação retomável existente; só dados próprios de teste podem ser limpos na prova nativa.
4. **Conversas persistidas.** O assistente usa POST /studies/:id/conversations, GET /workspace/studies/:id/conversations, GET /conversations/:id, POST /conversations/:id/turns e DELETE /conversations/:id. Campos seguem conversation-schemas e workspace/schemas, incluindo expectedRevision, versão, máximo20turnos e nextCursor; não há endpoint novo. Selecionar conversa carrega turnos/citações reais, falhas ou resposta indisponível ficam explícitas. A criação inicial pode preceder envio do primeiro turno; cancelamento não promete desfazer recursos já persistidos, e recarregar a lista recupera o estado confirmado pelo servidor.
5. **Cancelamento e corridas.** Sinal chega a fetch para criação de análise/conversa/turno. Cancelar, mudar estudo/versão ou desmontar invalida o pedido e impede publicar sucesso tardio, mesmo que um transporte ignore abort. Pedidos de IA não usam o timeout genérico15s como limite de uma inferência local; o backend conserva budgets pinados. Timeout/rede reais continuam erros recuperáveis, sem serem anunciados como cancelamento do utilizador. Botões têm nomes acessíveis e não permitem escrita duplicada enquanto o pedido está ativo.
6. **Conteúdo e direitos.** Retirar a referência Jo1:1-3 fabricada do painel; consultar CrossRefPanel/API para o estudo real ou mostrar estado vazio. «Anotações» oferece acesso ao workspace do estudo corrente. Resposta de IA distingue supported/insufficient/restricted/unavailable e mostra citações/direitos/limitações efetivamente recebidos; nota pessoal não é evidência histórica. Uso local do perfil extrativo permanece explícito; ampliação é T004.

Vantagem da composição no App: uma seleção por id/versão rege painel/assistente/workspace e elimina criação por remontagem. Custo: mais coordenação de estado no compositor; manter componentes e hooks específicos, sem router/store/dependência novos. Alternativa de manter cópias independentes e sincronizar por effects rejeitada pelas corridas e duplicação de POST. Risco de cancelar depois de persistir é mitigado por mensagem honesta/consulta ao servidor, não rollback fictício. Risco de dados de outro owner continua mitigado por T002 e autorização backend.

Sequência de prova: RED/GREEN afetados por comportamento; strict/lint/build e regressões; Chrome dev/preview desktop/mobile→API Nest→PostgreSQL de teste identificado, corpus autêntico e recursos técnicos próprios; criar/reabrir/versionar/nota CAS/favorito/conversa/eliminação, leitura de outro owner negada. Uma prova de cancelamento técnico não é chamada real ao modelo. Quando o fluxo chamar IA, usar o perfil real e reportar separadamente execução/resultado; infraestrutura ausente é BLOCKED. Nunca escrever em desenvolvimento para simular teste isolado.

Gates atuais incluem mutação obrigatória, inventário e revisão de sobreviventes, score bruto>85%/zeroRuntimeError+NoCoverage. Para evitar repetir uma medição parcial pouco antes do fecho, medir o frontend global nesta etapa: todo src TS/TSX e Vite config conforme QUALITY_PLAN, sem retirar componentes/hooks/entrypoint. Cobertura>=90%linhas/85%branches; configs só com tratamento estrutural já declarado. S10-T005 poderá reutilizar provas de fontes executáveis idênticos; qualquer alteração posterior exige revalidação pertinente. Backend inalterado conserva CI41126297344 auditada; não repetir a sua mutação por mudanças apenas frontend.
