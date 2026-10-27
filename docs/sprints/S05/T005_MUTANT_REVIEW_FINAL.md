# S05-T005 — Revisão causal final dos mutantes

Revisão de aceite corrigida: este registo preserva os74Survived/4NoCoverage da fonte b47cd23, mas não autoriza fecho T005. A SPEC exige zeroNoCoverage, pelo que os quatro caminhos precisam de prova automatizada, não só inspeção/denominador. [ERR-0020 e ação](../../megabrain/errors/ERR-0020-premature-nocoverage-closure.md). Novos unitários cobrem esses estados; estados originais abaixo não são editados e o novo relatório será separado.

Fonte b47cd2345224bd0c69807aef5dc8db14827d7bd5, CI40456053750.74 Survived e4 NoCoverage próprios, todos conservados no denominador673. Cada um tem análise/responsável/tarefa no [registo individual](evidence/T005-runtime-mutation-b47cd23.json). Não se identificou defeito crítico remanescente no código efetivo; lacunas de observação/falhas raras estão explicitadas, sem lhes atribuir PASS ou equivalência automática. O aceite respeita limiares aprovados e não é prova de todos os fault paths.

| Grupo | IDs deste relatório | Análise causal |
|---|---|---|
|D1|360|Equivalência do predicado Cc: ambos os substitutos intermediários não contêm Cc; pergunta original preservada.|
|D2|411, 412|Texto não branco tem comprimento positivo; end-start igual ao comprimento já implica end>start. Guarda redundante, conservada no denominador.|
|H1|516|Origem literal/canonical já só admite origin ou origin+/; ambos têm pathname /. Equivalência da guarda de pathname nesse conjunto.|
|H2|574, 639, 640|Observação de ref/limpeza do timer não é isolada pelos asserts atuais. Fonte mantém unref/clearTimeout e deadline real é testado; não se declara equivalência de recursos.|
|H3|601, 609|Corpos técnicos de erro/oversize terminam; falta distinguir cancelamento imediato de EOF posterior. Fonte cancela body e processo próprio encerra; mutação continua Survived.|
|H4|603, 607|Guarda de tamanho no streaming também rejeita corpo conhecido excessivo. Precheck Content-Length evita leitura antecipada; consumo/latência não equivalentes universalmente, lacuna contabilizada.|
|H5|629, 630|releaseLock posterior ao consumo não é observado isoladamente; reader não é exposto pelo port. Limitação de observação de recurso, sem retirar mutante.|
|P1|713|generationRequest repete validação antes de runtime.run para arrays de Domain. Não se prova equivalência universal: remover guarda anterior muda erro para entrada JS não iterável antes do spread.|
|N1|830, 838, 863, 889, 975|Texto do diagnóstico operacional não é comparado nestes casos. Categoria tipada/sanitização/falha fechada mantidas; mensagem vazia é diferença observável, não equivalência.|
|N2|734, 736|Erros de bind e endereço do socket efémero de reserva não são observados isoladamente. Modelo só recebe127.0.0.1, versão/pins permanecem; fonte mantém bind/reject corretos. Lacuna de teste de socket.|
|N3|749, 750, 751, 753|Guarda de filho já terminado em stoppedWithin depende da ordem exit/close. Fluxo normal e kill real cobertos, mas corrida de término precoce não distinguida; sem equivalência universal.|
|N4|764, 767, 768, 770|Ref/limpeza do timer e remoção do listener do helper não são isolados. Não confundir com761/762: estes foram Killed por duração10s>4s, evitando watchdog como prova falsa.|
|N5|779, 781, 786|Estados de filho já encerrado/repetição de kill não são distinguidos pelos asserts de resultado; ChildProcess mantém identidade própria. Fonte preserva guardas, sem alegar equivalência para todo estado do SO.|
|N6|791, 853, 1036, 962, 755, 793, 963, 964|Falha dupla de stop/erro assíncrono de spawn e término antecipado raro não são injetados. Quatro NoCoverage755/793/963/964 permanecem no denominador. Inspeção: stopped só fica true após stopOwnChild; falha conserva lease; erro de spawn marca failed. Não há PASS individual desses caminhos nem equivalência declarada.|
|N7|801, 802, 804, 805|Opção once/remoção do listener após work não são observadas isoladamente; AbortSignal dispara uma vez. Cancelamento e callback pendente são efetivamente testados; ciclo de retenção não é declarado equivalente.|
|N8|842|Invariante alcançável: run recusa nova sessão enquanto active existe e close não substitui active. Ao finalizar a sessão, active ainda é o objeto daquela chamada; comparação defensiva é redundante nesse desenho.|
|N9|866, 1043, 1044|Ref/clear do timer global não são inspecionados separadamente. Fonte aplica ambos; prazo/cancelamento comprovados. Retenção de timer não é equivalência universal.|
|N10|871, 873, 890, 971|Checkpoints de abort sobrepõem-se a verify/sinais de execFile/fetch/pause/ciclo; cancelamento em janelas exatas entre awaits não é distinguido. Fonte mantém todos, sem afirmar equivalência temporal.|
|N11|881, 882|Opções do comando de versão não são observadas integralmente; processo Jest tem env sandbox distinta do env padrão do Node host. Fonte usa allowlist/windowsHide; não afirmar que teste do modelo comprova todas as opções da versão.|
|N12|940, 941|windowsHide é específico Windows e CI é Linux; stdio vazio usa pipes padrão para saídas, stdin não é usado pelo harness. Fonte especifica stdin ignore/saídas pipe; diferença de UI/descriptor não comprovada pelo resultado.|
|N13|947, 949|Prefixo inicial Stryker não contém confirmação de ownership e não muda esse predicado; já retirar slice permite retenção ilimitada de logs e não é equivalente em memória. Fonte mantém cauda limitada8192 unidades de string; limite de retenção não é isolado no teste.|
|N14|980, 988, 990, 991, 994, 995, 1014, 1016, 1017, 1018|Sobreposições entre restante absoluto, abort de health e check pós-response; limites subms/redirect/probe que nunca responde/poll imediato não são todos distinguidos. Fonte mantém redirect:error/sinal/restante/ceil/pós-check/poll limitado. RED de health tardio foi corrigido e GREEN real; não declarar todas estas mutações equivalentes.|
|R1|1177|Igualdade abs(norm-1)==literal binary64 de0.0001 é impossível, conforme prova rational/Sterbenz e vizinhos preservada no checkpoint. Mutante permanece Survived no bruto.|
|A1|1200, 1201, 1203, 1234|Hash/leitura também recusam ficheiro inválido/tipo incompatível, mascarando prechecks stat/size. A pré-leitura é diferente em IO/memória; não afirmar equivalência universal. Fonte conserva prechecks, hash exato e testes de tamper com tamanho igual.|
|A2|1216, 1288|Código de diagnóstico constante não é assertado textualmente; classe/falha fechada/sanitização mantidas. Diferença operacional observável permanece no denominador.|
|A3|1223, 1225|path==.. designa diretório pai, também recusado por isFile/hash; path vazio designa próprio diretório na configuração operacional. Guarda redundante para targets regulares deste port; traversal por ficheiro/symlink com bytes válidos tem contraexemplos detetados.|
|A4|1239|Cancelamento de stream durante hash não é isolado de throwIfAborted inicial/readFile(key) com mesmo sinal. Latência de abort no meio de ficheiro grande é lacuna; fonte transmite signal ao stream e ao readFile, sem equivalência universal.|

Todos os estados originais são preservados. Não houve exclusão de código próprio/estáticos, edição de estados/cache ou redução de checker/limiar. Mutantes compileError estão separados; nove Timeout são deteções da ferramenta, analisados no relatório final. Fontes coincidem com commit e workspace. [Relatório/revisão corrente](T005_MUTATION_RUNTIME_REVIEW.md).
