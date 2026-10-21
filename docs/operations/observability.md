# Observabilidade

Estado: S01 implementa diagnósticos JSON sanitizados de erros HTTP/arranque e rotas locais de liveness/readiness; contratos e provas no [relatório S01](../sprints/S01/TEST_REPORT.md). Fornecedor, métricas e observabilidade de negócio/IA continuam propostos.

## O que observar
Coordenar pedido, estudo, recuperação, geração e persistência com proveniência suficiente para diagnóstico.
Medir sucesso/falha, duração, indisponibilidade de fontes, referências rejeitadas, persistência e utilização/custo do fornecedor quando disponível e autorizado.
Definir nomes, cardinalidade, objetivos, retenção e alertas no plano; não há metas operacionais aprovadas.

## Dados mínimos e privacidade
Não registar prompts completos, perguntas pessoais, texto protegido, credenciais ou saídas integrais por defeito.
Definir sanitização e acesso aos diagnósticos. Identificadores de correlação não devem expor informação pessoal.
Relatórios de avaliação e chamadas reais devem separar conteúdo necessário à revisão de dados que não podem ser conservados.

## Distinção essencial
Métrica operacional de sucesso não comprova suporte histórico da resposta. Qualidade da IA depende da [avaliação](../ai/evaluation.md).
Relacionar incidentes confirmados com [runbooks](runbooks.md) e MegaBrain; não converter automaticamente toda falha transitória em causa-raiz conhecida.
