# ADR-0006 — IA local limitada e índice reconstruível próprio

Estado2026-10-26: decisão estrutural aceite pelo agente no escopo da autorização integral, S05-T004; perfil/modelo final e implementação dependem da viabilidade/avaliação. Não é escolha específica atribuída ao utilizador nem aceitação de baseline falhada. Sucessora complementar da [ADR-0005](ADR-0005-estudos-privados-e-versoes.md), sem alterar estudo/token/direitos legados. Comportamento/transporte em [SPEC S05](../../sprints/S05/SPEC.md).

## Contexto e evidência

Não existe credencial paga admitida e o PC tem8GB/CPU. Geração1.5B falhou suporte semântico apesar de JSON/referências válidos;4B excedeu120s no segundo caso do lote, sem avaliação completa. Qwen3-1.7B Q8_0 está em comparação, sem aceite antecipado. Todos os resultados/configurações originais permanecem nos relatórios. Protocolo/health não demonstram qualidade histórica. [Viabilidade](../../sprints/S05/FEASIBILITY.md), [rubrica/revisão](../../sprints/S05/PREFLIGHT_REVIEW.md).

Windows recusou executar distribuição unsigned llama.cpp por Controlo de Aplicações4551. Não se alterou política, assinatura ou caminho para contornar o bloqueio. Outra distribuição oficial, Ollama0.40.11, contém engine direta b11845/9ff0d7e90 e28 binários CPU com Authenticode válido/hashes; execução real confirmou protocolo. O router desse build falha explicitamente por subprocess is not enabled on this build, embora a documentação upstream descreva a capacidade.

Pgvector compilou para PG16, mas probe real de escrita no diretório nativo foi recusado por ACL. A extensão oficial Docker0.8.7/PG17.11, imagem imutável pinada, executou embeddings/cosseno/ordenação/transação reais em alvo de teste e preservou embeddings após restart em volume de desenvolvimento próprio. Banco principal bible_db/PostgreSQL16 e containers domus foram preservados.

## Decisão

Manter monólito modular e HTTP nativo fetch contra engine local autenticada/loopback. Sem SDK adicional/daemon cloud/Redis/filas/microsserviços. Gestão de processo direto próprio com configuração/pins confiáveis, um modelo/sessão de cada vez, slot limitado, deadline, cancelamento e finally; sem depender do router indisponível. Credencial local real em ficheiro fora do Git e sem valor em argv/logs. Artefacto bloqueado não é fallback. Dependências/licenças/modelos/runtime e destino são explicitamente revistos, nunca escolhidos por input HTTP.

Começar por extração estruturada de frases originais, com IDs resolvidos por cópia literal pela aplicação e insuficiência explícita. Isso remove reescrita livre de quotes; não comprova relevância semântica. Todos os casos negativos/adversariais mantêm o mesmo critério e uma referência real irrelevante falha. Não apresentar narrativa antiga como prova independente, consenso moderno ou análise académica completa. Perfil de produção só é fixado se passar a rubrica dentro dos limites, sem média compensatória.

Persistir análises em ai-assistant no banco principal, associadas à versão do estudo por identificadores públicos, sem FK/SQL transversal. study não depende de ai-assistant; os seus snapshots continuam imutáveis. Índice vetorial é proprietário de ai-assistant, reconstruível e separado no PostgreSQL17/pgvector próprio por impedimento ACL do servidor nativo. Só vetores/proveniência de fonte pública admitida; nenhum texto privado de estudo ou embedding de pergunta armazenado nesse índice. Migrações/URLs/alvos de desenvolvimento e teste são separados, limpeza só depois de identidade confirmada. Pesquisa exata por volume de onze segmentos; nenhum índice aproximado sem medição.

Importação de perfil local-ai próprio da mesma obra não transforma a admissão legada pending em allowed nem cria testemunha histórica adicional. Elegibilidade/digest/direitos são revalidados por SourceLibrary público antes de inferir e antes de entregar. Conteúdo retirado é redigido na projeção, sem sobrescrever snapshot histórico; falha técnica não é insuficiência histórica. Destino CI e dados de teste requerem admissão própria antes de chamadas nesse ambiente.

## Alternativas e consequências

Fornecedor pago precisaria de credencial/orçamento/destino realmente disponíveis; não cabe inventar chave. Modelo maior só se recursos/latência/qualidade forem provados. Prosa livre de quotes já falhou fidelidade literal e não é aceita por mera boa aparência. Biblioteca SDK não necessária ao protocolo fixado acrescentaria dependência sem benefício demonstrado. Não instalar DLL por mudança de ACL/política nem substituir o banco do utilizador para satisfazer o teste.

Custo adotado: latência de carregamento serial, perfil inicial restrito, índice/volume/URL/migrações adicionais e avaliação real controlada. Benefício: dados locais e proveniência verificável, limites operacionais executáveis, sem cobrança remota/violação de fronteiras. A API deve expor limitações úteis sem esconder erro técnico. Gates de software e IA permanecem separados; chamadas gravadas/doubles técnicos não contam como inferência real. Inviabilidade de qualidade/recurso mantém T004/sucessoras pendentes, nunca transforma FAIL em PASS.
