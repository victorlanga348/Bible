# S10 — Plano de integração

Aceite por decisão delegada2026-10-30 sob pedido explícito «faz a tua parte» e instrução posterior para criar uma branch para o trabalho novo. Decisões concretas seguintes são do agente, não escolhas anteriores atribuídas ao utilizador.

Objetivo: uma aplicação pessoal local utilizável no navegador, com API real, sessão Google na interface, estudos/notas/favoritos/conversa persistentes e cancelamento correto. A ampliação de IA exige contrato e avaliação próprios antes de alterar o perfil pinado; começar pela integração existente.

Escopo sequencial: T001 comunicação /api e prova de leitura; T002 sessão Google integrada/isolamento; T003 percursos completos e correções funcionais, incluindo contexto de estudo e cancelamento; T004 investigar e implementar a ampliação local viável de IA com contrato/fontes/avaliações antes de código; T005 gates e documentação. Uma tarefa de cada vez, sem agentes. Sem main, force push, reescrita de commits frontend ou alteração de credenciais/serviços alheios. O pedido novo prevalece sobre a indicação histórica de trabalhar somente na branch backend.

Dependências: frontend5210a54/React19/Vite8.3.5/Vitest5, backend Google f3bd642, correções CI31823b2/db7f08d, PostgreSQL de teste isolado, fontes/modelos locais admitidos. Trazer somente os ficheiros de CI necessários da branch backend por seleção explícita e registar proveniência; não fazer merge automático nem sobrescrever documentação frontend.

Estratégia T001: prefixo same-origin /api no navegador; proxy Vite dev/preview para backend loopback. Vantagem: resolve a fronteira confirmada sem liberar CORS global; custo: build estático isolado precisa de proxy/hospedagem correspondente. Alternativa CORS permitido por origem exigiria mudança de backend sem necessidade nesta etapa. Não anunciar deploy público pronto por ter vercel.json.

Riscos: token público em variável VITE, sessão de owner anterior em cache, contratos assumidos, cancelamento apenas visual e testes que só verificam constantes. Mitigações nas tarefas próprias: tokens somente em memória e validação /auth/me, limpeza de dados privados na troca de sessão, contratos reais e percurso navegador→API→PostgreSQL→UI. Não usar dados fabricados como corpus nem testes técnicos de transporte como prova de negócio.

Validação: testes afetados RED/GREEN, typecheck/lint/build, HTTP e browser reais, testePG independente para escritas, cobertura>=90%linhas/85%branches e mutação bruta>85% com inventário/estados íntegros. Ferramentas/dependências de qualidade em falta exigem justificação/versionamento antes de instalação, sem trocar silenciosamente o gate. IA nova exige revisão semântica real; modelo/corpus/quota não disponíveis é BLOCKED. Não repetir inferência antiga ou suites integrais por alterações só documentais.

Fecho: [sete gates](../../quality/quality-gates.md), evidências e preservação, documentação coerente, commit/push na branch nova autorizados pelo pedido vigente. Consentimento Google pessoal adiado não bloqueia trabalho independente, mas impede alegar integração de conta real PASS.
