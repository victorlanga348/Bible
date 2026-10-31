# S10-T004 — Especificação de Ampliação Local de IA e Proveniência

Data: 2026-10-31
Decisão delegada do agente conforme autorização vigente e diretrizes de [AGENTS.md](../../../AGENTS.md).
Critério normativo de referência: AC05 em [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md).

---

### 1. Contexto e Avaliação de Viabilidade Local

A aplicação Bíblia monolítica opera em modo estritamente local (CPU loopback) e determinístico, integrando:
- **Modelo de Embedding**: `qwen3-embedding-0.6b-q8_0.gguf` (1024 dimensões, SHA256 pinado).
- **Modelo Extrativo Local**: `ollama-qwen3-1.7b-q4_k_m.gguf` em runtime C++ (`llama-server.exe` v0.40.11).
- **Corpus Primário Admitido**: Flávio Josefo (*Antiguidades Judaicas* I.1.1–4, Project Gutenberg 2848, SHA256 auditado).

#### Avaliação de Limitações Locais (CPU Inference):
1. **Latência e Recursos**: A inferência puramente em CPU para modelos superiores a 2B acarreta tempos de resposta inviáveis para interações interativas no navegador (>60s por turno).
2. **Fidelidade Hermenêutica**: A geração livre desprovida de ancoragem documental tende a alucinar interpretações teológicas e inventar referências canónicas inexistentes.
3. **Política de Segurança e Custos**: Nenhuma credencial de API externa (OpenAI, Anthropic, Google Vertex) ou contratação de serviço em nuvem foi autorizada pelo utilizador. Consequentemente, o assistente opera obrigatoriamente sob o perfil pinado `local-extractive-v1`.

---

### 2. Contrato de Proveniência e Seleção Extrativa

A ampliação viável de IA no âmbito da integração S10 baseia-se em:
1. **Ancoragem em Fontes Autênticas**: O assistente responde apenas com base em excertos verificados do corpus admitido ou do estudo contextual conectado pelo frontend.
2. **Abstenção Explícita**: Caso a pergunta do utilizador não encontre evidência direta nos excertos fornecidos, o modelo emite `citationId: null`, impedindo respostas enganosas ou deduções não fundamentadas.
3. **Imutabilidade de Corpus e Modelos Pinados**:
   - Ficheiros de admissão em `backend/admissions/local-extractive-v1.json` permanecem com hashes e parâmetros de amostragem estritamente inalterados.
   - As 14 asserções de validação determinística de IA mantêm-se em conformidade com o gate `test:tooling` e os testes de infraestrutura.

---

### 3. Ações Necessárias para Ampliações Futuras

Caso o utilizador decida futuramente expandir as capacidades generativas ou o corpus histórico:
1. **Provisão de Infraestrutura e GPU**: Configuração de aceleração CUDA/Metal ou contratação de gateway de inferência dedicado com orçamento alocado.
2. **Admissão de Novas Fontes**:
   - Criação de novo manifesto em `data/source-library/` com hash SHA256 do ficheiro de origem, licença em domínio público ou permissão expressa, e geração determinística de `excerpts.json`.
3. **Auditoria Semântica e Gates de Mutação**:
   - Execução das suítes de avaliação semântica (`ai:evaluate:local` e `ai:evaluate:conversations`).
   - Obtenção de pontuação de mutação > 85% para quaisquer novos adaptadores ou parsers de prompt.
