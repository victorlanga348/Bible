# S05-T005 — Revisão causal final dos mutantes

Aceite corrigido na fonte f798f31ebd41069ee7a6caf8a8681404d7f61ad8/CI40471991297:65 Survived próprios mantidos no denominador673, zeroRuntimeError e zeroNoCoverage globais/próprios conforme SPEC. [Registo individual atual](evidence/T005-runtime-mutation-f798f31.json). Os quatro NoCoverage antigos tornaram-se Killed, junto de outros nove sobreviventes, por testes de falhas raras de ChildProcess explicitamente simuladas. Esses testes não são falhas reais do SO nem integração de IA; a prova C++143,20s é separada e a produção é byte-idêntica à b47cd23.

| Grupo | IDs atuais | Análise causal |
|---|---|---|
|D1|360|Equivalência do predicado Cc: ambos os substitutos intermediários não contêm Cc; pergunta original preservada.|
|D2|411, 412|Texto não branco tem comprimento positivo; end-start igual ao comprimento já implica end>start. Guarda redundante, conservada no denominador.|
|H2|574, 639, 640|Observação de ref/limpeza do timer não é isolada pelos asserts atuais. Fonte mantém unref/clearTimeout e deadline real é testado; não se declara equivalência de recursos.|
|H3|601, 609|Corpos técnicos de erro/oversize terminam; falta distinguir cancelamento imediato de EOF posterior. Fonte cancela body e processo próprio encerra; mutação continua Survived.|
|H4|603, 607|Guarda de tamanho no streaming também rejeita corpo conhecido excessivo. Precheck Content-Length evita leitura antecipada; consumo/latência não equivalentes universalmente, lacuna contabilizada.|
|H5|629, 630|releaseLock posterior ao consumo não é observado isoladamente; reader não é exposto pelo port. Limitação de observação de recurso, sem retirar mutante.|
|H1|516|Origem literal/canonical já só admite origin ou origin+/; ambos têm pathname /. Equivalência da guarda de pathname nesse conjunto.|
|P1|713|generationRequest repete validação antes de runtime.run para arrays de Domain. Não se prova equivalência universal: remover guarda anterior muda erro para entrada JS não iterável antes do spread.|
|N1|830, 838, 863, 889, 975|Texto do diagnóstico operacional não é comparado nestes casos. Categoria tipada/sanitização/falha fechada mantidas; mensagem vazia é diferença observável, não equivalência.|
|N2|734, 736|Erros de bind e endereço do socket efémero de reserva não são observados isoladamente. Modelo só recebe127.0.0.1, versão/pins permanecem; fonte mantém bind/reject corretos. Lacuna de teste de socket.|
|N4|764, 767, 768, 770|Ref/limpeza do timer e remoção do listener do helper não são isolados. Não confundir com761/762: estes foram Killed por duração10s>4s, evitando watchdog como prova falsa.|
|N5|779, 781|Estados de filho já encerrado/repetição de kill não são distinguidos pelos asserts de resultado; ChildProcess mantém identidade própria. Fonte preserva guardas, sem alegar equivalência para todo estado do SO.|
|N7|801, 802, 804, 805|Opção once/remoção do listener após work não são observadas isoladamente; AbortSignal dispara uma vez. Cancelamento e callback pendente são efetivamente testados; ciclo de retenção não é declarado equivalente.|
|N8|842|Invariante alcançável: run recusa nova sessão enquanto active existe e close não substitui active. Ao finalizar a sessão, active ainda é o objeto daquela chamada; comparação defensiva é redundante nesse desenho.|
|N9|866, 1043, 1044|Ref/clear do timer global não são inspecionados separadamente. Fonte aplica ambos; prazo/cancelamento comprovados. Retenção de timer não é equivalência universal.|
|N10|871, 873, 890, 971|Checkpoints de abort sobrepõem-se a verify/sinais de execFile/fetch/pause/ciclo; cancelamento em janelas exatas entre awaits não é distinguido. Fonte mantém todos, sem afirmar equivalência temporal.|
|N11|881, 882|Opções do comando de versão não são observadas integralmente; processo Jest tem env sandbox distinta do env padrão do Node host. Fonte usa allowlist/windowsHide; não afirmar que teste do modelo comprova todas as opções da versão.|
|N12|940, 941|windowsHide é específico Windows e CI é Linux; stdio vazio usa pipes padrão para saídas, stdin não é usado pelo harness. Fonte especifica stdin ignore/saídas pipe; diferença de UI/descriptor não comprovada pelo resultado.|
|N13|947, 949|Prefixo inicial Stryker não contém confirmação de ownership e não muda esse predicado; já retirar slice permite retenção ilimitada de logs e não é equivalente em memória. Fonte mantém cauda limitada8192 unidades de string; limite de retenção não é isolado no teste.|
|N14|980, 988, 990, 994, 991, 995, 1014, 1016, 1017, 1018|Sobreposições entre restante absoluto, abort de health e check pós-response; limites subms/redirect/probe que nunca responde/poll imediato não são todos distinguidos. Fonte mantém redirect:error/sinal/restante/ceil/pós-check/poll limitado. RED de health tardio foi corrigido e GREEN real; não declarar todas estas mutações equivalentes.|
|R1|1177|Igualdade abs(norm-1)==literal binary64 de0.0001 é impossível, conforme prova rational/Sterbenz e vizinhos preservada no checkpoint. Mutante permanece Survived no bruto.|
|A1|1200, 1201, 1203, 1234|Hash/leitura também recusam ficheiro inválido/tipo incompatível, mascarando prechecks stat/size. A pré-leitura é diferente em IO/memória; não afirmar equivalência universal. Fonte conserva prechecks, hash exato e testes de tamper com tamanho igual.|
|A2|1216, 1288|Código de diagnóstico constante não é assertado textualmente; classe/falha fechada/sanitização mantidas. Diferença operacional observável permanece no denominador.|
|A3|1223, 1225|path==.. designa diretório pai, também recusado por isFile/hash; path vazio designa próprio diretório na configuração operacional. Guarda redundante para targets regulares deste port; traversal por ficheiro/symlink com bytes válidos tem contraexemplos detetados.|
|A4|1239|Cancelamento de stream durante hash não é isolado de throwIfAborted inicial/readFile(key) com mesmo sinal. Latência de abort no meio de ficheiro grande é lacuna; fonte transmite signal ao stream e ao readFile, sem equivalência universal.|

Todos os65 sobreviventes têm análise/responsável/tarefa; não se identificou defeito crítico remanescente no código efetivo. Lacunas de observação restantes não são renomeadas como equivalência/PASS e continuam no bruto. Os noveTimeout próprios são categorias da ferramenta com razões preservadas no relatório, não avaliações semânticas. Todos os2814 mutantes do escopo completo permanecem, sem editar estados/cache ou excluir código. Fontes correspondem ao commit e workspace.

O [registo b47cd23](evidence/T005-runtime-mutation-b47cd23.json) conserva74Survived/4NoCoverage originais. O fecho7406a0f foi revogado por não cumprir zeroNoCoverage; [ERR-0020](../../megabrain/errors/ERR-0020-premature-nocoverage-closure.md) regista erro/correção. A presente revisão sucede essa análise, sem reescrever resultados passados. [Fecho atual](T005_COMPLETION_REPORT.md).
