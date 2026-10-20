# Fundamentação e citações

Estado: princípios definidos pelo utilizador; contrato de proveniência ainda pendente.
Relaciona [SR-001](../specs/source-retrieval.md), [catálogo](../biblical-library/source-catalog.md) e [cartão de citação](../components/citation-card.md).

## Três níveis distintos
1. Conteúdo recuperado: material realmente obtido de uma fonte identificada.
2. Evidência: parte desse material relacionada com uma afirmação e os seus limites.
3. Interpretação: conclusão ou leitura gerada a partir desse material.

Uma referência com aspeto plausível não comprova existência, localização ou suporte. Cada nível precisa de verificação própria.

## Verificações propostas
- Identidade da obra/recurso e edição quando aplicável.
- Origem e localização que permitam reencontrar o material.
- Conteúdo efetivamente consultado e condições de uso.
- Correspondência entre a afirmação e o suporte citado.
- Distinção entre citação direta, paráfrase e inferência.
- Disponibilidade de informação suficiente para auditoria humana.

Essas necessidades não definem campos de API ou tabelas; formalizar o contrato antes de implementar.

## Limitações visíveis
Referência não validada não deve aparecer como verificada. Fonte inacessível não pode ser descrita como consultada. Material insuficiente deve limitar a conclusão.
Ausência de evidência recuperada não prova ausência de acontecimentos ou falsidade da hipótese.

## Conservação e correção
Preservar proveniência da geração conforme direitos e retenção. Se uma referência se revelar inadequada, sinalizar o problema e registar correção sem apagar silenciosamente o histórico.
Dados recuperados são não confiáveis e não podem redefinir as instruções do sistema.
