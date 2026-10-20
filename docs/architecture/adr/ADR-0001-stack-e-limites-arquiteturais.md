# ADR-0001 — Stack backend e limites arquiteturais

Estado: aceite por decisão explícita do utilizador.
Data de registo: 2026-10-17.
Decisor: utilizador.
Referência: pedido mestre desta sessão, secção 3, e confirmação da inicialização documental; registo em [DOC-0001](../../tasks/DOC-0001-inicializacao-governanca.md).
Implementação: não iniciada.

## Contexto
A plataforma deve sustentar estudo bíblico verificável, persistência e orquestração de IA sem ligar o domínio a tecnologias externas.

## Decisão fornecida
Usar Node.js, TypeScript, NestJS, Prisma ORM e PostgreSQL. Aplicar DDD e arquitetura hexagonal.
NestJS serve entrada, composição e infraestrutura. Domínio permanece independente de NestJS, Prisma e fornecedores de IA. Aplicação organiza casos de uso e contratos; infraestrutura implementa adapters.
Orquestração de IA integra o backend e abstrai fornecedores por ports.

## Alternativas
A stack foi prescrita pelo utilizador; não foi feita comparação empírica com outros frameworks, ORMs ou bases de dados. Não apresentar essa comparação como realizada.

## Consequências e trade-offs
Há separação explícita entre regras e tecnologia, com custo de desenhar ports, mapeamentos e testes de integração. A persistência exige PostgreSQL real e migrações verificadas.
As trilhas A, B e C não implicam serviços separados. Não se decide frontend, fornecedor de IA, embeddings, autenticação, deploy, versões ou licenças.

## Validação e continuidade
Aplicar [regras de dependência](../dependency-rules.md) e [gates](../../quality/quality-gates.md) em cada implementação. Decisões adicionais usam ADR própria; ver [pendências](../stack.md).
