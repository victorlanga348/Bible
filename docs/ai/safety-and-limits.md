# Segurança e limites da IA

Estado: política proposta a operacionalizar nas specs e no [plano de segurança](../audits/security.md).

## Autoridade e incerteza
A IA apoia pesquisa e não é autoridade absoluta sobre história, teologia ou texto bíblico. Evitar linguagem que transforme probabilidade em certeza ou leitura controversa em consenso.
Limitações concretas devem acompanhar a afirmação afetada, sem esconder conteúdo útil em avisos genéricos.

## Entradas não confiáveis
Perguntas, fontes, páginas externas e saídas do modelo não podem alterar políticas, revelar instruções privadas, autorizar ações ou escolher arbitrariamente destinos de rede.
Se recuperação remota for adotada, aprovar validação de destinos, controlo de acesso e limites antes da integração.

## Dados e direitos
Não enviar credenciais, segredos ou dados pessoais desnecessários ao fornecedor. Aprovar retenção, localização e utilização dos dados antes de chamadas reais.
Não reproduzir conteúdo protegido sem permissão; licença incerta bloqueia o uso afetado.

## Saída e ferramentas
Validar estrutura e referências fora da simples declaração do modelo. Tratar texto gerado como dados ao renderizar, evitando execução de conteúdo.
Não existe autorização para agentes autónomos, ferramentas executáveis, publicação ou ações externas no produto atual.

## Resposta a defeitos
Sinalizar fonte ausente ou não verificada, limitar conclusões e aplicar política aprovada de falha parcial/bloqueio.
Registar incidentes relevantes no MegaBrain com evidências sanitizadas e testes de regressão. Não esconder falha técnica como conclusão histórica.
