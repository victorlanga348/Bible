# Regras de dependência

Estado: limites definidos pelo utilizador; convenções concretas de pastas e fiscalização automática ainda por aprovar.

## Direção permitida
- Domínio depende apenas de conceitos internos e recursos de linguagem compatíveis com a sua independência.
- Aplicação depende do domínio e de contratos internos; não de adapters.
- Infraestrutura implementa ports e pode depender de aplicação/domínio.
- Entrada e composição NestJS ligam adapters aos casos de uso.
- Frontend comunica pelos contratos aprovados, sem acoplamento ao schema Prisma.

## Proibições
- Domínio não importa NestJS, Prisma, clientes HTTP, SDKs de IA ou configuração de ambiente.
- Casos de uso não recebem tipos de persistência ou respostas brutas de fornecedores como contrato de domínio.
- Controllers não contêm políticas bíblicas nem regras de persistência.
- Adapters não substituem decisões de negócio por comportamento específico do fornecedor.
- Dependências circulares entre contextos não são resolvidas com atalhos silenciosos.

## Contratos e erros
Ports expressam necessidades do domínio/aplicação. Assinaturas, semântica de erro e políticas de repetição exigem desenho aprovado.
Mapear erros técnicos para erros compreensíveis no limite apropriado sem expor segredos ou destruir a causa operacional.

## Verificação futura
A revisão deve inspecionar imports, tipos exportados, responsabilidades e testes de fronteira. Ferramentas automáticas de fiscalização serão selecionadas no bootstrap, sem pacote presumido.
Evidência de conformidade integra a [tarefa](../tasks/template.md) e os [gates](../quality/quality-gates.md).
