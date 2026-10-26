# S05 — Admissão limitada de dados para IA local

Estado: decisão do agente na autorização integral,2026-10-26, S05-T004; anterior às chamadas de corpus desta sprint. Não é nova instrução específica do utilizador, revisão humana externa ou licença mundial. Produto/adapter/importação continuam por implementar e testar.

## Material e finalidade

Somente os quatro parágrafos originais de Josefo, Antiquities of the Jews I.1.1–4, tradução William Whiston/Project Gutenberg2848, autenticados e já revistos na S03/S04. HTML SHA256098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99, conjunto de excertos2171bd34f61e74b22d61e58e6c71caa336716b8ad15e2c60f8210ce2e35d7f63, aviso integral18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1. Não ampliar o corpus nem transformar o relato em confirmação independente. Processar cópias derivadas desses originais, nunca importar fixtures para desenvolvimento.

Admitir um perfil próprio josephus-antiquities-pg2848-en-local-ai-v1 para embeddings/recuperação e extração/geração limitada por modelo local. É outra admissão da mesma obra/edição/textos, não uma segunda testemunha independente. A fixture antiga e a admissão operacional S04 continuam sendToAi pending e não serão usadas como se autorizassem IA. O perfil próprio terá proveniência/pins/permissões e identidades derivadas próprias, antes de importação de produto; nenhuma linha legada foi alterada por esta decisão documental.

## Destino e operação delimitados

Runtime nativo assinado da distribuição oficial Ollama0.40.11, engine llama.cpp b11845/commit9ff0d7e90, API autenticada em127.0.0.1. Modelos Qwen oficiais nos digests de FEASIBILITY; um ativo de cada vez, sem ferramentas, Web UI, túnel, telemetria de prompts, conta cloud ou rede para fornecedor remoto. Uso de inferência/embeddings, sem treino/fine-tuning dos pesos. Prompts recebem somente contexto público admitido e a pergunta controlada necessária; nenhum token, segredo, owner privado ou dado pessoal. Dados de teste em CI futuro exigirão perfil/destino explícito de runner descartável antes de envio; este aceite local não os presume.

Indexação local só para o perfil autorizado, índice reconstruível em PostgreSQL/pgvector próprio. Persistir vetores/proveniência e citações conforme as permissões; leitura, geração e entrega revalidam identidade/digest/direitos. Fonte pending/denied/retirada fica fora do percurso, sem resposta fictícia ou falha técnica convertida em ausência. O corpus original e o aviso completo ficam disponíveis com atribuição, direitos/localizador/hash. Não redistribuir modelos nem promover a fonte para material comercial/público neste recorte.

## Base e limites da revisão

O [catálogo oficial](https://www.gutenberg.org/ebooks/2848) identifica Josefo e Whiston(1667–1752) e declara domínio público nos EUA; a [licença](https://www.gutenberg.org/policy/license.html) exige examinar a lei do país e conservar as condições/atribuição aplicáveis. Não usar o resumo automático do catálogo como evidência histórica. A obra original/tradução são antigas; não presumir direitos de uma edição moderna diferente.

O [PDF oficial INICC](https://inicc.gov.mz/download/legislacao/69bfd67d3f6f7/lei42001.pdf),594795 bytes/SHA7a631ce26da371f69eb96f316d650c458542dcd8200797499f7e066182429900, foi novamente descarregado e é igual ao original S03. A extração da página7 confirma o título/data2022 e artigo47: caducidade patrimonial70 anos após morte e proteção não patrimonial sem limite temporal. A identificação da Lei9/2022 e revogação da4/2001 foi conferida também na [WIPO Lex](https://www.wipo.int/wipolex/en/legislation/details/21426). O nome histórico do ficheiro não muda o conteúdo. Inferência delimitada do agente: a morte de Whiston em1752 e a antiguidade da obra ultrapassam esse prazo para os textos originais aqui identificados; conservar autoria/integridade/aviso e limitar processamento pessoal local. Não é uma afirmação sobre toda jurisdição, nova tradução, uso remoto, treino ou distribuição comercial.

Evidência ignorada reports/s05-law-article47.json, s05-pdf-tool.json e PDF original; pypdf6.21.2 wheel SHA1d44d1a3a200f25062adff0085b02040e4646431ac2ccac22e42679e91466084 usado apenas como ferramenta isolada de leitura a partir de reports, sem instalação global ou dependência do backend. A primeira consulta PyPI usou URL sem /pypi e devolveu404; não significava biblioteca inexistente.

Saída permitida nesta primeira avaliação: relato da fonte claramente atribuído, citação verificável e limitação de cobertura. Nenhum consenso moderno, data arqueológica, verdade histórica ou conclusão teológica pode ser inferido só de a fonte o narrar. Pré-avaliações que falhem suporte/referência/direitos são FAIL e não são compensadas por média favorável.
