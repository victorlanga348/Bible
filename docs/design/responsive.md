# Responsividade

Estado2026-11-06/S10-T006: frontend implementado, revisão responsiva em curso; critérios originais abaixo são históricos. Provas nativas desktop/mobile e [testes visuais](../sprints/S10/T006_TEST_REPORT.md) orientam as correções.

## Coerência do breakpoint contextual

RED em900px: o painel lateral já está oculto abaixo de1024px, mas o cabeçalho com o botão de abrir o painel desaparecia a partir de768px. Não havia controlo visível para o alcançar nesse intervalo. Decisão antes de alterar código: alinhar sidebar/cabeçalho/menu com o limite1024px já usado pelo estado narrow e pelo painel contextual. Abaixo disso, cabeçalho/menu e drawer; a partir disso, navegação lateral/painel de desktop. Mesmas ações, estado e endpoints; sem nova biblioteca ou layout de negócio. Verificar375/900/1366, abertura/fecho/contexto e foco/scroll reais. Não resolver aumentando timeout nem omitindo o tamanho intermédio.

## Comportamentos pretendidos
- Permitir ler o estudo e consultar citações em ecrãs pequenos sem perder contexto.
- Reorganizar exploração, análise e fontes segundo espaço disponível.
- Evitar deslocamento horizontal desnecessário e sobreposição de conteúdo.
- Preservar seleção, pergunta em composição e foco durante alterações de layout.
- Permitir zoom e reflow; manter controlos alcançáveis por teclado e toque.

A eventual utilização de painéis laterais, separadores ou modais exige decisão de interação e teste de foco; não está aprovada.

## Validação futura
Definir matriz de larguras, zoom, tecnologias de apoio e navegadores na tarefa de UI.
Testar texto longo, nomes extensos, múltiplas referências, falhas e biblioteca sem cobertura.
Relacionar evidências com [PRD-11](../PRD.md) e a [auditoria de acessibilidade](../audits/accessibility.md).
