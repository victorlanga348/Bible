# S05-T005 — Revisão da mutação do runtime

Estado2026-10-27: IN_PROGRESS, fecho não aprovado tecnicamente. [CI40449032546](https://github.com/victorlanga348/Bible/actions/runs/40449032546) do commit81a89a4ba710715d04114aa7374038c64394a037 concluiu com sucesso segundo o gate global existente, mas o recorte próprio de IA falha o limiar. Não herdar aprovação global para T005. [Estados originais individuais](evidence/T005-runtime-mutation-81a89a4.json), [prova real/TDD anteriores](T005_RUNTIME_CHECKPOINT.md).

| Recorte | Killed | Timeout | Survived | NoCoverage | CompileError | Bruto |
|---|---:|---:|---:|---:|---:|---:|
| Global |1623|38|267|12|862|1661/1940=85,61855670103093%|
| ai-assistant |494|8|148|12|245|502/662=75,83081570996978%|

Zero RuntimeError. NoCoverage permanece no denominador; CompileError fica separado conforme norma. Nenhum estado editado/excluído, padrão src/checker/limiares intactos.59 fontes do JSON correspondem ao commit e código de produção atual.2082/2802 resultados reutilizados pelo Stryker,720 reavaliados. Integração/estática/build/24tooling/1165 testes/55suites PASS; linhas1137/1138=99,91%, branches681/707=96,32%. Próprio272/273 linhas e244/261branches; diferença Linux/Windows de teardown real registada sem substituir métricas locais.

Artefacto12710278245/backend-quality, ZIP1417770 bytes/SHA c403ba97d5b10683ea980eaf9ac19b5f1503d6662bc8d1361372e184d47c4eb6 confrontado com digest GitHub; mutation.json SHA09280e337d58e4ca06ea12a33dd793ef3df4506f9e86a956c41d04bcc5718c2b. Originais ignorados `reports/ci-40449032546-*`, comando `python reports/audit-s05-runtime-ci.py 40449032546 81a89a4ba710715d04114aa7374038c64394a037`, resultado `s05-runtime-ci-40449032546-audit.json`. ZIP validado antes de extração com proteção de caminho. URL temporária privada não publicada.

## Causas confirmadas e regressões

Cinco lacunas do checkpoint2daad433 foram detetadas agora: join de múltiplas frases, classificação de contexto inválido, completion_tokens=1, uma embedding e dimensão errada com norma válida. Prompt não tem sobreviventes; protocolo conserva só a fronteira binary64 equivalente1165. Domain conserva360/411/412 equivalentes, sem exclusão do denominador. IDs são do relatório específico, não identificadores permanentes entre fontes.

Outras lacunas confirmadas na leitura dos testes e fontes:

- Caminhos externos tinham bytes/tamanho diferentes do modelo, fazendo outra guarda mascarar a proteção de diretório. Agora usam os mesmos bytes/pins/tamanho e testam symlink para fora e caminho externo que resolve para dentro.
- Manifest vazio não isolava a exigência do pin do executável: uma library não vazia podia mascarar o predicado. Novo caso conserva a library e retira somente o pin do exe.
- Perfil alterado tinha tamanho diferente; novo caso muda conteúdo sem mudar bytes de tamanho, isolando hash.
- Faltavam limites positivos de chave32/128, ficheiro1024 bytes com chave válida após trim, deadline1/120000, porta1 e resposta de exatamente um byte, tanto Content-Length como streaming. Entradas que normalizam para origem mas não são canónicas isolam o guard de spelling; todos os quatro endpoints e media type JSON são verificados.
- Argumentos de CPU/contexto/batch/offline/alias/non-thinking agora são conferidos por opção; marcador técnico permitido e outro proibido distinguem whitelist de ambiente vazio/herdado, inclusive no comando de versão. Não se repõem variáveis de sistema para testar.
- Readiness verificava só classe de erro: o prazo global podia mascarar a ausência do prazo de readiness. Novo limite observável4s separa readiness1s de operação10s no harness. Confirmação de ownership é exigida mesmo com servidor técnico capaz de responder health; stdout e stderr são exercitados. PID/nonce da lease são conferidos.
- Cancelamento ativo antes do listener do callback, health inesperado e diagnóstico arbitrário do callback têm contraexemplos próprios. Query de um único input e template somente branco cobrem limites de provider.

São regressões pós-mutação sobre regras já implementadas, sem RED original fictício.151 testes dirigidos/4suites PASS15,157s; regressão `npm run test:unit`854/26suites PASS24,078s, typecheck/lint/24tooling PASS. Logs `s05-t005-mutant-*`. Produção/prompt/perfil/modelos não mudaram, logo não há nova inferência atribuída a estes testes. Confirmação Killed/NoCoverage resolvido depende da próxima execução integral; sobreviventes restantes terão análise causal individual antes do fecho. Não chamar cada sobrevivente de bug ou equivalente sem contraexemplo/prova.

## Oito timeouts próprios

HTTP618 remove corpo do ciclo de leitura; limite de instrumentação2009/2000 detetou o loop. Native970 remove corpo do ciclo de readiness, limite13212/13200. Native732/737/738 retiram resolução de promises de bind/close;766 torna Promise.race vazio;797 retira o corpo de coordenação abortable;879 remove os argumentos do comando de versão. Estados originais são Timeout, não RuntimeError nem inferência lenta de modelo. Esses pontos eliminam progresso/resolução no harness; não se afirma uma causa de timeout do SO ausente do log.8/662 válidos próprios, sem contagem como sucesso semântico de IA, conforme cálculo normativo da ferramenta.

Próximo passo: publicar reforços, executar CI completa com cache validado pelo Stryker, comparar fontes e recalcular global/próprio. T005 permanece IN_PROGRESS e T006/T007 dependentes. Nenhum modelo/serviço de outro projeto foi iniciado/parado para contornar gate; teste PostgreSQL próprio permanece ativo.
