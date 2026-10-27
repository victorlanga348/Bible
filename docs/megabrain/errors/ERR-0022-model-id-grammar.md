# ERR-0022 — ModelId confundido com slug de fonte

Estado resolvido por RED/GREEN antes da integração do produto,2026-10-27/S05-T006; agente delegado. Affected Domain AnalysisProvenance, TypeScript/Jest locais. Nenhum modelo ou perfil foi alterado.

Conferência do JSON normativo/runtime pinado mostrou generation.id=ollama-qwen3-1.7b-q4_k_m e embedding.id=qwen3-embedding-0.6b-q8_0. O Domain criado nesta tarefa aplicava requireAnalysisIdentity, cuja gramática de fonte/profile só permitia letras/números/hífen. Assim rejeitava a identidade real com ponto/underscore. O defeito ainda não tinha sido exercitado pelo produto/IA real; os primeiros testes usavam metadata técnica identificada, que não continha essa combinação.

Causa confirmada: reutilização indevida da validação de uma categoria de identificador para outra. Reprodução anterior à correção em analysis-document.spec.ts, lendo o ID do perfil real:1FAIL/53PASS2,024s, AnalysisDomainError no requireAnalysisIdentity(modelId). Isso não era falha do runtime nem autorização para renomear o modelo.

Correção registada no plano antes do código: modelId conserva o literal e valida gramática própria com início alfanumérico minúsculo e continuação alfanumérica/ponto/underscore/hífen, sem paths/whitespace. Slugs de fonte/profile/prompt não mudam. Caso com ID pinado mais negativos (path/controlos/prefixo inválido/case não admitido) incluídos antes de implementar. Regressão composta144/6suites9,087s PASS; regressão integral posterior1549/72suites/169,65s PASS, sem inferência nessa execução. Logs s05-t006-pinned-model-id-red.log e s05-t006-adapters-model-id-green.log, relatório S05.

Lição: validar contratos com valores reais já pinados antes de assumir que todos os identificadores partilham a mesma gramática. Dados técnicos locais continuam úteis, mas não demonstram compatibilidade com identidade real. Não normalizar/renomear IDs para esconder incoerência; manter perfis/hashes e gate de integração/avaliação real pendentes até prova própria.
