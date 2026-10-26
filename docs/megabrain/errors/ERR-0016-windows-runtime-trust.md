# ERR-0016 — Runtime local recusado pelo Controlo de Aplicações

Data:2026-10-26. Tarefa S05-T004, Windows, llama.cpp b11815 win-cpu-x64 oficial. Estado: impedimento confirmado para este artefacto; alternativa assinada em investigação. Não é falha demonstrada do modelo nem de código do backend.

Atualização2026-10-26: alternativa oficial assinada Ollama0.40.11 inspecionada e aceite sem alterar política.28 executáveis/DLL CPU Authenticode Valid/Ollama Inc., hashes conferidos; engine b11845/9ff0d7e90 executou embeddings1024 dimensões e geração JSON reais, com401 sem chave/processos próprios encerrados. O ZIP/modelos/digests/provas estão em TEST_REPORT/FEASIBILITY S05. O bloqueio do artefacto unsigned permanece respeitado e preservado; a alternativa é outra distribuição com cadeia de assinatura válida, não ocultação/remoção de bloqueio do ficheiro original. Isto resolve a viabilidade de protocolo, sem afirmar qualidade histórica ou produto concluído.

ZIP/modelos foram obtidos das fontes oficiais e conferidos com tamanho/SHA publicados. A primeira execução de llama-server.exe --version, antes de abrir servidor/carregar o modelo, lançou OSError WinError4551: política de Controlo de Aplicações bloqueou o ficheiro. Get-AuthenticodeSignature devolveu NotSigned. Logs/provas ignorados s05-embedding-probe.log e s05-candidate-downloads.json. A assinatura ausente é observada; não atribuir configuração exata do Windows ou decisão de antivírus sem evento que a confirme.

Não desativar política, autoassinar, remover marca de origem, copiar para ocultar bloqueio ou executar esse artefacto por outro mecanismo. Download verificado não significa executável autorizado pela plataforma. Nenhuma chamada de IA ocorreu e nenhuma dimensão/qualidade foi medida nesta tentativa.

Alternativa: verificar a distribuição oficial Ollama0.40.11 que declara assinatura no processo de release, conferir hash integral e Authenticode dos ficheiros realmente utilizados antes de executar. Não presumir aceitação do Windows nem alterar serviços/PATH/contas/cloud pela inspeção. Se também não houver runtime aceite, registar a ação externa e manter gate real bloqueado, preparando apenas o que não depender dessa prova.

Outro impedimento distinto: ACL recusou escrita exclusiva em Program Files/PostgreSQL/16/lib. Compilar pgvector16 não instalou DLL nem autorizou mudar ACL. Alternativa de índice PostgreSQL/pgvector dedicado foi registada antes de criar o container próprio; prova SQL real17.11/0.8.7 não altera o banco nativo. Não misturar esse PASS com inferência de IA.
