# Modelo de dados

Estado: mapa conceptual proposto. Não existe schema Prisma, migração, tabela, campo, índice ou enum aprovado.
As designações abaixo não são contratos de persistência.

## Conceitos a modelar
| Conceito | Necessidade de produto | Restrições a esclarecer |
|---|---|---|
| Passagem e versão | Localizar o texto estudado | Cânone, versificação, direitos e identificação |
| Estudo | Reunir análise e limitações | Ciclo de vida, critérios de completude e falhas parciais |
| Afirmação e evidência | Relacionar conclusão e suporte | Distinção entre referência válida e suporte efetivo |
| Fonte e localização | Verificar o material utilizado | Proveniência, edição, licença e disponibilidade |
| Interpretação | Representar leituras divergentes | Rótulos, fundamento e incerteza |
| Pergunta e resposta | Continuar uma investigação | Associação ao estudo e proveniência das novas respostas |
| Histórico | Recuperar estudos anteriores | Identidade, acesso, retenção e eliminação |

## Invariantes de domínio a detalhar nas specs
- Uma referência apresentada como validada deve ter verificação rastreável.
- Evidência recuperada e texto gerado devem permanecer distinguíveis.
- Falta de fontes deve poder ser representada sem inventar suporte.
- Consulta de histórico não deve regenerar respostas silenciosamente.
- Condições de utilização das fontes devem acompanhar decisões de armazenamento e apresentação.

## Aprovação do modelo lógico e físico
Antes de criar Prisma, documentar entidades, atributos justificados, identificadores, cardinalidades, nulabilidade, integridade referencial, transações, índices, retenção e migração/recuperação.
Relacionar cada escolha com a spec e os testes necessários. Rever [histórico](../specs/study-history.md), [fontes](../specs/source-retrieval.md) e [autenticação](../integrations/auth.md).

Cada migração futura deve atualizar este documento e ter execução real num PostgreSQL isolado. Não tratar esta descrição como schema implementado.
