# Fixtures autênticas de interface

`josephus-pg2848/manifest.json` e `excerpts.json` são cópias byte a byte das fixtures admitidas em `backend/test/fixtures/source-library/josephus-antiquities-pg2848-en/`. `ai-manifest.json` copia o manifesto de `backend/test/fixtures/ai-assistant/source-library/josephus-antiquities-pg2848-en-local-ai-v1/`.

Uso exclusivo de testes de interface/mutação. A duplicação mantém o sandbox Stryker do frontend independente do diretório backend. Não alimentam produção nem substituem os originais autenticados usados nas integrações reais. Proveniência, excertos e restrições ficam nos próprios manifestos; as permissões de IA diferem entre a admissão normal e a específica de IA. Os testes que alteram respostas/estados identificam essas variantes como dados técnicos.
