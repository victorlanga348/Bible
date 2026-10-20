# S08 — Escopo

Estado: proposto; aprovação pendente.

## Incluído
Definir cenários completos e dados autorizados; executar browser → API → persistência/fontes/IA → resposta; testar falhas, acesso e recuperação; corrigir apenas defeitos por planos aprovados.

## Excluído
Novas funcionalidades, corpus não autorizado, integrações simuladas apresentadas como reais ou relaxamento dos gates.

## Restrições
Spec e plano aprovados antes de código. Uma tarefa de cada vez salvo autorização expressa. Sem datas arbitrárias, contratos inventados ou dependências sem aprovação.
TDD estrito, infraestrutura real e mutação superior a 85% quando aplicáveis. A aprovação deste planeamento não aprova o trabalho futuro.

## Dependências
[S07](../S07/README.md)
Critérios de entrada no [README](README.md); dependências de tarefas no [backlog](backlog.md). Dependência concluída não substitui aprovação de encerramento da sprint anterior.

## Riscos e mitigação
Testes felizes esconderem falhas de fronteira e variação externa; mitigar com negativos, isolamento e suites externas controladas.

## Decisões pendentes
Matriz ponta a ponta, ambiente, orçamento de chamadas e critérios operacionais por aprovar.
Consultar [registo de decisões](../../architecture/stack.md). Questões ainda em aberto não podem ser resolvidas por pressuposto.

## Alteração de escopo
Propor impacto sobre specs, tarefas, critérios e roadmap; obter aprovação antes de executar. Não transferir pendências silenciosamente.
