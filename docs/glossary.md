# Glossário

Consolidação backend S00, 2026-10-20: termos abaixo são linguagem conceptual, não campos aprovados.
Book/Chapter/Verse/Translation: livro/capítulo/versículo/edição textual, sempre associados ao cânone e à versificação decididos.
Source/SourceExcerpt: fonte e excerto identificados com proveniência/direitos; Evidence: suporte verificável de uma afirmação, distinto da mera existência de uma referência.
Study/StudySection: estudo e secção persistíveis/versionados; Interpretation: leitura fundamentada com tradição/incerteza, distinta de facto documentado.
Cross-reference: relação justificada entre passagens, com natureza explícita; Workspace: notas/favoritos/histórico e recuperação; conversa: sequência contextual ligada ao estudo, sem o regenerar silenciosamente.
Facto documentado, inferência, tradição interpretativa e hipótese devem continuar distinguíveis. Ver [mapa modular](architecture/bounded-contexts.md).

Estado: vocabulário inicial; refinar com a aprovação das specs e dos contextos.

| Termo | Significado no projeto |
|---|---|
| Passagem | Unidade selecionada para estudo; regras de intervalos e identificação dependem da spec aprovada |
| Texto bíblico | Texto de uma edição/tradução identificada, separado da resposta gerada e sujeito a licença |
| Estudo estruturado | Análise organizada de uma passagem com contexto, evidências, interpretações e limites |
| Contexto imediato | Relação da passagem com o texto que a rodeia |
| Argumento do livro | Progressão literária que enquadra a passagem no conjunto do livro |
| Evidência | Material identificável que sustenta uma afirmação, com limites de verificação explícitos |
| Facto documentado | Afirmação sustentada por evidência identificada; não significa certeza absoluta |
| Inferência | Conclusão derivada de evidências, com raciocínio e incerteza explicitados |
| Tradição interpretativa | Leitura situada numa escola ou comunidade; não equivale a consenso |
| Hipótese | Explicação provisória que exige confirmação |
| Cumprimento histórico | Alegação de correspondência com acontecimentos históricos, sujeita a evidência |
| Interpretação messiânica | Leitura relacionada com o Messias, identificada como interpretação |
| Interpretação escatológica | Leitura relativa às realidades últimas, sem conversão automática em facto histórico |
| Fonte | Obra, documento ou recurso cuja identidade e condições de uso podem ser verificadas |
| Referência | Identificação de uma fonte; por si só não comprova que sustenta uma afirmação |
| Citação | Ligação de uma afirmação a uma localização identificável numa fonte |
| Grounding / fundamentação | Relação explícita entre resposta e material recuperado |
| Bounded context | Fronteira de um modelo e do seu vocabulário; não obriga a serviço separado |
| Port | Contrato interno que expressa uma necessidade ou capacidade sem dependência tecnológica |
| Adapter | Implementação que liga um port a framework, persistência ou serviço externo |
| Spec | Especificação de comportamento com estado e critérios verificáveis |
| ADR | Registo de decisão arquitetural com contexto, alternativas, consequências e aprovação |
| MegaBrain | Memória operacional de erros, lições e decisões de continuidade |
| Mutation score | Percentagem de mutantes detetados segundo o cálculo e o escopo documentados |
| Fixture | Dados controlados e versionados de teste, sem simular silenciosamente comportamento de integração |

## Gestão operacional
| Termo | Significado |
|---|---|
| Sprint | Unidade de escopo e aceitação identificada por Sxx, com aprovação de início e encerramento |
| Tarefa de sprint | Trabalho Sxx-Txxx com spec, plano, dependências, critérios e evidências próprios |
| Trilha | Responsabilidade A, B ou C; não implica serviço separado ou autorização de paralelismo |
| Gate | Verificação obrigatória aplicável antes de DONE, com resultado e evidência |
| READY | Estado em que aprovações e dependências permitem iniciar a tarefa |
| BLOCKED | Impedimento conhecido com motivo e condição de desbloqueio |
| REVIEW | Evidências/entrega em revisão; para sprint, aguarda aprovação de encerramento |
| DONE | Tarefa com gates e critérios satisfeitos; sprint também exige encerramento aprovado |

Regras de transição em [sprints](sprints/README.md); cálculo de mutação em [qualidade](quality/mutation-testing.md).
