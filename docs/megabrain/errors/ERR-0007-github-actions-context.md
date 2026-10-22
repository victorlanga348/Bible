# ERR-0007 — Contexto job indisponível no env do job

Data:2026-10-22, primeira execução remota após push autorizado. Estado: definição corrigida e validada localmente com actionlint; execução remota da correção ainda a acompanhar. Impacto: CI não chegou a iniciar job; não é falha de Jest/PostgreSQL nem prova de testes aprovados.

## Causa e prova

O workflow original definia TEST_DATABASE_URL no env do job com a expressão job.services.postgres.ports[5432]. Nesse local GitHub Actions não disponibiliza o contexto job. [Run39718273703](https://github.com/victorlanga348/Bible/actions/runs/39718273703) apresenta Unrecognized named-value: job, linha29; API confirmou0 jobs. Parsing YAML e execução local do bloco de download aprovados antes não verificavam contextos de expressões do GitHub.

## Correção e validação

Resolver a porta num step e escrever TEST_DATABASE_URL em GITHUB_ENV para os passos subsequentes. Usar a chave de objeto string '5432', conferida pelo type checker do actionlint. Nenhuma palavra-passe adicionada ao workflow; trust permanece limitado ao serviço efémero do runner.

Ferramenta de desenvolvimento isolada: [actionlint1.7.12 oficial](https://github.com/rhysd/actionlint/releases/tag/v1.7.12), ZIP Windows amd64 SHA2566e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9 comparado ao digest publicado na API. Executado sobre o workflow do commit ed03dc5:FAIL esperado; workflow corrigido:PASS, exit0. Artefactos ignorados em reports/actionlint/ e reports/s02-t006-actionlint.json. Checkers externos opcionais shellcheck/pyflakes não instalados; não se declara que foram executados. Uma primeira revisão ainda usava índice numérico e falhou no actionlint; corrigida para string antes de PASS.

O mesmo incremento prepara o corpus bíblico pinado para os testes futuros: ZIP oficial com hash fixo e conversor stdlib. Download positivo HTTPS real e falhas HTTP/hash foram exercitados localmente em diretórios novos, sem trocar dados da execução local de mutação. Não é um novo contrato de aplicação nem um acervo de produção.

## Prevenção e limite

YAML sintaticamente válido não comprova semântica de GitHub Actions. Validar expressões e observar um run remoto antes de declarar CI PASS. Manter evidências locais e remotas separadas; não editar estados/artefactos para ocultar a execução rejeitada.
