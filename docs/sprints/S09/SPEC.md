# S09 — Especificação Técnica: Frontend Client (SPEC)

## 1. Visão Geral e Princípios Fundamentais
A interface do Bíblia App é uma plataforma de investigação bíblica e histórica séria e imersiva. 
* **Prioridade ao Texto Canônico**: O texto sagrado é a âncora visual central. Análises, comentários, fontes e assistência de IA aparecem de maneira progressiva e não concorrem com a clareza da leitura.
* **Integridade Epistemológica**: Distinção clara e gráfica entre:
  1. *Fato documentado* (`documented-fact`)
  2. *Inferência textual* (`inference`)
  3. *Tradição histórica/teológica* (`tradition`)
  4. *Hipótese acadêmica debatida* (`hypothesis`)
  5. *Evidência insuficiente* (`insufficient-evidence`)
* **Proibição de Dados Falsos**: A aplicação nunca simula dados inexistentes. Se uma fonte ou estudo não estiver persistido, a interface exibe um estado vazio informativo com orientação clara de ação.
* **Independência de Camada**: O frontend consome estritamente a API REST do NestJS via HTTP, respeitando schemas Zod e códigos contratuais.

---

## 2. Contratos de Dados e Comportamento da API

### 2.1. Códigos de Erro Contratuais do Backend
O frontend trata de forma determinística os seguintes envelopes de erro:
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | NOT_FOUND | CONFLICT | WORKSPACE_CONFLICT | CONVERSATION_CONFLICT | AI_RESULT_REJECTED | RELATION_EVIDENCE_REJECTED | AI_UNAVAILABLE | WORKSPACE_UNAVAILABLE | RELATION_UNAVAILABLE | AI_TIMEOUT | INTERNAL_ERROR",
    "message": "Mensagem descritiva em português."
  }
}
```
* `401 UNAUTHORIZED`: Redireciona o estado para redefinição do Bearer Token e notifica o usuário via Toast.
* `409 CONFLICT` (CAS): Notifica que a versão ou revisão foi alterada concorrentemente e oferece recarregamento do recurso.
* `422 AI_RESULT_REJECTED`: Apresenta aviso contextual de que a afirmação não pôde ser sustentada pelas fontes admitidas.
* `503 AI_UNAVAILABLE / WORKSPACE_UNAVAILABLE`: Indica que o serviço técnico local está inoperante (ex.: modelo não carregado ou lease em uso), sem inventar respostas.
* `504 AI_TIMEOUT`: Informa que a inferência do modelo local excedeu o tempo limite estabelecido.

---

## 3. Especificação do Design System & Identidade Visual

### 3.1. Tipografia Fluida
* **Texto Canônico & Leitura**: `Source Serif 4` / `Literata`
  * Tamanho fluido: `font-size: clamp(1.05rem, 0.95rem + 0.5vw, 1.35rem)`
  * Altura de linha: `line-height: clamp(1.6, 1.5 + 0.3vw, 1.85)`
  * Largura máxima de linha de leitura: `max-width: min(100%, 72ch)`
* **Títulos Editoriais**: Serif clássica refinada com hierarquia moderada.
* **Interface & Controles**: `Inter` / `Geist` (sans-serif neutra, pesos 400, 500, 600).
* **Numeração de Versículos**: Discreta, tamanho relativo `0.75em`, cor atenuada, alinhada à linha de base.

### 3.2. Tokens de Cor e Superfície
* **Modo Claro (Editorial Paper)**:
  * Fundo base: `#F8F7F3` (papel natural não reflexivo)
  * Superfície principal: `#FFFFFF`
  * Superfície secundária: `#F0EFEA`
  * Texto primário: `#202A28` (alto contraste sem ser preto puro)
  * Texto secundário/metadados: `#66716D`
  * Accent/Destaque: `#315F58` (verde acadêmico profundo)
  * Destaque de versículo selecionado: `#F3E8C7` (ouro pálido suave)
  * Bordas: `#E3E5DF` (1px de precisão)
* **Modo Escuro (Monastic Night)**:
  * Fundo base: `#141B1A`
  * Superfície principal: `#1D2624`
  * Superfície secundária: `#26312E`
  * Texto primário: `#F1F1EB`
  * Texto secundário: `#A8B5AE`
  * Accent: `#8DB9A8`
  * Destaque de versículo selecionado: `#4B4531`
  * Bordas: `#35413D`

### 3.3. Feedback e Primitivas de UI
* **Toasts**: Notificações empilhadas via Radix UI Toast / Sonner com entrada/saída de 200ms `ease-out`, acessibilidade ARIA Live.
* **Skeletons**: Layout com `animate-pulse` suave reproduzindo exatamente o esqueleto da página (lista de versículos, cartões de fontes, painel de estudo).
* **Modais / Diálogos**: Radix UI Dialog com armadilha de foco (focus trap), `aria-modal="true"`, fechamento por `Esc` e clique no backdrop. Zero uso de `window.alert()` ou `window.confirm()`.
* **Formulários**: Atributo `noValidate` nativo, validação contextual via Zod com transição de cor de borda e mensagens inline acessíveis (`aria-describedby`).

---

## 4. Especificação dos Fluxos e Módulos

### 4.1. Leitor Bíblico (`/reader`)
* Permite selecionar a tradução ativa (`porbr2018` — Bíblia Livre), livro (66 opções), capítulo e versículos.
* Carregamento em lote por capítulo (`/translations/{id}/books/{code}/chapters/{ch}/verses`).
* Ações ao selecionar um versículo ou intervalo:
  1. *Iniciar Estudo Estruturado* (`POST /studies`).
  2. *Consultar Referências Cruzadas* (`GET /cross-references`).
  3. *Adicionar Nota Contextual* (`POST /workspace/studies/{id}/notes`).
  4. *Copiar Citação Formatada* para a área de transferência.
* Modo Foco (Zen): Atalho para ocultar navegações laterais e expandir o texto na largura ideal de leitura.

### 4.2. Painel de Estudo Estruturado (`/study/:id`)
* Exibe metadados autênticos: passagem, versão, data de criação.
* 6 Seções Canônicas do Backend:
  1. Contexto Imediato (`immediate-context`)
  2. Argumento do Livro (`book-argument`)
  3. História e Cultura (`history-culture`)
  4. Autoria, Destinatários e Propósito (`authorship-audience-purpose`)
  5. Comparação Textual (`comparison`)
  6. Interpretações (`interpretations`)
* Cada seção com tag de status visual (`available` ou `insufficient-evidence`).
* Links clicáveis para as fontes e citações comprovadas (`evidenceIds`).

### 4.3. Assistente de IA / RAG Local (`/assistant` ou gaveta lateral)
* Campo de pergunta com limite estrito de 500 bytes UTF-8 (validado antes do envio).
* Histórico paginado da conversa (máximo de 20 turnos por conversa).
* Exibição da resposta gerada:
  * Quando suportada: exibe a citação única com autor (Flávio Josefo), obra e direitos autorais.
  * Quando a evidência for insuficiente: exibe badge explicativo "Sem evidência documental nas fontes admitidas".
* Botão de cancelamento de requisição via `AbortController`.

### 4.4. Workspace e Notas Pessoais (`/workspace`)
* Listagem de estudos recentes com paginação por cursor.
* Editor minimalista de notas com suporte a controle de versão (Compare-And-Swap para evitar sobrescrita acidental).
* Gerenciador de favoritos por versão do estudo.

---

## 5. Estratégia de Testes e Qualidade

1. **Testes Unitários (Vitest + React Testing Library)**:
   * Parsing e normalização de referências bíblicas.
   * Transformação e renderização de status epistemológicos.
   * Comportamento do cliente HTTP (interceptação de Bearer token e mapeamento de erros).
   * Estados de loading, erro e visualização dos componentes do Design System.
2. **Testes de Integração Real**:
   * Executados contra o backend local NestJS ativo em `http://127.0.0.1:3000`.
   * Validação de fluxos reais: Leitor ➔ Criação de Estudo ➔ Consulta de Fontes ➔ Anotação.
3. **Testes End-to-End (Playwright)**:
   * Navegação canônica em desktop e mobile.
   * Interação com teclado e conformidade com WCAG 2.2 AA.
   * Alternância entre temas Claro e Escuro.
4. **Testes de Mutação (Stryker)**:
   * Aplicação em módulos críticos (parsers, formatadores, cliente de API e hooks de sincronização), visando score > 85%.

---

## 6. Critérios de Aceitação da Sprint S09
- [ ] Documentação de especificação (`SPEC.md`) e plano (`PLAN.md`) devidamente aprovadas pelo usuário.
- [ ] Arquitetura e matriz de capacidades 100% alinhadas com os endpoints reais do backend.
- [ ] Estratégia de autenticação local documentada sem dependência de `localStorage` arbitrário.
- [ ] Zero código de mock ou simulação fictícia de dados.
- [ ] Nenhuma linha de implementação escrita antes da autorização formal expressa.
