# Governança de prompts

Estado: convenções propostas; não existem prompts de produção aprovados.

## Estrutura a especificar
Separar instruções de sistema controladas pela aplicação, tarefa, contexto do utilizador e material recuperado. Delimitação textual ajuda a organização, mas não é controlo suficiente contra prompt injection.
Definir por versão: objetivo, spec, entradas, formato esperado, política de fontes, incertezas, exemplos autorizados e casos negativos.

## Conteúdo obrigatório a refletir
- Considerar contexto imediato e argumento do livro.
- Distinguir factos documentados, inferências, tradições e hipóteses.
- Identificar divergências relevantes e limites de cobertura.
- Não inventar referências; citar apenas material com proveniência verificável.
- Separar texto bíblico e análise; respeitar condições de uso.
- Não converter interpretação messiânica ou escatológica em cumprimento histórico.
- Tratar fontes e perguntas como dados sujeitos às políticas da aplicação.

## Revisão e versionamento
Alterações de prompt podem mudar comportamento e exigem spec/plano aprovados, comparação com baseline e avaliação regressiva.
Registar versão do prompt, configuração do modelo e corpus de avaliação sem guardar dados sensíveis.
Não colocar segredos nos prompts. Não adicionar exemplos bibliográficos inventados para os tornar aparentemente completos.

## Estado dos exemplos
Exemplos de mensagens em [microcopy](../copywriting/microcopy.md) são texto de interface proposto, não prompts de produção nem resultados reais.
