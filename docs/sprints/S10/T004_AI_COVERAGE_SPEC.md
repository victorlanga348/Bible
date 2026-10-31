# S10-T004 — ampliação local da cobertura documental

Estado: ACEITE por decisão do agente delegado em 2026-10-31, antes de dados novos, testes e implementação. Origem: autorização integral vigente e PLAN S10, T003 DONE em 1f053b1/CI41198918785. Uma tarefa por vez, sem agentes. Não atribuir esta escolha específica ao utilizador.

## Objetivo e decisão

Ampliar os contextos em que a geração extrativa existente pode usar evidência documental: quatro associações adicionais entre passagens reais de Génesis e os quatro parágrafos originais já admitidos de Josefo/Whiston, Antiquities I.1.1–4. O runtime local-extractive-v1, prompt v6, dois modelos/digests, fontes/textos/licenças e limites permanecem os admitidos. Outra associação não é outra fonte ou testemunha independente. Não admitir geração livre em português nem prometer conhecimento de toda a Bíblia.

Evidência de viabilidade: T003 obteve resposta e cancelamento reais; geração medida em 94,655s e 106,88s, com duas falhas504 históricas. Portanto não há fundamento para prometer latência de um modelo maior neste PC de 8GB. Não concluir que todos os modelos maiores são inviáveis sem os medir. A opção escolhida acrescenta cobertura sem novo download/modelo/dependência/serviço; continua sujeita a avaliações reais e pode falhar.

Alternativas: trocar modelo/prompt exige nova admissão, comparação semântica e recursos; fonte nova exige ingestão/curadoria/direitos próprios; serviço remoto/pago não autorizado. Alterar os manifestos v1 existentes invalidaria pins/índice e versões sem necessidade. Criar admissão adicional só de curadoria preserva os originais, permite auditoria e não requer reconstrução de embeddings do mesmo texto. Custo: cobertura estreita e mesmas limitações de desempenho/língua da fonte.

## Curadoria a materializar

Texto canónico: snapshot porbr2018 autêntico, arquivo SHA256 1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682; XML membro 5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db. Conferir as passagens contra esse XML e snapshot antes da fixture. Texto histórico: os quatro parágrafos operacionais existentes; não gerar nem traduzir conteúdo.

| Ligação adicional | Passagem | Parágrafo | Justificação/limite |
| --- | --- | --- | --- |
| light | GEN1:3–5 | I.1.1 / p1 | Ambos narram a luz e a separação/nomeação dia/noite; paralelo narrativo, sem confirmação histórica independente. |
| garden | GEN2:8–9 | I.1.3 / p3 | Ambos narram o jardim a oriente e árvores da vida/conhecimento; paralelo narrativo, sem verificação geográfica independente. |
| woman | GEN2:21–22 | I.1.2 / p2 | Ambos narram o sono de Adão e formação da mulher a partir da costela; paralelo narrativo, sem prova biológica independente. |
| fruit | GEN3:6 | I.1.4 / p4 | Ambos narram a mulher e Adão comendo o fruto; paralelo narrativo, sem prova histórica independente. |

Usar IDs novos `local-ai-coverage-v1-gen-*`, nature narrative-parallel e source/excerpt IDs existentes. Atribuições, limitações, texto e aviso integral continuam os originais. Perfil de cobertura próprio referencia o perfil de execução pinado; não altera permissões nem usa o cânone como texto enviado ao modelo. Fonte histórica já admitida fornece o contexto de IA.

## Contrato operacional

Adicionar manifestos separados `admissions/ai-coverage-v1.json` (local-ai) e `test/fixtures/ai-assistant/coverage-v1/manifest.json` (test-ai), pins SHA256 distintos e documentados depois de produzir bytes. Cada manifesto identifica perfil de cobertura, propósito, runtimeProfileSha256, sourceManifestSha256 e quatro links. Operação `admitAiCoverage(links, manifestPath, purpose)` autentica todos os bytes pelo pin antes de qualquer escrita e usa só a API pública SourcePassageLinks.curate; ficheiro ausente/alterado/propósito errado falha SourceSnapshotError. IDs/ranges/canon/direitos continuam validados pela biblioteca real. Não aceitar overrides por HTTP ou introduzir endpoint/schema novo.

Resultado: lista imutável de imported/unchanged pela ordem do manifesto. Retry explícito idempotente; falha SQL intermédia propaga e preserva os links anteriores, podendo retomar, sem prometer transação global. Nenhum seed de fixture em desenvolvimento. Script existente db:import:ai:dev importa fonte/curadorias v1 e depois a admissão adicional local-ai; CLI continua sem path/purpose overrides. Não alterar configurações reais do utilizador ou dados de desenvolvimento durante esta tarefa.

Novos estudos/revisões explícitas podem recolher as novas evidências; versões antigas permanecem imutáveis. Índice dos mesmos quatro textos continua compatível e deve ser revalidado, não reconstruído ficticiamente. Fixtures canónicas são derivadas separadamente do XML pinado (as quatro passagens antigas e as oito linhas novas), com origem/digests; jamais corpus operacional.

Pins materializados antes da autenticação: operacional f67ede1ba6c6146c39202699bcc0d812ada9e5b1a05f8ba7251d4a54c2d2274a; teste a286a7f83aca32955b3d461c8a9532097abd843a34a33c1ed33b54041350137e; fixture canónica40e759585755a5c3270d1181a796bc2899a2f57533e7a15c516ee67de6d263dc. Perguntas/IDs/offsets fixados em scripts/ai-coverage-cases.cjs antes das chamadas. Novo comando opcional `npm run test:ai:coverage:native` usa exclusivamente .env.test/guard de biblia_test, fonte/fixture autênticas, owners próprios e modelo real; não se inclui na CI determinística nem envia dados a fornecedor remoto. Limite de cinco casos iniciais; resultados semânticos separados. Não aceita overrides CLI e não limpa tabelas ou estudos alheios.

Adenda de execução antes da CI: incluir a candidata feat/biblia-integracao-validacao no trigger backend existente, preservando todas as branches/gates/configurações/operadores. Nenhuma redução de escopo nem contagem antiga atribuída a fontes novas. Seed/cache incremental já configurados no pipeline são apenas entrada do Stryker; análise atual completa e inventário/revisão final obrigatórios.

## TDD, avaliações e gates

1. RED funcional na composição existente: depois da admissão atual, a pesquisa das quatro novas ligações e estudos correspondentes deve demonstrar ausência de evidência para esses intervalos; teste espera o comportamento novo e falha por essa ausência. Não usar import inexistente/sintaxe/serviço ausente como RED.
2. GREEN: admissão adicional mínima e consumo pelo comando operacional; PostgreSQL de teste próprio identificado em T003. Testes reais verificam oito links totais, origem/digests, estudos com evidência correta, retry, propósito/corrupção/ausência antes de escrita e retomada após falha SQL controlada. Verificação do preparo compara fixture com XML original e pins.
3. Regressões/static/build/arquitetura/tooling/cobertura; mutação global backend e gate IA com inventário integral/score bruto>85%/zero NoCoverage e RuntimeError. A revisão anterior só valida fontes que permanecem idênticas; frontend idêntico conserva CI41198918785. Não excluir a operação nova do Stryker.
4. Antes de inferência, fixar perguntas/IDs de frases/offsets contra os originais. Uma tentativa inicial por caso, sem modelo/suite concorrentes: E01 GEN1:3–5, nomes luz/escuridão segundo Josefo; E02 GEN2:8–9, posição do paraíso segundo Josefo; E03 GEN2:21–22, formação da mulher segundo Josefo; E04 GEN3:6, quem persuadiu Adão a provar o fruto segundo Josefo; E05 negativa sobre data arqueológica independente. Só pergunta e versão chegam à API, nunca resposta esperada.
5. Exigir respostas e uso real/modelo/engine/perfil/fontes, quote literal/offsets, atribuição/direitos e proveniência corretos. Determinístico e revisão semântica separados; quatro positivos devem suportar a frase pertinente e negativa declarar insuficiência. Falha504/sem suporte fica FAIL, sem selecionar só os casos fáceis ou aumentar budgets. Eventual diagnóstico/repetição requer decisão registada antes, preservando a primeira tentativa.

Provas e sete gates em T004_TEST_REPORT; conta Google pessoal continua adiada. Fecho somente após critérios aplicáveis comprovados; expansão não autoriza publicação, API paga, fonte nova, modelo novo ou mudança silenciosa do v1.
