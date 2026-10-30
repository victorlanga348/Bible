# S09 — Frontend Client (Bíblia App)

## Estado da Sprint: DONE Técnico (2026-10-30)
Execução integral concluída com sucesso na branch `feat/biblia-frontend`.
Entrega: Single Page Application (SPA) reativa e tipada em `frontend/`, consumindo integralmente a API REST do NestJS (`backend/`), com identidade editorial acadêmica, leitor canônico de 66 livros, barra de busca/resolução de passagens, estudos estruturados com diferenciação epistemológica, integração de IA com RAG extrativo local, catálogo de fontes históricas de Flávio Josefo, workspace com anotações CAS e favoritos, modo foco de leitura imersiva e acessibilidade WCAG 2.2 AA.

* **Plano da Sprint**: [PLAN.md](PLAN.md)
* **Especificação Técnica**: [SPEC.md](SPEC.md)
* **Critérios de Aceitação**: [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md)
* **Relatório de Testes**: [TEST_REPORT.md](TEST_REPORT.md)
* **Revisão e Fecho**: [REVIEW.md](REVIEW.md)

---

## 1. Resumo das Fases Executadas
* **Fase 0 — Auditoria e Planeamento**: Mapeamento completo dos contratos REST, schemas Zod, auditoria de autenticação JWT e aprovação formal.
* **Fase 1 — Identidade Visual, Design System & Shell**: Tokens fluidos (`clamp()`, `rem`), paletas Editorial Paper / Monastic Night, primitivas acessíveis Radix UI e shell adaptativo de 3 colunas (commit `9ce93f7`).
* **Fase 2 — Cliente HTTP Tipado & Gestão de Sessão**: Cliente HTTP resiliente, tipagem estrita via `contracts.ts`, injeção dinâmica de Bearer Token em memória, tratamento contratual de erros (`400/401/404/409/422/503/504`) e integração com TanStack Query (commit `74fb5b7`).
* **Fase 3 — Leitor Canônico (`biblical-canon`)**: Navegação por Testamento (Antigo/Novo), 66 livros da Bíblia Livre (`porbr2018`), capítulos, seleção e cópia de versículos com atribuição e busca de passagens via `POST /references/resolve` (commit `041320f`).
* **Fase 4 — Estudos Estruturados & Epistemologia (`study`)**: Geração e consulta de estudos, renderização das 6 seções canônicas, controle CAS (`expectedVersion`), badges de diferenciação epistemológica e modal de evidências auditadas (commit `3b60750`).
* **Fase 5 — Assistente de IA / RAG Local (`ai-assistant`)**: Chat contextual vinculado ao estudo, validação prévia de 500 bytes UTF-8, cancelamento com `AbortController`, tratamento de status "Evidência Insuficiente" e exibição de proveniência com tokens auditáveis (commit `89144a9`).
* **Fase 6 — Biblioteca de Fontes e Referências Cruzadas (`source-library` / `cross-ref`)**: Consulta de fontes e trechos de Josefo com SHA-256 e direitos de uso, painel de relações hermenêuticas e conexões paralelas (commit `130cf67`).
* **Fase 7 — Workspace, Anotações Atômicas e Favoritos (`study-workspace`)**: Histórico com paginação por cursor, anotações com controle de concorrência CAS (`r1`, `r2`), favoritos por versão e diálogo acessível de confirmação de exclusão (commit `c1b5609`).
* **Fase 8 — Refinamento Visual, Acessibilidade & Modo Foco**: Modo Foco imersivo com atalhos de teclado (`Escape`, `Ctrl+Shift+F`), skip-to-content e conformidade com WCAG 2.2 AA (commit `a7e72a8`).
* **Fase 9 — Hardening, E2E (Playwright) & Fecho**: 33 testes unitários e de integração aprovados no Vitest, suíte Playwright E2E estruturada, build de produção em 1.32s com zero erros e documentação de fecho.

---

## 2. Verificação Técnica
* **Typecheck & Build**: `npm --prefix frontend run build` (`tsc -b && vite build`) compilou com sucesso em **1.32s** gerando `dist/` limpo e otimizado.
* **Testes Automatizados**: `npm --prefix frontend test` executou **8 arquivos de teste e 33 testes aprovados** com 100% de sucesso.
* **Integridade do Backend**: Testes de arquitetura e governança do `backend/` executados com **0 regressões** (`9/9 passed`).
