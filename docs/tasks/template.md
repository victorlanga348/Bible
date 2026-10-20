# Sxx-Txxx — Título da tarefa

Estado do modelo: template; não é tarefa autorizada.

## Identificação
- ID: Sxx-Txxx único na sprint.
- Título: resultado observável.
- Estado: BACKLOG / READY / IN_PROGRESS / BLOCKED / REVIEW / DONE.
- Prioridade: proposta e justificação.
- Data: data real de criação/execução; não estimar datas arbitrárias.
- Sprint: Sxx e ligação ao README/escopo.
- Trilha: A / B / C / transversal.
- Responsável: por designar até atribuição.
- Revisores: identificar.
- Specs afetadas: ID, versão, estado e ligações.
- Contratos e ADRs: referências e estados.
- Motivo de bloqueio e condição de desbloqueio: preencher quando BLOCKED.

## Contexto e problema
Descrever estado real, necessidade, requisitos do PRD e evidências.
Registar consulta de erros, padrões, armadilhas do MegaBrain, ADRs e skills relevantes.
Inspecionar apenas ficheiros/diretórios necessários.

## Solução proposta
Definir âmbito, ficheiros esperados e exclusões; não inventar contratos ou dependências.
Listar qualquer dependência nova, motivo e aprovação necessária.

## Alternativas consideradas
Comparar opções concretas e a manutenção do estado atual quando pertinente.

## Vantagens
Benefícios verificáveis.

## Desvantagens
Custos e limitações.

## Riscos
Riscos de domínio, integração, dados, licenças, IA, segurança, acessibilidade e migração conforme impacto.

## Mitigações
Relacionar cada risco com ação, responsável e evidência.

## Dependências
Tarefas predecessoras, decisões, specs, contratos e infraestrutura. Verificar ciclos e aprovações.
Trabalhar numa tarefa de cada vez, salvo autorização expressa de paralelismo.

## Critérios de aceitação verificáveis
Identificar critério, ligação à spec, condição/ação/resultado e evidência prevista.

## Plano Red–Green–Refactor
- RED: comportamento, teste antes de implementação, execução e motivo esperado da falha.
- GREEN: mínimo necessário e execução que demonstra aprovação.
- REFACTOR: melhoria interna, testes repetidos e dependências arquiteturais verificadas.
- Não implementar primeiro para simular TDD depois.
- Documentação pura: justificar não aplicabilidade e planear validação documental.

## Qualidade estática
Typecheck TypeScript, ESLint, dependências arquiteturais e build aplicáveis.
Identificar scripts reais do package.json; se inexistentes, registar preparação necessária sem inventar comandos.

## Testes de integração necessários
PostgreSQL/Prisma/repositórios/transações/restrições/migrações reais quando afetados; limpeza determinística.
HTTP com NestJS inicializado e contratos aprovados. Serviços externos em suites específicas reais com custo/quotas/dados controlados.
Fixtures versionadas exclusivas de teste; doubles unitários não substituem integração.

## Plano de mutation testing
StrykerJS sob compatibilidade validada; domínio/aplicação abrangidos; escopo, exclusões e cálculo da política.
Score bruto superior a 85%, relatório e análise dos sobreviventes. Se não aplicável, justificar sem score fictício.

## Avaliação da IA
Quando aplicável: corpus/rubrica/limiares aprovados, integração real controlada, fontes, suporte semântico e citações inexistentes.
Registar variabilidade, custos e limitações sem expor dados.

## Aprovações
- Sprint/escopo: aprovador, data e referência.
- Spec/contratos: aprovador, versão, data e referência.
- Plano/dependências: aprovador, data e referência.
- Mudanças posteriores: impacto e nova aprovação.
Nenhum campo pendente é aprovação implícita.

## Evidências de execução
Por execução: data, comando exato, ambiente, versões/revisão ou estado da árvore, saída/artefacto, resultado, falhas e limitações.
Registar RED/GREEN/REFACTOR separadamente. Preferir rtk compatível, com equivalente nativo se necessário.
Não apresentar resultados esperados como executados.

## Resultado dos sete gates
| Gate | Resultado | Evidência ou motivo de não aplicabilidade |
|---|---|---|
| 1 — Especificação | PENDENTE | Preencher |
| 2 — TDD | PENDENTE | Preencher |
| 3 — Qualidade estática | PENDENTE | Preencher |
| 4 — Integração real | PENDENTE | Preencher |
| 5 — Mutação | PENDENTE | Preencher |
| 6 — IA | PENDENTE | Preencher |
| 7 — Governança | PENDENTE | Preencher |

Resultados: PENDENTE, APROVADO, FALHADO ou NÃO APLICÁVEL. Motivo obrigatório para não aplicabilidade; falta de ferramenta obrigatória é impedimento.
Gates obrigatórios pendentes/falhados impedem DONE.

## Documentação afetada
Aplicar matriz bidirecional; listar alterados, revistos e motivos de não aplicabilidade.

## Atualização do MegaBrain
Ligar erros, causas confirmadas, regressões, lições e padrões reais quando relevantes.
Não duplicar normas, registos ou transcrições; atualizar contexto operacional quando necessário.

## Definition of Done
- [ ] Critérios satisfeitos e evidenciados.
- [ ] Sprint, spec/contratos e plano aprovados antes de código.
- [ ] Gates aplicáveis aprovados, com não aplicabilidade justificada nos restantes.
- [ ] RED/GREEN/REFACTOR, estática, integração real, mutação e IA demonstrados quando aplicáveis.
- [ ] Sem sobreviventes críticos por resolver ou exclusões artificiais.
- [ ] Arquitetura, direitos, segurança, acessibilidade e operação revistos conforme impacto.
- [ ] Docs, backlog, roadmap e MegaBrain sincronizados.
- [ ] Limitações e pendências explícitas; sem declaração de teste não executado.

Pergunta obrigatória: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
Concluir tarefa não encerra sprint; encerramento exige relatório e aprovação explícita.
