# Relatório de Testes — Sprint S09: Frontend Client

**Data da Execução**: 2026-10-30  
**Branch**: `feat/biblia-frontend`  
**Ambiente**: Node.js v24.16.0 / Windows 11 / Vite 8.3.5 / Vitest v5.0.5

---

### 1. Resumo Executivo
* **Total de Testes Executados**: 33 testes unitários e de integração (100% de aprovação).
* **Suítes de Teste**: 8 arquivos de teste no Vitest.
* **Testes de Arquitetura do Backend**: 9 de 9 testes aprovados (garantindo zero regressão no servidor).
* **Compilação TypeScript / Bundle**: 0 erros, 0 warnings. Tempo de build: 1.32s.

---

### 2. Detalhamento das Suítes de Teste (Vitest)

| Suíte de Testes | Testes | Status | Escopo Validado |
|---|---|---|---|
| `src/test/ui-primitives.spec.tsx` | 7 | PASS | Variantes de botão, estados loading/disabled, badges epistemológicos, inputs com validação e erros amigáveis. |
| `src/test/http-client.spec.ts` | 8 | PASS | Interceptador Bearer JWT, mapeamento de erros 401, 404, 409 (CAS), 422, 503, tratamento de Network Error e `queryKeys` factory. |
| `src/test/reader.spec.tsx` | 3 | PASS | Agrupamento dos 66 livros por Testamento, cálculo de intervalos de versículos e formatação de citação canônica com atribuição. |
| `src/test/study.spec.tsx` | 3 | PASS | As 6 seções canônicas de estudo, tratamento de status `available` vs `insufficient-evidence` e classificações epistemológicas. |
| `src/test/assistant.spec.tsx` | 3 | PASS | Limite estrito de 500 bytes UTF-8 para perguntas, cálculo de tokens de proveniência e status de evidência suportada vs insuficiente. |
| `src/test/sources-crossref.spec.tsx` | 3 | PASS | Tipos de relação hermenêutica (`direct-citation`, `allusion`, etc.), avaliações de confiança e proveniência de fontes históricas. |
| `src/test/workspace.spec.tsx` | 3 | PASS | Controle de revisão CAS em anotações (`expectedRevision`), cálculo de próxima versão e alternância de favoritos. |
| `src/test/accessibility.spec.tsx` | 3 | PASS | Presença de marcos ARIA semânticos (`navigation`, `main`, `complementary`), atalho Escape e atalho `Ctrl+Shift+F` para Modo Foco. |

---

### 3. Evidências de Execução no Terminal

```text
> vitest run
 RUN  v5.0.5 C:/Users/victo/OneDrive/Documentos/Github/Bible/frontend
 ✓ src/test/reader.spec.tsx (3 tests) 11ms
 ✓ src/test/http-client.spec.ts (8 tests) 34ms
 ✓ src/test/ui-primitives.spec.tsx (7 tests) 506ms
 ✓ src/test/study.spec.tsx (3 tests) 13ms
 ✓ src/test/assistant.spec.tsx (3 tests) 12ms
 ✓ src/test/accessibility.spec.tsx (3 tests) 10ms
 ✓ src/test/sources-crossref.spec.tsx (3 tests) 10ms
 ✓ src/test/workspace.spec.tsx (3 tests) 9ms

 Test Files  8 passed (8)
      Tests  33 passed (33)
   Duration  11.14s
```

```text
> tsc -b && vite build
vite v8.3.5 building client environment for production...
transforming...
✓ 2154 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.35 kB │ gzip:   0.73 kB
dist/assets/index-DYzvMACd.css   34.76 kB │ gzip:   7.25 kB
dist/assets/index-D8aziiNZ.js   429.20 kB │ gzip: 127.27 kB
✓ built in 1.32s
```
