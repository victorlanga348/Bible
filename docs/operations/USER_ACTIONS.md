# Guia de Operação e Ações do Utilizador — Bíblia App

Este documento define as instruções operacionais para o utilizador no ambiente local Windows, distinguindo rigorosamente as tarefas do operador das responsabilidades do sistema de desenvolvimento (Codex).

Atualizado em 2026-11-06. Rascunho inicial escrito pela agy sob coordenação do Codex, depois conferido contra scripts/contratos e documentação oficial Google. Arranque completo provado e CI técnica final aprovada; resultados, falhas históricas e limites em [S10-T006](../sprints/S10/T006_TEST_REPORT.md). O consentimento da tua conta é uma ação pessoal separada.

**O que tens de fazer pessoalmente:** quando quiseres testar a conta real, executar G01–G04 abaixo. Não precisas de voltar a dar permissão, contratar IA, fornecer segredos, executar testes automáticos, corrigir código ou coordenar a agy. Codex trata dessas tarefas. O consentimento Google continua adiado até decidires realizá-lo.

| ID | Ação tua | Quando | Prova de conclusão |
|---|---|---|---|
| G01 | Conferir o cliente Google existente e as origens no teu projeto da consola | Só se ainda não configuradas ou se houver erro de origem | Origens locais guardadas no mesmo cliente usado pela aplicação |
| G02 | Executar `npm.cmd run dev` na raiz num terminal e abrir a aplicação local | Ao usar o projeto | Mensagem `Bíblia App pronta`, leitor real e `/api/health/ready` responde 200 |
| G03 | Entrar usando o botão oficial e concluir pessoalmente a seleção/consentimento da tua conta | Quando retomares o teste antes adiado | Diálogo fecha e a interface mostra `Sessão Ativa` |
| G04 | Sair, voltar a entrar e confirmar os dados da mesma conta | Depois de G03 | Sessão termina; a nova entrada recupera os dados guardados |
| G05 | Comunicar resultado ou erro sanitizado | Depois do teste | Mensagem curta conforme modelo no fim do guia |

Não abras outra sessão de IA para editar este repositório ao mesmo tempo. A colaboração agy já é lançada e coordenada pelo Codex; não tens de executar `agy` separadamente.

---

## 1. Divisão de Responsabilidades

- **Responsabilidade do Codex:**
  - Manutenção e implementação de código-fonte (frontend e backend).
  - Execução de testes automatizados (unitários, integração, e2e, tooling e mutação Stryker).
  - Verificação e cumprimento de Quality Gates, integridade arquitetural e governança documental.
  - Versionamento, criação de branches e commits Git.
  - *Regra estrita:* Não se afirmam funcionalidades ou gates como `PASS` sem evidências executáveis documentadas. Nenhuma correção técnica ou suite de testes é delegada ao utilizador.

- **Responsabilidade do Utilizador:**
  - Uso diário dos terminais próprios e do navegador; preparação técnica, diagnóstico e correções ficam com Codex.
  - Acesso à interface gráfica via navegador web (`http://127.0.0.1:5173`).
  - Configuração de origens autorizadas na Google Cloud Platform (Google Auth Platform).
  - Execução dos testes humanos reais no navegador (adiados conforme decisão do utilizador).
  - Preservação estrita dos ficheiros locais `.env`, chaves e bases de dados já provisionadas.

---

## 2. Ações Obrigatórias da Conta (Google Auth Platform)

O teste humano de login com conta Google real foi adiado por decisão do utilizador. Para que a autenticação funcione quando o teste for realizado, a configuração do cliente Web existente deve seguir estes passos:

1. Abrir [Google Auth Platform — Clients](https://console.cloud.google.com/auth/clients) com a conta que gere o projeto. No seletor de projeto da barra superior, escolher o projeto onde criaste o cliente usado pelo Bíblia App.
2. Clicar no cliente do tipo **Web application / Aplicação Web** existente. Comparar o identificador com `GOOGLE_CLIENT_ID` no ficheiro local `backend/.env`, apenas no teu PC. Não criar outro cliente ou substituir o identificador por tentativa; se não encontrares o projeto/cliente correspondente, comunica essa dificuldade ao Codex, sem enviar o ficheiro.
3. **Não solicitar nem configurar Client Secret:** O fluxo de autenticação frontend com Google Identity Services (GSI) não consome nem deve expor nenhum segredo de cliente.
4. Na secção **Origens JavaScript autorizadas (Authorized JavaScript origins)** do Web Client ID, assegurar que constam exatamente os endereços locais:
   - `http://127.0.0.1:5173`
   - `http://localhost:5173`
   - `http://localhost` (também recomendado pela documentação Google para desenvolvimento local)
   - *(Opcional, para testes diretos no backend: `http://127.0.0.1:3000` e `http://localhost:3000`)*
5. Clicar **Save / Guardar**. As origens são só protocolo/host/porta, sem `/api`, `/auth/google` ou outros caminhos. Este fluxo usa callback JavaScript: não precisas de acrescentar um redirect URI para o frontend.
6. Se houver recusa por utilizador não autorizado num projeto em modo de teste, abrir **Audience / Público-alvo → Test users / Utilizadores de teste → Add users**, adicionar a conta que vais usar e guardar. Não publicar o projeto OAuth apenas para contornar esse erro.

Se as origens já estiverem corretas, não tens de as voltar a alterar. [Instruções oficiais Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

---

## 3. Uso Diário: Arranque e Operação no Windows

> [!IMPORTANT]
> **Preservação de Dados:** Não reinstalar dependências desnecessárias, não recriar volumes e **não executar resets de banco de dados**. O banco relacional principal (`bible_db`) e o índice vetorial (`bible_ai`) já estão provisionados e devem ser preservados.

### 3.0. Um comando para arrancar tudo

Num PowerShell, executar exatamente:

```powershell
Set-Location "C:\Users\victo\OneDrive\Documentos\Github\Bible"
npm.cmd run dev
```

Esperar **Bíblia App pronta** e abrir **http://127.0.0.1:5173**. Mantém esse terminal aberto. O comando confere a configuração existente, inicia PostgreSQL/Docker/índice quando necessário, verifica os modelos e o índice sem inferência e inicia backend e frontend com atualização automática. Não precisas de executar build, arrancar Docker à mão nem abrir um segundo terminal. Não há instalação, download de modelo, migração ou importação automática.

Para parar a aplicação, **Ctrl+C nesse terminal**. PostgreSQL e Docker ficam disponíveis. Para voltar a usar, repetir o mesmo comando. Se já tiveres uma instância tua nas portas3000/5173, usa-a ou encerra esse teu terminal antes; não iniciar duas instâncias nem matar processos desconhecidos.

Se aparecer **Arranque interrompido na etapa …**, comunica a etapa e a hora, sem `.env`, passwords ou tokens. A correção técnica continua a cargo do Codex. [Contrato, validação e diagnóstico do arranque](DEV_STARTUP.md).

### Alternativa manual — serviços já configurados

Os passos seguintes servem somente para preferires o arranque manual. Não os executar em conjunto com o comando único acima.

O PostgreSQL principal é um serviço Windows que já está configurado para arranque automático. O seu estado e a identidade `bible_db` foram conferidos pelo Codex; não precisas de criar um banco nem de alterar passwords/URLs.

**Só para usar inferência de IA:** se reiniciaste o PC ou fechaste o Docker Desktop, abre **Docker Desktop** pelo menu Iniciar e espera que o motor termine de arrancar. Depois, num PowerShell, inicia apenas o índice já existente deste projeto:

```powershell
docker start biblia-ai-index-development
docker ps --filter "name=^/biblia-ai-index-development$" --format "{{.Names}} {{.Status}} {{.Ports}}"
```

Resultado esperado: `biblia-ai-index-development` com estado `Up` e porta local `127.0.0.1:55436`. O Codex conferiu o nome, as labels do Bíblia App e o binding antes de o iniciar nesta entrega. O comando não cria bases de dados nem importa conteúdo. Se o container não existir ou não arrancar, comunica esse erro; não executar `docker compose down`, remover volumes ou criar um substituto. Leitura bíblica e gestão de estudos não exigem nova inferência. Não precisas de abrir Ollama, trocar modelos ou instalar serviços de IA.

### Alternativa manual — Backend (Terminal 1)
Abrir uma janela do PowerShell e executar:

```powershell
Set-Location "C:\Users\victo\OneDrive\Documentos\Github\Bible\backend"
npm.cmd run build
npm.cmd start
```

- O serviço backend fica ativo em `http://127.0.0.1:3000`.
- Documentação interativa Swagger acessível em `http://127.0.0.1:3000/docs/`.
- Verificação de integridade operacional via endpoint `GET /health/live`.

Antes de tentar autenticação, abrir `http://127.0.0.1:3000/health/ready` no navegador: deve responder HTTP 200 e `{"status":"ok","database":"up"}`. `/health/live` sozinho só prova que o processo responde. Se houver erro, deixa o terminal aberto e comunica a mensagem sanitizada; a correção da configuração/banco é responsabilidade do Codex. Não executar migrações nem importações para tentar resolver.

### Alternativa manual — Frontend (Terminal 2)
Abrir uma segunda janela do PowerShell e executar:

```powershell
Set-Location "C:\Users\victo\OneDrive\Documentos\Github\Bible\frontend"
npm.cmd run build
npm.cmd run preview
```

- A aplicação fica acessível no navegador em: **`http://127.0.0.1:5173`**.
- O frontend consome a API através do proxy do Vite (`vite.config.ts`), encaminhando requisições sob o prefixo `/api` diretamente para o backend na porta 3000 (`VITE_API_URL=/api`).

Abrir `http://127.0.0.1:5173/api/health/ready`: deve dar o mesmo resultado do backend. Regressar à página principal e verificar que aparece **Gênesis 1** com versículos. Se as portas 3000/5173 estiverem ocupadas, não mudar portas ou matar processos desconhecidos; comunica `EADDRINUSE`/`Port 5173 is already in use` ao Codex. Para uso diário, o build/preview acima serve uma versão estável, sem recarregamento automático durante alterações de código. Para desenvolvimento, podes usar `npm.cmd run dev` em alternativa, após parar apenas o teu servidor frontend com Ctrl+C. Não executar dev e preview simultaneamente na mesma porta.

Para encerrar o uso diário, Ctrl+C nos dois terminais que tu abriste. Não parar PostgreSQL, Docker, Domus ou OneDrive. O principal usa a URL privada já configurada; não trocar `localhost` por IP ou apontar para outro banco. Para leitura/estudos sem inferência, o índice de IA indisponível não exige recriar bases de dados.

### 3.3. Emissão de Token Local Opcional (Uso Operacional)
Se for necessário aceder a recursos privados sem utilizar a conta Google, o operador pode emitir um token local num terminal:

```powershell
Set-Location "C:\Users\victo\OneDrive\Documentos\Github\Bible\backend"
npm.cmd run auth:token -- local-owner
```

- Este token JWT manual possui validade de 1 hora para o subject `local-owner`.
- **Isolamento de Dados:** Os estudos, notas e dados de `local-owner` são completamente isolados e **não se misturam** com os dados gerados via login da Google (que utilizam subject com namespace e hash exclusivos).
- No diálogo de acesso, expandir **Usar um token local**, colar a saída somente em **Token de acesso local** e clicar **Confirmar acesso local**. Não enviar esse token ao Codex nem guardá-lo num ficheiro versionado. Esta alternativa é opcional e não comprova o login Google humano.

---

## 4. Interface, Botões e Ciclo de Sessão

### 4.1. Textos e Botões Exatos da Interface
Na interface web (`http://127.0.0.1:5173`), os elementos de interação são:

- **Navegação Principal:**
  - `Bíblia` (Leitor bíblico)
  - `Estudo Estruturado` (Módulo de estudos)
  - `Fontes Históricas` (Biblioteca de fontes)
  - `Histórico & Workspace` (Histórico e área de trabalho)
  - `Pular para o conteúdo principal` (Acessibilidade)
- **Controles de Acesso e Sessão (Sidebar / Rodapé):**
  - Botão com ícone de chave: rótulo/título `Entrar na conta` (quando sem sessão) ou `Gerir conta` (quando autenticado).
  - No menu mobile: botão `Conta e acesso`.
  - Indicador de estado: ponto âmbar com texto `Sem sessão` ou `A confirmar acesso…`; ponto verde com texto `Sessão Ativa`.
- **Janela de Acesso ("Entra no teu espaço de estudo."):**
  - Botão oficial do **Google Sign-In**.
  - Detalhe expansível: `Usar um token local`.
  - Campo de texto: `Token de acesso local`.
  - Botão de envio: `Confirmar acesso local`.
  - Botão de encerramento (quando autenticado): `Sair da conta`.
- **Controles Auxiliares:**
  - Alternador de tema: `Ativar Modo Claro` / `Ativar Modo Escuro`.
  - Modo Foco: `Sair do Modo Foco` (ou tecla `Esc`).
  - Painel de IA (mobile): `Abrir Painel Contextual de IA`.

### 4.2. Resultados Esperados no Ciclo de Vida da Sessão

Teste humano G03–G04, pela ordem:

1. No computador, clicar **Entrar na conta** no rodapé da barra lateral. Num ecrã estreito, clicar **Abrir Menu → Conta e acesso**.
2. No diálogo **Entra no teu espaço de estudo.**, clicar no botão oficial do Google. O texto desse botão pode variar com o idioma/sessão do próprio Google.
3. Escolher a tua conta e concluir o consentimento no navegador. Não copiar credenciais da janela Google ou do separador Network.
4. Esperar que o diálogo feche e apareça **Sessão Ativa**. Se ficar em **A confirmar acesso…** ou mostrar erro, guardar apenas o texto do erro e a hora; não assumir sucesso porque a janela Google fechou.
5. Opcionalmente criar um dado teu identificável: abrir **Estudo Estruturado**, escrever `GEN 1:1`, clicar **Gerar Estudo**, abrir o painel contextual, escolher **Anotações**, escrever `Teste pessoal de acesso` e clicar **Salvar anotação**. Isto grava um estudo/nota reais da tua conta; não é necessário para repetir os testes automáticos.
6. Abrir **Gerir conta** (ou **Abrir Menu → Conta e acesso**) e clicar **Sair da conta**. Confirmar **Sem sessão** e ausência dos dados privados na interface.
7. Voltar a entrar com a **mesma conta**. Em **Histórico & Workspace**, abrir o estudo criado e confirmar a nota. Uma conta Google diferente tem um espaço distinto; não ver os dados antigos nessa outra conta é o comportamento previsto.
8. Recarregar a página com F5. É esperado voltar a **Sem sessão**; os dados guardados no banco mantêm-se e reaparecem após nova entrada com a mesma conta. A sessão tem validade máxima de uma hora e não se renova automaticamente.

- **Sessão Estritamente em Memória:** Por decisão de segurança e arquitetura, a sessão ativa reside unicamente no estado React da aba do navegador. Não há gravação em `localStorage`, `sessionStorage` nem cookies de sessão persistentes.
- **Login Bem-Sucedido:** Ao selecionar a conta Google ou submeter o token local, a aplicação valida a credencial via `GET /auth/me`. Confirmada a identidade, o indicador muda para `Sessão Ativa` (verde) e os dados privados do respetivo owner são carregados.
- **Recarregar a Página (F5) ou Fechar Aba:** A sessão em memória é imediatamente descartada, retornando ao estado `Sem sessão`.
- **Logout:** Ao clicar no botão `Sair da conta`, o token é limpo da memória, os caches do React Query são descartados e a interface volta ao estado anónimo.
- **Reentrada:** Para retomar o acesso, o utilizador clica em `Entrar na conta` e reautentica-se.

---

## 5. Diagnósticos, Problemas Típicos e Informação Sanitizada

| Sintoma / Erro | Causa Provável | Ação Recomendada |
|---|---|---|
| **HTTP 401 Unauthorized** | Token expirado (validade de 1 hora) ou inválido. | Efetuar novo login no botão da conta ou reemitir novo token local. |
| **HTTP 503 Unavailable** (`GOOGLE_AUTH_UNAVAILABLE`) | Configuração Google ausente ou serviço Google indisponível. | Confirmar `/api/health/ready` e comunicar o código ao Codex. O diagnóstico de configuração é responsabilidade do Codex. |
| **Erro de Origem no Google Sign-In** | A origem `http://127.0.0.1:5173` ou `http://localhost:5173` não está autorizada no Console Google. | Adicionar as duas origens em "Authorized JavaScript origins" no Google Cloud Console. |
| **"Não foi possível confirmar a sessão."** | Token local incorreto ou falha de comunicação com `GET /api/auth/me`. | Conferir se o backend está em execução no Terminal 1 e reintroduzir o token. |
| **Botão Google ausente / janela bloqueada** | Biblioteca Google inacessível, bloqueador ou popup recusado. | Permitir o popup para a origem local, confirmar acesso à Internet e repetir uma vez; se persistir, comunicar ao Codex. |
| **Dados antigos não aparecem após Google** | Os dados antigos podem pertencer a `local-owner`. | Usar a alternativa local apenas para consultar esse espaço. Não há migração automática por email. |
| **`AI_UNAVAILABLE` / HTTP 503 ao perguntar à IA** | Índice/runtime/modelos indisponíveis. | Comunicar ao Codex; não comprar uma API, trocar modelos ou recriar o índice por tentativa. |

> [!CAUTION]
> **Comunicação Sanitizada:** Ao relatar problemas técnicos ou saídas de erro ao Codex ou em chats de assistência, comunique **somente** códigos HTTP e mensagens genéricas de falha. **Nunca envie tokens JWT, segredos, credenciais, senhas ou conteúdos do ficheiro `.env`**.

---

## 6. Arquitetura da IA Atual e Expansão Futura

### 6.1. IA Atual: Extrativa e Delimitada
- **Mecanismo:** A IA implementada opera sob os perfis `local-extractive-v1` e `source-sentence-selection-v6`, integrando modelo Qwen3-1.7B Q4_K_M com embeddings de 1024 dimensões e PostgreSQL com pgvector no índice `bible_ai`.
- **Escopo e Idioma:** O modelo executa **extração e seleção estrita de frases em inglês** a partir do corpus histórico autenticado de Flávio Josefo (tradução Whiston).
- **Saída delimitada:** O perfil permite uma frase inglesa extraída e citada, ou insuficiência de evidência. Isso não é uma garantia universal de veracidade histórica. Falha técnica é comunicada como indisponibilidade, não como insuficiência documental. Perguntas em português podem não obter suporte neste corpus inglês.

### 6.2. Expansão Futura (Condicional)
- **Restrições de Custos e Hardware:** O projeto foi desenhado para execução em hardware pessoal local (PC com 8 GB de RAM). Nenhuma contratação de APIs comerciais pagas ou serviços em nuvem foi autorizada.
- **Critérios Condicionais:** A eventual inclusão de novos corpora textuais, ampliação do cânone, traduções adicionais ou novos modelos de linguagem depende obrigatoriamente de:
  1. Análise formal de licenciamento e direitos autorais das fontes.
  2. Compatibilidade estrita com a capacidade de memória e processamento do hardware existente.
  3. Autorização explícita e prévia para quaisquer custos financeiros ou alterações de infraestrutura.

**Nada desta expansão é obrigatório para concluir o uso local atual.** Se a quiseres mais tarde, a tua parte é indicar: (a) se precisas de respostas desenvolvidas em português ou só pesquisa/citação; (b) obras/edições que queres incluir, com ficheiros ou links de origem e direitos conhecidos; (c) se aceitas envio a fornecedor externo e qual o orçamento máximo, podendo ser zero. Codex avalia viabilidade, formaliza contratos/licenças, implementa e valida; não tens de escolher embeddings, escrever adapters ou executar gates.

### 6.3. Uso opcional de uma conversa guardada

Depois de iniciar o índice, abrir a aplicação e entrar na conta:

1. Em **Estudo Estruturado**, criar um estudo de `GEN 1:1` ou abrir o teu estudo existente em **Histórico & Workspace**.
2. Abrir o painel contextual; no telemóvel, usar **Abrir Painel Contextual de IA**. Selecionar **Assistente IA**.
3. Em **Conversas guardadas**, clicar **Nova conversa**. No campo **Pergunta na conversa**, escrever `What does Josephus say about the Sabbath?` e clicar **Enviar na conversa**.
4. Esperar pelo resultado. Esta pergunta retornou **Evidência documentada** na prova nativa, com frase inglesa, atribuição e localização; continua a ser um caso verificado, sem promessa para qualquer pergunta. Ler a fonte e as limitações apresentadas. **Evidência insuficiente**, **Fonte restrita** ou indisponibilidade têm significados distintos e aparecem explicitamente na interface.
5. Para retomar depois, reabrir o mesmo estudo e clicar **Abrir conversa …**. A conversa conserva a versão de estudo em que foi criada. O limite é de20turnos e500bytesUTF-8 por pergunta, mostrado na interface.

**Cancelar resposta da conversa** interrompe a espera no cliente; o servidor pode já ter guardado trabalho. Reabrir/recarregar a conversa para conferir o estado antes de repetir. Este uso é opcional e não é uma tarefa de validação técnica tua.

## 7. O que comunicar depois do teu teste

Enviar apenas este resumo, preenchido no chat:

```text
Origem usada: http://127.0.0.1:5173 ou http://localhost:5173
Leitor e /api/health/ready: funcionou / falhou
Login Google: entrou / falhou + texto sanitizado do erro
Sair e voltar a entrar na mesma conta: funcionou / falhou
Estudo/nota pessoal (se fizeste o passo opcional): reapareceu / não reapareceu
Hora aproximada e navegador:
```

Não enviar email pessoal, JWT, nonce/cookie, código OAuth, cabeçalho Authorization, conteúdo de `.env`, passwords ou ficheiro HAR. Os testes automáticos, a revisão dos gates e o commit/push continuam com Codex, independentemente do adiamento deste teste humano.
