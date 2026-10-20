# PRD — Bíblia App

Estado: visão e requisitos de alto nível definidos pelo utilizador; decomposição nas specs ainda em rascunho.
Data da baseline: 2026-10-17. Consolidação documental backend: 2026-10-20, plano S00 aprovado pelo «ok» do utilizador. Implementação: não iniciada.

## Problema e propósito
O estudo de uma passagem exige reunir contexto histórico, literário, cultural e teológico, reconhecer divergências e verificar fontes. O Bíblia App pretende apoiar esse trabalho sem apresentar a IA como autoridade absoluta.

Público inicial: utilização pessoal. Cobertura pretendida: Bíblia inteira, com biblioteca de fontes construída progressivamente. A extensão do cânone suportado e as traduções disponíveis dependem de decisões documentadas e licenciamento.

## Fluxo principal
Selecionar livro, capítulo e versículos; solicitar estudo estruturado; consultar evidências, referências e interpretações; continuar com perguntas livres; voltar ao histórico de estudos.

## Requisitos rastreáveis
| ID | Necessidade | Spec responsável |
|---|---|---|
| PRD-01 | Pesquisar e selecionar livros, capítulos e versículos | [Estudo estruturado](specs/structured-study.md), seleção detalhada pendente |
| PRD-02 | Gerar estudo com contexto imediato e argumento do livro | [Estudo estruturado](specs/structured-study.md) |
| PRD-03 | Apresentar contexto histórico/cultural e autoria, destinatários e propósito com incertezas | [Estudo estruturado](specs/structured-study.md) |
| PRD-04 | Comparar passagens com relações justificadas | [Estudo estruturado](specs/structured-study.md), detalhamento de comparação pendente |
| PRD-05 | Apresentar divergências e distinguir cumprimento histórico, leituras messiânicas e escatológicas | [Estudo estruturado](specs/structured-study.md) |
| PRD-06 | Continuar o estudo com perguntas livres | [Perguntas livres](specs/free-questions.md) |
| PRD-07 | Exibir fontes verificáveis e cobertura real da biblioteca | [Recuperação de fontes](specs/source-retrieval.md) |
| PRD-08 | Consultar histórico dos estudos realizados | [Histórico](specs/study-history.md) |
| PRD-09 | Distinguir texto bíblico, evidência, inferência e interpretação | [Estudo estruturado](specs/structured-study.md) e [fontes](specs/source-retrieval.md) |
| PRD-10 | Respeitar licenças e direitos de utilização | [Recuperação de fontes](specs/source-retrieval.md) |
| PRD-11 | Tratar carregamento, falha, acessibilidade e recuperação de forma compreensível | [Espaço de estudo](pages/study-workspace.md), critérios a detalhar por spec |

PRD-01 e PRD-04 não ficam integralmente especificados pelas quatro specs iniciais: requerem refinamento antes de implementação. Ver [backlog](tasks/backlog.md).

## Qualidade esperada
A resposta deve expor evidências e limites, reconhecer fontes ausentes e evitar consensos artificiais. Qualidade bíblica e epistemológica exige [avaliação própria](ai/evaluation.md), independente da cobertura e da mutação do software.

Segurança, acessibilidade, desempenho, custos, retenção e disponibilidade exigem critérios mensuráveis aprovados nas tarefas; não existem metas numéricas aprovadas para estes itens.

## Âmbito desta entrega e exclusões
Esta entrega estabelece documentação, governança, templates, rastreabilidade e memória operacional. O ciclo backend atual é S00–S08; frontend fica adiado. Trilhas A domínio, B infraestrutura, C qualidade/documentação. Notas, favoritos e relações justificadas são responsabilidades futuras de study-workspace/cross-references, ainda por especificar em S07.
Não inclui código, instalação, schema, serviços, chamadas de IA, corpus de textos ou fontes históricas preenchido.

## Decisões e dependências
A [stack](architecture/stack.md) contém decisões técnicas definidas e pendentes. O [roadmap](product/roadmap.md) ordena dependências sem prometer datas. Specs, contratos HTTP, modelo lógico e política de acesso precisam de aprovação antes das respetivas implementações.

## Critério de sucesso da inicialização
Estrutura exigida presente, links locais válidos, documentos substanciais, estados explícitos e coerência entre PRD, specs, backlog e roadmap. A conclusão documental não comprova funcionalidades.
