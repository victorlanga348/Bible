# S10-T007 — Revisão de mutação

## Backend

Fonte `98d515ec01e570dd69f5022bf0e89ad56675178c`, [CI45383232192](https://github.com/victorlanga348/Bible/actions/runs/45383232192). Relatório integral de193mutantes/5fontes;115detetados/134válidos=85,82089552238806%.59CompileError são rejeições reais do checker TypeScript (retorno obrigatório, narrowing de nulos e contratos incompatíveis), sem exclusões manuais. ZeroNoCoverage/RuntimeError. Os19sobreviventes foram todos revistos abaixo; nenhum foi removido do denominador.

| Fonte / IDs | Revisão |
|---|---|
| `app.ts` 4,6 | Opções de logging/abort do Nest; não alteram o caminho de cadastro aprovado. Lacuna de opções operacionais, sem remover assinatura/guard. |
| `app.ts` 8,9,12,13,15 | Metadados Swagger (título, versão, esquema/formato Bearer e URL JSON). A composição e as rotas reais são verificadas; os textos completos desses metadados não são fixados. |
| `password-auth.ts` 28,35,96,97 | Textos de erro429/503/409 e código de duplicado. Os estados, ausência de gravação indevida e preservação de senha estão verificados; alguns textos/código409 não são comparados integralmente. |
| `password-hash.ts` 137,138 | Remoção de âncoras da expressão de formato do hash. Falta testar prefixo/sufixo em hash estruturalmente correto. O código original ancora ambos os limites; hashes são produzidos internamente, não aceites como credencial HTTP. Lacuna conservada na medição. |
| `password-auth.controller.ts` 154,155 | Esquema de resposta do OpenAPI vazio ou literal Bearer alterado na documentação. Corpo HTTP real é comparado; a representação documental completa não. |
| `password-auth.controller.ts` 157 | Acrescenta Retry-After a outros erros além de429. A limitação e o cabeçalho obrigatório429 são comprovados; ausência do cabeçalho nos outros erros não é critério de autenticação. |
| `password-auth.controller.ts` 183 | Troca fallback de origem ausente por texto que continua fora da allowlist; ambos rejeitam403. Equivalente para o contrato local atual. |
| `password-auth.controller.ts` 196 | Texto genérico de erro de origem; status/código403 e bloqueio antes da persistência são verificados. |
| `password-auth.controller.ts` 198 | Troca rótulo `unknown` do IP ausente por vazio; mantém um único contador partilhado e limitado para pedidos sem IP. Equivalente para o contrato atual. |

Não há defeito funcional observado nos originais acima. Lacunas documentais/formato permanecem declaradas; o limiar do gate é >85%, não100%.

## Frontend

Em execução após remoção do token manual; nenhum score aprovado inferido de tentativas parciais.
