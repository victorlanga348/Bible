# Bounded contexts

Estado: proposta de modelação para revisão; não constitui separação implementada nem decisão de serviços.
Relaciona [PRD](../PRD.md), [glossário](../glossary.md) e [modelo conceptual](data-model.md).

## Candidatos
| Contexto proposto | Responsabilidade e vocabulário | Relações propostas |
|---|---|---|
| Navegação bíblica | Livro, capítulo, passagem, cânone e versão | Fornece seleção identificada ao estudo; depende de decisões editoriais/licenças |
| Estudo bíblico | Estudo, secção, comparação, interpretação e pergunta | Coordena a investigação com referências e incertezas |
| Biblioteca e evidência | Fonte, localização, condições de uso, cobertura e evidência | Fornece material identificável ao estudo sem decidir a interpretação |
| Histórico de investigação | Estudo guardado, continuidade e proveniência | Preserva contexto para consulta; depende da política de acesso/retenção |

A geração por IA é uma capacidade de infraestrutura usada pela aplicação, não uma autoridade sobre o domínio. A sua eventual modelação como contexto próprio requer evidência e ADR.

## Relações e linguagem
A navegação não deve assumir que todas as versões partilham identificadores e versificação. A biblioteca deve expor limites de cobertura. O estudo deve distinguir validade da referência, suporte da afirmação e interpretação.
O histórico deve preservar proveniência suficiente para evitar que mudanças na biblioteca alterem silenciosamente o sentido de um estudo anterior.

## Questões antes de aprovar
- Quem mantém o ciclo de vida de estudos e perguntas?
- Que conceitos exigem invariantes transacionais?
- Qual é a unidade de identidade de uma passagem entre versões?
- Como preservar proveniência e direitos de utilização no histórico?
- Quais relações são contratos publicados entre contextos?

Responder nas tarefas de modelação; não criar aggregates, tabelas ou eventos apenas a partir destes nomes.
