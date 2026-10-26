# Integração com fornecedor de IA

Atualização S05-T0042026-10-26: [SPEC](../sprints/S05/SPEC.md)/[perfil](../ai/profiles/local-extractive-v1.json)/[ADR-0006](../architecture/adr/ADR-0006-ia-local-e-indice-reconstruivel.md) aceites pelo agente delegado antes de produto. Engine local assinada/modelos/pins/licenças/loopback/credencial própria reais e dez casos de viabilidade comprovados, sem conta/chave paga ou envio remoto. Port/adapter por TDD começa T005; integração/avaliação14casos de produto continuam obrigatórias. Estado seguinte histórico, sem necessidade de nova permissão.

Estado: fornecedor, modelos, SDK e configuração pendentes em DEC-02.
Nenhuma conta, credencial, custo ou disponibilidade foi verificada.

## Critérios para a decisão
Comparar qualidade pela [rubrica](../ai/evaluation.md), suporte à fundamentação, termos de dados/licenças, custos, limites, latência, falhas, observabilidade e possibilidade de testes de contrato.
Não assumir que um modelo ou configuração garante determinismo.

## Contrato interno por aprovar
O port deve expressar a necessidade do caso de uso e manter tipos do fornecedor fora do domínio/aplicação.
Definir entradas autorizadas, saída validável, semântica de erro, cancelamento, orçamento, repetição e proveniência da geração. Nomes e assinaturas não estão aprovados.

## Validação
Combinar testes locais de comportamento e contrato com execução real controlada do adapter. Resultados gravados podem apoiar reprodução, desde que sanitizados, licenciados e identificados como gravações.
Mocks ou respostas gravadas não substituem permanentemente comprovação da integração real.
Credenciais não entram em Git, prompts, logs, relatórios ou MegaBrain.

## Mudança de fornecedor/modelo
Exige plano, contratos revistos, comparação com baseline e avaliações. Não configurar fallback ou contratar serviço implicitamente.
