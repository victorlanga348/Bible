# Orquestração da IA

Estado: princípios definidos; sequência operacional proposta para revisão em SS-001, FQ-001 e SR-001.
Não existe implementação nem SDK selecionado.

## Percurso proposto
1. Receber seleção ou pergunta validada pelo caso de uso.
2. Resolver contexto autorizado da passagem e do estudo.
3. Recuperar fontes elegíveis e conservar proveniência.
4. Separar instruções controladas, entrada do utilizador e material recuperado.
5. Solicitar análise ao fornecedor através de port.
6. Validar estrutura, referências, suporte das afirmações e rótulos de incerteza.
7. Aplicar política aprovada de aceitar, corrigir, limitar ou recusar o resultado.
8. Persistir apenas conforme spec, licença e retenção aprovadas; apresentar limites.

Cada fase deve preservar a diferença entre conteúdo recuperado, evidência e interpretação gerada. O modelo não valida a própria bibliografia por simples declaração.

## Capacidades internas candidatas
Recuperação de fontes, geração de análise, validação de referências e persistência do estudo são necessidades a expressar por ports. Não há nomes de interfaces, métodos, payloads ou esquemas aprovados.
O port do fornecedor deve permitir testar contratos sem contaminar domínio e aplicação com SDKs.

## Falhas e controlo
Definir em tarefa políticas de timeout, repetição, cancelamento, custo, concorrência e resultados parciais. Não pressupor streaming, filas, fallback entre modelos ou execução de ferramentas.
Uma falha técnica deve manter diagnóstico operacional e mensagem compreensível, sem inventar conteúdo para preencher lacunas.

## Evidências necessárias
Integrações reais dos adapters, testes dos casos de uso, [avaliações](evaluation.md), proveniência da execução e aprovação dos [contratos](../integrations/llm-provider.md).
