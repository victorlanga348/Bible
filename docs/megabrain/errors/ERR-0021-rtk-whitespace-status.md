# ERR-0021 — Status de git diff --check através do RTK

Data2026-10-27, S05-T006, agente delegado; estado resolvido por fallback nativo neste gate. Windows/PowerShell5.1.26100.9711/RTK0.43.0, branch feat/biblia-backend/base011c824. Sem alteração da ferramenta externa.

Sintoma confirmado: auditoria documental independente terminou FAIL com trackedWhitespace2. Na mesma árvore, `rtk git diff --check` apresentou só avisos de conversão LF/CRLF e retornou0; `git diff --check` nativo retornou2 e identificou `backend/src/config/runtime-config.ts:25: new blank line at EOF.` Nenhuma alteração ao ficheiro ocorreu entre essas duas verificações. Não aceitar a saída comprimida como prova de whitespace limpo.

Causa observada confirmada: incompatibilidade do wrapper para preservar diagnóstico/status deste uso de --check. O mecanismo interno do RTK não foi investigado; não atribuir o problema ao Git, autocrlf ou shell sem prova adicional. O defeito de whitespace era a linha vazia final introduzida pela extração do guard, sem comportamento de produto alterado.

Correção: remover apenas a linha vazia final e usar Git nativo para este critério. Reexecução nativa retornou0; auditoria documental deve repetir o gate antes de staging. Logs ignorados s05-t006-storage-doc-audit.log (primeiro FAIL), s05-t006-whitespace-stderr.log e s05-t006-whitespace-native-after.log; execução inicial/status estão também no histórico de ferramentas da sessão. Não é RED/GREEN de negócio e não requer novo teste de aplicação: alteração só de whitespace, depois de1441 testes/65suites PASS.

Prevenção: preferir RTK nos comandos compatíveis; para gates cujo status é parte da evidência, usar implementação nativa quando a compatibilidade falhar e registar o motivo, conforme AGENTS. Não alterar ficheiro externo RTK.md, mascarar saída não zero nem declarar PASS a partir de ausência de diagnóstico comprimido.
