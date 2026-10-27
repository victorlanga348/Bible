# ERR-0017 — Hash de gravação e normalização de linhas das fixtures

Observado/corrigido2026-10-26 em S05-T005. Auditoria documental/whitespace falhou na execução2026-10-26T17:59:45Z, antes de qualquer commit das fixtures. Testes locais passavam, mas Git avisava CRLF será convertido para LF. Não tratar teste local verde como prova de digest idêntico no checkout CI.

Causa confirmada: os originais JSON do helper Python Windows foram escritos com newline padrão/CRLF; cópia por bytes conservou-os e o manifesto inicialmente foi escrito com Path.write_text/newline padrão. A regra nova eol=lf transformaria os ficheiros no índice, invalidando hashes brutos copiados para o manifesto. Comparação de bytes/parsed JSON confirmou a diferença física sem alteração de dados.

Correção: manter originais intactos em reports; gerar cópias de teste com somente CRLF→LF, verificar JSON bruto==JSON normalizado, escrever por bytes UTF-8 e guardar originalSha256/originalBytes/sha256/bytes/transformation separadamente no manifesto. Atributos LF explícitos para perfil/fixtures. Não alterar o corpus/avisos fonte ou alegar byte-identidade com o bruto.

Regressão: verificador dos três digests no teste protocol.spec.ts; execução s05-t005-protocol-lf-green.log PASS e auditoria documental2026-10-26T18:01:40Z PASS, sem exceção introduzida para ignorar avisos. Perfil normativo continua cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f. Helper ignorado s05-prepare-protocol-fixtures.py, manifesto versionado em backend/test/fixtures/ai-assistant/protocol. Nenhuma gravação é prova de chamada atual de IA ou seed de produção.
