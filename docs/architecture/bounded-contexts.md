# Bounded contexts e módulos

Estado: responsabilidades dos seis módulos definidas pelo pedido mestre; aggregates, fronteiras transacionais e contratos detalhados ainda por aprovar. [ADR-0003](adr/ADR-0003-backend-modular-e-stack-prescrita.md).

| Módulo | Propriedade e vocabulário | Relação por contrato |
|---|---|---|
| biblical-canon | Book, Chapter, Verse, Translation, referência, cânone, versificação e navegação | Fornece identidades/referências validadas, sem assumir versificação comum |
| source-library | Source, SourceExcerpt, autoria/datação, proveniência, licenças e pesquisa | Fornece evidências identificadas e cobertura real |
| study | Study, StudySection, Interpretation, Evidence e versões | Consome cânone/fontes, mantém composição e proveniência do estudo |
| cross-references | Relação entre passagens, citação, alusão, paralelo e classificação profética | Usa referências canónicas e evidência da ligação |
| ai-assistant | Orquestração LLM/RAG, recuperação, conversas, validação e limites | Consome evidências/ports; fornecedor é adapter, não autoridade de domínio |
| study-workspace | Estudos guardados, notas, favoritos, histórico e recuperação de sessões | Referencia estudos/conversas por contratos; não lê tabelas alheias |

Um módulo não equivale automaticamente a bounded context de negócio ou aggregate. Os quatro contextos candidatos da baseline anterior evoluem para este mapa de responsabilidades; a separação técnica de IA não atribui autoridade histórica ao fornecedor.
Perguntas antes da implementação: propriedade de ciclo de vida, identidade de passagem entre edições, consistência e transações, preservação de proveniência/direitos, identidade/acesso e retenção. Resolver em specs/ADRs antes de campos/tabelas/events.
Referências: [PRD](../PRD.md), [linguagem](../glossary.md), [modelo](data-model.md) e [dependências](dependency-rules.md).
