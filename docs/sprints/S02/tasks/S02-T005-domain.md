# S02-T005 — Domínio bíblico e parser de referências

Data: 2026-10-21. Trilha A, prioridade alta. Responsável: agente executor; aprovador: utilizador. Estado atual DONE técnico após revisão/gates; READY após T004, IN_PROGRESS ao iniciar RED. Uma tarefa por vez, branch feat/biblia-backend. Commit S02 PENDING, sem autorização de commit/push/merge.

## Aprovação e dependências

O «ok» do utilizador após a apresentação da SPEC v0.2, pacote editorial e plano T005 aprova esse escopo/contratos/plano. S01 DONE/commitada. T004: corpus XML e aviso obtidos/verificados; 66 livros/1.189 capítulos/31.102 versículos reais, hashes e fixture autêntica rastreáveis. [SPEC](../SPEC.md), [PLAN](../PLAN.md) e [fixture](../../../../backend/test/fixtures/biblical-canon/porbr2018/README.md) são as referências, sem criar novas regras nesta ficha.

Consultados ADR-0003/0004, fronteiras, TDD/testes/mutação, ERR-0001 e índices de padrões/armadilhas. Stack existente e Node24/TypeScript strict/Jest/Stryker comprovados; nenhuma dependência nova, tecnologia ou skill específica adicional necessária para domínio puro. Sem subagentes.

## Entrega, ficheiros e exclusões

Implementar Translation, Book, Chapter, Verse, PassageReference e parser puros conforme invariantes/gramática aprovadas. Domain não consulta catálogo/banco nem presume existência de uma referência. Texto real preservado; nomes/metadados vêm da fixture admitida, não são inventados.

Ficheiros: backend/src/modules/biblical-canon/domain/{translation,book,chapter,verse,passage-reference,reference-parser}.ts; erro de domínio e helper privado de invariantes partilhadas somente se necessário para os conceitos existentes; testes em backend/test/unit/biblical-canon/. Sem ports vazios, casos Application, controllers/rotas, Prisma/migrações, importador de produção ou nova dependência. T006 reúne orquestração/adapters reais; estes não são simulados como integração em T005.

## Alternativas e impacto

Domínio puro próprio permite controlar gramática e invariantes sem SDKs; custo é manter testes explícitos. Parser externo introduziria dependência/licença e linguagem implícita fora do recorte aprovado; não adotado. Classes pequenas/objetos de valor preservam invariantes; evitar base class/repositório genérico. Helpers são apenas funções internas usadas por estes conceitos, sem abstrações para futuro hipotético.

Riscos: testar apenas exemplos válidos; normalizar caracteres/texto indevidamente; confundir ordem/identidade/edição; mutação insuficiente. Mitigar com casos inválidos/fronteiras aprovados, comparação exata da fixture, edição explícita, fiscalização AST/ciclos, cobertura e análise de sobreviventes. Sem ambiente de produção afetado.

## Critérios e RED → GREEN → REFACTOR

1. Referência/parser: aceitar as duas formas aprovadas, remover espaço exterior/normalizar código ASCII, preservar edição, canonizar intervalo singular; recusar sinais/zeros iniciais/decimais/expoente/inteiro inseguro, espaços internos/nomes livres e intervalos invertidos. Parser estrutural não afirma existência de livro/verso.
2. Entidades: validar invariantes da SPEC; Verse apenas singular/texto não vazio; preservar texto exato do XML e metadados/identidades explícitos; data/URL/checksum válidos.
3. Escrever teste antes de cada família; assinaturas/stubs mínimos podem permitir compilação, mas RED exige falha por comportamento ausente/errado, sem contar import/sintaxe/ambiente. Guardar comandos/saídas/contagens em TEST_REPORT/artefactos locais.
4. GREEN mínimo por família e regressão; REFACTOR sem novos comportamentos, repetindo testes e fiscalização. Reforços posteriores de mutação são registados como tais, sem simular RED original.

Comandos reais em backend/: `npm run test:unit -- --testPathPatterns=biblical-canon`, `typecheck`, `lint`, `build`, `test:architecture`, `test:tooling`, `test:coverage` e `test:mutation`. RTK quando compatível. Não executar suites destrutivas simultâneas sobre a base partilhada. Configuração Jest preserva descoberta OneDrive e VM modules.

## Gates, dados e saída

Exigir linhas>=90%, branches>=85%, mutação bruta>85% sem exclusão de código próprio; zero erros TypeScript/lint/testes obrigatórios. Relatório e sobreviventes reais. Unidade de Domain não precisa de integração de banco; a regressão global da fundação mantém a evidência real quando executada. IA não aplicável. Nenhum double de repositório é necessário à tarefa pura.

Atualizar critérios/report/revisão/índices/contexto com estados reais; lições apenas se ocorrer problema confirmado. Task DONE só após gates/critérios aplicáveis; sprint continua em execução/revisão até autorização própria de encerramento. O «ok» atual não autoriza commit S02 nem planos detalhados futuros além deste escopo.

## Evidência final e revisão técnica

Critérios1/2 PASS: parser/referência e entidades conforme SPEC, sem existência inferida e texto real exato. Critério3/4 PASS: RED87 por comportamento ausente, GREEN53/87, regressão92 T005/152 totais, tooling13/arquitetura e estática/build aprovados. Cobertura100% linhas/96,62% branches global, Domain100%/100%; mutação bruta97,21% global/98,91% Domain, relatório válido e sobreviventes analisados. Comandos, ambiente, artefactos e falha/correção do primeiro relatório no [TEST_REPORT](../TEST_REPORT.md).

Gates1/2/3/5 aprovados; gate4 não aplicável ao Domain sem infraestrutura nova (regressão real técnica passou, sem antecipar integração bíblica); gate6 não aplicável sem IA; gate7 aprovado tecnicamente por sincronização/checks documentais. [REVIEW](../REVIEW.md) regista impactos/limites. Correção confirmada de colisão Stryker no MegaBrain ERR-0002, sem exclusões artificiais ou novo contrato de negócio.

T005 está incluída no encerramento reduzido autorizado posteriormente por «termina, o que falta vou adicionar depois». [T006](S02-T006-integration.md)/T007 ficam adiadas no BACKLOG, sem implementação iniciada. Pergunta de fechamento: **"Existe alguma alteração no projeto que não esteja refletida em /docs ou no README?"**
