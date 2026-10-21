# Ambientes

Estado: Docker Desktop Linux local, PostgreSQL dev/test isolados e ligação Prisma real validados em S01. [EXT-002](../external-actions/REQUIRED_ACTIONS.md) resolvida localmente; CI configurada, execução remota NOT_RUN. Procedimento no [backend](../../backend/README.md).

## Separação obrigatória
Desenvolvimento e testes têm configuração/dados independentes; teste usa PostgreSQL real isolado, Prisma/migrações e fixtures determinísticas. Confirmar identidade do alvo antes de qualquer limpeza, recusando bases de uso real.
Integrações externas reais usam credenciais/orçamento autorizados e dados sanitizados; ambiente pessoal/release depende de acesso/retenção/deployment aprovados (EXT-001/005/006).
Na preparação de S00 o motor Linux não estava disponível. Em S01 foi iniciado após escolha de Docker Desktop pelo utilizador; PostgreSQL 17.11 fixado por digest, portas 55432/55433 em loopback e credenciais distintas ignoradas pelo Git. Base de desenvolvimento tem volume persistente; teste usa tmpfs e exige reaplicar migração após recriação.

## Configuração e validação
Nomes de variáveis, validação Zod e alvos técnicos na [SPEC S01](../sprints/S01/SPEC.md). Valores privados ficam apenas nos ficheiros locais ignorados; exemplos versionados não contêm credenciais. Não expor segredos em logs/chat.
Bootstrap tem provas locais de arranque/encerramento, conexão, migração isolada, transações/constraints, limpeza protegida e HTTP real no [relatório S01](../sprints/S01/TEST_REPORT.md). CI tem execução/evidência próprias.
[Plano S01](../sprints/S01/PLAN.md); [testes](../quality/testing-strategy.md). Release/publicação exige autorização separada e operação/recuperação verificadas.
