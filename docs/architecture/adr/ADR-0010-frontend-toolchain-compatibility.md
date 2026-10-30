# ADR-0010 — Compilador frontend compatível com os gates

Aceite por decisão delegada2026-10-30/S10-T001, antes de alterar a dependência, sob autorização para concluir integração/qualidade na branch nova. [Plano](../../sprints/S10/QUALITY_PLAN.md).

Facto observado: Stryker10.1.1 instrumentou os quatro ficheiros/270mutantes, mas abortou no pré-processamento de tsconfig com TypeError:ts.parseConfigFileTextToJson is not a function. O TypeScript7.0.2 da S09 não expõe essa API de compilador requerida; isto é incompatibilidade da ferramenta, não RED de produto nem score aprovável. Raw em backend/reports/s10-t001-stryker-dry-run.log.

Decisão: fixar typescript6.0.3 no frontend, a mesma versão já validada no backend, conservando strict:true e todos os gates/operadores/ficheiros. A aplicação não usa recurso que exija7; build/runner ainda devem comprovar compatibilidade, não presumi-la. Dependência apenas de desenvolvimento, lock atualizado. Nenhum React/Vite/backend/schema/modelo alterado por esta decisão.

Alternativas rejeitadas: remover o checker/gate, afirmar que dry-run falhado passou, remendar módulos de terceiros ou manter compiladores diferentes ocultamente para burlar o erro. Vantagem: API estável usada pelos gates existentes e uma versão consistente; custo: abandonar por agora a versão nativa7na interface. Uma migração futura para7 exige suporte real do toolchain e provas próprias.

Até build strict e Stryker executarem corretamente, compatibilidade continua BLOCKED. Documentar falhas anteriores sem substituir os brutos.
