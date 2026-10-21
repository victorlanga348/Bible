# ADR-0004 — Fundação executável S01

Data: 2026-10-20. Estado: ACEITE na revisão final S01 em 2026-10-21 pelo utilizador: «segunda sprint aprovada, continue com a proxima apos o commit». Origem: stack prescrita, autorização de início S01 com confirmação antes do commit, escolha de Docker Desktop local e criação de backend/. Escolhas concretas foram decisões de implementação do agente, aceites na revisão final; não se atribui aprovação individual anterior de versões nem se apaga essa cronologia.

## Decisão e alcance

Fundação em backend/, separada da documentação existente. Nest12/TS6 strict/Node24, npm/lockfile, Prisma7 estável com adapter-pg, Zod4, Jest30/Supertest7/Stryker10 e ESLint10. Matriz completa/contratos na [SPEC S01](../../sprints/S01/SPEC.md). Sem funcionalidades de negócio, IA, frontend ou deployment.
CommonJS com module Node20 e moduleResolution Node16: suporta require(esm) do Node24 sem migrar todo o projeto para ESM. Jest precisa de --experimental-vm-modules. Swagger usa Standard Schema nativo para derivar os schemas Zod.
Docker tem bases/utilizadores/credenciais de dev/test distintos, portas só em loopback. Testes usam base descartável e guard antes de ligar/migrar/limpar; identidade confirmada no PostgreSQL. Namespace app é a primeira migração; a fixture técnica é exclusiva de testes, sem entidades de negócio artificiais.
Stryker inclui todo src próprio, sem ignorar mutantes estáticos. Cliente Prisma gerado fica excluído. Score bruto >85% é verificado também por contagem inteira; exatamente 85% não passa. Uma instância de mutação evita concorrência na fixture partilhada.

## Alternativas e consequências

- Prisma8 latest era RC com interface diferente; linha7 estável preserva schema/migrações. Custo: atualização futura explícita.
- TS7 latest estava fora dos intervalos das ferramentas de teste/lint; TS6 foi selecionado. Nest12 ESM exigiu module Node20 e VM modules no Jest; as falhas e regressões reais estão no relatório.
- ESM integral exigiria outra organização de compilação/testes; não é necessário para a fundação. CommonJS mantém require(esm) dependente da versão Node24 fixada.
- Base externa foi preterida pela escolha explícita do utilizador por Docker Desktop local. Dois serviços custam mais recursos, mas isolam desenvolvimento de testes destrutivos.
- CI usa serviço PostgreSQL efémero com trust, sem credencial versionada, apenas no runner. Local usa palavras-passe geradas. Execução remota continua NOT_RUN até publicação autorizada; não há deployment.

## Validação

[TEST_REPORT S01](../../sprints/S01/TEST_REPORT.md), atualizado em 2026-10-21: migração real, 60 testes Jest, 13 checks de tooling, compilação/lint/typecheck e cobertura100%/94,54% medidos. Mutação integral118/123 = 95,9349593495935%, com cinco sobreviventes/três timeouts analisados e sem NoCoverage/RuntimeError/Pending. Harness ajustado à descoberta no OneDrive; nenhuma alteração de versões nesta continuação. S01 DONE após aceitação formal/encerramento/commit aprovados em 2026-10-21; evidência da aprovação no REVIEW. Complementa [ADR-0003](ADR-0003-backend-modular-e-stack-prescrita.md), preservando ADR-0001/0002 históricas.
