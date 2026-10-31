# S10-T004 — Relatório de Evidências de IA e Proveniência

Estado: DONE2026-10-31.
Especificação: [T004_AI_SPEC](T004_AI_SPEC.md).
Critério: AC05 cumprido (ampliação via perfil pinado local, proveniência autêntica e limitações explícitas).

---

### 1. Verificações Executadas

1. **Integridade de Fontes e Admissão de IA**:
   - Perfil `local-extractive-v1.json` auditado com integridade SHA256 em todas as dependências e binários (`llama-server.exe`, DLLs GGML).
   - Corpus histórico `josephus-antiquities-pg2848-en` (Project Gutenberg 2848) validado sem alterações ou fontes sintéticas.
   - 100 testes de integridade e tooling executados com sucesso em `npm run test:tooling`.
2. **Abstenção e Segurança Contra Injeção/Distorção**:
   - Verificado que perguntas sem sustentação nos excertos documentais resultam em abstenção explícita (`citationId: null`).
   - Verificado que instruções hostis ou tentativas de quebra de diretrizes hermenêuticas são filtradas pelas asserções do protocolo determinístico.
3. **Desacoplamento de Provedores Externos**:
   - Nenhuma dependência externa paga ou remota foi introduzida.
   - Aplicação opera integralmente offline / loopback local.
