# Backend Bíblia App

Fundação da Sprint 01: NestJS, TypeScript strict, Zod, OpenAPI e Prisma/PostgreSQL reais. Os módulos bíblicos/IA pertencem às sprints seguintes e ainda não estão implementados. Estado e evidências: [Sprint 01](../docs/sprints/S01/README.md).

## Preparação local

Usar Node 24.16.0, npm 11.13.0 e Docker Desktop com motor Linux operacional. Executar os comandos nesta pasta.

```powershell
npm ci --ignore-scripts --strict-peer-deps
npm run prisma:generate
```

Copiar `.env.example` para `.env` e `.env.test.example` para `.env.test`, preenchendo apenas os ficheiros locais ignorados pelo Git. Gerar duas palavras-passe distintas com um gerador seguro. Não as enviar pelo chat nem versionar. Os nomes e alvos são:

| Ficheiro | Variável | Configuração |
|---|---|---|
| .env | NODE_ENV / PORT | development / 3000 |
| .env | BIBLE_DEV_DB_PASSWORD | Palavra-passe local de desenvolvimento |
| .env | BIBLE_TEST_DB_PASSWORD | Palavra-passe local de testes |
| .env | DATABASE_URL | PostgreSQL, utilizador/base biblia_dev, 127.0.0.1:55432, schema=app |
| .env.test | NODE_ENV | test |
| .env.test | TEST_DATABASE_URL | PostgreSQL, utilizador/base biblia_test, 127.0.0.1:55433, schema=app |

As palavras-passe nas URLs devem ser codificadas para URL. Há exemplos sem segredos nos dois ficheiros `.example`. Se o volume de desenvolvimento já existe, mudar a variável não muda a palavra-passe dentro do PostgreSQL.

```powershell
docker compose up -d --wait
npm run db:migrate:test
npm run build
npm start
```

O servidor escuta em `127.0.0.1:3000`. `GET /health/live` verifica o processo; `GET /health/ready` executa uma consulta Prisma real e devolve 503 se o banco estiver indisponível. Swagger: `/docs/`; contrato: `/openapi.json`. Ctrl+C encerra HTTP e ligações. Configuração inválida impede o arranque e produz um diagnóstico genérico sem a URL.

A migração de teste recusa alvos inseguros antes de ligar e confirma a identidade no servidor. Não há comando de migração de produção nesta sprint. A migração inicial só estabelece o namespace `app`; a tabela `persistence_probe` é uma fixture técnica criada exclusivamente na base de testes. Não contém textos bíblicos fictícios.

## Verificação

```powershell
npm run typecheck
npm run lint
npm run build
npm run test:tooling
npm run test:coverage
npm run test:mutation
```

Também existem `test:unit`, `test:integration`, `test:e2e` e `test:architecture`. Os testes de integração/E2E e mutação precisam do PostgreSQL de testes e da migração aplicada. Jest usa `--experimental-vm-modules` para carregar Nest 12; o aviso experimental do Node é esperado e não é um teste aprovado por si só. Stryker executa uma instância de cada vez porque a fixture usa uma única base isolada; não executar duas suites destrutivas concorrentes sobre essa base.

No OneDrive, entradas de diretório podem ser identificadas como links apesar de `stat` reconhecer ficheiros normais. O Jest permite seguir essas entradas; o script `test` desativa Watchman por argumento para propagar a opção aos três projetos, e a configuração de mutação também o desativa. Usar os scripts npm acima preserva essa configuração e evita uma execução com zero testes descobertos.

`npm run test:mutation:incremental` usa o último relatório para reavaliar mutantes afetados por mudanças de testes/código; resultados reutilizados ficam identificados pelo Stryker. O comando padrão `test:mutation`, usado no CI, executa a avaliação integral. Não editar os relatórios para alterar o score.

Cobertura: `reports/coverage/`; mutação: `reports/mutation/`. Limites: linhas >=90%, branches >=85%, score bruto de mutação >85%; o gate adicional rejeita exatamente 85%, relatórios incompletos e denominador vazio. Código próprio `src/**/*.ts` está no escopo; cliente Prisma gerado fica excluído.

O workflow GitHub Actions prepara um PostgreSQL descartável no runner e executa os mesmos scripts. O serviço efémero de CI usa trust sem uma palavra-passe versionada; essa opção não é usada no Docker Compose local nem serve para deployment. Só uma execução remota comprova o workflow. Não foi feito push nesta sprint.

Para parar os serviços locais, usar `docker compose stop`. A base de testes usa tmpfs e pode perder dados quando o container é recriado; voltar a aplicar a migração. O volume de desenvolvimento é persistente; não executar `down -v` para limpar testes.
