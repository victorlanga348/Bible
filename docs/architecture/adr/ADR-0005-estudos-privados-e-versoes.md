# ADR-0005 — Estudos privados, tokens locais e snapshots imutáveis

Implementação verificada2026-10-26: decisão abaixo mantida, S04-T005/T006/T007 concluídas,907 testes locais/CI40338249693 e gates/revisão aprovados. [Relatório S04](../../sprints/S04/TEST_REPORT.md). A decisão foi do agente delegado, sem nova escolha específica atribuída ao utilizador. Registo de aceite preparatório seguinte preservado como histórico.

Estado: aceite para implementação por decisão do agente no âmbito da autorização integral do utilizador2026-10-22. Não é uma aprovação individual do utilizador a cada escolha. Responsável/decisor: agente executor. Tarefa S04-T004; implementação ainda NOT_RUN.

## Contexto

S02 integral/S03 estão concluídas e oferecem cânone/fontes públicos por contratos de Application. Estudos precisam de identidade/acesso e proveniência preservada desde a primeira gravação. O backend é NestJS pessoal em loopback, com PostgreSQL do PC e jwtSecret existente; não há requisito de contas remotas. GOOGLE_CLIENT_ID isolado não comprova autenticação Google.

## Decisão

Usar JOSE6.2.13 exata, verificada por licença/SRI e compatibilidade Node24/Jest30, para assinatura/verificação JWT HS256. Reutilizar jwtSecret UTF-8 com mínimo32 bytes. Perfil local: typ JWT, issuer biblia-local, audience biblia-backend, subject ASCII1..64, iat/exp obrigatórios, validade3600s e idade máxima1h. Verificar assinatura/algoritmo/claims no servidor antes de qualquer recurso privado. Emissão somente por CLI local, sem endpoint público que aceite apenas um nome. Chave ausente fecha os recursos privados; chave fornecida curta é erro de configuração genérico. Rotação da chave invalida os tokens anteriores após reiniciar; não há revogação seletiva nem refresh tokens nesta entrega.

TokenService em infraestrutura técnica partilhada, guard/decorator/filtro no transporte e composição global; nenhum sétimo módulo de domínio. Domain/Application de study recebem owner como valor validado e não importam crypto/Nest/ambiente. A fiscalização arquitetural deve abranger também imports de infraestrutura global, com regressão estrutural RED antes de alterar o checker se necessário.401 próprio preserva o contrato técnico403→500 já existente; recurso de outro owner devolve404.

Persistir study_record e study_version em app, sob propriedade study: owner e versão corrente no registo, documento JSONB/createdAt por versão, sem sobrescrever anteriores. Escrita/revisão transacionais com expectedVersion condicionado; concorrência produz uma nova versão e um conflito, sem apagar snapshots. Versões positivas seguras em JS, persistidas como BigInt com checks. Revalidar direitos na projeção de leitura e também na entrega pós-gravação; quote e conteúdo derivado de fonte revogada são redigidos, preservando snapshot e contexto bíblico autorizado.

Associações explícitas pertencem ao serviço público SourcePassageLinks de source-library, validando cânone através de port/adapter. Sem SQL/FK para tabelas de outro módulo. Associação inicial GEN1:1/Josefo I.1.1 é paralelo narrativo, sem alegação de confirmação histórica independente. Operação local deriva do raw autenticado, com admissão separada da fixture; sendToAi continua pending nesta sprint.

## Alternativas, custos e limites

Histórico anónimo impediria isolamento posterior seguro. Login remoto/Better Auth/Clerk, discutidos na skill de autenticação, acrescentariam contas/sessões/fluxos externos desnecessários ao CLI pessoal atual. JWT manual sem biblioteca aumentaria o risco criptográfico. Cookies e OAuth podem ser decisões futuras próprias; esta decisão não os simula. Custo adotado: configurar/emitir token local e guardar a chave privada; benefício: usar a configuração existente com fronteira verificável e sem conta externa.

Sobrescrever JSON único foi rejeitado por destruir proveniência. Revalidar fontes em cada entrega custa leituras, mas evita devolver texto revogado do histórico. Não há transação distribuída de direitos; a verificação define o ponto de decisão da entrega, sem prometer atomicidade entre módulos.

## Validação e rastreabilidade

[SPEC S04](../../sprints/S04/SPEC.md), [T004](../../sprints/S04/tasks/S04-T004-contracts.md), [PLAN](../../sprints/S04/PLAN.md), SS-001/SH-001 e BR-01–12. Prova preparatória JOSE2/2 PASS não é autenticação da aplicação. T005/T006 exigem RED/GREEN, assinaturas reais, entradas negativas, owner A/B, Prisma/PostgreSQL/Nest reais, concorrência/rollback e redigir direitos. T007 verifica todos os gates e limites; sem LLM nesta sprint. Aprovação delegada não equivale a implementação ou integração já PASS.
