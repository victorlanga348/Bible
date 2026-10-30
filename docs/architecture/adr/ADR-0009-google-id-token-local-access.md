# ADR-0009 — Google ID token e acesso local

Aceite delegado2026-10-30 antes de código/S08-T008, pedido explícito do utilizador. Complementa [ADR-0005](ADR-0005-estudos-privados-e-versoes.md), preservando sua decisão histórica CLI. [Contrato](../../sprints/S08/GOOGLE_AUTH_SPEC.md).

GSI oficial entrega ID token ao mesmo backend por POST JSON com desafio/nonce/cookie/Origin. JOSE existente valida RS256/JWKS fixo/claims; owner deriva apenas de sub estável com namespace google-/SHA256base64url, compatível com owner1..64. JWT local HS2561h continua autorizando os seis módulos. Sem armazenar email/perfil/Google tokens ou ligar contas por email; sem permissão para API Google adicional.

Auth é infraestrutura técnica e transporte, não domínio novo. GOOGLE_CLIENT_ID opcional/público e jwtSecret existente; nenhum pacote/migração/segredo/fornecedor pago novo. Desafios128/TTL300s em memória/consumo único nesta instância pessoal; outro deployment/múltiplas instâncias/refresh/link de contas exige contrato próprio. CLI/dados/modelos preservados.

Custos: Google/rede/origem/consentimento e login renovado. Better Auth/Clerk/code flow/SDK adicional não justificados no NestJS já com JOSE. Fixtures RSA/JWKS e PostgreSQL provam protocolo/isolamento, não login real; este exige clique/consentimento e prova separados, sem converter ausência em PASS.
