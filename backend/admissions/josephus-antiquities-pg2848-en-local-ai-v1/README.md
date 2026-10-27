# Admissão operacional local de IA

Quatro parágrafos de Josefo, Antiquities I.1.1–4, tradução William Whiston/Project Gutenberg2848. Outra admissão da mesma obra/edição, nunca uma testemunha independente. [Âmbito e revisão](../../../docs/sprints/S05/DATA_ADMISSION.md) e [plano concreto](../../../docs/sprints/S05/tasks/S05-T006-rag-persistence-http.md) são normativos. Este diretório é operacional, não deriva de fixture.

Reprodução a partir do backend: `python scripts/prepare-ai-sources.py local-ai data/source-library/josephus-antiquities-pg2848-en/source.html data/source-library/josephus-antiquities-pg2848-en/source.txt admissions/josephus-antiquities-pg2848-en-local-ai-v1`. Originais são preparados pelo procedimento S03/S04 existente, com pins; a ferramenta não descarrega nem transmite dados.

manifest.json SHA256f7680eb9eaf5b0ef28b867fdb902da44d7856cb386efd317ee69a554f620d230; excerpts.json79228666d0b6d552d6a5dc7ac3072acb7781c73f63af54119dab1495abff92d8; aviso integral18bc5c6f86b23ade32c4d711e765328b0c642c383a993c8d7f11c7ee21da4bf1. HTML/excertos originais/pins do perfil estão no manifesto. Só IDs/admissão foram derivados; texto, locators, ordem e digests dos parágrafos são originais. Curadoria GEN1:1/2:7/2:10/3:1 é paralelo narrativo, sem confirmação independente.

Permissões são limitadas ao runtime local autenticado/perfil pinado: embeddings e seleção extrativa de uma frase. Sem treino, provedor remoto, serviço público ou redistribuição comercial. Conservar atribuição, integridade e NOTICE.source.txt; o perfil legado continua sendToAi pending. A importação real é responsabilidade de SourceLibrary e ainda exige alvo validado e prova; estes ficheiros não são seed automático.
