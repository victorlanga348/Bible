# Stack e decisões

Stack prescrita no pedido mestre e consolidada em S00. Fundação implementada, validada e aceite no encerramento S01 em backend/; escolhas concretas e alternativas na [SPEC S01](../sprints/S01/SPEC.md).
[ADR-0001](adr/ADR-0001-stack-e-limites-arquiteturais.md)/[ADR-0002](adr/ADR-0002-adocao-condicional-strykerjs.md) preservadas; evolução na [ADR-0003](adr/ADR-0003-backend-modular-e-stack-prescrita.md).

## Prescrito pelo utilizador
Node.js LTS compatível, TypeScript strict, NestJS, REST, OpenAPI/Swagger, Zod, Prisma, PostgreSQL, pesquisa textual nativa; pgvector quando necessário à pesquisa semântica.
DDD, arquitetura hexagonal, monólito modular, SOLID e inversão de dependências. Seis módulos do [mapa](bounded-contexts.md).
Jest, Supertest, Stryker Mutator, testes reais e avaliações de IA. Line Coverage >= 90%; Branch Coverage >= 85%; Mutation Score bruto > 85%. Ferramentas fixadas e instaladas em S01; resultados não devem ser inferidos da instalação.
Sem Redis, microsserviços, filas externas ou outras tecnologias adicionais sem necessidade e aprovação.

## Estado das decisões
| ID | Situação | Momento |
|---|---|---|
| DEC-01 | Frontend adiado, fora do ciclo backend | Novo ciclo aprovado |
| DEC-02 | Fornecedor/modelos de geração, orçamento e credenciais | Antes do adapter/avaliação reais S05 |
| DEC-03 | Modelo/dimensão de embeddings e desenho de recuperação; pgvector prescrito quando necessário | Antes de indexação semântica S05 |
| DEC-04 | Autenticação/autorização e proteção do uso privado | Antes de exposição/dados pessoais |
| DEC-05 | Alojamento, backups/recuperação e publicação | Antes de preparação de release S08; publicação separada |
| DEC-06 | Bíblia Livre/porbr2018/CC BY4.0, snapshot/aviso/fixture admitidos para usos S02 v0.2 | «ok» explícito em 2026-10-21; SPEC S02 e EXT-003. Outras edições/IA fora do aceite |
| DEC-07 | Matriz implementada em S01: npm/lockfile, Node24/TS6/Nest12/Prisma7, Docker PostgreSQL17, CommonJS com module Node20 | Revisão final aceite em 2026-10-21; ver SPEC/TEST_REPORT |
| DEC-08 | Stryker10/Jest30 executados: dry run60 e mutação integral95,93% aprovados, análise no TEST_REPORT | Aceitação formal final S01 recebida em 2026-10-21 |
| DEC-09 | Recorte protestant-66, catálogo/ordem/códigos USFM/versificação do XML porbr2018; parser estrito da SPEC S02 | «ok» explícito em 2026-10-21 e inventário real66/1189/31102; Domain/parser T005 verificados, Application pendente |
| DEC-10 | Retenção/eliminação, acesso ao histórico e envio ao fornecedor | Antes dos dados/chamadas afetados |

Jest/Zod/OpenAPI/monólito não são escolhas abertas. DEC-07/08 estão concretizadas, validadas tecnicamente e aceites na revisão final S01 pelo utilizador em 2026-10-21; futuras incompatibilidades de Stryker bloqueiam, não autorizam substituição.
Registo de [ações externas](../external-actions/REQUIRED_ACTIONS.md) ligado aos índices. Cada decisão exige origem/aprovador/data, alternativas/riscos e evidência; não contratar serviços nem inferir credenciais.
