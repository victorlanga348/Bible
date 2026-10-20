# Ambientes

Estado: nenhuma infraestrutura de aplicação provisionada ou ligação PostgreSQL validada. [EXT-002](../external-actions/REQUIRED_ACTIONS.md) prepara a ação necessária à S01.

## Separação obrigatória
Desenvolvimento e testes têm configuração/dados independentes; teste usa PostgreSQL real isolado, Prisma/migrações e fixtures determinísticas. Confirmar identidade do alvo antes de qualquer limpeza, recusando bases de uso real.
Integrações externas reais usam credenciais/orçamento autorizados e dados sanitizados; ambiente pessoal/release depende de acesso/retenção/deployment aprovados (EXT-001/005/006).
Docker cliente 29.7.2 foi observado, mas o motor Linux não estava disponível na preparação de S00; isso não é prova de banco funcional. Mecanismo/versões/imagens e custos ainda por aprovar.

## Configuração e validação
Nomes de variáveis, validação Zod, segredos e origem devem ser aprovados no contrato técnico antes de implementar. Não inventar valores, criar .env sensível ou expor credenciais em logs/chat.
Bootstrap deve provar arranque/encerramento, conexão, migrações numa base isolada, transações/constraints, limpeza protegida e HTTP real. CI tem execução/evidência próprias.
[Plano S01](../sprints/S01/PLAN.md); [testes](../quality/testing-strategy.md). Release/publicação exige autorização separada e operação/recuperação verificadas.
