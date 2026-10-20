# S07 — Escopo

Estado: proposto; aprovação pendente.

## Incluído
Decidir frontend; aprovar UX/tokens/responsividade; implementar navegação, estudo, citações, perguntas e histórico; integrar estados reais.

## Excluído
Inventar respostas/persistência em produção, alterar contratos unilateralmente ou declarar acessibilidade sem testes.

## Restrições
Spec e plano aprovados antes de código. Uma tarefa de cada vez salvo autorização expressa. Sem datas arbitrárias, contratos inventados ou dependências sem aprovação.
TDD estrito, infraestrutura real e mutação superior a 85% quando aplicáveis. A aprovação deste planeamento não aprova o trabalho futuro.

## Dependências
[S06](../S06/README.md)
Critérios de entrada no [README](README.md); dependências de tarefas no [backlog](backlog.md). Dependência concluída não substitui aprovação de encerramento da sprint anterior.

## Riscos e mitigação
Frontend acoplado ao schema, estados que escondem falhas e barreiras de leitura; mitigar com contratos, testes reais e auditoria manual.

## Decisões pendentes
DEC-01; identidade visual, ferramentas de UI, norma/nível de acessibilidade e matriz de dispositivos por aprovar.
Consultar [registo de decisões](../../architecture/stack.md). Questões ainda em aberto não podem ser resolvidas por pressuposto.

## Alteração de escopo
Propor impacto sobre specs, tarefas, critérios e roadmap; obter aprovação antes de executar. Não transferir pendências silenciosamente.
