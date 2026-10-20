# Explorador de passagens

Estado: proposta; PRD-01 e PRD-04 ainda precisam de refinamento em PLAN-009.
Não há pesquisa, rotas ou catálogo implementados.

## Objetivo
Permitir localizar livros, capítulos e versículos, reconhecer versão/cânone e fornecer seleção inequívoca ao estudo.

## Decisões necessárias
Formato de pesquisa, nomes e variantes de livros, seleção por intervalo, referências inválidas, diferenças de versificação e comparação entre versões/passagens.
Não presumir que existe uma única organização de livros ou que índices de versículos correspondem entre edições.

## Estados propostos
Catálogo indisponível; nenhuma seleção; pesquisa sem resultado; referência ambígua/inválida; seleção válida; texto não disponível/licença pendente.
Esses estados não definem enums de API.

## Critérios de UX a aprovar
Seleção compreensível por teclado e leitor de ecrã, identificação da edição e transição clara para o estudo.
Informar quando o texto ou as fontes não estão disponíveis. Não apresentar biblioteca progressiva como cobertura integral.
Dependências: [cânone e versões](../biblical-library/canon-and-versions.md), [contratos](../integrations/api-contracts.md) e [responsividade](../design/responsive.md).
