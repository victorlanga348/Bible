# Reproduzir os percursos nativos de S10-T003

O runner específico usa Chrome instalado, frontend5273 e API32124. Nunca reutiliza um servidor que já ocupe5273. Não é um deployment nem um teste da conta pessoal Google. Acesso feito com JWT de teste emitido em memória pelo backend real; traces/vídeos ficam desligados. Não fornecer credenciais no chat nem guardar tokens nos relatórios.

Pré-condições desta composição: Node/npm das versões fixadas, dependências dos locks existentes, backend compilado com os dois clientes Prisma gerados, PostgreSQL isolado em127.0.0.1:61073 com db/rolebiblia_test/schemasapp e ai e migrações aplicadas. O helper confirma URL e identidade SQL antes de importar; não limpa o banco. O container desta execução e a sua propriedade estão registados em T003_TEST_REPORT e no manifesto privado backend/reports/s10-native-database.json. Nunca parar um serviço por ocupar uma destas portas; escolher uma infraestrutura própria e rever explicitamente a composição caso estas portas não estejam disponíveis.

O backend/.env.test privado deve apontar exclusivamente para esse alvo de teste, com NODE_ENV=test, TEST_DATABASE_URL no schemaapp, BIBLE_AI_DATABASE_URL derivada para schemaai e jwtSecret de teste válido. BIBLE_AI_HOME aponta para o diretório local de runtime/modelos já admitidos. O ficheiro não é versionado. Não modificar .env de desenvolvimento para simular teste isolado. Aplicar migrações com o script existente npm run db:migrate:test no backend; a identidade test é obrigatória.

Os originais são explícitos, autenticados pelos pins existentes antes da importação:

- S10_CANON_DIRECTORY: diretório local com source.zip e snapshot.json full da BLIVRE,31.102versículos. O importador de teste usa o manifesto test/fixtures/biblical-canon/porbr2018/manifest.json, tal como a suite de aceitação; não usar o manifesto operacional de admissions com este importador.
- S10_SOURCE_FILE: source.html original admitido de Josephus/Whiston/PG2848. O helper chama admitAiSources com a admissão test-ai existente: importa texto, direitos/aviso e as quatro ligações curadas entre fonte e passagem. Importar só os parágrafos não associa a fonte a um estudo; indexar não cria essas ligações.

Em PowerShell, dentro de frontend, definir os dois paths acima nas respetivas variáveis de ambiente e PLAYWRIGHT_CHANNEL=chrome. Executar os scripts reais:

```powershell
npm run test:e2e:workflows -- --grep 'persists versions'
```

O percurso cria dados somente com o owner técnico único da execução; confirma SQL/contratos/409/404 e elimina o estudo e os dados associados. O teste responsivo separado é:

```powershell
npm run test:e2e:workflows -- --project 'Mobile Chrome' --grep 'opens and closes'
```

Para testar o build, executar npm run build e definir PLAYWRIGHT_PREVIEW=1 antes dos mesmos comandos; remover a variável depois. O runner usa o proxy de preview real, com as mesmas portas da composição. A configuração geral Playwright conserva os testes anteriores e exclui este spec dependente de infraestrutura própria.

Inferência real é uma execução separada, sem Vitest/mutação/modelos concorrentes neste PC. Confirmar antes que nenhum recurso nativo pertence a outra operação. Não apagar locks. Definir S10_NATIVE_AI=1 e executar:

```powershell
npm run test:e2e:workflows -- --project chromium --grep 'executes one native'
```

Esse teste indexa os segmentos admitidos, pede uma resposta pelo browser, exige uso/proveniência reais e citação conferida contra o endpoint público source-excerpts, depois cancela outra operação e verifica fechamento HTTP/libertação dos locks e revisão persistida. Falha de fonte/modelo/infraestrutura continua FAIL/BLOCKED; uma resposta que declara que nenhum modelo foi executado não comprova inferência. O caso sem S10_NATIVE_AI é NOT_RUN, não PASS de IA. Revisão semântica da citação continua separada das asserções técnicas. Artefactos de Playwright podem ser substituídos pela execução seguinte; conservar os resultados usados na revisão em backend/reports antes de repetir.

Cancelamento nativo pode ser observado separadamente, sem confundir aborto com geração concluída:

```powershell
npm run test:e2e:workflows -- --project chromium --grep 'cancels an owned native'
```

Para diagnosticar somente API/runtime real sem iniciar outro browser, definir também S10_NATIVE_TRACE=1 e executar:

```powershell
npm run test:e2e:workflows -- --project chromium --grep 'observes native model API stages'
```

O trace opcional usa diagnostics_channel apenas para endpoints loopback permitidos, portas/status/tempos; nunca recolhe cabeçalhos, corpo, chave ou argumentos de processo. Unsubscribe no fechamento. O diagnóstico atual terminou201/189262ms, geração106880ms; duas repetições do percurso combinado terminaram504 e continuam FAIL. Não executar repetidamente nem ampliar budgets para esconder a indisponibilidade. Ver [validação atual](T003_CURRENT_VALIDATION.md).

Após as provas, os próprios runners fecham API/frontend/runtime em finally/afterAll. Confirmar a propriedade por ID/labels/manifesto antes de parar o container descartável desta tarefa. Não remover dados/serviços/modelos de outra execução. Estado e provas efetivamente obtidas estão em [T003_TEST_REPORT](T003_TEST_REPORT.md).
