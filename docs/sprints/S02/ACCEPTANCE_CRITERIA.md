# S02 — Critérios de aceitação

## Retoma integral — 2026-10-22

Matriz final: S02-AC01/02/03/04 PASS, conforme TEST_REPORT/REVIEW finais.551 testes reais/31 suites, quatro migrações e acervo66/1189/31102 confrontado; estática/build/arquitetura PASS,100% linhas/97,47% branches; mutação padrão local95,87% e CI integral95,41%, zero RuntimeError/NoCoverage. Análise causal/sobreviventes/limitações em MUTATION_ANALYSIS; IA não aplicável, sem a apresentar como PASS. Auditoria documental de encerramento precede commit autorizado. As notas de validação abaixo são históricas.

### Histórico das matrizes de validação

S02-T006/T007 retomadas pela autorização integral posterior. Esta matriz é o estado corrente; as secções seguintes preservam a entrega reduzida anterior sem apagar evidências. Sprint IN_PROGRESS, sem novo DONE enquanto os gates finais estiverem pendentes.

| Critério existente | Evidência atual | Estado corrente |
|---|---|---|
| S02-AC01 | Importação atómica/idempotente, conflitos/rollback, catálogo, navegação e texto exato demonstrados por T006; aceitação integral66/1189/31102 na baseline513 e no PostgreSQL local16.14 | PASS funcional; regressão final pendente |
| S02-AC02 | Cinco contratos Nest/Prisma/Zod/OpenAPI reais,30 E2E GREEN, sintaxe400/ausência404/falha500; entradas estritas e referências realmente existentes | PASS funcional; regressão final pendente |
| S02-AC03 | Corpus/aviso/créditos autênticos; quatro tabelas próprias, Domain sem framework, ports/adapters e arquitetura/tooling13 PASS | PASS no checkpoint; auditoria final pendente |
| S02-AC04 | Documentação/relatório em atualização, mutação local/CI e regressão final ainda pendentes; investigação de RuntimeError do harness | NOT_RUN final; impede encerramento |

I01–I03/H01 tiveram execução real em T006, conforme [TEST_REPORT](TEST_REPORT.md). A execução remota do checkpoint8055a4c passou cobertura e continua em mutação; a correção de harness6272697 tem regressão controlada própria e precisa de confirmação integral. Não transferir os scores antigos de Domain/S03 para esta retoma. Os12 testes adicionais de constraints e a aceitação HTTP integral pertencem à regressão final; número previsto de testes não é resultado executado.

Atualização após execução sequencial:526 testes/27 suites PASS, incluindo12 constraints, regressão de limpeza e aceitação HTTP integral; linhas100%/branches97,05%. AC01–03 têm regressão funcional final demonstrada. AC04 continua NOT_RUN final, pois a mutação integral CI e a revisão de encerramento estão pendentes. Logs e distinção das tentativas no TEST_REPORT.

## Histórico dos critérios do encerramento reduzido

Em2026-10-21 o utilizador aprovou: «termina, o que falta vou adicionar depois». A S02 encerra somente corpus/domínio/parser; T006/T007 voltam ao BACKLOG como adiadas. Acrescentam-se IDs únicos AC05–07 para o recorte, preservando o significado e os resultados incompletos dos critérios originais AC01–04 abaixo. Não há diminuição dos thresholds nem PASS fictício de API/persistência.

| Critério | Resultado exigido no recorte | Evidência | Estado |
|---|---|---|---|
| S02-AC05 | Corpus/aviso/catálogo/fixture reais e rastreáveis admitidos conforme pacote aprovado | T004: hashes ZIP/XML/aviso,66 livros/1189 capítulos/31102 versículos, quatro excertos exatos de teste, direitos/créditos preservados | PASS |
| S02-AC06 | Entidades/referência/parser cumprem gramática/invariantes aprovadas sem inferir existência, preservar texto e fronteiras de Domain | RED87 → GREEN53/87 → regressão152;92 novos testes; estática/build/arquitetura; cobertura100%/96,62%, mutação97,21% global/98,91% Domain | PASS |
| S02-AC07 | Gates aplicáveis à entrega, docs/revisão/pendências e autorização de encerramento coerentes | TEST_REPORT/REVIEW; decisão explícita de redução/fecho, T006/T007 adiadas; gate4 não aplicável ao Domain puro, gate6 não aplicável sem IA | PASS |

Os casos P01/P02/P03 continuam PASS no recorte AC06. I01–I03/H01 são NOT_RUN e ficam fora deste encerramento por adiamento explícito, sem dispensa de prova na futura execução. Sem IA/HTTP/persistência novos; a regressão técnica real S01 não comprova os comportamentos adiados.

## Histórico dos critérios do plano integral v0.2

A matriz a seguir preserva resultados e obrigações do escopo original anterior à redução; não é uma segunda lista de critérios ativos do fecho reduzido.

Atualização: 2026-10-21. SPEC v0.2/recorte/contratos/plano T005 aprovados pelo «ok». T004/T005 verificadas; resultados abaixo distinguem Domain concluído de Application/importação/HTTP futuros. Evidência real no TEST_REPORT; o aceite não é PASS automático da sprint.

| Critério | Resultado exigido | Evidência prevista | Estado |
|---|---|---|---|
| S02-AC01 | API consulta e valida passagens reais com cânone e textos autorizados. | Corpus/fixture admitidos, DEC-06/09 e EXT-003 resolvidas para snapshot; importação/consulta/API reais T006 ainda não executadas | NOT_RUN |
| S02-AC02 | Contratos aprovados cobrem caminhos válidos, inválidos e negados, com efeitos reais verificáveis. | P01/P02/P03 Domain PASS; importação/HTTP/persistência pendentes T006/T007 | NOT_RUN |
| S02-AC03 | Fronteiras DDD/hexagonais e propriedade modular verificadas; dados/fontes autênticos e direitos/proveniência demonstrados. | Domain/fronteiras/proveniência verificados; modelos/integrações reais bíblicas ainda não executados | NOT_RUN |
| S02-AC04 | Gates aplicáveis cumpridos, relatórios e documentação sincronizados, sem pendência crítica. | Testes reais e revisão conforme PLAN; comando/data/ambiente/artefactos por critério | NOT_RUN |

## Matriz de cenários — sem valores inventados

- Catálogo/numeração da edição: livros e limites conferidos com fonte autorizada; cobertura ausente explícita, sem equivalência automática com outra edição.
- Parser: formatos/aliases aprovados, entrada vazia/malformada/ambígua, referência existente e limites ausentes; sem corrigir a seleção silenciosamente.
- Consulta/navegação: devolver o texto real da edição selecionada; comportamento nos extremos/intervalos definido na SPEC antes de testes.
- Importação: formato/artefacto/proveniência identificados; dados inválidos/repetidos e falha parcial segundo política transacional/repetição aprovada; não alimentar produção com fixture.
- Persistência: unicidade, relações/constraints, consultas parametrizadas e rollback reais em PostgreSQL de teste guardado; modelos e namespace app comprovados quando existirem.
- HTTP: NestJS/Supertest real, Zod/OpenAPI coerentes, entradas/saídas e erros exatos do contrato aprovado, sem exposição de segredos nem acesso a módulo alheio.

Cada cenário receberá valores/expectativas a partir do corpus e decisões aprovados; não adivinhar contagens bíblicas ou formatos. Semântica aprovada na SPEC v0.2; provas de implementação são separadas por fase. Critérios de decisão e bloqueio da preparação na [ficha S02-T004](tasks/S02-T004-canon-contracts.md).

## Casos concretos v0.2 aprovados — estado de execução

| Caso | Ação/resultado exigidos | Fase/evidência e estado |
|---|---|---|
| S02-AC02-P01 | Parser aceita CODE capítulo:versículo ou intervalo no mesmo capítulo, normaliza código/espaço exterior e produz referência canónica; não presume existência | PASS T005, RED87/GREEN53/87 e regressão92, gramática da SPEC |
| S02-AC02-P02 | Recusa formato livre/ambíguo, zeros iniciais/sinais/decimais/inteiro inseguro, múltiplos capítulos ou intervalo invertido | PASS T005, falha de domínio controlada e testes de fronteira |
| S02-AC02-P03 | Entidades recusam invariantes inválidas; Verse exige referência singular e texto real/não vazio; edição/proveniência explícitas | PASS T005, fixture real/exata, arquitetura e cobertura Domain100%/100% |
| S02-AC01-I01 | Importação completa atómica; mesma identidade/hash não duplica; hash divergente ou falha parcial não altera edição existente | NOT_RUN T006, PostgreSQL/Prisma/migração/constraints/rollback reais |
| S02-AC01-I02 | Catálogo e texto iguais ao snapshot autorizado; ausência de posição/intervalo não produz texto parcial ou inventado | NOT_RUN T006, confronto com a fonte e casos de lacuna/limites reais |
| S02-AC01-I03 | Navegação anterior/próximo acompanha ordem real de capítulos/livros e devolve null nas extremidades | NOT_RUN T006, acervo e casos de transição a verificar |
| S02-AC02-H01 | Cinco operações e DTOs estritos da SPEC;200, erro400 de sintaxe,404 de ausência e500 de falha inesperada conforme caso; resolver referência não grava dados | NOT_RUN T006/T007, Nest/Supertest real, OpenAPI/Zod e efeitos persistidos |

P01/P02/P03 têm evidência executada no TEST_REPORT; restantes casos são expectativas aprovadas ainda NOT_RUN. Admissão/extração XML verificadas sem mudança de semântica; persistência/consulta/API ainda precisam de prova própria. Não transferir o PASS da S01 para os casos acima.

## Sete gates
| Gate | Obrigação |
|---|---|
| 1 | Sprint, spec/contratos, tarefas/dependências aprovados |
| 2 | RED/GREEN/REFACTOR demonstrados por comportamento |
| 3 | TypeScript strict/lint/build/arquitetura; linhas >=90%, branches >=85% |
| 4 | PostgreSQL/Prisma/migrações/HTTP reais e serviços pertinentes |
| 5 | Stryker, Mutation Score bruto >85%, relatório e sobreviventes |
| 6 | IA, fontes, suporte/citações e limitações quando aplicável |
| 7 | Docs/README, ADRs, MegaBrain, critérios e relatórios sincronizados |

Não aplicabilidade exige motivo/evidência separados de NOT_RUN; não é PASS. Serviço/credencial obrigatório ausente é BLOCKED e impede encerramento. Sem código mutável real não inventar score nem criar regras artificiais.
