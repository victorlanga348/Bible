# ERR-0027 — Cancelar voltou a submeter o formulário

Confirmado2026-10-31/S10-T003. Estado: causa confirmada, GREEN17testes dirigidos; browser dev/preview confirma somente um pedido e controlos utilizáveis, cancelamento nativo separado PASS com HTTP/processo/locks/revision0. Frontend React19, ContextPanel. Duas falhas de latência na geração são problema separado; mutação global atual ainda pendente.

Sintoma observado em Chrome com runtime real: primeira resposta suportada/citada guardada; segundo pedido em curso, clicar Cancelar não conservava o aviso nem o botão Enviar. O browser continuava a processar. Não era ausência de AbortSignal: os testes antigos confirmavam abort mas não exerciam a ação de ativação real do browser.

Isolamento causal antes de código: browser com apenas o transporte do turno atrasado por double explícito contou dois pedidos após uma única pergunta/cancelamento; RED30,0s. Não é prova de IA/cancelamento servidor. Regressão jsdom força flush de atualizações discretas no listener de document, antes da ação default da ativação: RED1FAIL5SKIP, envio novamente pendente. RTL normalmente faz flush no fim do act e escondia esta diferença.

Causa: Cancelar e Enviar reconciliavam o mesmo nó button. handleCancel libertava o controller e mudava pending parafalse; React podia atualizar o type de button para submit antes da ação default do clique. O browser submetia de novo o formulário, criando outra operação. Não atribuir o problema ao modelo, PostgreSQL ou proxy.

Correção mínima: impedir a ação default no clique de Cancelar antes de abortar/mudar o estado. Sem trocar contrato, timeout, modelo ou perfil. GREEN17PASS/3ficheiros24,57s em assistant-lifecycle/conversation-workflows/assistant-cancellation. A suite global CI41168600897 refere-se ao checkpoint anterior3f33e2a e não valida esta correção; exige medição atual antes de DONE.

Lição: comprobar sinal abortado não garante cancelamento utilizável. Verificar browser/ação default, número de escritas, estado de UI, fechamento HTTP, recursos nativos e estado persistido, distinguindo cada prova. [Relatório T003](../../sprints/S10/T003_TEST_REPORT.md).
