# ERR-0018 — Perfil fora do pacote no sandbox de mutação

Confirmado2026-10-27 em S05-T005, CI40439892332/fonte36c2ffcaa82b1ec6f08d05d50e110fd371e9feda: build/estática/tooling e1038 testes/51suites passaram, mas o dry run do Stryker falhou por ENOENT ../docs/ai/profiles/local-extractive-v1.json. Nenhuma pontuação dessa execução é aceite. Originais reports/ci-40439892332-job-original.log; job121977452896.

Causa: tests/runtime liam o perfil fora de backend. O checkout normal tinha /docs, mas o sandbox do Stryker contém o pacote backend isolado. Serviços/credenciais não eram a causa; não retirar checker, mudar mutate ou reaproveitar resultado antigo para contornar o erro.

Decisão/correção antes da edição na ficha T005: /docs/ai/profiles/local-extractive-v1.json continua a única fonte normativa; backend/admissions/local-extractive-v1.json é cópia derivada de distribuição, byte-idêntica/SHA cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f, sem nova regra/edição manual. Tooling compara bytes e hash fixado. Testes/runtime usam só o recurso dentro do pacote; modelos/prompt/permissões/fixture não mudam.

Validação local: verificação de configuração antes da cópia FAIL por ficheiro ainda ausente (não RED de negócio); depois PASS. Jest prompt/protocolo passou num backend temporário sem /docs externo, com admissions/fixtures/código e dependências locais, comando node reports/verify-profile-package-isolation.cjs; prova s05-profile-isolation-proof.json, não substitui gate integral Stryker. Regressão atual795 unitários/25suites, typecheck/lint/build PASS inclui componentes novos ainda não publicados. Nova CI integral da correção ainda pendente; manter essa distinção ao encerrar o incidente.
