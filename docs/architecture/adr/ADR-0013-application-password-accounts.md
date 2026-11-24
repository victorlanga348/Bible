# ADR-0013 — Contas próprias com email e palavra-passe

Estado: aceite para implementação sob pedido explícito do utilizador e autorização operacional vigente. Data:2026-11-24. Escopo: S10-T007, ambiente pessoal local.

## Contexto e decisão

O acesso ao estudo estruturado exigia sessão, mas a janela privilegiava Google e um token técnico. O utilizador pediu cadastro no próprio app. Acrescentar uma conta persistida PostgreSQL/Prisma, com UUID, email único normalizado e hash scrypt assíncrono de `node:crypto`, sem instalar dependências.

Reutilizar a emissão/verificação JWT e os guards existentes. Namespace `account-<uuid>` distingue estas contas de Google e do acesso técnico; não ligar identidades automaticamente por email. O cadastro entra automaticamente e confirma `/auth/me` antes de mostrar sessão ativa. Os dados privados continuam isolados pelo owner validado.

Parâmetros e transporte constam do [contrato T007](../../sprints/S10/T007_ACCOUNT_SPEC.md): scrypt32768/8/3, sal aleatório, chave64bytes, limites de tentativas/capacidade, origens locais explícitas, validação estrita e erros sanitizados. Palavra-passe não é aparada/truncada nem guardada em texto simples. JWT e senha não são persistidos no navegador.

## Alternativas e consequências

Manter Google como única entrada não satisfaz o pedido. Um fornecedor externo de identidade acrescentaria dependência e configuração ao uso local; uma senha partilhada misturaria proprietários. A tabela própria permite cadastro real, mas exige backup da base e proteção das credenciais. A migração é aditiva e não modifica estudos existentes.

Sem verificação/recuperação de email neste recorte; email serve como identificador, não prova de titularidade. Sem migração de estudos por email, refresh ou revogação individual; sessão existente de uma hora e em memória. Google e token técnico preservados. Publicação remota exigiria um desenho próprio de transporte e gestão de contas.
