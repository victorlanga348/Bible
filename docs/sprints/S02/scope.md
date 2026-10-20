# S02 — Escopo

Estado: proposto; aprovação pendente.

## Incluído
Aprovar modelo físico, acesso/retenção e contratos; bootstrap NestJS/Prisma/PostgreSQL; migrações e repositórios reais; persistência e consulta de histórico conforme SH-001.

## Excluído
Escolher serviços cloud, disponibilizar corpus não licenciado, geração de IA ou interface visual.

## Restrições
Spec e plano aprovados antes de código. Uma tarefa de cada vez salvo autorização expressa. Sem datas arbitrárias, contratos inventados ou dependências sem aprovação.
TDD estrito, infraestrutura real e mutação superior a 85% quando aplicáveis. A aprovação deste planeamento não aprova o trabalho futuro.

## Dependências
[S01](../S01/README.md)
Critérios de entrada no [README](README.md); dependências de tarefas no [backlog](backlog.md). Dependência concluída não substitui aprovação de encerramento da sprint anterior.

## Riscos e mitigação
Mistura de dados de teste/uso real e schema derivado de suposições; mitigar com isolamento, decisões explícitas e migrações testadas.

## Decisões pendentes
DEC-04/10 e versões DEC-07; modelo/contratos de histórico e segurança por aprovar. Decisões canónicas bloqueiam apenas operações que delas dependam.
Consultar [registo de decisões](../../architecture/stack.md). Questões ainda em aberto não podem ser resolvidas por pressuposto.

## Alteração de escopo
Propor impacto sobre specs, tarefas, critérios e roadmap; obter aprovação antes de executar. Não transferir pendências silenciosamente.
