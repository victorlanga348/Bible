# Josefo / Whiston — fixture histórica real de teste

Aprovada para verificação/admissão S03 pelo «vai enfrente» em2026-10-21 após SPEC v0.1/planos T004/T005. Obra: *Antiquities of the Jews*, Flavius Josephus, tradução inglesa William Whiston, distribuição [Project Gutenberg2848](https://www.gutenberg.org/ebooks/2848). Uso exclusivo de testes; não é seed de produção.

Texto canónico HTML oficial:3.561.835 bytes, SHA-256 `098d837010fea0f38b104d2c9397696ae5db9e5cbd15a8e8f400f36811fbcf99`. Data real no manifesto; original completo em backend/data/source-library/ ignorado. Obtenção HTTPS com validação TLS Windows; Python falhou na cadeia de certificados, sem desativar validação. O prólogo declara ISO-8859-1 mas bytes são UTF-8 estrito; observação conservada sem regravar o original.

Recorte: Livro I capítulo1, quatro parágrafos numerados entre anchors link2HCH0001/link2HCH0002. HTMLParser stdlib sem scripts/entidades externas, só parágrafos principais; cinco marcadores de notas omitidos, sem notas/imagens/outros capítulos. Concatena nós textuais, descodifica entidades e colapsa whitespace de layout num espaço; retira prefixo ordinal para locator/order. Palavras/pontuação/colchetes preservados, sem tradução/correção/texto gerado. Locator book-1/chapter-1/paragraph-N acompanha numeração real da edição.

excerpts.json SHA-256 `2171bd34f61e74b22d61e58e6c71caa336716b8ad15e2c60f8210ce2e35d7f63`; hashes UTF-8 por texto e tamanhos reais2127/1061/859/3807 caracteres. Afirmações da obra não são comprovação histórica independente, consenso moderno ou associações bíblicas validadas.

## Direitos e créditos

Créditos: Flavius Josephus; William Whiston, tradutor; agradecimento de origem ao Project Gutenberg eBook2848, produzido por David Reed/David Widger. Sem uso da marca como título próprio. O catálogo declara domínio público nos EUA e identifica Whiston1667–1752; não se generaliza isso para todo território/conteúdo recente do export.

Revisão local limitada: [Lei9/2022 no WIPO Lex](https://www.wipo.int/wipolex/en/legislation/details/21426) e Boletim obtido no [INICC oficial](https://inicc.gov.mz/download/legislacao/69bfd67d3f6f7/lei42001.pdf), art.47(1): prazo patrimonial70 anos após morte;47(2): proteção não patrimonial preservada. Inferência para texto original/tradução antiga e usos locais/testes aprovados, com autoria/integridade/créditos conservados. Nome lei42001.pdf é histórico; cabeçalho/norma revogatória confirmam conteúdo Lei9/2022. PDF/hash local no manifesto. Sem garantia mundial ou autorização de futuros serviços públicos/comerciais.

NOTICE.source.txt conserva integralmente o aviso do TXT oficial irmão a partir de START: FULL LICENSE; SHA-256 `18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1`. HTML não contém aviso integral; não se declara essa parte inexistente nele nem se usa texto TXT como canónico da extração. [Condições gerais](https://www.gutenberg.org/policy/license.html) e aviso incluído conferidos; formato original acessível pelo catálogo.

Matriz admitida: ingest/store/index/display/quote allowed no recorte/usos locais e fixture de teste; sendToAi pending. Sem autorização deduzida para IA, notas, áudio, imagens ou outras obras. EXT-004 conserva obrigações para ampliações/avaliações; admissão não comprova importação/pesquisa de banco.

## Reprodução

.gitattributes preserva NOTICE.source.txt byte a byte com -text, incluindo os espaços/finais de linha originais; exceção de whitespace vale só para esse artefacto, não código. JSON tem text/eol=lf para hash reproduzível mesmo com core.autocrlf=true. check-attr/hash-object confirmaram ausência de conversão dos bytes versionados.

Obter mesmo HTML, confirmar hash e anchors/números1–4. Aplicar somente transformações do manifest.json, comparar texto/hash por excerto e cinco marcadores omitidos. JSON UTF-8 indentado/newline final; conferir aviso com TXT/hashes do manifesto. Não completar conteúdo de memória nem corrigir original para satisfazer teste. Snapshot diferente exige nova revisão.
