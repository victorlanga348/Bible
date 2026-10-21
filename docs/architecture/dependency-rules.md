# Regras de dependência

Direção aprovada documentalmente no PLAN S00/ADR-0003; fiscalização automática implementada em S01, com evidências no [relatório](../sprints/S01/TEST_REPORT.md).

## Direção
Domain depende de conceitos internos/linguagem; Application de Domain e ports internos; Infrastructure implementa ports e pode depender das camadas internas. Presentation delega após validação de transporte. module.ts é composição NestJS.
Domain não importa NestJS, Prisma, Zod, clientes HTTP, SDKs de IA ou configuração de ambiente.
Application não depende de adapters/concretos, nem recebe tipos Prisma/respostas brutas do fornecedor como contrato.
Presentation não contém regras de negócio; entidades Prisma não substituem entidades do domínio.
Cada módulo controla os seus dados; integração entre módulos usa contratos explícitos, sem SQL/repositório/tabela de outro módulo por atalho.
Não resolver ciclos com acesso transversal silencioso, abstrações genéricas sem necessidade ou microsserviços.

## Contratos e fiscalização
Assinaturas, semântica de erro, limites, idempotência/repetição e consistência exigem desenho aprovado. Não inventar endpoints/ports para preencher pastas.
Erros técnicos são mapeados no limite adequado sem expor segredos e sem apagar causa operacional.
Verificar imports, tipos exportados, responsabilidades, ciclos e propriedade de persistência com checks executáveis em S01. Não selecionar nova dependência de fiscalização sem aprovação.
S00 revê regras documentais. Em S01, `npm run test:architecture` verifica imports/ciclos das fontes existentes e casos proibidos; os módulos de negócio serão fiscalizados quando implementados. A propriedade de tabelas e responsabilidades continua a exigir revisão técnica. Ver [gates](../quality/quality-gates.md).
