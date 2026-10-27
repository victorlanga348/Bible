# Inteligência artificial

Distribuição do perfil: [JSON normativo](profiles/local-extractive-v1.json) permanece a fonte única; [cópia empacotada](../../backend/admissions/local-extractive-v1.json) entrega exatamente os mesmos bytes ao backend isolado. Tooling confere igualdade/SHA fixado, sem segunda regra editável. Runtime/testes leem o recurso empacotado; não dependem de /docs fora do pacote. [Incidente/validação](../megabrain/errors/ERR-0018-profile-package-isolation.md).

Estado vigente2026-10-26: viabilidade real local S05-T004 concluída, com [perfil extrativo](profiles/local-extractive-v1.json), [contratos](../sprints/S05/SPEC.md)/[ADR-0006](../architecture/adr/ADR-0006-ia-local-e-indice-reconstruivel.md), dez casos conformes dentro dos limites e baselines falhadas preservadas. Adapter/produto/integração/catorze avaliações/gates ainda pendentes T005–T007. Não existe ainda IA entregue na API. Políticas históricas seguintes permanecem princípios; a afirmação histórica de nenhuma chamada não representa os probes atuais.

A IA é assistente de investigação, não autoridade absoluta. A orquestração integra o backend e usa ports.
Ler [orquestração](orchestration.md), [prompts](prompts.md), [fundamentação](grounding-and-citations.md), [avaliação](evaluation.md) e [limites](safety-and-limits.md).

Estado: políticas de alto nível definidas pelo utilizador; pipeline, contratos, modelos e métricas operacionais propostos ou pendentes. Não há chamadas de IA executadas.
