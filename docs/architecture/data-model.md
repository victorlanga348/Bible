# Modelo de dados

Estado: mapa conceptual para os restantes módulos; responsabilidades consolidadas em S00 por ADR-0003. Modelo lógico das quatro tabelas biblical-canon aprovado na SPEC v0.2 S02; transposição Prisma/migração ainda não implementada.
As designações abaixo não são contratos de persistência.

Histórico da preparação S02-T004, proposta v0.2 de 2026-10-21: a [SPEC S02](../sprints/S02/SPEC.md) concretiza quatro tabelas propostas de propriedade biblical-canon, chaves/relações/constraints, metadados de proveniência e transação/idempotência de importação. Não há schema/migração de negócio aprovado ou implementado; o namespace técnico da S01 já existe. Campos propostos permanecem na SPEC para revisão antes de transposição para Prisma.
Aceite posterior: o «ok» do utilizador aprovou a SPEC v0.2/recorte e plano T005. Domain/referências puros foram implementados; transposição física das tabelas/migrações/casos de aplicação só na T006 com plano detalhado aprovado. Nada nesta implementação de entidades comprova persistência de negócio; o corpo conceptual abaixo permanece para os restantes módulos.

## Conceitos a modelar
| Conceito | Necessidade de produto | Restrições a esclarecer |
|---|---|---|
| Passagem e versão | Localizar o texto estudado | Cânone, versificação, direitos e identificação |
| Estudo | Reunir análise e limitações | Ciclo de vida, critérios de completude e falhas parciais |
| Afirmação e evidência | Relacionar conclusão e suporte | Distinção entre referência válida e suporte efetivo |
| Fonte e localização | Verificar o material utilizado | Proveniência, edição, licença e disponibilidade |
| Interpretação | Representar leituras divergentes | Rótulos, fundamento e incerteza |
| Pergunta e resposta | Continuar uma investigação | Associação ao estudo e proveniência das novas respostas |
| Histórico | Recuperar estudos anteriores | Identidade, acesso, retenção e eliminação |

## Invariantes de domínio a detalhar nas specs
- Uma referência apresentada como validada deve ter verificação rastreável.
- Evidência recuperada e texto gerado devem permanecer distinguíveis.
- Falta de fontes deve poder ser representada sem inventar suporte.
- Consulta de histórico não deve regenerar respostas silenciosamente.
- Condições de utilização das fontes devem acompanhar decisões de armazenamento e apresentação.

## Aprovação do modelo lógico e físico
Antes de criar Prisma, documentar entidades, atributos justificados, identificadores, cardinalidades, nulabilidade, integridade referencial, transações, índices, retenção e migração/recuperação.
Relacionar cada escolha com a spec e os testes necessários. Rever [histórico](../specs/study-history.md), [fontes](../specs/source-retrieval.md) e [autenticação](../integrations/auth.md).

Cada migração futura deve atualizar este documento e ter execução real num PostgreSQL isolado. Não tratar esta descrição como schema implementado.

## Propriedade modular consolidada
biblical-canon: Book/Chapter/Verse/Translation e referência; source-library: Source/SourceExcerpt e direitos/proveniência; study: Study/StudySection/Interpretation/Evidence/versionamento; cross-references: ligações justificadas entre passagens; ai-assistant: conversas/mensagens e orquestração; study-workspace: notas/favoritos e recuperação de estudos/sessões.
Identidades, cardinalidades, campos e limites transacionais permanecem por especificar. Workspace referencia estudo por contrato e não duplica a propriedade do estudo; conversa não equivale à versão do estudo.
Não criar schema de negócio na S01 para aparentar persistência real. A prova técnica de persistência terá contrato próprio e dados controlados, sem textos bíblicos/históricos fictícios.
