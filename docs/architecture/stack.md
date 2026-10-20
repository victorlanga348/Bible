# Stack e decisões

Atualização aprovada: pedido mestre e «ok» de 2026-10-20 ao PLAN S00. Implementação ausente.
[ADR-0001](adr/ADR-0001-stack-e-limites-arquiteturais.md)/[ADR-0002](adr/ADR-0002-adocao-condicional-strykerjs.md) preservadas; evolução na [ADR-0003](adr/ADR-0003-backend-modular-e-stack-prescrita.md).

## Prescrito pelo utilizador
Node.js LTS compatível, TypeScript strict, NestJS, REST, OpenAPI/Swagger, Zod, Prisma, PostgreSQL, pesquisa textual nativa; pgvector quando necessário à pesquisa semântica.
DDD, arquitetura hexagonal, monólito modular, SOLID e inversão de dependências. Seis módulos do [mapa](bounded-contexts.md).
Jest, Supertest, Stryker Mutator, testes reais e avaliações de IA. Line Coverage >= 90%; Branch Coverage >= 85%; Mutation Score bruto > 85%. Nada instalado.
Sem Redis, microsserviços, filas externas ou outras tecnologias adicionais sem necessidade e aprovação.

## Decisões pendentes
| ID | Situação | Momento |
|---|---|---|
| DEC-01 | Frontend adiado, fora do ciclo backend | Novo ciclo aprovado |
| DEC-02 | Fornecedor/modelos de geração, orçamento e credenciais | Antes do adapter/avaliação reais S05 |
| DEC-03 | Modelo/dimensão de embeddings e desenho de recuperação; pgvector prescrito quando necessário | Antes de indexação semântica S05 |
| DEC-04 | Autenticação/autorização e proteção do uso privado | Antes de exposição/dados pessoais |
| DEC-05 | Alojamento, backups/recuperação e publicação | Antes de preparação de release S08; publicação separada |
| DEC-06 | Traduções, edições e licenças | Antes da importação/uso S02 |
| DEC-07 | Matriz de versões compatíveis, gestor de pacotes, build, isolamento e CI | Antes de instalar/bootstrap S01 |
| DEC-08 | Compatibilidade/configuração real de Stryker com Jest | Antes da aceitação do gate de código S01 |
| DEC-09 | Cânone, nomes/identidades, capítulos/versículos e versificação | Antes do catálogo/parser S02 |
| DEC-10 | Retenção/eliminação, acesso ao histórico e envio ao fornecedor | Antes dos dados/chamadas afetados |

Jest/Zod/OpenAPI/monólito já não são escolhas abertas. DEC-07/08 continuam sem versões/prova real; incompatibilidade de Stryker bloqueia, não autoriza substituição.
Registo de [ações externas](../external-actions/REQUIRED_ACTIONS.md) ligado aos índices. Cada decisão exige origem/aprovador/data, alternativas/riscos e evidência; não contratar serviços nem inferir credenciais.
