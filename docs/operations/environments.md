# Ambientes

Estado: proposta de separação; nenhuma infraestrutura provisionada, variável configurada ou dependência instalada.

## Necessidades
- Desenvolvimento local: configuração explícita, dados autorizados e sem segredos no repositório.
- Testes: PostgreSQL real isolado, Prisma real, migrações e fixtures determinísticas.
- Integração externa controlada: credenciais de teste autorizadas, orçamento e dados sanitizados.
- Utilização efetiva: ambiente e proteção a decidir em DEC-04/DEC-05.

Não pressupor staging, containers, cloud ou CI específicos.

## Configuração futura
Inventariar nomes de variáveis, finalidade, obrigatoriedade e armazenamento apenas após definição dos adapters.
Nunca documentar valores de segredos. Validar que testes não apontam para bases de utilização real.
Aprovar versões, configuração, migrações, retenção, backup e recuperação antes de publicação.

## Evidência de prontidão
Bootstrap reproduzível, conexão real verificada, migrações aplicadas em teste, falhas compreensíveis e recuperação ensaiada.
As [tarefas](../tasks/backlog.md) PLAN-006 e PLAN-011 preparam este trabalho; não existe comando de arranque aprovado.
