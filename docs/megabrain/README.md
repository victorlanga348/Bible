# MegaBrain — Memória Técnica Operacional

Estado: estrutura inicial criada; não há incidentes, lições de implementação ou padrões comprovados registados.
O MegaBrain evita repetição de erros e perda de contexto entre sessões. Não é fonte normativa de comportamento: promover conhecimento para specs/ADRs apenas após aprovação.

## Organização
| Diretório | Utilização |
|---|---|
| [errors](errors/README.md) | Falhas relevantes com reprodução, causa e regressão |
| [lessons](lessons/README.md) | Conhecimento reutilizável sustentado em experiência |
| [patterns](patterns/README.md) | Padrões aprovados com exemplos reais |
| [pitfalls](pitfalls/README.md) | Armadilhas observadas e abordagens a evitar |
| [investigations](investigations/README.md) | Hipóteses em aberto, evidências e próximos passos |
| [agent-context](agent-context/README.md) | Estado resumido, mapa e continuidade |
| [templates](templates/README.md) | Modelos de registos |

## Regras de utilização
1. Antes de resolver erro, pesquisar palavras-chave, módulo e sintomas nos registos existentes.
2. Reutilizar/relacionar o registo existente; não duplicar o mesmo incidente.
3. Distinguir hipótese de causa-raiz confirmada e ligar evidência.
4. Relacionar erros, lições, padrões, tarefas, specs e commits reais.
5. Não apagar decisões relevantes; marcar como obsoleto/arquivado e ligar sucessores.
6. Não guardar transcrições completas, segredos, credenciais, dados sensíveis ou conteúdo protegido indevido.
7. Guardar evidência sanitizada e mínima, suficiente para reprodução e aprendizagem.
8. Padrões só são aprovados com exemplo implementado e revisão explícita.
9. Promover regras normativas para specs oficiais mediante aprovação, sem alterar comportamento silenciosamente.
10. Registar conhecimento relevante; não criar entradas artificiais só para preencher diretórios.

## Identificação e revisão
Consultar o maior ID antes de criar um registo; usar sequência única por categoria e nome descritivo.
Erros: `ERR-0001-descricao-curta.md`; lições: `LESSON-0001-descricao-curta.md`; padrões: `PATTERN-0001-descricao-curta.md`; armadilhas: `PITFALL-0001-descricao-curta.md`; investigações: `INV-0001-descricao-curta.md`.
Atualizar o índice da categoria ao adicionar, resolver ou substituir registos.
Começar cada sessão pelo [estado atual](agent-context/project-state.md) e procurar o tema relevante; corrigir contexto desatualizado com referência ao que mudou.

## Integração por tarefa e sprint
Antes de cada tarefa, consultar erros relacionados, padrões aprovados, armadilhas conhecidas e ADRs relevantes; registar referências na ficha quando aplicáveis.
Após cada tarefa, identificar problemas reais, causas confirmadas, correções/testes de regressão e lições reutilizáveis. Atualizar o contexto operacional quando mudar o estado do projeto.
Ligar registos a IDs Sxx-Txxx sem quebrar referências DOC-/PLAN- antigas; consultar [correspondência](../roadmap/traceability.md).
Na retrospectiva, ligar apenas conhecimento efetivamente produzido e pendências transferidas; não inventar uma lição para preencher o campo.
Aprovações, estados e gates residem na [governança](../documentation-governance.md) e nas [sprints](../sprints/README.md); o MegaBrain não mantém uma versão normativa alternativa.
