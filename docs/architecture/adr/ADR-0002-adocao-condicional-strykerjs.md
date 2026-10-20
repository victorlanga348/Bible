# ADR-0002 — Adoção condicionada de StrykerJS

Estado: aceite — escolha condicionada à validação de compatibilidade; implementação não iniciada.
Decisor: utilizador. Data de registo: 2026-10-17.
Referência: atualização da governança, secção 4 («Adotar StrykerJS, sujeito à validação de compatibilidade»), e «ok» ao plano desta sessão; [S00-T001](../../sprints/S00/tasks/S00-T001-atualizacao-governanca.md).

## Contexto e evolução
A baseline inicial tratava StrykerJS como candidato em DEC-08. O novo pedido define adoção condicionada.
A stack de [ADR-0001](ADR-0001-stack-e-limites-arquiteturais.md) permanece intacta. Esta ADR não substitui essa decisão nem prova compatibilidade com versões ainda não escolhidas.

## Decisão
Usar StrykerJS se a validação com Node.js, TypeScript, runner e configuração escolhidos comprovar compatibilidade.
Manter mutation score estritamente superior a 85% e o [cálculo existente](../../quality/mutation-testing.md), com relatório, sobreviventes e exclusões justificadas.
Executar obrigatoriamente em domínio e aplicação abrangidos por alterações executáveis.

## Alternativas e trade-offs
Manter apenas o estatuto de candidato não refletiria o pedido atual. Escolher outra ferramenta sem revisão também não está autorizado.
A condição evita declarar uma combinação suportada sem testes; exige trabalho de compatibilidade e configuração antes do gate.

## Consequências
DEC-08 passa a representar validação técnica pendente de uma escolha condicionada.
Nenhuma dependência foi instalada, runner selecionado ou comando inventado nesta operação.
Se incompatível, registar evidência, bloquear o gate aplicável e apresentar alternativas com nova aprovação; não usar outra ferramenta silenciosamente nem dispensar o score.

## Validação prevista
[S01](../../sprints/S01/README.md), tarefa S01-T002: selecionar versões/runner por plano aprovado, verificar documentação oficial e executar prova de compatibilidade real e sanitizada.
Não existe experiência ou score executado nesta ADR.
