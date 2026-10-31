# S10-T004 — evidências e limites

IN_PROGRESS em 2026-10-31. [Contrato prévio](T004_AI_COVERAGE_SPEC.md). Perfil de cobertura ai-coverage-v1 próprio, execução local-extractive-v1/prompt v6/fontes/textos/permissões inalterados. Não é outra testemunha, fonte nova ou geração livre. Google humano adiado.

Preparação executada: `python reports/prepare-s10-coverage.py <originais porbr2018>` (ferramenta local ignorada). Arquivo/XML/snapshot originais conferidos contra pins antes de extrair 12 versículos reais: quatro antigos e oito novos. Cada versículo extraído do XML é idêntico ao snapshot original. Operacional JSON SHA256 f67ede1ba6c6146c39202699bcc0d812ada9e5b1a05f8ba7251d4a54c2d2274a; teste JSON a286a7f83aca32955b3d461c8a9532097abd843a34a33c1ed33b54041350137e; fixture canónica40e759585755a5c3270d1181a796bc2899a2f57533e7a15c516ee67de6d263dc. LF fixado por .gitattributes. Originais preservados.

| Etapa | Resultado | Evidência |
| --- | --- | --- |
| Primeiro ensaio de integração | BLOCKED de preparação, não RED | HTML original ausente no checkout privado; SourceSnapshotError antes das expectativas. Cópia autenticada do HTML para data ignorada privada; original intacto. Corrigida também assinatura de chamada do builder no harness antes da execução funcional. Log s10-t004-coverage-red.log. |
| RED funcional | FAIL esperado | Admissão anterior não devolve a ligação GEN1:3–5: esperado link real, recebido []. PostgreSQL/libraries reais. 1FAIL/13,646s; s10-t004-coverage-red-functional.log. |
| GREEN mínimo | PASS | Implementada admissão adicional; preparação do teste passa a invocar a nova operação antes das mesmas expectativas. Quatro intervalos/estudos/evidências corretos; fonte1/excertos4/links8. 1PASS/12,833s; s10-t004-coverage-green-minimal.log. Não alegar RED de import inexistente. |
| RED autenticação da admissão | FAIL esperado | 5FAIL/1PASS/23,284s: propósitos trocados/desconhecido e JSON válido com bytes alterados eram aceites; ficheiro ausente dava Error genérico. s10-t004-coverage-security-red.log. |
| GREEN autenticação | PASS | Pin de todos os bytes por propósito antes de qualquer link novo; SourceSnapshotError em leitura inválida. 6PASS/18,238s; s10-t004-coverage-security-green.log. |
| Regressões SQL/retoma/distribuição operacional | PASS | 14testes/2suites32,952s: intervalos/estudos reais, hashes/propósitos, idempotência, erro SQL real depois do primeiro link e retoma explícita. s10-t004-coverage-regression.log. |
| Tooling novo | PASS | 4testes4,845s: fixture contra snapshot original, pins/propósitos, IDs/offsets pré-fixados e CLI guardada antes de dados/modelo. s10-t004-tooling.log. |
| Arquitetura | PASS | 9testes7,106s, fontes próprias e limites; s10-t004-architecture.log. |
| Build/typecheck/lint | PASS | npm run build, typecheck e lint reais, zero erros/avisos. Primeiro lint do harness novo teve3no-undef nos globais web; corrigido para globalThis conforme padrão existente, sem alterar comportamento/config. Logs s10-t004-build.log/typecheck.log/lint.log/lint-final.log. |
| Geração real E01–E05 | NOT_RUN | Perguntas/IDs/offsets fixados em scripts/ai-coverage-cases.cjs antes de inferência; sem selecionar casos pelo resultado. |
| Cobertura/mutação backend atual | NOT_RUN | Fonte executável nova exige gates backend atuais; CI anterior não valida esta operação. Frontend inalterado conserva CI41198918785. |

Ambiente: Windows/Node24.16.0, banco independente biblia_test próprio da T003/loopback61073, migrations reais aplicadas. Só alvos/serviços/ficheiros privados próprios; sem credenciais em logs, dependências/modelos novos ou escrita no desenvolvimento.
