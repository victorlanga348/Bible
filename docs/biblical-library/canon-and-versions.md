# Cânone e versões

Estado atual em 2026-10-21: DEC-06/DEC-09 resolvidas para a SPEC S02 v0.2 pelo «ok» explícito do utilizador. Edição inicial Bíblia Livre/porbr2018, português do Brasil,66 livros/recorte protestant-66, ordem/códigos/numeração do XML confirmados no catálogo e no artefacto. Direitos/atribuição e usos locais previstos verificados no aviso incluído; nenhum outro cânone/edição ou uso de IA aprovado por inferência.
Atualização S02-T004, 2026-10-21: S01 encerrada/commitada e continuação S02 autorizada. Cânone/edição foram perguntados ao utilizador; nenhuma preferência foi inferida. [SPEC S02](../sprints/S02/SPEC.md) regista candidaturas Bíblia Livre/porbr2018 e Bíblia Portuguesa Mundial/porbrbsl, condições declaradas e limitações. Pesquisa não é admissão; nenhum texto foi incorporado.
Proposta concreta v0.2 após «avanca»: começar pelos 66 livros do catálogo Bíblia Livre/porbr2018, numeração própria da edição, preservando créditos/condições. Recorte inicial proposto `protestant-66`; não é uma preferência religiosa atribuída ao utilizador nem decisão aceite. Catálogo/aviso e alternativas foram consultados; o artefacto/manifesto/hash ainda não foram obtidos. O pacote de decisão/contratos está na SPEC, para aprovação explícita antes da importação/implementação.
A intenção de cobrir a Bíblia inteira não resolve quais cânones, ordens, nomes de livros ou sistemas de versificação serão suportados.

## Decisões necessárias
- Âmbito inicial e eventual suporte de mais de um cânone.
- Identificação e apresentação dos livros, capítulos e versículos.
- Regras para diferenças de versificação e comparação entre versões.
- Traduções/edições, origem do conteúdo e idiomas disponíveis.
- Licenças para ingestão, armazenamento, indexação, citação, exibição e envio a IA.
- Atribuição, limites de reprodução e tratamento de retirada de permissão.

Não há preferência de tradução ou tradição canónica inferida do idioma do utilizador.

## Critérios de admissão propostos
Cada edição deve ter identidade verificável, origem documentada e permissões para a utilização concreta.
Uma edição não pode ser importada por estar acessível publicamente sem verificar condições de uso.

## Relações
Aprovação antecede o catálogo de navegação, o [modelo](../architecture/data-model.md), o [explorador](../pages/passage-explorer.md) e o refinamento de PRD-01/PRD-04 em PLAN-009.
Não há texto bíblico redistribuído nesta documentação.

## Admissão do snapshot aprovado

ZIP real do eBible obtido após autorização, SHA-256 `1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682`; membro canónico porbr2018_vpl.xml, SHA-256 `5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db`. Inventário real66 livros/1.189 capítulos/31.102 versículos, sem duplicados/lacunas neste snapshot. A aprovação do domínio não presume equivalência com outra edição.

Artefacto completo local ignorado pelo Git; [fixture de teste](../../backend/test/fixtures/biblical-canon/porbr2018/README.md) contém manifesto/catalogação, aviso original e quatro excertos XML genuínos, preservados exatamente. O TXT tem aliases/formatação próprios e não foi silenciosamente convertido no contrato API. Sem imagens/áudio/comentários, texto gerado, envio a IA, revisão editorial ou importação no banco nesta admissão. Histórico das propostas anteriores acima preservado; situação atual e detalhes de admissão na SPEC.
