# Critérios de Aceitação — Sprint S09: Frontend Client

## 1. Estrutura e Separação de Código
- [x] **Diretório `frontend/` isolado**: O cliente vive na raiz em `frontend/`, mantendo `backend/` intocado em sua integridade modular.
- [x] **Configuração de Ambiente**: URL do backend configurada via `VITE_API_URL` em `frontend/.env.example` e lida dinamicamente.
- [x] **Deploy Pronto (Vercel)**: `frontend/vercel.json` configurado com reescrita SPA (`{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`).

## 2. Princípios de Design e UX
- [x] **Zero Mocks**: Nenhuma array estática ou dados fictícios na aplicação. Textos bíblicos, fontes e estudos vêm exclusivamente da API real.
- [x] **Tipografia Fluida**: Uso rigoroso de `clamp()`, `rem`, `%`, `vw/vh` para todas as fontes e layouts; `px` restrito estritamente a bordas finas de 1px.
- [x] **Identidade Editorial**: Tipografia `Source Serif 4` / `Literata` para leitura bíblica, `Inter` para controles, `Newsreader` para títulos. Sem dashboards genéricos, sem KPIs decorativos e sem gradientes roxos/azuis.
- [x] **Temas Claro e Escuro**: Paleta Editorial Paper (`#F8F7F3`) e Monastic Night (`#141B1A`) com alternância acessível e persistência em memória/localStorage.
- [x] **Primitivas Acessíveis Radix UI**: Toasts semânticos com ARIA live, Skeletons contextualizados para versículos e estudos, Dialog com focus trap (zero `alert/confirm` nativos).

## 3. Integração e Contratos do Backend
- [x] **Leitor Canônico**: Suporte aos 66 livros da Bíblia Livre (`porbr2018`), capítulos, seleção de versículos, cópia com atribuição legal e busca com resolução de referências (`POST /references/resolve`).
- [x] **Estudos Estruturados**: Geração e exibição das 6 seções canônicas com controle de concorrência CAS (`expectedVersion`) e links de evidência.
- [x] **Diferenciação Epistemológica**: Badges específicos para Fato Documentado, Inferência, Tradição, Hipótese e Evidência Insuficiente.
- [x] **Assistente de IA**: RAG local CPU Qwen3-1.7B, validação estrita de limite de 500 bytes UTF-8 na pergunta, suporte a cancelamento com `AbortController` e exibição inequívoca de "Evidência Insuficiente" sem alucinações.
- [x] **Fontes Históricas**: Catálogo de Flávio Josefo (*Antiguidades dos Judeus*) com direitos, licenças, proveniência SHA-256 e visualização de trechos.
- [x] **Workspace & Anotações CAS**: Histórico com paginação por cursor, anotações com controle de revisão CAS (`r1`, `r2`) e favoritos por versão.

## 4. Qualidade e Verificação Técnica
- [x] **Testes Automatizados**: 33 testes unitários e de integração executados e aprovados via Vitest.
- [x] **Suíte E2E**: Playwright configurado cobrindo leitor bíblico, alternância de abas, modo foco e temas.
- [x] **Build de Produção**: `npm --prefix frontend run build` compilando com 0 erros TypeScript strict e 0 warnings em menos de 2 segundos.
- [x] **Acessibilidade**: Conformidade com WCAG 2.2 AA (landmarks ARIA, navegação por teclado, skip-to-content link).
