# S03-T007 — Revisão integrada da biblioteca de fontes

Data:2026-10-21. Trilha C, prioridade alta. Estado: DONE técnico. O utilizador aprovou este plano com «aprovado, e veja que alterei o .env, podes usar e adaptar o que precisares tambem». T006 DONE e dependências locais confirmadas; BLOCKED → READY → IN_PROGRESS → REVIEW → DONE com os critérios abaixo demonstrados no TEST_REPORT. A autorização cobre uso/adaptação necessária do `.env`, preservando segredos e o alvo isolado de testes. Sem dependências npm novas, agentes paralelos, publicação, commit ou push. Sprint DONE após o posterior «pode usar» ao encerramento/commit; hash a registar após criação.

## Objetivo, escopo e dependências

Confirmar a entrega S03 no recorte aprovado de uma obra/edição e quatro parágrafos reais, produzindo revisão final e rastreabilidade entre critérios, contratos, migrações, testes e documentação. Depende dos gates T004–T006, PostgreSQL de teste saudável e original HTML com hash admitido. Não retoma S02-T006/T007 nem cria associação bíblica, IA ou ampliação do corpus.

1. Revisar SPEC, contratos publicados, modelo físico/migrações e propriedade modular; confrontar texto/localizações/aviso/metadados/direitos com os artefactos admitidos. Conferir os sete gates e análises de sobreviventes sem alterar thresholds/exclusões.
2. Exercitar o percurso completo original/manifesto/excertos/aviso → importador guardado → transação PostgreSQL → Nest/Supertest → resposta/cobertura. Testes reais de T006 são evidência reutilizável quando o código não mudou; acrescentar prova composta só se revelar uma lacuna entre partes. Qualquer comportamento novo exige RED antes da implementação e aceite de mudança de escopo quando pertinente.
3. Preparar o workflow existente para obter o original ignorado no runner por HTTPS da URL fixa admitida, validar SHA-256 antes das suites e falhar se indisponível/alterado. Não trocar o original por conteúdo gerado, baixar hash ou ignorar testes. Ficheiro confirmado: `.github/workflows/backend.yml`; download é preparação de teste, não dependência HTTP do runtime. Sem executar CI remota/push por esta aprovação.
4. Verificar scripts de arranque/importação: alvo recusado, quatro caminhos obrigatórios, saída genérica de falha e encerramento de recursos; sem vazar segredos/texto em diagnósticos. Confirmar distinção entre conectividade de readiness e esquema/acervo instalado, documentando o banco de desenvolvimento ainda não migrado.
5. Sincronizar PLAN/TASKS/ACCEPTANCE_CRITERIA/TEST_REPORT/REVIEW, README/backend README, índices/roadmap, ações externas e MegaBrain. Manter resultados anteriores como histórico, sem duplicar backlog ou esconder pendências. Rever ADRs existentes; novo ADR só se houver decisão arquitetural real que o exija.

## Vantagens, custos e alternativas

Reutilizar provas válidas preserva rastreabilidade e evita repetir suites longas sem motivo. A revisão integrada encontra lacunas que percentagens isoladas não mostram. Custo: original remoto pode ficar indisponível ou mudar; o runner deve falhar com requisito de nova admissão, sem fallback para texto não verificado. Alternativa de arquivar artefacto completo exigiria política de armazenamento/retenção própria; não adotada automaticamente. Fixture de excertos e aviso permanece versionada e exclusiva de teste.

## Critérios verificáveis

| Critério | Evidência exigida |
|---|---|
| T007-AC01 | S03-AC01–04 e P/I/H/G rastreados a resultados reais, sem inferir suporte semântico |
| T007-AC02 | Percurso completo e bloqueios por permissão/falha/ausência demonstrados com PostgreSQL/Nest reais |
| T007-AC03 | Preparação de original no CI com hash fixo e checks executáveis da configuração; CI remota NOT_RUN até autorização própria |
| T007-AC04 | Estática/build/arquitetura e regressão aplicáveis PASS; linhas>=90%, branches>=85%, mutação bruta>85% com relatório válido e sobreviventes analisados |
| T007-AC05 | Docs/README/MegaBrain/ações/roadmap coerentes, zero segredos versionáveis, revisão final com limites e commit PENDING |

Scripts reais: `typecheck`, `lint`, `build`, `test:tooling`, `test:coverage`, `test:mutation:incremental`/`test:mutation`, `db:migrate:test`, `db:import:sources:test`. Executar sequencialmente as suites que limpam a base partilhada; confirmar guard/identidade antes de qualquer escrita. Preparação documental pura dispensa TDD de comportamento com justificação explícita, mas requer validação real de links/estados/diff. Configuração de CI/importação exige verificação executável adequada. Nenhum resultado inventado para comando não executado.

## Riscos, mitigação e saída

Banco/limpeza: apenas biblia_test confirmado, tabelas próprias, sem reset/volumes/dev. Direitos: mesma admissão limitada e sendToAi pending; nenhuma transferência a IA. Mutação: cache/relatório em caminhos separados, conservar o denominador e investigar defeitos. Documentação: distinguir o que está entregue do que foi adiado ou não executado. Fonte única/inglês/limites ficam visíveis no contrato e revisão.

Após critérios/gates, T007 segue IN_PROGRESS → REVIEW → DONE técnico e a sprint fica REVIEW para aceite de encerramento. Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"** Aprovar este plano autoriza a verificação/preparação descritas; encerramento/commit S03, S04, merge, push e deployment conservam aprovações próprias.

## Resultado executado

AC01–05 PASS no recorte aprovado: rastreabilidade/revisão integral,440 testes (319 unit/67 integração/54 E2E), linhas100%/branches97,07%, typecheck/lint/build/tooling13, mutação435/439=99,08883826879271% sobre639 mutantes. Sem mudança de comportamento em src nesta tarefa; prova composta verifica o comportamento já entregue por T006, não é RED retroativo. Configuração CI foi verificada antes/depois, download real admitido e falhas de transporte/integridade testadas localmente; CI remota NOT_RUN. IA não aplicável/NOT_RUN.

Adaptação autorizada do `.env`: somente BIBLE_TEST_DB_PASSWORD sincronizada com credencial real já validada em `.env.test`; Compose resolvido conferido, demais valores preservados, nenhum container recriado ou dado de desenvolvimento alterado. Relatório/cache/hash/links/diff/segredos conhecidos verificados; [TEST_REPORT](../TEST_REPORT.md) e [REVIEW](../REVIEW.md) registam evidências e limites. Não foi necessária nova decisão arquitetural/ADR.
