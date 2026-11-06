# Bíblia App — Frontend Client

Execução técnica S10-T006 concluída na branch `feat/biblia-integracao`, preservando `feat/biblia-frontend`. CI42265985431/921ca7c PASS351testes/47ficheiros, cobertura99,89%/95,66%, mutação global86,02247191011236%, zeroNoCoverage/RuntimeError. [Guia específico do utilizador](../docs/operations/USER_ACTIONS.md), [evidências atuais](../docs/sprints/S10/T006_TEST_REPORT.md). Google integrado tecnicamente; conta pessoal continua adiada. Métricas antigas limitadas à sessão permanecem históricas.

Arranque completo: **`npm run dev` na raiz do repositório**, abrindo127.0.0.1:5173 após a mensagem de prontidão; [serviços, watch e diagnóstico](../docs/operations/DEV_STARTUP.md). `npm run dev` nesta pasta continua a iniciar apenas o frontend, exigindo backend já disponível em127.0.0.1:3000. Preview: `npm run build`, depois `npm run preview`, alternativamente ao dev na mesma porta. `VITE_API_URL=/api`; `BIBLE_API_PROXY_TARGET` é configuração somente do servidor Vite e deve continuar HTTP de loopback. Build estático isolado precisa de proxy equivalente, não publica o backend. Nenhum segredo deve ser introduzido em variáveis VITE.

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
   - JWT mantido apenas em memória; qualquer acesso precisa de confirmação `/auth/me`, sem owner inventado ou ligação automática entre contas.
   - Google pelo botão oficial e token local como alternativa secundária. `VITE_LOCAL_AUTH_TOKEN` foi removido na S10; nunca introduzir tokens no bundle.
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

O padrão `/api` funciona sem criar um `.env` do frontend. Preservar a configuração já existente; se for necessário definir explicitamente a base:

```env
# Mesma origem do navegador, encaminhada pelo Vite
VITE_API_URL=/api

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
A aplicação estará disponível em `http://127.0.0.1:5173`. Para o botão Google, a origem usada deve constar no cliente Web existente, conforme o guia do utilizador.

Executar testes automatizados (Vitest):
```bash
npm run build
npm test
```
O build atual e o Chrome instalado são pré-requisitos da suite global: `native-styles.spec.tsx` mede CSS real sobre o HTML produzido pelos componentes React sob teste, incluindo quando instrumentados pelo Stryker. Rede do browser bloqueada; isto não chama IA nem substitui e2e/API/PostgreSQL. Alterações em estilos exigem novo build antes dessa suite. Em CI, Chrome vem da imagem oficial ubuntu24.04; não há download de browser ou dependência nova nesta revisão. Testes afetados que não incluem esta suite visual mantêm o fluxo normal de Vitest.

Qualidade global: `npm run test:coverage`, `npm run test:tooling` e `npm run test:mutation:ci`. O epoch visual S10-T006 já revalidou todos os estáticos por `npm run test:mutation:ci:force`. O workflow normal usa agora seed integral auditado, hashes de toolchain/fixtures e comparação de Chrome/CSS/fonte/harness; mudança visual exige análise completa, corrupção falha e o gate global atual continua obrigatório. [Plano e limites](../docs/sprints/S10/QUALITY_PLAN.md); nenhum recorte de sessão substitui o gate global.

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
