# S10 — Critérios verificáveis

- AC01: PASS. /api usa a origem do frontend e proxy dev/preview preserva contrato/query/Bearer, sem CORS global nem destinos externos implícitos.
- AC02: PASS. Sessão Google entra pela interface, confirma owner no backend e isola/limpa dados privados entre sessões; prova de conta real separada.
- AC03: PASS. Leitor/estudo/nota/favorito funcionam por browser/API/PG real e guardam estado; versões/conflitos/erros/eliminação próprios verificados.
- AC04: PASS. Assistente recebe o estudo ativo e cancelamento chega ao pedido via AbortSignal, sem anunciar cancelamento se a operação continuar; cancelamento cliente não promete rollback de operação já persistida.
- AC05: PASS. Ampliação IA documentada e viabilizada somente com perfil pinado local (`local-extractive-v1`), fontes autênticas de Josefo e limitações explícitas; chave/modelo não são prova de qualidade.
- AC06: PASS. Sete gates atuais cumpridos, dados e segredos preservados, evidências completas e docs/README coerentes.

Resultados em [TEST_REPORT](TEST_REPORT.md); estados em [TASKS](TASKS.md). Todos os critérios cumpridos.
