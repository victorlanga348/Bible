# Estratégia de testes reais

Estado: política para implementação futura. Não há suites instaladas, package.json ou scripts de execução.
Versões, runner, harness e compatibilidade serão decididos em tarefas aprovadas; StrykerJS segue DEC-08 condicionada.

## Níveis
| Nível | Comprovação |
|---|---|
| Domínio | Invariantes e políticas especificadas, sem framework ou serviços externos |
| Aplicação | Casos de uso e contratos explícitos; doubles unitários identificados e integração das fronteiras afetadas |
| Persistência | PostgreSQL real isolado, Prisma e repositórios reais |
| HTTP | Aplicação NestJS inicializada, contratos e segurança aprovados |
| Externa | Suites específicas com fornecedor real, custo/quotas e variabilidade controlados |
| Interface | Comportamentos e acessibilidade; browser/API reais conforme fluxo |
| IA | Casos de referência, suporte das fontes, citações válidas e qualidade semântica |

## Persistência
Executar migrações reais, consultas, transações e restrições de integridade. Verificar resultados pelos repositórios reais, não por uma imitação em memória.
Definir isolamento e limpeza determinística entre testes. Impedir uso de bases pessoais/produção; confirmar o alvo antes de limpeza.
Fixtures determinísticas e versionadas reproduzem cenários reais. Não escolher containers ou serviço de CI sem decisão aprovada.

## HTTP
Inicializar a aplicação NestJS e verificar rotas, DTOs, validação de entradas, respostas, erros, persistência e segurança aplicáveis.
DTOs e rotas devem derivar de contratos aprovados; não inventar endpoints nos testes.
Cobrir caminhos válidos, inválidos e negados e efeitos persistidos quando existirem.

## Fixtures e doubles
Dados controlados pertencem exclusivamente ao ambiente de testes e podem permanecer versionados nos recursos de teste. Não é necessário removê-los do repositório após cada ciclo.
Não introduzir dados fictícios nos fluxos de produção. Esta política não autoriza remover dados reais ou alterar produção.
Doubles podem apoiar testes unitários de ports; não comprovam integração e não substituem permanentemente PostgreSQL, Prisma, HTTP ou fornecedores.
Gravações sanitizadas são fixtures, não chamadas reais; identificar origem, direitos e limites.

## Integrações externas e IA
Organizar suites específicas com credenciais autorizadas, orçamento, quotas, dados sanitizados e ambiente identificado.
Combinar integração real, avaliações com casos de referência, verificação de fontes e suporte semântico, deteção de citações inexistentes e limitações documentadas.
Não exigir chamadas pagas e não determinísticas em todos os ciclos locais. A dispensa no ciclo local não elimina integração real necessária antes de aceitar o adapter ou a mudança afetada.

## Evidências
Registar sprint/tarefa, critério, comando real, ambiente, versões/revisão ou estado da árvore, fixtures, saída, data, resultado e limitações.
Preferir rtk compatível; usar equivalente nativo quando necessário. Executar scripts existentes no package.json, sem inventar nomes.
Serviço obrigatório indisponível deixa gate pendente/falhado; não declarar sucesso com base apenas em mocks.
Qualidade da IA segue [avaliação própria](../ai/evaluation.md), independente do [score de mutação](mutation-testing.md).
