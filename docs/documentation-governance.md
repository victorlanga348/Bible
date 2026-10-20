# Governança documental

Atualização: 2026-10-20. Origem: pedido mestre de backend e «ok» explícito ao [PLAN S00](sprints/S00/PLAN.md). Aprovação cobre S00-T002 a T007 e a transição documental, não implementação/encerramento/commit/push.

## Fontes e estados
/docs contém specs normativas; README contém entrada; ADRs aceites registam decisões; MegaBrain preserva conhecimento operacional. Código/testes devem corresponder a specs aprovadas.
Estados documentais: definido pelo utilizador, rascunho/proposto, pendente, aprovado/aceite, implementado, substituído/obsoleto. Aprovação regista aprovador, data e referência; implementado exige evidência.
Conflitos exigem interrupção da implementação e esclarecimento. Não alterar silenciosamente documentos aprovados; preservar histórico e obter aprovação de mudanças de escopo.

## Aprovações independentes
Escopo de sprint, spec/contratos e plano/dependências de tarefa são aprovados antes da execução. Uma aprovação pode enumerar tarefas documentais concretas; não autoriza futuros comportamentos.
Relatório e REVIEW precedem aprovação final de encerramento/commit. Sprint permanece REVIEW até essa aprovação. Não iniciar próxima sprint sem autorização própria.
Estado de tarefa: BACKLOG → READY → IN_PROGRESS → REVIEW → DONE; BLOCKED com causa/critério de desbloqueio. DONE exige todos os gates aplicáveis.
Resultado de execução/critério: PASS, FAIL, BLOCKED, NOT_RUN. Aplicabilidade/motivo ficam separados, sem converter não execução em PASS.
Trilhas: A domínio/regras; B infraestrutura/integrações; C qualidade/documentação. Não implicam subagentes, paralelismo ou serviços separados.

## Documentos canónicos
Reutilizar arquitetura/adr, quality, product, integrations e MegaBrain existentes.
Cada sprint terá PLAN, TASKS, ACCEPTANCE_CRITERIA, TEST_REPORT e REVIEW em docs/sprints/Sxx. TASKS é a fonte de estados de tarefa; README da sprint é a fonte do estado da sprint.
Entradas antigas scope/backlog/acceptance remetem para os novos documentos, preservando IDs e retratos históricos. Uma lista histórica não é backlog ativo.
Não duplicar modelos/regras em novas árvores. Specs existentes permanecem rascunho até aprovação própria.

## Ciclo
Identificar tarefa/specs/contratos/ADRs; consultar MegaBrain/skills; apresentar plano, alternativas, riscos e validação; obter aprovações; executar uma tarefa por vez; aplicar TDD a comportamento; validar [sete gates](quality/quality-gates.md); sincronizar impacto; registar evidência e conhecimento real.
Não instalar/adicionar dependências ou contratar serviços fora de escopo. Ausência de credencial não impede contratos/adapters possíveis aprovados, mas a integração real permanece BLOCKED. Registar ação externa com critério de desbloqueio.

## Matriz de impacto bidirecional
| Mudança | Rever em ambos os sentidos |
|---|---|
| Entidades/regras | PRD, product/business-rules, specs, architecture/data-model e testes |
| Persistência/migrações | Modelo, contratos, testes reais, ambientes, recuperação |
| API | integrations/api-contracts, specs, schemas/OpenAPI, consumidores e HTTP real |
| IA/RAG | ai, biblioteca, fontes/licenças, contratos e avaliações reais |
| Testes/gates | quality, critérios, tarefas, relatórios e dependências |
| Operação/acesso | operations, segurança, auth, retenção, ações externas e ADRs |
| Arquitetura | ADRs, módulos/ports, dependências e planos |
| Planeamento | Sprints, roadmap, tarefas, rastreabilidade e contexto MegaBrain |
| Erros/aprendizagens | MegaBrain, regressões e fontes normativas afetadas |

Mudança de código exige rever spec; mudança de spec exige rever consumidores/testes. Registar ficheiros revistos e motivo de não aplicabilidade.

## Git e evidências
Branch principal main; backend em feat/biblia-backend. Antes de editar verificar estado/refs e preservar trabalho. Não usar reset destrutivo, merge automático ou alterar main.
Commits por sprint seguem mensagens exatas de [AGENTS](../AGENTS.md); descrição documental em português. Commit PENDING antes de aprovação final. Push exige autorização separada.
Preferir rtk compatível com fallback nativo justificado, sem editar RTK.md externo. Executar apenas scripts reais do package.json. Registar comando, data, ambiente, resultado/falhas/artefactos sem segredos.

## Fechamento
Verificar critérios/gates aplicáveis, sincronizar docs/README/ADRs/roadmap/MegaBrain, produzir relatórios com riscos/bloqueios e pedir aprovação de encerramento.
Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
DOC-0001/S00-T001 preservam evidências históricas; não comprovam funcionamento do backend nem gates atuais.
