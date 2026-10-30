# IA — o que falta para estudos completos

Estado verificado em2026-10-30, após o pedido de finalizar Google e explicar os próximos passos. Este documento explica o produto existente e a ampliação futura; não altera contratos, modelos, fontes ou direitos aprovados.

## O que já funciona

A IA local tem runtime e modelos instalados, banco vetorial próprio e índice de11chunks. O perfil `local-extractive-v1` foi validado com chamadas reais: seleciona uma frase inglesa dos quatro parágrafos admitidos de Josefo/Whiston. Estudos, análises e conversas usam isolamento por owner e referências verificadas. A Bíblia integral está no banco principal; isso não implica que todos os seus textos estejam admitidos/indexados como contexto de IA. Fontes atuais e limites constam de [IA local](local-ai.md), [perfil](../ai/profiles/local-extractive-v1.json) e [admissão](../sprints/S05/DATA_ADMISSION.md).

Para usar esse recorte, não é necessária uma chave paga. O backend precisa dos dois bancos locais disponíveis e dos valores privados existentes `BIBLE_AI_HOME`/`BIBLE_AI_DATABASE_URL`; o adapter inicia os seus próprios processos de inferência por operação. Arranque em `backend`: `npm run build`, seguido de `npm start`. Não reimportar, migrar ou reindexar tudo apenas para iniciar. Ausência de memória/runtime/índice pode impedir geração; Google autentica o utilizador e não corrige esses recursos.

## O que depende de ti

1. Definir o resultado esperado: por exemplo, explicações em português com citações, comparação de interpretações e conversa sobre um estudo. A implementação atual de uma frase não entrega automaticamente esses comportamentos.
2. Escolher entre manter processamento no PC ou permitir uma API externa com um limite de gastos. No PC atual de8GB, modelos maiores exigem avaliação de recursos; uma API depende de conta, faturação/crédito e chave do fornecedor escolhido. Nenhuma conta paga é exigida para o recorte local existente.
3. Confirmar as traduções e obras desejadas, sobretudo se já tens edições ou permissões específicas. Posso investigar fontes e licenças, obter os originais e preparar importação/indexação; não precisas de montar o acervo manualmente. Envio externo e publicação precisam de admissão própria: a autorização atual é pessoal/local.
4. Rever alguns estudos gerados para confirmar se a qualidade e as citações servem ao uso pretendido. Essa revisão complementa os testes técnicos e as avaliações com fontes verificadas.

Se escolheres uma API, a chave será colocada por ti num ficheiro privado, após implementarmos o adapter e documentarmos o nome exato da variável. Não enviar chaves no chat nem inventar agora um nome de variável que o backend ainda não lê. `GOOGLE_CLIENT_ID` serve ao login e não é credencial de um modelo de IA.

## O que fica a cargo da implementação

Criar um plano/contrato próprio para o novo perfil de geração, escolher e medir o modelo adequado, integrar o fornecedor, admitir e indexar o acervo necessário, produzir respostas em português com referências e limites explícitos, e avaliar respostas sem suporte, divergências, qualidade, custo e tempo de resposta. Os sete gates continuam exigidos. Trocar apenas uma chave ou o nome do modelo no perfil pinado não conclui esta ampliação.

Não precisas de programar a integração, configurar manualmente cada vetor ou escrever testes. A tua intervenção prática é nas escolhas de uso/recursos, numa eventual conta/chave privada e na revisão dos resultados. O [teste Google](../sprints/S08/GOOGLE_AUTH_TEST_REPORT.md) permanece separado e foi adiado por tua decisão.
