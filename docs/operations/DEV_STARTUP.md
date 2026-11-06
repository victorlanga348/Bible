# Arranque completo de desenvolvimento

Plano aprovado pelo pedido de 2026-11-06: «quando eu faça a run dev tudo rode normalmente». Tarefa S10-T006, mesma branch. Implementar `npm run dev` na raiz, sem dependências novas, usando Node e as instalações existentes. O comando `frontend/npm run dev` continua disponível para trabalhar apenas na interface.

Contrato antes de implementação:

1. Compilar o backend existente e carregar `backend/.env` em memória, sem imprimir valores. Exigir configuração de desenvolvimento local, banco `bible_db` existente, JWT, Google e IA já configurados. Não editar `.env`.
2. Recusar portas ocupadas antes de iniciar processos. Verificar PostgreSQL real; se estiver parado, iniciar apenas o serviço Windows `postgresql-x64-16` existente. Nunca criar/resetar/migrar/importar bases automaticamente.
3. Verificar Docker; se necessário, abrir a instalação existente do Docker Desktop oculta. Conferir nome, labels, identidade de banco e binding local do container `biblia-ai-index-development` antes de o iniciar. Nunca criar container ou parar serviços alheios.
4. Conferir hashes dos artefactos locais e readiness do índice pelo adapter existente, sem inferência/download. Falha interrompe o arranque e indica a etapa sem expor segredos.
5. Iniciar API, compilador TypeScript em watch e Vite dev com proxy para a porta real da API. Só anunciar pronto após readiness HTTP da API e do proxy. Backend reinicia após recompilação; frontend mantém HMR.
6. `Ctrl+C` ou falha fecha somente os processos/observadores criados pelo launcher. PostgreSQL, Docker, volumes e dados permanecem disponíveis.

Alternativa de dois terminais permanece válida, mas não satisfaz o novo pedido de comando único. Usar scripts nativos evita instalar um supervisor. Riscos: Docker lento, permissões do serviço Windows, porta ocupada e artefacto ausente; tratar como falha explícita, sem simular integrações. Validar sequenciamento/falhas/limpeza por testes, depois executar o launcher com os serviços reais, conferir API/proxy/leitura no browser, recompilação e encerramento dos próprios processos.

## Utilização neste PC

```powershell
Set-Location "C:\Users\victo\OneDrive\Documentos\Github\Bible"
npm.cmd run dev
```

Esperar `Bíblia App pronta`, manter o terminal aberto e abrir **http://127.0.0.1:5173**. O primeiro arranque compila/verifica artefactos; pode demorar cerca de um minuto neste PC. Não executar `npm install` na raiz: o launcher não tem dependências novas e usa as instalações existentes em backend/frontend. `Ctrl+C` encerra a aplicação; repetir o comando para reabrir.

Se ocorrer `Arranque interrompido na etapa …`, comunicar apenas etapa, hora e mensagem sanitizada ao Codex. `ensurePorts`: existe outro processo na porta3000/5173; fechar somente uma instância tua conhecida ou usar a já aberta. `loadConfig`: conferir configuração privada com Codex, sem enviar `.env`. `ensurePostgres`/`ensureAiContainer`: serviço parado, permissões ou Docker indisponível; não reinstalar nem criar substitutos. `verifyAi`: artefactos/índice não correspondem ao perfil admitido; não baixar outro modelo nem reconstruir o índice por tentativa. `waitForApi`/`waitForProxy`: o serviço não confirmou readiness; não declarar a aplicação pronta.

## Validação real — 2026-11-06

`npm.cmd run test:dev`: **9PASS**, após RED de contrato contra o esqueleto que anunciava pronto sem verificar dependências. A falha anterior de módulo inexistente é apenas preparação do harness, não RED de comportamento.

`npm.cmd run dev` executado duas vezes com PostgreSQL/Docker/índice/modelos reais existentes. API3000 e proxy5173 responderam200/`database: up`. Prova Chrome **PASS**: leitor mostra Génesis1/31versículos reais, ligação HMR confirmada por WebSocket e compilador TypeScript recompilou ficheiro temporário exclusivo, reiniciando a API e recuperando readiness. Probe fonte/JS removido no `finally`; backend versionado permaneceu idêntico à revisão auditada. [Manifesto da prova](../sprints/S10/evidence/T006-dev-startup.json).

Ambos os encerramentos por Ctrl+C libertaram3000/5173; PostgreSQL Windows e o container IA continuaram ativos, sem parar serviços alheios. O wrapper de terminal devolve1 ao ser interrompido; não é uma falha de teste nem um exit0 de execução terminada normalmente. Logs/JSON locais: `backend/reports/s10-t006-dev-native.*`; sem inferência, consentimento Google pessoal ou escrita de dados da aplicação nesta prova.

Arranque: PASS neste PC. A CI42260812862/21ee138 aprovou o score global85,88764044943821%, com auditoria independente; revisão final e testes posteriores continuam em [T006_TEST_REPORT](../sprints/S10/T006_TEST_REPORT.md). Instruções pessoais: [USER_ACTIONS](USER_ACTIONS.md).

Revisão independente agy somente de leitura, exit0, não encontrou problema concreto no escopo launcher/guia: comando raiz, limpeza dos próprios filhos e alternativas manuais coerentes. Log `backend/reports/s10-t006-agy-dev-review.log`. Isto é revisão documental/de código; as execuções reais acima foram feitas pelo Codex e a revisão agy não certifica gates globais.
