# Bíblia Livre/porbr2018 — fixture real de teste

Aprovada para S02 pelo «ok» do utilizador em 2026-10-21 após SPEC v0.2/recorte e plano T005 apresentados. Uso exclusivo dos testes; não importar estes excertos como acervo de desenvolvimento/produção.

Origem: [pacote VPL/XML do eBible](https://ebible.org/Scriptures/porbr2018_vpl.zip), publicação e condições verificadas no [catálogo](https://ebible.org/bible/details.php?id=porbr2018) e no aviso incluído `porbr2018_about.htm`, conservado byte a byte como NOTICE.source.html. O aviso declara CC BY4.0, autores/créditos e identificação de alterações. Nenhuma imagem/áudio/nota foi incluída.

Créditos: Bíblia Livre (BLIVRE), copyright ©2018 Diego Santos, Mario Sérgio e Marco Teles; distribuição eBible.org/porbr2018. [CC BY4.0](https://creativecommons.org/licenses/by/4.0/). O aviso traz a data editorial2022-03-08; data de obtenção e hashes exatos no manifest.json. A edição é declarada em andamento pelo fornecedor, não uma edição crítica produzida pelo projeto.

## Snapshot verificado

- ZIP: SHA-256 `1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682`, 4.379.838 bytes.
- Membro canónico: porbr2018_vpl.xml, SHA-256 `5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db`.
- Inventário real: 66 livros, 1.189 capítulos, 31.102 versículos; ordem/códigos XML confrontados com catálogo publicado, identidades únicas e numeração positiva sem lacunas neste snapshot.
- Seleção: GEN1:1 e JHN3:16–18, quatro registos em verses.json; valores de text copiados exatamente do XML, incluindo espaços finais. Nenhum texto foi gerado, traduzido, corrigido ou aparado.
- verses.json: SHA-256 `a27749f2c2a81cc5c31b2ec9bdd85b9ea2f6ff6391581e7f40d0f8355ef5460c`.

O TXT do pacote usa abreviaturas BibleWorks e difere do XML em espaços/colchetes. São formatos distintos do fornecedor: 31.058 registos não idênticos, dos quais4.838 diferem além de espaços exteriores; a comparação diagnosticou apenas espaços e colchetes, sem diferença de sequência de capítulos/versículos. Isto não autoriza remover caracteres durante a importação. Escolheu-se o XML existente, cujos códigos USFM correspondem ao catálogo e ao contrato aprovado; o texto desse membro é preservado. Aliases TXT não são aliases aceites pela API.

## Reprodução e limites

1. Obter o mesmo ZIP da origem e confirmar o hash acima antes de usar. Mudança de hash bloqueia a reprodução; não atualizar fixture/manifesto automaticamente.
2. Ler os membros pelo ZIP, sem executar o SQL incluído ou extrair caminhos arbitrários. Confirmar hash do XML e do aviso com o manifesto.
3. Interpretar os elementos v do XML: atributos b/c/v identificam livro/capítulo/versículo; conteúdo do elemento é text. Selecionar apenas as quatro identidades do manifesto e confrontar valores e ordem com verses.json; não aplicar trim/normalização textual.
4. JSON mantém esses valores e metadados de origem, com serialização UTF-8 indentada e newline final. Essa transformação de formato/seleção está declarada no manifesto. NOTICE.source.html é cópia exata; checksum do aviso no manifesto.

O corpus completo e o ZIP ficam localmente em backend/data/biblical-canon/porbr2018/, ignorados pelo Git. Apenas metadados, aviso e excertos de teste são versionáveis nesta tarefa. SHA-256 mede a identidade dos bytes obtidos; não foi alegada verificação GPG independente do fornecedor. Importação real de acervo/banco pertence à T006, sem PASS antecipado.
