# Estratégia de testes reais

Jest, Supertest e Stryker prescritos e instalados na fundação S01. Scripts, PostgreSQL local isolado e CI configurada existem; compatibilidade/resultados locais no [relatório S01](../sprints/S01/TEST_REPORT.md). Execução remota do workflow NOT_RUN.

## Níveis
| Nível | Comprovação |
|---|---|
| Domain | Regras puras aprovadas, sem infraestrutura externa |
| Application | Casos de uso/contratos; infraestrutura real como estratégia padrão |
| Persistência | PostgreSQL isolado, Prisma, migrações, consultas, repositórios, transações e restrições reais |
| HTTP/E2E | NestJS inicializado via Supertest; contratos, schemas Zod, entradas/saídas, erros, persistência e segurança |
| Externa | Suite real específica com credenciais autorizadas e custo/quotas controlados |
| IA | Regras/contratos determinísticos, integração real e avaliação semântica independente |

## Isolamento, fixtures e doubles
Base de teste independente de desenvolvimento/produção; confirmar alvo antes de limpeza determinística. Aprovar mecanismo/credenciais antes de uso.
Fixtures autênticas, identificadas, licenciadas, reproduzíveis e versionadas, exclusivas de teste. Não inventar conteúdo bíblico/histórico, alimentar produção ou remover recursos versionados após cada tarefa.
Doubles locais podem apoiar unitários específicos e são identificados; não são estratégia padrão de Application nem prova de integração. Gravações são fixtures, não chamadas reais.

## Contratos e serviços
Rotas, entradas/saídas, erros e OpenAPI exigem contrato aprovado. Não inferir endpoint por capacidade. Verificar caminhos válidos/inválidos/negados e efeitos reais.
Migrações reais numa base isolada, constraints, transações e limpeza/recuperação aprovadas. Não migrar dados reais por conveniência.
Preparar contratos/adapters/validação/tratamento de erros possíveis no escopo aprovado mesmo sem credencial; não substituir por respostas estáticas ocultamente.
Credencial/serviço obrigatório ausente: BLOCKED, nunca PASS. Registar ação externa e pedir intervenção antes da validação final. Não exigir chamadas pagas em todo ciclo local; executar suites reais necessárias à aceitação.

## Gates e evidências
Line Coverage >= 90%; Branch Coverage >= 85%; Mutation Score bruto > 85%; testes aplicáveis aprovados e zero erros de tipagem/lint.
Por critério: comando real, data, ambiente, versões/revisão, origem de fixtures, saída/artefactos e limitações.
PASS/FAIL/BLOCKED/NOT_RUN com aplicabilidade/motivo separados. Não aplicabilidade não é PASS; ferramenta obrigatória ausente não é não aplicabilidade.
Ver [gates](quality-gates.md), [mutação](mutation-testing.md), [avaliação IA](../ai/evaluation.md) e [TDD](tdd-policy.md).
