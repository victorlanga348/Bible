# Autenticação e autorização

Estado: pendente DEC-04. Uso pessoal não implica acesso anónimo ou ausência de proteção.
Não há fornecedor, protocolo, sessão, papel ou modelo de identidade aprovado.

## Questões para decisão
- Quem pode aceder à aplicação e aos estudos?
- Que informação pode sair do ambiente pessoal?
- Como isolar dados no histórico e nas perguntas?
- Que operações exigem autenticação e autorização?
- Como expirar/revogar acesso e recuperar de perda de credenciais?
- Qual a política de retenção e eliminação associada à identidade?

## Critérios a detalhar
A decisão deve permitir impedir acesso indevido e evitar mistura de contextos. Respostas de erro, contratos e estados de UI serão definidos após aprovação.
Testar fluxo autorizado e negado com aplicação real e persistência real quando aplicável; não limitar a verificação à interface.

## Dependências
[SH-001](../specs/study-history.md), [modelo](../architecture/data-model.md), [segurança](../audits/security.md), DEC-10 e PLAN-003.
Não criar tabelas de utilizadores, tokens ou endpoints de sessão nesta etapa.
