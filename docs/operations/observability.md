# Observabilidade local

Verificada na release S08. [Medições/limites](../sprints/S08/TEST_REPORT.md), [evidência](../sprints/S08/evidence/release-verification.json), [runbooks](runbooks.md).

GET /health/live200 confirma processo; GET /health/ready200 confirma consulta ao principal,503 indica indisponibilidade. Readiness não verifica acervo/migrações/índice/runtime. Erros HTTP e arranque são JSON sanitizados, sem credenciais, pergunta, citação ou SQL. Diagnóstico completo de avaliação fica em artefacto privado separado, só com dados técnicos autorizados.

Proveniência persistida da análise identifica perfil/prompt/modelos/digests/runtime/dimensões/limites/usage/segmentos/citações; leitura revalida fontes e distingue restrição, ausência de evidência e falha técnica. Segundos por readiness/embedding/recuperação/geração/persistência foram medidos separadamente na prova real; uma geração, sem retake semântico. Metas do ensaio pessoal:20leituras por percurso/p95<=2000ms;5criações/p95<=5000ms;5leituras concorrentes sem falha. Não são SLA nem teste de carga público.

Memória observada em71amostras, pausa configurada2000ms mais custo de consulta, intervalo efetivo2233..8972ms. Máximo privado Node256016384bytes/modelo1068961792bytes; working set Node238936064bytes/modelo2130440192bytes; mínimo físico livre411868KB. Estes valores são amostras, não pico contínuo; heap512MiB foi teto temporário da prova. Não inferir causa de incidente antigo sem telemetria causal.

Operador conserva diagnósticos privados apenas para prova/incidente e pode eliminá-los após revisão. Backups ficam até substituto restaurado/verificado; não há retenção central/alerta automático. Readiness503, backup/restauro falhado, discrepância de hashes/datas ou lease residual exigem intervenção manual pelo runbook. Não são monitorização contínua, HA ou promessa de disponibilidade de modelos.
