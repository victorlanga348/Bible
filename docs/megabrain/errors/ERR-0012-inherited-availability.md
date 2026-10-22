# ERR-0012 — Propriedade herdada confundida com disponibilidade

Data2026-10-22. Módulo study, S04-T005. Responsável: agente executor. Estado: resolvido,667 regressões e mutação própria88,98% PASS. Node24.16/TypeScript6/Jest30, domínio puro sem base de dados nesta reprodução.

## Sintoma e causa confirmada

A [SPEC S04](../../sprints/S04/SPEC.md) exige missing quando a disponibilidade de um excerto não é reportada. O identificador constructor satisfaz a gramática admitida. A leitura availability[id] num objeto vazio encontrou Object.prototype.constructor; o fallback por null/undefined não foi aplicado e a validação lançou StudyDomainError. Não houve devolução de quote restrita; o defeito era uma falha de disponibilidade para uma identidade válida.

Reprodução executou o domínio compilado com a mesma quote autêntica e identidade técnica controlada constructor. Depois escreveu-se o teste Jest antes da correção: RED1 falha/51 skipped,5,807s, pela exceção na projeção. O typecheck posterior encontrou um literal alargado na asserção do mapa constructor; isso não causou a falha RED. Anotação as const corrigiu a tipagem sem alterar JS. Para confirmar a prova estrita, restaurou-se temporariamente só a linha anterior, typecheck PASS e RED1 pela mesma causa em2,671s, depois reaplicou-se a correção. Logs prototype-red e prototype-typed-red-typecheck/-red preservados; não apagar essa cronologia nem chamar a falha de tipagem RED.

## Correção e regressão

Projeção consulta Object.hasOwn antes de ler o estado. Sem propriedade própria, missing; com constructor próprio e available, conserva a quote autorizada. [domain.spec.ts](../../../backend/test/unit/study/domain.spec.ts) verifica ambos, preservando o documento original. GREEN52/52,3,669s, s04-t005-prototype-green.log; confirmação tipada GREEN52/52,1,603s. Regressão integral final667/667 PASS com limite temporário512MB/GC; estática/build/tooling PASS. Mutação própria323/363=88,98071625344353%, zero RuntimeError/NoCoverage,40 sobreviventes analisados; sem todos os Timeout87,87878787878788%. Falha anterior84,30% preservada, sem aceitar agregado de caches alheios. Estado/evidências canónicos no [TEST_REPORT S04](../../sprints/S04/TEST_REPORT.md).

A mutação anterior foi interrompida após a confirmação do defeito e preservada como INCOMPLETE sem score aceite; somente processos próprios foram terminados após identidade conferida. Não usar relatório do código anterior como gate da correção. Não modificar manualmente estados/cache da ferramenta.

## Lição

Record<string,T> não garante que a indexação JavaScript consulte somente propriedades próprias. Mapas de identidades externas devem explicitar essa semântica; não retirar uma identidade válida da gramática apenas para evitar o caso. Esta ocorrência não aprova uma refatoração genérica de todos os dicionários do projeto.
