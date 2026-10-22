# Execução integral autorizada — 2026-10-22

Origem: pedido posterior do utilizador para executar tudo o que for necessário, terminar todas as sprints e fazer push sem autorização prévia adicional, com registo detalhado. Decisões de implementação delegadas ao agente; não são decisões individuais prévias do utilizador. Esta autorização substitui pausas por aprovação, preservando specs/ADRs históricos e provas reais. Não autoriza declarar PASS sem execução, omitir falhas ou expor segredos.

## Ordem, escopo e saídas

1. EXT-002: completar provisionamento de bible_db no PostgreSQL16.14 do PC; schema app, três migrações existentes e prova Nest/Prisma/HTTP de leitura. Preservar credenciais e isolamento dos testes PostgreSQL17 no Docker. Fonte de ligação: DATABASE_URL; campos POSTGRES_* são conferidos quanto a coerência, não interpolados automaticamente.
2. S02-T006/T007: retomar integração/API bíblicas já especificadas, antes adiadas. Persistência/importação atómica do snapshot aprovado, existência/navegação/consulta/pesquisa reais; fixture permanece só de teste. Reabrir somente essas tarefas e distinguir commit original reduzido do complemento atual.
3. S04: refinar contratos e implementar estudo determinístico com seleção bíblica validada, secções explícitas, evidências recuperadas, limitações e persistência; nenhuma análise histórica fabricada. Complementar associações fonte-passagem quando a existência real do cânone estiver disponível.
4. S05: geração e recuperação com fornecedor real e avaliação semântica. Investigar execução local para evitar depender de credencial paga ausente; justificar qualquer novo runtime/modelo/licença/recurso antes de instalar. Direitos sendToAi exigem nova avaliação para os dados efetivamente enviados. Nenhuma resposta estática é prova de IA. Serviço/credencial obrigatória ausente deixa gate bloqueado.
5. S06: continuação contextual com histórico ordenado, associação ao estudo e políticas de acesso/retenção documentadas.
6. S07: relações justificadas, notas/favoritos e recuperação de estudos/sessões por contratos públicos dos módulos, com isolamento de acesso e proveniência.
7. S08: auditoria, regressão completa, migrações/recuperação, segurança, desempenho básico medido, observabilidade, avaliações e runbooks. Publicar commits na branch dedicada e inspecionar CI; conservar falhas remotas como falhas até correção.

## Método e validação

Antes de cada tarefa: ID/plano concreto, campos/endpoints/regras, alternativas/riscos, dependências e critérios no diretório canónico. Uma tarefa ativa; sem agentes paralelos. Alterações de comportamento seguem RED executado pela razão certa, GREEN mínimo e refactor com regressão. Não construir implementação primeiro para simular RED depois. Configuração/migração requer prova executável; documentação, links/estados/UTF-8/diff. Excluir segredos e artefactos gerados do Git.

Sete gates aplicáveis, linhas>=90%, branches>=85%, mutação bruta>85%, sem baseline obrigatória falhada/bloqueada. PostgreSQL real/Nest/Supertest; mutação com denominador e sobreviventes preservados. Avançar sequencialmente com evidências, não com percentagens atribuídas a funcionalidades ausentes. Integrações IA têm critérios semânticos próprios. Nenhuma instalação paga/orçamento ilimitado é inferido; priorizar recursos locais/gratuitos quando adequados.

## Riscos e alternativas

PG16 local difere do PG17 testado: executar migrações/provas reais, não inferir compatibilidade. Ampliar corpus sem curadoria é proibido; usar snapshot autenticado existente e indicar cobertura. Duplicação de credenciais/configuração exige coerência sem divulgar valores. IA pequena local pode falhar qualidade: medir, corrigir seleção/prompt/contratos ou registar bloqueio, nunca baixar critérios para obter DONE. Alternativa de fornecedor pago depende de credencial e limites operacionais disponíveis, não de uma chave fictícia. Microserviços/Redis/filas não se justificam neste monólito.

## Registo detalhado

Cada sprint conserva PLAN/TASKS/ACCEPTANCE_CRITERIA/TEST_REPORT/REVIEW e evidências locais ignoradas com comandos, ambiente, data, resultados e limitações. Este documento agrega ordem e autorização; não duplica os resultados canónicos. Commits identificam os incrementos; hashes registados posteriormente sem autorreferência impossível. Push autorizado na branch existente, sem force push/main/merge automático.
