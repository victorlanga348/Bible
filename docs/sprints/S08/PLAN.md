# S08 — Plano de hardening e release

Adenda2026-10-30: pedido explícito reabre apenas [T008 Google Sign-In](tasks/S08-T008-google-login.md), com [contrato](GOOGLE_AUTH_SPEC.md)/ADR-0009 antes de código. Implementação/gates atuais no [relatório próprio](GOOGLE_AUTH_TEST_REPORT.md); prova real adiada pelo utilizador. O plano/fecho abaixo é o histórico da release local anterior, sem aprovação automática do incremento.

Estado DONE técnico2026-10-29, sob autorização integral. T004–T007 DONE após revisão/gates/auditoria documental PASS. Decisões operacionais do agente delegado na [SPEC](SPEC.md), antes da implementação; não atribuídas a escolhas individuais prévias do utilizador. Branch feat/biblia-backend, uma tarefa por vez, sem agentes.

Objetivo: release pessoal local recuperável, sem gate obrigatório falhado/bloqueado. Escopo: auditoria de limites, regressões das lacunas S05/S06/S07, preparação operacional independente de fixtures, segurança/configuração, uma inferência real congelada, desempenho básico, backups e restauro isolado, gates completos e runbooks. Frontend/OAuth/serviço público/remoto/HA fora do escopo; dados/modelos/segredos/main/serviços alheios preservados.

Sequência executada:

1. [T004](tasks/S08-T004-release-scenarios.md): ambiente/escopo/metas congelados antes de código; aceite delegado da SPEC.
2. [T005](tasks/S08-T005-hardening-recovery.md): regressões Domain/Application/PG/Nest/HTTP, verificação de preparação sem fixtures, CI de checkpoint, recursos próprios/nativa/desempenho, dois backups/restauro/HTTP/preservação. Falhas e hipóteses refutadas mantidas.
3. [T006](tasks/S08-T006-final-gates.md): oito jobs/artefactos/fontes/inventário/cobertura/mutação/429sobreviventes/segurança/semântica conferidos na mesma revisão, sem gates intactos repetidos.
4. [T007](tasks/S08-T007-release-readiness.md): operação/inventário/TimeZone/runbooks/entradas/contexto curto, revisão/critério/evidência, auditoria e commit/push autorizados.

Dependências S07 e EXT-001–006 satisfeitas no recorte pessoal local. Nenhum serviço pago, nova dependência ou tecnologia. Alternativas rejeitadas: mock como restauro/IA, fixture em desenvolvimento, mudanças de thresholds/pins, restauro por cima de dados existentes e repetir semântica até passar. Custos reais: espaço de cópia privada, CI e uma inferência; mitigados por execução sequencial e incorporação por identidade.

TDD: nenhum comportamento de produção alterado; regressões novas não são RED retroativo. Preparação/configuração teve verificação causal anterior, GREEN e snapshot idêntico, documentados na ficha. Diagnósticos de restauro são operações verificáveis, não código de produto testado depois para fabricar RED. [Sete gates](../../quality/quality-gates.md) intactos: linhas>=90%, branches>=85%, mutação bruta>85%global/IA/zeroRuntimeError+NoCoverage, todos testes obrigatórios PASS.

[TEST_REPORT](TEST_REPORT.md), [REVIEW](REVIEW.md), [AC01–04](ACCEPTANCE_CRITERIA.md), [evidência](evidence/release-verification.json). Configuração TimeZone do original integra a recuperação após falha causal comprovada; nenhum dado/código/expectativa foi alterado para aceitar a cópia. Operação e direitos locais limitados explicitamente; outro ambiente/fuso exige trabalho próprio.
