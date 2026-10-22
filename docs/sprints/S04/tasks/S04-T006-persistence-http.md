# S04-T006 — Construção, persistência, versões e HTTP

Estado: BLOCKED na predecessora; plano preparado, depende de T005 concluída. Execução delegada, stack existente mais JOSE previamente justificada. Código em study/{application,infrastructure,presentation}, module.ts; infraestrutura técnica auth partilhada; tabelas próprias em app. Sem serviço ou tabela alheia por acesso direto.

Plano: migração aditiva study_record/study_version; ports próprios e adapter Prisma; construção por CanonLibrary/SourceLibrary públicos; criação/revisão atómicas e leitura autorizada com projeção de direitos atuais. POST studies, GET studies/:id e POST studies/:id/versions estritos Zod/OpenAPI conforme SPEC. Emissão de token apenas CLI local, com diagnóstico sem chave/token no log do agente. Não importar fixtures no desenvolvimento.

TDD real: schema/PK/FK/unique/checks com verificações executáveis; depois tests-before de construção e persistência usando PostgreSQL guardado. RED antes de handlers; GREEN mínimo. Percursos: referência existente/ausente/inválida; contextos/limitações e evidências reais; owner A/B, token ausente/inválido; versão1/2 recuperáveis; duas revisões concorrentes: uma201/uma409, sem perder snapshot; rollback real e indisponibilidade500; fonte revogada redigida, ausência/falha técnica distintas. GET não gera nova versão nem chama IA.

Vantagem: snapshots imutáveis, acesso e direitos reavaliados; custo: mais validação ao ler histórico e tabelas de versões. Alternativa de sobrescrever um JSON único é rejeitada porque apagaria proveniência; transação longa em torno de serviços externos não é necessária. Risco de limpar banco errado: guard/identidade antes de qualquer fixture; limpar só tabelas próprias, sem dev/reset/volume. Falha obrigatória impede DONE.

Saída: provas reais Application/Nest/Prisma, contratos/erros/OpenAPI, checks/gates, docs e MegaBrain atualizados. Desenvolvimento recebe migração somente após prova de teste e alvo confirmado, sem declarar release remota implícita.
