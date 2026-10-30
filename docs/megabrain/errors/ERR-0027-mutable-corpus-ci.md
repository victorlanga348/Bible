# ERR-0027 — URL de corpus mudou os bytes admitidos

Confirmado2026-10-30/S08-T008. CI41071764566/f3bd642 falhou antes de migrações e testes: as URLs eBible já não devolviam o ZIP/catálogo pinados. ZIP novo4379836bytes/SHA3d9c4c8a… e catálogo25467e03…; XML/aviso extraídos continuavam iguais. Isso não torna o novo arquivo idêntico ao admitido nem autoriza mudar os pins.

Os originais autênticos locais4379838bytes/SHA1f71b776… e catálogoSHA badc2d6d… foram conservados num draft privado do próprio repositório, com avisos/atribuição e metadados verificáveis. Upload e download real por maintainer PASS; CI41076553056/31823b2 ainda FAIL ao consumir com Contents:read. O erro inicial era genérico, sem status HTTP suficiente para afirmar403/404. Visibilidade de draft exige push segundo a documentação GitHub; autorização de maintainer não demonstrava acesso pelo token efémero do runner.

Correção db7f08d: job mínimo de leitura dos assets privados com Contents:write, sem npm/dependências/DB/testes e sem credenciais persistidas. Suites read-only recebem apenas os dois originais públicos CC-BY4.0 num artefacto com retenção1dia e voltam a validar integralmente hashes/tamanhos. O artefacto segue a visibilidade da CI, sem alegar privacidade equivalente ao draft. CI41078164874 comprovou download real, snapshot14c2103d… idêntico/66livros1189capítulos31102versículos e suites integrais PASS. Falhas anteriores preservadas, nenhum pin/texto/manifesto alterado para aceitar bytes novos.

Helper tem11testes técnicos de I/O/transporte, incluindo adulteração/tamanho, falta de token, idempotência, recusa de alvo divergente, concorrência sem overwrite e redirect sem transmitir autorização à CDN. Diagnóstico público limita-se a códigos sanitizados; não registar token/corpo privado. Draft é dependência da CI, não deve ser publicado ou eliminado como recurso temporário de teste. [Decisão e IDs](../../sprints/S08/CI_ADMITTED_INPUT_ARCHIVE.md).

Lição: uma URL pública estável não é um arquivo imutável; preservar os bytes admitidos e testar o consumidor com a identidade real da CI. Hash de texto extraído não substitui o pin do contêiner, proveniência e aviso.
