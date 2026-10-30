# Bíblia App — Frontend Client

Incremento S10 em execução na branch `feat/biblia-integracao`, preservando `feat/biblia-frontend`. Comunicação local agora por `/api`, proxy dev/preview para NestJS loopback e TypeScript6.0.3/strict conforme [ADR](../docs/architecture/adr/ADR-0010-frontend-toolchain-compatibility.md). Leitura real por Chrome/API/PostgreSQL comprovada, sem escrita. [Plano/limites atuais](../docs/sprints/S10/README.md), [gates em curso](../docs/sprints/S10/TEST_REPORT.md). Não inferir aplicação integrada/Google/IA completa pelas métricas históricas S09 abaixo.

Arranque integrado: backend disponível em127.0.0.1:3000 e `npm run dev` nesta pasta, abrindo127.0.0.1:5173. Preview: `npm run build`, depois `npm run preview`, alternativamente ao dev na mesma porta. `VITE_API_URL=/api`; `BIBLE_API_PROXY_TARGET` é configuração somente do servidor Vite e deve continuar HTTP de loopback. Build estático isolado precisa de proxy equivalente, não publica o backend. Nenhum segredo deve ser introduzido em variáveis VITE. Sessão Google na interface é a tarefa seguinte; login de conta real continua adiado.

Frontend de alta fidelidade para a plataforma de estudo e investigação bíblica assistida por inteligência artificial.

Construído em **React 19**, **TypeScript strict**, **Vite**, **Tailwind CSS v4** e **Radix UI**, com foco em leitura imersiva, tipografia editorial, tokens fluidos (`clamp()`, `rem`), ausência total de dados fictícios e integração direta com o backend NestJS.

---

## 1. Princípios Arquiteturais e de Design

1. **Zero Mocks**: A aplicação não contém dados falsos nem simulações estáticas de capítulos, versículos, comentários ou respostas de IA. Toda informação exibida provém da API real ou reflete um estado vazio informativo autêntico.
2. **Tipografia Editorial e Serenidade**:
   - Fontes: `Source Serif 4` / `Literata` para o texto bíblico e leitura aprofundada, `Inter` para controles utilitários e metadados, `Newsreader` para títulos e cabeçalhos históricos.
   - Layout fluido: dimensionalidade baseada em `clamp()` e `rem`. O uso de `px` é estritamente restrito a bordas de precisão (1px).
   - Paleta Monástica / Papel Editorial: temas *Editorial Paper* (`#F8F7F3`) e *Monastic Night* (`#141B1A`) projetados para longas sessões de leitura sem fadiga visual.
3. **Diferenciação Epistemológica Rigorosa**:
   - Toda afirmação de estudo é rotulada como **Fato Documentado**, **Inferência**, **Tradição**, **Hipótese** ou **Evidência Insuficiente**.
   - Integração de IA com RAG local com exibição de proveniência (trechos extraídos, fonte Josefo e auditoria de tokens).
4. **Segurança e Gestão de Sessão**:
   - Token JWT (`local-owner`) mantido em memória durante a sessão (`useSession`), eliminando riscos de persistência insegura em `localStorage`.
   - Suporte a injeção em ambiente local de desenvolvimento através de `VITE_LOCAL_AUTH_TOKEN`.
   - Tratamento contratual de erros de rede e códigos HTTP (`400`, `401`, `404`, `409 Conflict/CAS`, `422`, `503`, `504`).

---

## 2. Estrutura do Código (`frontend/src/`)

```text
src/
├── app.tsx                 # Raiz da aplicação, provedores e orquestração de painéis
├── main.tsx                # Entrada DOM com TanStack Query e Toasts
├── shared/
│   ├── api/                # Contratos DTO, cliente HTTP tipado e hooks TanStack Query
│   └── ui/                 # Primitivas acessíveis (Radix Dialog, Toasts, Skeletons, Badges)
└── features/
    ├── canon/              # Leitor canônico (66 livros), busca e resolução de passagens
    ├── studies/            # Visualização das 6 seções canônicas de estudo e evidências
    ├── assistant/          # Painel de IA / RAG com validação UTF-8 e cancelamento
    ├── sources/            # Catálogo de fontes primárias (Flávio Josefo) e SHA-256
    ├── cross-ref/          # Referências cruzadas e conexões hermenêuticas
    └── workspace/          # Histórico de estudos, anotações atômicas CAS e favoritos
```

---

## 3. Requisitos e Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
# URL do backend NestJS (padrão: http://127.0.0.1:3000)
VITE_API_URL=http://127.0.0.1:3000

# Token JWT local-owner (opcional em desenvolvimento para sessão imediata)
# Gerado no backend via: npm run auth:token -- local-owner
VITE_LOCAL_AUTH_TOKEN=
```

---

## 4. Scripts e Operação

Instalação de dependências:
```bash
npm install
```

Iniciar servidor de desenvolvimento Vite (HMR):
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.

Executar testes automatizados (Vitest):
```bash
npm test
```

Executar suíte de testes ponta a ponta (Playwright E2E):
```bash
npm run test:e2e
```

Compilar para produção (Typecheck + Bundle Vite):
```bash
npm run build
```
O pacote compilado e minificado será gerado no diretório `dist/`.

Visualizar build de produção localmente:
```bash
npm run preview
```

---

## 5. Atalhos de Teclado e Navegação Acessível

- `Escape`: Fecha modais abertos, fecha painéis contextuais laterais ou sai do Modo Foco.
- `Ctrl + Shift + F`: Alterna o **Modo Foco** (expande a coluna do leitor bíblico para tela cheia e oculta menus e ferramentas contextuais).
- `Tab` / `Shift + Tab`: Navegação completa por teclado com indicação de foco de alto contraste (`outline-accent`).
- Link de navegação rápida: `"Ir para o conteúdo principal"` no topo da página para leitores de tela.
