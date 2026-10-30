# S09 — Plano da Sprint: Frontend Client & Auditoria

## 1. Identificação e Contexto
* **Sprint**: S09 (Frontend Client — Fase 0: Auditoria, Arquitetura e Planeamento)
* **Estado**: READY / EM REVISÃO DOCUMENTAL (Não autorizada a implementação de código)
* **Precedência**: S00–S08 concluídas tecnicamente no backend (`feat/biblia-backend`). S09 inicia o ciclo de interface visual e cliente consumidor em `frontend/`.
* **Regras Normativas**: `AGENTS.md`, `GEMINI.md`, Spec-Driven Development (SDD), `project-standards` (adaptado com diretiva expressa para raiz `frontend/`).

---

## 2. Objetivo da Sprint S09
Conceber a arquitetura completa, a governança, os contratos de integração, a direção visual editorial e o plano de implementação em 10 fases para o frontend do Bíblia App, sem qualquer linha de mock na aplicação e sem iniciar implementação até aprovação formal.

---

## 3. Matriz de Auditoria de Capacidades (Backend vs Contratos vs Frontend)

| Funcionalidade | Endpoint Backend | Status Backend | Contrato Validado | Plano Frontend | Dependência / Risco |
|---|---|---|---|---|---|
| **Health / Conexão** | `GET /health/live`<br>`GET /health/ready` | Disponível e Verificado | `{ status: "ok", database: "up" }` | Indicador discreto de status de conexão no shell | Nenhuma. Backend operando em `127.0.0.1:3000`. |
| **Catálogo de Traduções** | `GET /translations` | Disponível e Verificado | Array com `porbr2018` (BLIVRE) e licença CC BY 4.0 | Seletor canônico e badges de atribuição legal | Apenas `porbr2018` ativa no momento. |
| **Livros e Capítulos** | `GET /translations/{id}/books`<br>`GET /translations/{id}/books/{code}/chapters` | Disponível e Verificado | 66 livros protestantes, contagem e numeração | Seletor hierárquico (Testamento / Livro / Capítulo) | Respeitar ordem canônica e códigos USFM de 3 letras. |
| **Leitura de Versículos** | `GET /translations/{id}/books/{code}/chapters/{ch}/verses?from=&to=` | Disponível e Verificado | Array `{ number, text }`, `previousChapter`, `nextChapter` | Leitor editorial com tipografia fluida, numeração discreta | Parâmetros de paginação por intervalo (`from`, `to`), não `limit`. |
| **Resolução de Referência** | `POST /references/resolve` | Disponível e Verificado | In: `{ translationId, reference }`<br>Out: `{ bookCode, chapter, fromVerse, toVerse, normalized }` | Barra de busca/navegação rápida ("GEN 1:1-3", "Jo 3:16") | Requer parser e normalização estrita do backend. |
| **Catálogo de Fontes Históricas** | `GET /sources`<br>`GET /sources/{id}/excerpts` | Disponível e Verificado | Flavius Josephus (*Antiquities*), metadados de proveniência | Painel de fontes com atribuição, limitações e licença | Apenas Josefo (Antiguidades, Livro I, Cap. 1) admitido. |
| **Criação de Estudo** | `POST /studies` | Disponível e Verificado | In: `{ translationId, reference }`<br>Out: `studyView` (UUID, 6 seções, evidências) | Ação contextual "Estudar passagem" | Requer Bearer Token JWT `local-owner`. |
| **Consulta e Versão de Estudo** | `GET /studies/{id}?version=`<br>`POST /studies/{id}/versions` | Disponível e Verificado | CAS com `expectedVersion`, 6 seções estruturadas | Visualizador de estudo com seções contextuais | Tratar conflito CAS (`409 CONFLICT`). |
| **Workspace / Listagem** | `GET /workspace/studies?limit=&cursor=` | Disponível e Verificado | Cursor pagination, `items: [{ id, version, reference }]` | Lista de estudos recentes na Home e histórico | Requer Bearer Token JWT `local-owner`. |
| **Anotações Atômicas** | `GET /workspace/studies/{id}/notes`<br>`POST /workspace/studies/{id}/notes`<br>`PATCH /workspace/notes/{id}`<br>`DELETE /workspace/notes/{id}` | Disponível e Verificado | Revisão atômica CAS, content Unicode UTF-8 | Editor limpo de notas associadas a estudo/versão | Tratar conflito de concorrência (`409 WORKSPACE_CONFLICT`). |
| **Favoritos por Versão** | `PUT /workspace/studies/{id}/favorites/{ver}`<br>`DELETE /workspace/studies/{id}/favorites/{ver}`<br>`GET /workspace/favorites` | Disponível e Verificado | Idempotente, indexado por owner + study + version | Toggle de favorito com estado remoto imediato | Requer Bearer Token JWT `local-owner`. |
| **Referências Cruzadas** | `GET /cross-references?translationId=&reference=`<br>`POST /cross-references`<br>`DELETE /cross-references/{id}` | Disponível e Verificado | In/Out com evidências e tipo hermenêutico | Painel lateral de passagens paralelas e alusões | Requer passagem e credenciais `local-owner`. |
| **IA / Análise de Estudo** | `POST /studies/{id}/ai-analyses`<br>`GET /ai-analyses/{id}` | Disponível e Verificado | RAG local Qwen3-1.7B, status `supported` ou `insufficient-evidence` | Painel de resposta com citação verificada ou aviso explícito | Bloqueia se modelo local não estiver ativo (HTTP 503). Cancelamento via AbortController. |
| **IA / Conversa Contextual** | `POST /studies/{id}/conversations`<br>`POST /conversations/{id}/turns`<br>`GET /conversations/{id}` | Disponível e Verificado | Máximo 20 turnos, CAS por revisão, contexto até 2 turnos | Chat de investigação vinculado ao estudo | Máximo 1 frase inglesa de Josefo por resposta; respeitar limites. |

---

## 4. Auditoria de Autenticação (`local-owner` JWT)
1. **Mecanismo Real**:
   * Algoritmo: **HS256** com chave simétrica no backend (`jwtSecret`, ≥ 32 bytes UTF-8).
   * Claims verificadas pelo `LocalAccessGuard`: `iss="biblia-local"`, `aud="biblia-backend"`, `sub` (identificador do owner: regex `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`), `iat` e `exp`.
   * Validade: Exatamente 3.600 segundos (1 hora).
   * Emissão: Não existe endpoint público de login/senha no backend aprovado. A emissão é local via CLI: `npm run auth:token -- local-owner`.
2. **Avaliação de Riscos e Armazenamento no Frontend**:
   * **Risco de `localStorage`**: Vulnerável a ataques de script (XSS) e persistência arbitrária de tokens expirados.
   * **Estratégia Recomendada para o Frontend**:
     * Estado em **Memória (Memory Storage)** via Context/Store tipado durante a sessão ativa.
     * Configuração opcional via variável de ambiente de desenvolvimento (`VITE_LOCAL_AUTH_TOKEN`) para testes locais.
     * Modal/Gaveta acessível de configuração de sessão onde o operador insere seu token emitido pela CLI, com exibição de tempo restante de validade e aviso visual discreto quando expirar (tratando HTTP 401).

---

## 5. Arquitetura Proposta para `frontend/`
```
frontend/
├── .env.example              # VITE_API_URL, VITE_LOCAL_AUTH_TOKEN
├── vercel.json               # SPA rewrites: {"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}
├── package.json              # React 19, Vite, TypeScript strict, Tailwind CSS
├── tsconfig.json             # TypeScript strict
├── vite.config.ts            # Configuração do Vite com alias @/
├── public/
└── src/
    ├── app/                  # Roteamento e providers globais
    │   ├── router.tsx
    │   └── providers.tsx     # QueryClientProvider, SessionProvider, ToastProvider
    ├── pages/                # Páginas da aplicação
    │   ├── home/             # Ponto de entrada e continuação
    │   ├── reader/           # Leitor Bíblico focado
    │   ├── study/            # Espaço de Estudo Estruturado
    │   ├── sources/          # Catálogo e detalhe de fontes
    │   └── history/          # Histórico de navegação e estudos
    ├── features/             # Módulos verticais de negócio
    │   ├── canon/            # Navegação canônica, seletores de livros/capítulos/versos
    │   ├── studies/          # Seções do estudo, CAS, versões
    │   ├── assistant/        # Chat contextual, streaming/polling, evidências
    │   ├── sources/          # Trechos históricos, licenças, proveniência
    │   ├── cross-ref/        # Relações hermenêuticas e conexões
    │   └── workspace/        # Notas atômicas, favoritos, paginação
    ├── shared/               # Recursos compartilhados
    │   ├── api/              # Cliente HTTP centralizado (fetch tipado, interceptor Bearer, DTOs)
    │   ├── ui/               # Primitivas acessíveis (Radix UI / Tailwind)
    │   │   ├── button.tsx
    │   │   ├── dialog.tsx    # Modal acessível (zero alert/confirm nativo)
    │   │   ├── toast.tsx     # Notificações semânticas
    │   │   ├── skeleton.tsx  # Skeletons animados contextuais
    │   │   ├── input.tsx     # Validação inline customizada
    │   │   └── select.tsx
    │   ├── hooks/            # Hooks de leitura, teclado, tema e sessão
    │   └── lib/              # Formatadores de texto, normalização de referências
    └── styles/               # Tokens CSS, tipografia fluida clamp(), temas claro/escuro
```

---

## 6. Governança e Sequência de Sprints do Frontend (Roadmap S09)
* **S09-F00 (Sprint 0)**: Auditoria e Planeamento (Atual — aprovação formal dos contratos e plano).
* **S09-F01 (Sprint 1)**: Identidade Visual, Design System Editorial & Shell Responsivo.
* **S09-F02 (Sprint 2)**: Cliente HTTP Tipado, Sessão Local e Tratamento de Erros da API.
* **S09-F03 (Sprint 3)**: Leitor Canônico e Navegação Bíblica (`biblical-canon`).
* **S09-F04 (Sprint 4)**: Estudos Estruturados e Diferenciação Epistemológica (`study`).
* **S09-F05 (Sprint 5)**: Assistente de IA / RAG Local e Gestão de Evidência (`ai-assistant`).
* **S09-F06 (Sprint 6)**: Biblioteca de Fontes e Referências Cruzadas (`source-library` / `cross-ref`).
* **S09-F07 (Sprint 7)**: Histórico, Favoritos e Anotações Atômicas (`study-workspace`).
* **S09-F08 (Sprint 8)**: Refinamento Visual, Acessibilidade WCAG 2.2 AA e Modo Leitura Focado.
* **S09-F09 (Sprint 9)**: Hardening, Testes E2E (Playwright), Mutação (Stryker) e Fecho de Release.

---

## 7. Dependências e Ações Externas
* `ACTION_REQUIRED: TOKEN_OPERADOR`: O frontend requer a inserção de um token JWT emitido pelo operador (`npm run auth:token -- local-owner` no backend) para interagir com rotas protegidas (`/studies`, `/workspace`, `/ai-analyses`, `/cross-references`).
* `ACTION_REQUIRED: RUNTIME_IA`: As funcionalidades de IA no frontend dependem do runtime local configurado em `BIBLE_AI_HOME`. Caso indisponível, o backend retorna HTTP 503 e o frontend exibirá o estado real de indisponibilidade técnica, sem simulações.
