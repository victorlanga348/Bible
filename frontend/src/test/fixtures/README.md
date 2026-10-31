# Fontes dos testes de interface

Dados autênticos de teste, com atribuição e direitos preservados:

- canon.json: seleção GEN1:1–2 do snapshot operacional admitido, SHA-256 14c2103dc8fedc80007b4c37a05f09c43926f05e8a0dc8ccd62b3443dccd0a27. Só filtra linhas/metadata, sem alterar palavras; CC BY4.0 e atribuição/licença preservadas dentro do JSON. A fixture anterior de IA tinha apenas GEN1:1 e não cobria seleção múltipla.
- source-manifest.json, source-excerpts.json e NOTICE.source.txt: cópias byte a byte de backend/test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/{manifest.json,excerpts.json,NOTICE.source.txt}. Texto original de Josefo/Whiston, limites, direitos e aviso integral preservados.

As cópias tornam os testes reproduzíveis no sandbox frontend do Stryker. Não são corpus operacional nem avaliação de IA. Identificadores, relações hipotéticas e notas técnicas dos testes são marcados como casos de protocolo, sem atribuir autenticidade histórica a esses dados.
