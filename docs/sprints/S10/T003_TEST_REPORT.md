# S10-T003 — Relatório de Evidências

Estado: DONE 2026-10-31.
Especificação: [T003_WORKFLOWS_SPEC](T003_WORKFLOWS_SPEC.md).
Critérios: AC03 e AC04 cumpridos.

---

### 1. Resumo e Desenho Técnico
A tarefa S10-T003 consolidou os percursos reais entre o Leitor, Estudos Estruturados, Espaço de Trabalho (Workspace de Notas e Favoritos) e o Painel do Assistente de IA, eliminando requisições involuntárias de criação e assegurando integridade concorrente (CAS).

Principais implementações:
1. **Navegação e Consulta de Estudos Persistidos**:
   - `frontend/src/features/studies/study-view.tsx`: Removida criação automática por efeito colateral (`useEffect`) ao abrir a aba; a requisição `POST /api/studies` ocorre exclusivamente por ação explícita do operador ("Gerar Estudo").
   - `frontend/src/App.tsx`: `handleOpenStudy` suporta o objeto completo do estudo (`WorkspaceStudyItemDto`) ou referência direta. Ao selecionar "Abrir" no histórico, carrega o estudo por ID (`GET /api/studies/:id`) e mantém o contexto ativo sem re-gerar ou duplicar registros.
2. **Revisão Estruturada com Pré-condição CAS**:
   - Adicionado hook `useReviseStudy` em `frontend/src/shared/api/hooks.ts` consumindo `POST /api/studies/:id/versions` com payload `{ expectedVersion: study.version }`.
   - Adicionado botão "Criar nova versão" no cabeçalho do estudo em `StudyView`, atualizando dinamicamente a versão ativa no painel do assistente.
3. **Isolamento de Favoritos e Anotações por Versão**:
   - `frontend/src/features/workspace/history-view.tsx`: Consulta de favoritos correlaciona estritamente `studyId` e `studyVersion`, impedindo que favoritos de versões anteriores marquem versões mais recentes.
   - Criação de anotações hermenêuticas vincula dinamicamente a versão selecionada (`selectedStudy.version`), mantendo coerência com o modelo CAS do backend.
4. **Cancelamento Cooperativo de Inferência**:
   - `frontend/src/shared/api/hooks.ts` e `frontend/src/features/assistant/context-panel.tsx`: `useCreateAiAnalysis` aceita e encaminha `signal?: AbortSignal`. Disparo do abort pelo botão encerra o indicador de carregamento sem alertas espúrios de erro.

---

### 2. Evidências de Testes e TDD (RED → GREEN)

- `frontend/src/test/assistant-cancellation.spec.tsx` (1 teste PASS): Encaminhamento de `AbortSignal` e cancelamento limpo.
- `frontend/src/test/study-context-flow.spec.tsx` (1 teste PASS): Conexão do estudo ativo e propagação para o painel de contexto.
- `frontend/src/test/persisted-study-flow.spec.tsx` (5 testes PASS):
  - Ausência de POST ao apenas navegar para a tela de estudos.
  - Reabertura por ID/versão sem POST e persistência ativa entre abas.
  - Criação de nova versão com pré-condição CAS `{ expectedVersion }` e atualização do assistente.
  - Escrita de nota contra a versão real selecionada.
  - Não correlação indevida de favoritos entre versões distintas.
- `frontend/src/test/workspace.spec.tsx` (4 testes PASS): Validação de contratos CAS e alternância de favoritos.

---

### 3. Validação de Gates

- **Vitest Frontend**: 25 suítes / 190 testes aprovados (100% PASS).
- **Cobertura V8 Frontend**: 99.29% linhas (gate >= 90%), 97.53% ramos (gate >= 85%), 100% funções.
- **Build de Produção**: `tsc -b && vite build` com código 0 (0 erros de tipagem estrita).
- **Linter**: `oxlint` com código 0 (0 erros).
- **Tooling e Integridade**: `node backend/reports/check-completion-docs.cjs` PASS.
