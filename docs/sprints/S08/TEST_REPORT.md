# S08 — Relatório de testes

PASS2026-10-29 para a release pessoal local da [SPEC](SPEC.md), revisão executável f71a7356b6fb445284d6713d47d7f6552f98d750. [Evidência com hashes, contagens e medições](evidence/release-verification.json), [mutação](MUTATION_REVIEW.md) e [cronologia/falhas T005](tasks/S08-T005-hardening-recovery.md). Alterações posteriores são documentais/diagnósticos ignorados; `git diff --exit-code` dos diretórios de produto/testes/Prisma/admissões/scripts/configuração exit0.

## Gates executáveis

[CI40912125811](https://github.com/victorlanga348/Bible/actions/runs/40912125811), oito jobs SUCCESS conferidos por GitHub MCP. Ubuntu24.04/Node24.16.0/npm11.13.0/PostgreSQL17.11/vector0.8.7; pacotes pinados. Foundation executou instalação estrita, `npm run prisma:generate`, originais autenticados, `npm run db:migrate:test` (inclui build), `npm run typecheck`, `npm run lint`, `npm run test:tooling`, `npm run test:coverage`. Seis partições executaram `npm run test:mutation:shard -- 0` até5; agregado executou `npm run test:mutation:merge` e `npm run test:mutation:ai-gate`. Todos exit0. Não repetir gates porque os ficheiros executáveis não mudaram.

| Verificação | Resultado | Evidência |
|---|---|---|
| TypeScript strict/lint/build/arquitetura | PASS | Steps CI e89tooling/zero falhas |
| Jest/Prisma/Nest/Supertest reais | PASS |2249testes107suites,76,517s; PostgreSQL isolado e migrações reais |
| Cobertura | PASS |2290/2290linhas100%;1570/1603branches97,94% |
| Mutação global/IA | PASS |4319/4748=90,9646166807%;IA2130/2370=89,8734177215% |
| Inventário e sobreviventes | PASS |132fontes/107mutáveis/6540assinaturas;429Survived revistos;zeroRuntimeError+NoCoverage |
| Preparação operacional sem fixtures | PASS | Admissão/pins próprios;31102textos/snapshot14c2103d… idênticos; ausência/adulteração recusadas |
| Segurança/contratos | PASS | JWT/owner/401/404/CAS/limites/erros sanitizados e regressões S08 assimétricas/Unicode/versão2/múltiplas evidências |
| IA nativa/semântica | PASS após revisão | Uma geração real823tokens+26embedding; bruto preservado REVIEW, revisão separada PASS |
| Backup/restauro/HTTP | PASS | Dois dumps custom; hashes15tabelas main+3AI, migrações/vetores/constraints e recursos privados recuperados |
| Preservação/cleanup | PASS | Todos os dados anteriores idênticos; só recursos técnicos próprios eliminados; container removido e zero modelos próprios |
| Desempenho | PASS | Todas as metas congeladas satisfeitas, medições abaixo |

ZIP foundation12914242664/381592bytes/SHAf6732a10c425898c025e96ff88e78e875924cf59fa9c96601d43ced8a6c1e198; agregado12916142991/1268765bytes/SHA2044327c24792dcbc04ceb1a2f272073874541e159b47de5db8bdca8cd6eb6b0. Digests oficiais comparados e originais privados conservados em LOCALAPPDATA/BibleAI/quality-artifacts/40912125811; cópia remota expira2026-11-12. `node reports/audit-s08-ci.cjs` em backend PASS: fontes embutidas/current/commit, inventário e operadores padrão conferidos, JSON bruto SHA1e8864535e7cf6cb72a3ad4c0bec411a4634670ef05d64eb96ce0677ea50e5bc. Compatibilidade Jest30.5.2/Stryker10 demonstrada, sem reduzir thresholds/checkers/escopo.

## TDD e provas nativas

Nenhum comportamento de produção foi alterado S08.116testes/5suites adicionais e6tooling sobre S07: Domain/Application diretas, datas/cursors assimétricos, CAS/UTF-8/versão2, HTTP com múltiplas evidências/offsets, exportação de WorkspaceLibrary e contexto/cleanup IA. Regressões de código já correto não são RED retroativo. Preparação teve2falhas causais de configuração antes da admissão operacional e GREEN com snapshot idêntico; sexto teste comprova recusa sem catálogo. Erros de harness/typecast conservados na ficha, sem alegar RED de negócio. T006 confere provas/documentação: TDD novo de comportamento não aplicável.

Windows8GB/PostgreSQL16.14 principal e17.11/vector0.8.7 índice; uma validação pesada por vez. `node reports/s08-release-audit.cjs` e fases populate/restore/cleanup são diagnósticos administrativos ignorados, conservados com hashes no diretório privado da prova, não scripts npm publicados. Ensaio18:37:30.494Z–18:40:51.245Z:5estudos/6versões, nota revista/favorito/relação com2citações/conversa/análise. Caso Sabbath/p1-s11 congelado, única chamada, quote literal1904..2127 responde ao sétimo dia segundo Josefo/Whiston, com atribuição/direitos/quatro limitações. Sem confirmação histórica independente nem revisão humana externa alegada. Avaliações S05/14casos, S06/9turnos e S07 incorporadas por identidade de fontes/modelos/perfil, sem replay.

Populate SHA71ab7c611b62d2279aa96f916ce8888a2d8bd12aa878814576e8362ff2aa9fb7; revisão semântica separada SHAbe4ba95ed3d0cd9e6797c093514bc337b0acdd8aa54125c8b7709c7572ecbcd2 PASS. Raw final SHA80c0ca597fefa465005c9a5ac922732181c48a05c1900517afaa0166ea2d5daf permanece REVIEW; HTTP restaurado SHA9fd6b7fa64e968c8cc45e6572c72ed31f1e081eab716966670245ad8c333d257 PASS. Nenhum bruto foi reescrito para obter aprovação.

| Percurso | Amostras | p50ms | p95ms | Máximoms | Meta p95ms |
|---|---:|---:|---:|---:|---:|
| Criação de estudo |5|—|714,42|714,42|5000|
| Passagem canónica |20|26,70|40,60|57,49|2000|
| Workspace |20|11,81|22,21|30,63|2000|
| Histórico |20|10,76|17,11|17,13|2000|
| Favoritos |20|8,94|12,20|13,82|2000|

Cinco leituras concorrentes/zero falhas,234,91ms total. Embedding40,15s incluindo38,59s readiness e1,28s request; geração135,99s incluindo110,95s readiness e23,32s request; recuperação175,42ms/persistência144,32ms. Readiness<180s/request<120s/operação<600s, sem ampliar prazos. Carga dos processos e requests separados; não se alega benchmark isolado de cache quente do modelo nem SLA público.

Memória:71amostras, pausa configurada2s mais custo de consulta. Máximos observados privados Node256016384bytes/modelo1068961792bytes; working set Node238936064bytes/modelo2130440192bytes. Intervalos efetivos/RAM livre na evidência; não é pico contínuo e heap512MiB é teto, não medição.

Backups fora de Git/OneDrive: main1431312bytes/SHAca4ab0de52fcc51913b8b70ebc79db14f653a2472c736fcede382ffd6e1492f3; AI63953bytes/SHAe13f45555723323e2419f2b5ea8d62af9c596d478f56b861d8e978dc7157b85a. Operador sem novas escritas durante os dois dumps, sem transação distribuída. Restauro em bases próprias/porta127.0.0.1:55437/tmpfs/imagem ac08538c…, sem volumes de utilizador; SQL23514/23505 confirma constraints e adapter real confirma índice/11vetores. HTTP recupera recursos privados sem modelos. TimeZone também recuperado: Africa/Johannesburg main, Etc/UTC AI; auditor usa UTC apenas na sua conexão.

## Falhas e limites

CI40911244442 FAIL por catálogo ausente, corrigido no workflow sem mudar pins. Auditor inicial interrompido por EOF em pg_restore--list; tratar pipe apenas com leitor exit0. Primeira retoma recusou snapshots não gravados. Restauros anteriores falharam na guarda correta do alvo AI e depois no fuso omitido; hipótese de índice foi refutada. Todos os brutos/logs/contagens mantidos. Um stop ficou false; inspeção independente confirmou ID ausente; prova final termina com remoção confirmada. Ficha T005 conserva causas, hipóteses refutadas e digests.

Conservar TimeZone é obrigatório com o adapter instalado; mudar fuso/portar dados exige tarefa/migração própria. Fontes/direitos/inglês/quatro parágrafos e JWT local mantêm limites. Frontend, OAuth, publicação remota/serviço público, HA e carga pública fora do escopo. Nenhuma chave/ação adicional do utilizador para esta release local.

Governança T005 PASS2026-10-29T18:55:42.080Z,3Markdown4links/zero alertas após corrigir link S05. T007 executa auditoria final de operação/entradas; nenhum gate obrigatório de produto falhado/bloqueado permanece.
