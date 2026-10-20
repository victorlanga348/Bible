# Stack e decisões pendentes

Estado: stack backend definida pelo utilizador; implementação ausente. Versões ainda não selecionadas.
A [ADR-0001](adr/ADR-0001-stack-e-limites-arquiteturais.md) regista a baseline, sem escolher tecnologias adicionais.

## Decisões definidas
| Área | Direção |
|---|---|
| Runtime e linguagem | Node.js e TypeScript |
| Backend | NestJS para entrada, composição e infraestrutura |
| Persistência | Prisma ORM e PostgreSQL |
| Modelação | DDD e arquitetura hexagonal |
| Domínio | Independente de NestJS, Prisma e fornecedor de IA |
| Aplicação | Casos de uso e contratos explícitos |
| IA | Orquestração no backend, fornecedores por ports, recuperação e referências |
| Qualidade | TDD estrito, infraestrutura real e mutation score superior a 85% |

## Registo de pendências
| ID | Decisão por aprovar | Impacto e momento de resolução |
|---|---|---|
| DEC-01 | Framework frontend | Antes do bootstrap da trilha C |
| DEC-02 | Fornecedor e modelos de IA | Antes dos adapters e integrações reais de IA |
| DEC-03 | Embeddings e pesquisa semântica | Antes de implementar pesquisa semântica; não assumir necessidade para toda recuperação |
| DEC-04 | Autenticação e autorização | Antes de acesso exposto e isolamento de histórico |
| DEC-05 | Infraestrutura de deploy | Antes de provisionamento e publicação |
| DEC-06 | Traduções bíblicas e licenças | Antes de importar, apresentar ou redistribuir textos |
| DEC-07 | Versões e ferramentas de build/testes | Antes do bootstrap; verificar compatibilidade e registar decisão |
| DEC-08 | Validar compatibilidade de StrykerJS | Adoção condicionada definida; validar versões/runner/configuração antes de instalar e aprovar o gate |
| DEC-09 | Âmbito do cânone e identificação de livros | Antes de catálogo bíblico e validação de referências |
| DEC-10 | Retenção, eliminação e dados enviados a fornecedores | Antes de persistir dados de utilização ou chamar fornecedores |

A evolução de DEC-08 de candidato para adoção condicionada está em [ADR-0002](adr/ADR-0002-adocao-condicional-strykerjs.md). Não há compatibilidade demonstrada ou dependências instaladas.

Aprovador inicial: utilizador. Cada resolução deve indicar alternativas, riscos, data e referência em tarefa ou ADR. Nada nesta tabela autoriza instalação, contratação ou chamadas pagas.
