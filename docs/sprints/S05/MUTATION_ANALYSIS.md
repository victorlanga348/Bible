# S05 — Análise incremental de mutação

## Checkpoint Domain f04e1ad, CI40371545025

Fonte exata f04e1ad5c89a34ec68f6fd5935f20a381b9c83e3; todas as53 fontes presentes no JSON correspondem ao commit e aos ficheiros atuais equivalentes. Novos ficheiros de ports/prompt/protocolo ainda não existiam nesse snapshot e não são validados pelo resultado. Padrão src/checker/limiares intactos, sem nova configuração reduzida. 1894/2025 resultados reutilizados pelo Stryker real,131 reavaliados. [Execução](https://github.com/victorlanga348/Bible/actions/runs/40371545025).

Global:1231 Killed/30 Timeout/123 Survived/641 CompileError, sem RuntimeError/NoCoverage. Denominador válido1384, detetados1261, bruto91,11271676300578%. Domain novo:102 Killed/4 Survived/24 CompileError/zero Timeout,106 válidos, bruto96,22641509433963%. CompileError excluído conforme norma, sobreviventes mantidos integralmente no denominador. Não substituir a pontuação bruta por outra coluna do HTML.

Artefacto12673910107/backend-quality, ZIP1103191 bytes/SHA c9efdb60b96100f4d45608d1c8bf8875a20f8c15f732fbd7c0f3442e82656938; mutation.json SHA5efc66b72e3d0924306376cdcd8355177d76071ccbc826f79489f470f7d608b7. Originais ignorados reports/ci-40371545025-* e auditoria s05-t005-domain-ci-audit.json, comando python reports/audit-s05-domain-ci.py.982/49suites PASS, linhas889/889100%, branches481/49098,16%; Domain24/24linhas e44/44branches100%. Aprovação de etapas CI não substitui análise causal abaixo.

| ID | Mutação e análise causal |
|---|---|
| 360 | Troca a substituição vazia dos controlos permitidos por Stryker was here!. O resultado intermediário é usado só no predicado de presença de outros caracteres Cc, não na pergunta entregue. Ambos os textos substitutos não contêm Cc; tab/CR/LF continuam ignorados pelo predicado e a string original continua preservada. Equivalência para esse predicado, sem remover mutante/alterar score. |
| 407 | Remove input.start<0. O teste original alterava start para -1 mas conservava end: também violava comprimento, sendo rejeitado pela outra guarda. Lacuna confirmada de teste isolado, não defeito observado na regra vigente. Acrescentado caso com start=-1/end=originalEnd-1/comprimento coerente, para que só a guarda negativa o rejeite. O teste passa na implementação já existente; é regressão pós-mutação, não RED fictício da implementação original. Confirmação Killed exige próximo relatório integral, ainda pendente. |
| 411/412 | Remove ou relaxa end<=start. Após os outros requisitos, texto não branco tem comprimento positivo e Array.from(text).length===end-start implica end>start. Guarda redundante nestes inputs válidos; valores iguais/negativos são recusados pela coerência do comprimento. Equivalência causal mantida no denominador, sem exclusão ou alegação de teste capaz de distinguir comportamentos idênticos. |

A pontuação do checkpoint está acima dos limiares, sem RuntimeError/NoCoverage. Não encerra T005/S05: ainda faltam novos componentes, gates da fonte final e avaliações reais do adapter/produto. Próximo relatório deve recalcular global/recorte próprios e comparar fontes de novo; não herdar estes valores após mudar escopo.
