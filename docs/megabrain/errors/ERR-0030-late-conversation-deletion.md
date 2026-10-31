# ERR-0030 — Eliminação antiga apagava rascunho de outra conversa

Confirmado2026-10-31/S10-T003, ContextPanel. Depois de confirmar eliminar A, fechar o diálogo e escolher B ainda era possível enquanto a resposta DELETE estava pendente. Quando chegava sucesso, handleDelete limpava question/selectedId da seleção nova. Uma falha tardia também publicava o erro de A em B.

RED1FAIL inicial perdeu o rascunho; ampliação RED2FAIL/19SKIP8,92s comprova sucesso apagando texto e falha publicando mensagem obsoleta. Logs s10-t003-late-delete-red.log e s10-t003-late-delete-both-red.log. Sem erro de ambiente/sintaxe.

Correção mínima: geração de seleção local, incrementada na escolha explícita/criação/paginação; DELETE captura a geração e só atualiza estado transitório enquanto ela corresponder. O hook continua a eliminar/inventariar o recurso pedido, sem rollback fictício ou bloqueio de conversas diferentes. GREEN49PASS/3ficheiros32,95s, s10-t003-late-delete-green.log.

Preview Chrome/API/PostgreSQL reais PASS1/32s, teste7,8s, s10-t003-late-delete-native.log: route.fetch executa a eliminação real e apenas atrasa a entrega da resposta204; A passa a404, B mantém200/revision0/rascunho, nenhum turno criado. Estudo técnico próprio eliminado em finally. Não é prova de inferência. CI6b874d9 antecede a correção; exigir novo gate global.

Lição: terminar uma escrita no servidor não autoriza limpar a seleção atual da interface; identificar também a intenção de UI que iniciou a operação.
