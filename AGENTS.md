# Instruções operacionais — Bíblia App

## Fonte da verdade e entrada
Estas regras aplicam-se a todo o repositório e a todos os agentes.
- /docs contém as especificações normativas; só specs aprovadas autorizam comportamento.
- README.md contém visão geral e procedimentos de entrada.
- ADRs aceites documentam decisões arquiteturais.
- MegaBrain preserva conhecimento operacional e histórico de erros; não substitui specs.
- Código e testes devem corresponder às especificações aprovadas.

Ler [governança](docs/documentation-governance.md), [sprints](docs/sprints/README.md), [gates](docs/quality/quality-gates.md) e [contexto operacional](docs/megabrain/agent-context/project-state.md).
Em caso de conflito entre requisitos, contratos, código ou decisões, interromper a implementação e solicitar esclarecimento. Não resolver silenciosamente escolhendo uma fonte conveniente.

## Aprovação antes de código
1. Identificar sprint Sxx e tarefa Sxx-Txxx.
2. Consultar specs afetadas, contratos e ADRs relevantes.
3. Consultar erros relacionados, padrões aprovados e armadilhas do MegaBrain.
4. Verificar skills relevantes disponíveis e aplicar as que correspondam ao trabalho.
5. Apresentar plano técnico pequeno e revisável.
6. Explicitar vantagens, desvantagens, alternativas, riscos e mitigações.
7. Definir critérios verificáveis, dependências e plano de validação.
8. Aguardar aprovação explícita da spec e do plano da tarefa, além do escopo da sprint.

Aprovar uma sprint não aprova automaticamente todas as suas tarefas, specs, dependências ou mudanças fora do escopo.
Mudança de escopo exige análise de impacto e nova aprovação. Nunca alterar silenciosamente uma spec aprovada.
Esta atualização documental foi autorizada pelo utilizador após apresentação do plano; não autoriza funcionalidades.

## Escopo cirúrgico
- Modificar apenas os ficheiros necessários; evitar refatorações não relacionadas.
- Não adicionar dependências sem justificação e aprovação.
- Não inventar contratos, endpoints, campos, regras ou decisões técnicas.
- Inspecionar apenas diretórios e ficheiros relevantes; evitar varreduras massivas sem necessidade.
- Preferir diffs pequenos e revisáveis; preservar alterações do utilizador.
- Preservar [limites de arquitetura](docs/architecture/dependency-rules.md): domínio independente de NestJS, Prisma e fornecedor de IA.
- Não instalar, publicar, fazer commit/push, migrar dados reais ou contratar serviços fora do âmbito autorizado.

## TDD estrito: RED–GREEN–REFACTOR
Para cada alteração de comportamento:
1. RED: identificar comportamento especificado; escrever teste antes da implementação; executar; confirmar falha pela razão esperada e guardar evidência.
2. GREEN: implementar o mínimo; executar novamente; confirmar aprovação sem funcionalidade extra.
3. REFACTOR: melhorar desenho sem mudar comportamento; executar novamente os testes e verificar dependências arquiteturais.

É proibido implementar primeiro e escrever testes depois para simular TDD.
Falhas de sintaxe, ambiente ou dependência não demonstram RED do comportamento.
Documentação sem comportamento executável exige justificação de não aplicabilidade e validação documental real.
Ver [política TDD](docs/quality/tdd-policy.md).

## Testes reais e dados controlados
- Persistência: PostgreSQL isolado, Prisma, migrações, repositórios, transações e restrições reais; limpeza determinística.
- HTTP: inicializar a aplicação NestJS e verificar rotas, DTOs, entradas, respostas, erros, persistência e segurança aplicáveis.
- Fixtures determinísticas são recursos versionados de teste, exclusivos do ambiente de testes. Não alimentam produção nem precisam de ser apagadas do repositório após cada tarefa.
- Doubles locais podem apoiar testes unitários; mocks/fakes não substituem permanentemente integrações reais.
- Fornecedores externos: suites específicas reais, considerando custo, quotas e variabilidade; não exigir chamadas pagas em todos os ciclos locais.
- IA: combinar integração real, casos de referência, fontes verificadas, qualidade semântica e deteção de citações inexistentes.

Ver [estratégia de testes](docs/quality/testing-strategy.md). Não declarar sucesso sem execução verificável.

## Mutation testing
Adotar StrykerJS sujeito à validação de compatibilidade, sem presumir versão ou runner.
Executar nos módulos de domínio e aplicação abrangidos por alteração executável.
Exigir score bruto estritamente superior a 85%, relatório e análise de sobreviventes; documentar exclusões sem manipular o escopo para elevar o score.
Usar o cálculo da [política de mutação](docs/quality/mutation-testing.md).
Score insuficiente, execução incompleta ou compatibilidade por resolver impedem DONE quando o gate é aplicável.

## Terminal e evidências
Preferir rtk quando instalado e compatível; usar comando nativo equivalente quando indisponível ou incompatível e registar o motivo.
A instrução local C:\Users\victo\.codex\RTK.md é referência histórica; a preferência com fallback aqui definida substitui a obrigatoriedade anterior neste projeto. Não editar o ficheiro externo nesta operação.
Usar apenas scripts reais do package.json. Não inventar comandos de typecheck, ESLint, testes, mutação ou build.
Registar comando, ambiente, data, resultado, falhas e artefactos; não expor segredos.
Se um comando obrigatório falhar ou não puder ser executado, declarar a limitação e manter o gate pendente/falhado.

## Ciclo de sprint e tarefa
No início da sprint, apresentar objetivo, escopo, tarefas, dependências, riscos, critérios e plano de validação; aguardar aprovação.
Trabalhar numa tarefa aprovada de cada vez, salvo autorização explícita para paralelismo. Trilhas A/B/C são responsabilidades, não autorização para agentes paralelos nem serviços separados.
Estados de tarefa: BACKLOG, READY, IN_PROGRESS, BLOCKED, REVIEW, DONE. Respeitar condições de transição do [índice de sprints](docs/sprints/README.md).
Bloquear trabalho dependente de contratos não aprovados. Atualizar estados e documentação sem antecipar resultados.

Antes de cada tarefa: consultar MegaBrain e ADRs. Depois: registar problemas relevantes, causas confirmadas, correções/regressões, lições reutilizáveis e contexto atualizado quando necessário.
Não duplicar regras normativas no MegaBrain, nem inventar erros/padrões ou guardar transcrições completas, segredos e dados sensíveis.

## Qualidade e fechamento
Uma tarefa só passa a DONE com os sete [gates aplicáveis](docs/quality/quality-gates.md) satisfeitos:
1. Spec, critérios e dependências.
2. RED, GREEN e REFACTOR.
3. TypeScript typecheck, ESLint, dependências arquiteturais e build aplicáveis.
4. Integração real e migrações.
5. Mutação superior a 85%, relatório e sobreviventes analisados.
6. Qualidade da IA, fontes, citações e limitações, quando aplicável.
7. Documentação, ADR, MegaBrain e critérios de aceitação sincronizados.

Nenhum gate obrigatório pendente ou falhado permite DONE. Não aplicabilidade exige motivo e evidência; não equivale a teste aprovado.
Ao fechar sprint: verificar tarefas/gates, sincronizar docs/MegaBrain, produzir relatório, registar pendências, atualizar roadmap e solicitar aprovação explícita de encerramento. A sprint permanece REVIEW até essa aprovação.
Pergunta obrigatória de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**

## Estado e limites da operação atual
Não há aplicação implementada. Esta operação altera apenas documentação e governança.
Não criar backend, frontend, schema, migrações, chamadas de IA ou código de produção.
A inicialização histórica DOC-0001 mantém a sua evidência; specs existentes continuam em rascunho até aprovação própria.
