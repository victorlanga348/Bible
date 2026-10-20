# Bíblia App

Plataforma planeada de estudo bíblico histórico, contextual e comparativo, assistida por IA. A IA apoia a investigação; as respostas devem distinguir factos documentados, inferências, tradições interpretativas e hipóteses.

## Estado real
Em 2026-10-17, a inicialização documental está concluída e validada. Existem documentação, propostas e regras de governança; não existe backend, frontend, base de dados configurada ou funcionalidade implementada. Não há comandos de instalação ou execução da aplicação definidos.

O utilizador confirmou a inicialização e o plano de atualização documental para gestão por sprints. Specs de funcionalidades e contratos continuam em rascunho ou pendentes de aprovação. A atualização não autoriza implementação nem encerra sprints automaticamente.

## Direção definida
- Backend: Node.js, TypeScript, NestJS, Prisma ORM e PostgreSQL; versões por selecionar.
- DDD e arquitetura hexagonal, com domínio independente de framework, persistência e fornecedores de IA.
- TDD estrito, integração com infraestrutura real e mutation score superior a 85% no escopo aplicável.
- Estudo estruturado seguido de perguntas livres; cobertura bíblica inteira e biblioteca de fontes progressiva.

Frontend, fornecedor e modelos de IA, embeddings, autenticação, deploy e traduções/licenças permanecem pendentes.

## Documentação e colaboração
Começar pelo [índice](docs/README.md), pelo [PRD](docs/PRD.md) e pela [governança documental](docs/documentation-governance.md).
Agentes devem ler [AGENTS.md](AGENTS.md); a entrada alternativa é [GEMINI.md](GEMINI.md).

Consultar [arquitetura](docs/architecture/README.md), [specs](docs/specs/README.md), [qualidade](docs/quality/README.md), [backlog](docs/tasks/backlog.md) e [MegaBrain](docs/megabrain/README.md).
O [registo de inicialização](docs/tasks/DOC-0001-inicializacao-governanca.md) preserva a entrega anterior. A atualização atual está em [S00-T001](docs/sprints/S00/tasks/S00-T001-atualizacao-governanca.md).

## Desenvolvimento por sprints
Consultar [S00–S09](docs/sprints/README.md), [plano mestre](docs/roadmap/master-plan.md) e [correspondência de tarefas](docs/roadmap/traceability.md).
Antes de código, aprovar a sprint, a spec e o plano da tarefa. Só usar scripts reais de package.json quando existir; neste momento não há comandos de aplicação para executar.
Aplicar os [sete gates](docs/quality/quality-gates.md), incluindo typecheck/ESLint/build, integração real e mutação estritamente superior a 85% quando aplicáveis.
StrykerJS foi adotado sob condição de compatibilidade; não instalado. Preferir rtk compatível com alternativa nativa quando necessário.
S00-T001 está DONE após validação documental; S00 permanece REVIEW à espera de aprovação explícita de encerramento. As restantes sprints não foram iniciadas.
