# Catálogo de fontes

Estado: edição bíblica inicial admitida em S02 v0.2; primeiro capítulo histórico admitido em S03 após «vai enfrente»; comentários/outros acervos continuam não incorporados. Cobertura documental não é declarada completa.
Admitido somente Livro I capítulo1 de Josefo/Whiston/Gutenberg2848 para usos locais e fixture de teste;4 parágrafos reais. S03-T006 implementa importação guardada para teste, banco/pesquisa/API independentes, verificados no recorte T006; desenvolvimento não migrado. Manifesto/aviso/hashes/limites no README da fixture source-library.

## Registo de cobertura
| Categoria | Estado atual | Próximo passo |
|---|---|---|
| Textos bíblicos e traduções | Bíblia Livre/porbr2018 aprovada; snapshot/aviso/catalogação/fixture reais verificados em S02-T004; Domain/parser T005 concluídos e commitados | Consulta/importação/API S02-T006/T007 adiadas pelo utilizador; ver [cânone/versões](canon-and-versions.md) |
| História e cultura | Josefo/Whiston/Gutenberg2848, Livro I capítulo1,4 parágrafos admitidos; importação/pesquisa/HTTP reais no teste isolado | T006 verificada; revisão integrada T007 aguarda plano; ampliar só com curadoria própria |
| Autoria, destinatários e propósito | Sem acervo validado | Selecionar fontes e documentar incertezas |
| Comentários e tradições interpretativas | Nenhum incorporado | Aprovar critérios de diversidade e utilização |
| Comparação entre passagens | Sem base curada | Definir relações e evidência exigida |

## Ficha de curadoria proposta

Preparação S03 em2026-10-21: [SPEC/curadoria candidata](../sprints/S03/SPEC.md) propõe Josefo/Whiston, Gutenberg2848, Livro I capítulo1. Metadados/estrutura/condições pesquisados em páginas primárias, sem admissão, download local de corpus ou fixture. OpenStax é alternativa com condições específicas de IA; não assumida como corpus livre para RAG. O histórico anterior descreve a preparação: «vai enfrente» posterior aprovou o pacote e o artefacto/usos/fixture do capítulo foram verificados. EXT-004 satisfeita apenas para esse recorte local, mantendo obrigações para ampliações/IA. OpenStax não foi incorporada.
Registar identidade da fonte, autoria/editoria quando conhecida, edição, origem, localizações utilizáveis, acesso efetivo, condições de uso, âmbito temático, limitações e revisão.
Estes elementos são necessidades documentais, não campos de API ou schema aprovados.

## Ciclo de vida proposto
Candidata → em revisão → aprovada para usos específicos; ou rejeitada com motivo.
Fonte indisponível, retirada ou obsoleta deve manter histórico e implicações para estudos anteriores.
Aprovação para leitura não equivale a permissão para copiar, indexar ou enviar a fornecedores.

## Referências
[Política de fontes](../product/source-policy.md), [SR-001](../specs/source-retrieval.md) e [fundamentação](../ai/grounding-and-citations.md).
