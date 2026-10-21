# S03-T005 — Source e SourceExcerpt puros

Atualização2026-10-21: plano/contratos aprovados pelo «vai enfrente»; T004 concluiu admissão do recorte e fixture reais. T005 READY → IN_PROGRESS ao iniciar RED. Sem Application/persistência/HTTP; associações adiadas conforme aceite. Texto abaixo preserva o plano apresentado, sem alteração de escopo.

Estado final: DONE técnico em2026-10-21 após REVIEW. Critérios1–4 PASS: RED137 por comportamento ausente → GREEN137 → regressão289 (265 unit/7 integração/17 E2E), estática/build/tooling13/arquitetura aprovados. Novo Domain70/70 linhas e32/32 branches; global231/231 linhas e118/121 branches. Stryker78/78 válidos novos detetados, nenhum sobrevivente novo; global287/293=97,95221843003414%. Fontes do relatório iguais a src e JSON/cache válidos. Comandos/artefactos/análise/limites no TEST_REPORT. Gates1/2/3/5/7 aprovados no recorte;4 não aplicável ao Domain puro/6 sem IA. Associações permanecem adiadas conforme aceite, sem PASS atribuído ao componente excluído. Sprint continua IN_PROGRESS e commit PENDING.

Data:2026-10-21. Trilha A, alta prioridade. Estado: BLOCKED por T004 e aceite deste plano/SPEC v0.1. Responsável proposto: agente executor; aprovador: utilizador. Uma tarefa por vez, branch feat/biblia-backend. Plano concreto para revisão, sem código/teste implementado.

## Escopo e dependências

Source/SourceExcerpt com campos/invariantes/permissions da SPEC; erro próprio e helper específico apenas se necessário, sem abstrações genéricas. Valores de metadados/texto vêm da fixture autêntica admitida em T004. Domain independente de framework/SDK/Prisma/Zod/fs/ambiente; checksum estrutural no Domain, confronto dos bytes/hashes nos adapters futuros.

Elegibilidade pura: ingestão requer ingest/store allowed; leitura requer display/quote allowed; pesquisa requer index mais permissões de leitura allowed. pending/denied nunca autorizam a operação; não inferir sendToAi. Source pode representar estado de curadoria pendente sem admitir ingestão/uso automaticamente. Fonte não vazia/URLs/data/hash válidos; excerpt text não branco, ordem positiva segura e identidades/locator explícitos, preservando texto exato e estado validado imutável. Existência do Source/locator/associações/consulta e cálculo do hash real pertencem à Application/Infrastructure.

Associações fonte-passagem mencionadas no título histórico ficam explicitamente adiadas na proposta, por ausência de contrato real de existência biblical-canon. Não importar classe do outro módulo como atalho, simular validação ou implementar S02-T006. Sem ports vazios/Application/controller/migração nesta tarefa.

## Ficheiros, alternativas e riscos

backend/src/modules/source-library/domain/{source,source-excerpt,source-permissions,source-domain-error}.ts e backend/test/unit/source-library/. Helpers só quando usados. Sem dependência/tecnologia nova. Consultar novamente SPEC/contratos/ADR-0003/0004, fronteiras e ERR-0001/0002 antes do RED. Nenhuma skill adicional necessária para objetos/regras puros da stack existente.

Vantagem: regras de identidade/proveniência/direitos testáveis sem banco; custo: não entrega pesquisa/API. Alternativa de implementação Application primeiro dependeria de adapter real ainda ausente; manter T006 com ambos. Riscos: falsos direitos por default, texto alterado, permissões confundidas e estados mutáveis; mitigar com matriz allowed/pending/denied por operação, dados reais, limites/imutabilidade e mutação integral.

## Critérios e TDD verificável

1. Source preserva metadados reais/identidade e recusa vazios/URL/data/hash inválidos; translator null quando não identificado, sem inventar nome/datas.
2. SourceExcerpt preserva text/locator/ordem/id/sourceId/hash estrutural, recusa estado inválido e não afirma existência de Source/posição nem suporte histórico.
3. Matriz de direitos separada, só combinação exigida de allowed habilita operação; pending/denied bloqueiam sem influência de permissão diferente. Registar que isto é regra determinística, não validação jurídica.
4. RED por família antes de comportamento, stubs mínimos compiláveis se necessário; guardar falha esperada, nunca contar erro de import/sintaxe/serviço como RED. GREEN mínimo; REFACTOR/regressão/arquitetura sem comportamento extra. Reforços posteriores são documentados como regressão, não RED original.

Comandos reais: test:unit filtrado para source-library, test:coverage, typecheck, lint, build, test:tooling e test:mutation/incremental existentes. Integrações técnicas de regressão reais e serializadas; unidade pura não exige DB de domínio. Cobertura>=90% linhas/>=85% branches, mutação bruta>85% global e prioridade no novo Domain, sem tirar código próprio/operadores do denominador; paths de cache/relatório distintos. Analisar sobreviventes e comparar source do relatório com src.

Gates1/2/3/5/7 exigidos para DONE; gate4 não aplicável ao novo Domain sem infraestrutura (sem substituir prova futura S03); gate6 não aplicável sem IA. Estados atuais de implementação/testes NOT_RUN. Exigir corpus/fixture/planos aprovados antes de iniciar; falta obrigatória é BLOCKED. Atualizar critérios/report/review/README/contexto/erros reais depois. T006/T007 exigem planos próprios; sem encerramento/commit S03 autorizado.
