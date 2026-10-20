# Mutation testing

Estado: StrykerJS adotado sob condição de compatibilidade, por orientação do utilizador. Não instalado; versão, runner, configuração e compatibilidade ainda não validados.
Ver [ADR-0002](../architecture/adr/ADR-0002-adocao-condicional-strykerjs.md) e DEC-08 na [stack](../architecture/stack.md).
Não existe score medido ou relatório executado.

## Obrigatoriedade e escopo
Executar nos módulos de domínio e aplicação abrangidos por cada alteração executável, incluindo invariantes, classificação, validação de evidência e coordenação.
O plano deve identificar ficheiros incluídos, operadores, configuração, comando real, baseline e exclusões antes de executar.
Avaliar comportamento próprio de composição e adapters; não os excluir automaticamente.
Compatibilidade por resolver, comando inexistente ou suite incompleta não dispensam o gate aplicável.

## Cálculo preservado
Mutation score = 100 × detetados / válidos.
Detetados: mutantes mortos por testes ou por timeout classificado como deteção pela ferramenta.
Válidos: detetados + sobreviventes + sem cobertura.
Registar categorias originais e confirmar o mapeamento com a versão/configuração selecionada antes de aprovar; esta convenção não comprova compatibilidade atual de StrykerJS.

Score bruto deve ser **estritamente superior a 85%**, antes de arredondamento. 85% exatos falham.
Erros de compilação, execução ou infraestrutura são reportados separadamente, investigados e nunca contados como deteção por conveniência.
Sem mutantes válidos não há score aprovável: justificar não aplicabilidade real; execução falhada ou incompleta não é escopo vazio.

## Exclusões
Podem ser justificadas para código gerado, build, dependências, declarações sem comportamento ou documentação.
Identificar caminho, motivo, impacto e revisão; não excluir código difícil, sem cobertura ou com sobreviventes apenas para elevar o score.
Não apagar testes ou restringir artificialmente o escopo para obter aprovação.

## Sobreviventes e relatório
Produzir relatório com localização, mutação, comportamento afetado, cobertura, teste em falta, possível equivalência, responsável e tarefa.
Equivalência exige evidência e revisão, não uma etiqueta arbitrária.
Defeitos críticos de evidência, acesso ou licenças exigem correção mesmo com score global suficiente.
Timeouts excessivos devem ser investigados.

## Gate e evidências
Score insuficiente ou gate obrigatório pendente/falhado impede DONE.
Registar comando, versão, configuração, escopo, exclusões, contagens por categoria, score bruto, relatório e análise dos sobreviventes.
Documentação pura: não aplicável com justificação, sem score fictício.
A instalação/validação técnica só ocorrerá numa tarefa aprovada; não há dependências instaladas nesta operação.
