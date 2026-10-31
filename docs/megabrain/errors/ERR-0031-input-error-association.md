# ERR-0031 — Erro inline sem associação acessível

Confirmado2026-10-31/S10-T003, Input. S09/SPEC3.3 exige associação das mensagens por aria-describedby, mas o texto do erro não tinha ID nem ligação ao campo; aria-invalid também estava ausente.

RED2FAIL/10SKIP6,41s: atributo inválido ausente e campos sem IDs gerados, s10-t003-input-error-association-red.log. Correção com React.useId existente, preservando ID/ref/descrições e validação fornecidos pelo chamador. Erro próprio acrescenta somente a sua referência e aria-invalid=true; removê-lo conserva as descrições externas.

GREEN44PASS/3ficheiros22,46s em ui-primitives/reader-workflows/conversation-workflows; s10-t003-input-error-association-green.log. Caso adicional conserva aria-invalid=grammar do chamador. Contratos calculados no Chrome real e primitivos34PASS26,76s, s10-t003-rendered-design-contracts-green.log; build strict2159PASS3,77s/C42L4jdH.js/Cy0cXX7P.css. Browser da aplicação e gates atuais continuam separados.

Lição: texto visível não é, por si só, uma mensagem associada ao campo. Verificar identidade, relação, exclusividade entre campos e recuperação sem apagar instruções existentes.
