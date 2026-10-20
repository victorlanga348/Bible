# Avaliação de qualidade da IA

Estado: dimensões exigidas pelo produto; rubrica, corpus e limiares operacionais propostos, sujeitos a aprovação antes da implementação.
Nenhuma avaliação foi executada nesta etapa.

## Dimensões separadas dos testes de software
| Dimensão | O que examinar |
|---|---|
| Fidelidade contextual | Contexto imediato, género e argumento do livro |
| Fundamentação | Evidência efetiva para cada afirmação verificável |
| Integridade bibliográfica | Existência, localização e fidelidade da referência |
| Disciplina epistemológica | Distinção entre facto, inferência, tradição e hipótese |
| Diversidade interpretativa | Divergências relevantes sem falso consenso ou equivalência artificial |
| Comparação | Relações entre passagens justificadas |
| Distinção temporal/teológica | Cumprimento histórico separado de leituras messiânicas e escatológicas |
| Transparência | Lacunas, falhas e cobertura comunicadas |
| Segurança e direitos | Resistência a instruções externas e respeito das condições de uso |

## Corpus proposto
Casos determinísticos e versionados com fontes autorizadas: cobertura suficiente e insuficiente, interpretações divergentes, atribuição incerta, referências inexistentes, fonte válida sem suporte, comparação indevida e prompt injection.
As expectativas devem ser verificadas por curadoria humana; não inventar fontes nem uma resposta teológica única para toda a avaliação.

## Rubrica e aceitação
Proposta inicial: classificar cada dimensão como satisfatória, parcial ou inadequada, com evidência e justificação.
Antes de aprovar o gate, definir amostragem, revisão humana, tratamento de desacordo, limiares e defeitos bloqueantes.
Referência fabricada, exposição de dados indevida e violação de direitos não podem ser normalizadas por uma média favorável; o produto exige corrigir ou impedir a entrega afetada.
Não existe score numérico mínimo de qualidade da IA aprovado.

## Reprodutibilidade e custos
Registar corpus/versão, prompt, fornecedor/modelo/configuração, data, saídas, critérios e resultados. Modelos externos podem variar mesmo com configuração igual; explicitar essa limitação.
Combinar avaliações locais reproduzíveis com execução real controlada antes de aceitar ou alterar adapters/modelos. Não exigir chamadas pagas e não determinísticas em todo ciclo local.

## Distinção dos gates
Cobertura de código e mutation score superior a 85% medem capacidade dos testes de software; não comprovam veracidade, qualidade histórica ou equilíbrio interpretativo.
Ver [estratégia](../quality/testing-strategy.md) e [gates](../quality/quality-gates.md).
