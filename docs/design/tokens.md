# Tokens de design

Estado2026-11-06/S10-T006: o frontend e os tokens CSS já existem em [index.css](../../frontend/src/index.css). As secções de proposta originais abaixo são históricas. A revisão atual mantém tipografia/identidade existentes e corrige contraste/precedência com prova de browser, sob decisão técnica delegada pelo utilizador.

## Correção verificável de acessibilidade

Antes de código: Chrome com CSS real mediu texto destrutivo claro1,8202:1, legenda de erro2,6696:1 e badge neutro4,3974:1, todos abaixo de4,5:1. Não arredondar para aprovação. Critério: [WCAG2.2 contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Textos/limitações e estados existentes não mudam de significado.

Decisão: texto secundário claro `--foreground-muted` passa de `#66716D` para `#626D69`, preservando o matiz e ganhando margem nos fundos muted. Estado destrutivo/erro usa tokens `--danger-foreground`, `--danger-bg`, `--danger-hover`, `--danger-border`: claro `#9F1239` com fundos desse matiz a8%/14% e borda40%; escuro `#FB7185` com fundos `#881337` a20%/30% e borda40%. Aviso metodológico usa `--warning-foreground`/`--warning-bg`/`--warning-border`: claro `#854D0E` com fundo8%/borda25%; escuro `#FCD34D` com fundo `#78350F` a18%/borda30%. Medir o contraste real após composição alfa em ambos os temas; não aprovar só por escolher estes valores.

Outra falha reproduzida: os quatro tamanhos do leitor renderizavam20,96px porque `.font-scripture` fora de layers sobrepunha as utilities de tamanho. Colocar a regra em `@layer components`, mantendo família/fallbacks e permitindo às utilities existentes determinar o tamanho/altura de linha. [Precedência recomendada Tailwind](https://tailwindcss.com/docs/adding-custom-styles). Verificar SM<MD<LG<XL, largura legível e seleção intacta, sem novas fontes/bibliotecas.

Provas e estados atuais em [T006_TEST_REPORT](../sprints/S10/T006_TEST_REPORT.md); testes visuais exercitam HTML de React instrumentado e CSS do build no Chrome, sem rede. Os valores deste ajuste ficam sujeitos aos testes, não são um PASS antecipado.

## Necessidades
Definir tipografia de leitura e hierarquia; espaçamento; largura legível; cores de texto, superfície, foco, estado e categorias epistemológicas; bordas; movimento e níveis de sobreposição.
Não converter estes conceitos em nomes de variáveis ou valores obrigatórios antes de revisão.

## Critérios
Priorizar leitura prolongada, contraste, foco visível, zoom e distinção clara entre texto bíblico, comentário e evidência.
Categorias não podem depender só da cor. Fontes, ícones e outros recursos precisam de condições de utilização conhecidas.
Estados de erro, ausência de fonte e incerteza devem ser compreensíveis sem parecer validação de conteúdo.

## Aprovação
Uma proposta futura deve apresentar exemplos nas páginas de estudo e fontes, validar contraste e navegação e documentar valores e licenças.
Não há ativos visuais, tokens CSS ou tema implementados.
