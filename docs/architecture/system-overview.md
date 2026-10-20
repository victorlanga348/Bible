# Visão do sistema

Estado: limites arquiteturais definidos; topologia de execução e módulos concretos propostos. Nenhum componente implementado.

## Fluxo conceptual
1. A interface recolhe uma seleção e apresenta estados compreensíveis.
2. A entrada NestJS valida o contrato de transporte aprovado e chama um caso de uso.
3. A aplicação coordena regras de domínio, recuperação, geração, validação e persistência através de ports.
4. Adapters traduzem os contratos internos para PostgreSQL/Prisma e fornecedores externos.
5. A resposta distingue texto bíblico, evidência recuperada e interpretação; o histórico respeita a política de acesso aprovada.

Não há endpoints, filas, serviços independentes ou protocolos internos definidos por este fluxo.

## Camadas
| Camada | Responsabilidade | Limite |
|---|---|---|
| Domínio | Conceitos e regras de estudo, evidência e interpretação | Sem imports de frameworks ou fornecedores |
| Aplicação | Casos de uso, contratos e coordenação | Depende do domínio e de abstrações internas |
| Infraestrutura | Persistência, fontes e fornecedores externos | Implementa ports; não redefine regras |
| Entrada e composição | HTTP, validação de transporte e ligação das dependências | NestJS; delega comportamento aos casos de uso |
| Interface | Navegação, estudo, fontes, perguntas e histórico | Consome contratos aprovados |

## Trilhas
- A: bootstrap, persistência, HTTP, migrações, segurança, observabilidade e integração.
- B: domínio, método de estudo, fontes, IA, validação e avaliações.
- C: navegação, espaço de estudo, citações, perguntas, histórico e acessibilidade.

As trilhas coordenam-se por specs e contratos. Não implicam microserviços nem deploys separados. A escolha entre unidades de execução continua sujeita a justificação e aprovação.

## Fronteiras de confiança
Entrada do utilizador, fontes recuperadas e saída do modelo são dados não confiáveis. Apenas instruções controladas pelo backend definem a orquestração. Conteúdo externo não autoriza ferramentas nem altera políticas. Ver [segurança da IA](../ai/safety-and-limits.md) e [auditoria](../audits/security.md).
