# S10 — Critérios verificáveis

- AC01: /api usa a origem do frontend e proxy dev/preview preserva contrato/query/Bearer, sem CORS global nem destinos externos implícitos.
- AC02: sessão Google entra pela interface, confirma owner no backend e isola/limpa dados privados entre sessões; prova de conta real separada.
- AC03: leitor/estudo/nota/favorito/conversa funcionam por browser/API/PG real e guardam estado; versões/conflitos/erros/eliminação próprios verificados.
- AC04: assistente recebe o estudo ativo e cancelamento chega ao pedido, sem anunciar cancelamento se a operação continua apresentada como concluída; cancelamento cliente não promete rollback de operação já persistida.
- AC05: ampliação IA somente com perfil/fontes/avaliações reais e limitações explícitas; chave/modelo não são prova de qualidade.
- AC06: sete gates atuais, dados e segredos preservados, evidências completas e docs/README coerentes. CI antiga não valida executáveis novos.

Resultados em [TEST_REPORT](TEST_REPORT.md); estados em [TASKS](TASKS.md). Critério pendente obrigatório impede DONE.
