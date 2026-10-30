# S10-T001 — Revisão da mutação de transporte

Execução2026-10-30, Node24.16/TS6.0.3/Stryker10.1.1/Vitest5.0.5. Cinco fontes,271assinaturas conferidas pelo instrumentador independente; relatório SHA2561512577c755bbbfa313928adc7f6ff4e92fad1ac62053fb5df5e688edcfd7593. Bruto181Killed/1Timeout/13Survived/76CompileError, zeroRuntimeError/NoCoverage. Score182/195=93,333333%, PASS estritamente acima de85. CompileError fica fora do denominador conforme política; nenhum mutante removido, ignorado ou reclassificado.

Incremental oficial:0fontes alteradas/2ficheiros de testes novos/17testes novos. Dry-run97PASS36s;165resultados reutilizados e106verificados. Execução completa5min21s. Artefactos locais ignorados em frontend/reports/mutation/transport, log backend/reports/s10-t001-mutation-transport-stable.log. Primeira medição82,5641% e tentativas falhadas/interrompidas preservadas; não substituídas por PASS retroativo.

| Fonte / IDs sobreviventes | Análise e decisão |
|---|---|
| api-proxy42 | Retira apenas a âncora inicial da reescrita. A chave externa do proxy já exige o prefixo inicial /api; dentro desse contrato a âncora é redundante. Não excluir nem alterar o relatório. |
| client122 | Texto de fallback genérico não comparado literalmente; código/status/tipo do erro são verificados. Lacuna de deteção de mensagem, sem alegar equivalência. |
| http-client129 | Nome Error.name não comparado; classe/status/code são verificados. Lacuna de deteção, mantida no score bruto. |
| http-client190/247 | Condição do clearTimeout sempre verdadeira. clearTimeout(undefined) não agenda nem deixa timer ativo; testes verificam liberação nos dois caminhos. Sem necessidade de impor a presença literal do guard. |
| http-client197 | Fallback de JSON inválido muda de objeto vazio para undefined. Erros HTTP continuam classificados por fallback; sucesso com JSON inválido não tem semântica aprovada nesta tarefa. Não criar requisito apenas para matar mutante. |
| http-client232/268/269 | Textos de erro/timeout/rede não comparados literalmente. Status/códigos e timeout efetivo verificados; lacunas mantidas, sem declarar equivalência. |
| http-client238 | Retira guard de existência de window na emissão de401. Cliente de browser já precisa de window para resolver a URL; não inventar desaparecimento artificial dessa plataforma durante a requisição. |
| http-client258/260 | Reconhecimento de AbortError não exercitado. Cancelamento externo e timeout precisam de correção contratual em T003; não congelar a classificação atual incorreta só para aumentar score. |
| vite.config271 | loadEnv passa a ler todos os nomes, mas continua a selecionar só BIBLE_API_PROXY_TARGET, sem expor objeto ao bundle. O prefixo restringe a leitura; mutante permanece sobrevivente e sem dispensa. |

Timeout103/client57: altera fallback do catch de JSON. O estado bruto é Timeout; não há evidência suficiente para atribuir uma causa específica nem afirmar deteção semântica. Como análise conservadora adicional, tratar esse único resultado como não detetado daria181/195=92,820512%, ainda acima do gate. Não modificar o artefacto nem declarar uma causa que não foi demonstrada.

Gates globais do frontend e comportamento Google/IA não são medidos por este recorte. A revisão não dispensa os gates da S10-T005.
