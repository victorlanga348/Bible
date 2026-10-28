# PowerShell: texto Unicode enviado a Python

Observado2026-10-28/S05-T007. O Windows PowerShell desta sessão usa `$OutputEncoding.WebName = us-ascii`; uma here-string com acentos enviada por pipe a Python perdeu caracteres antes de `read_text`/`write_text(encoding='utf-8')`. UTF-8 no destino não recupera bytes já substituídos. Afetou textos novos da documentação/revisão, não src nem relatórios nativos originais. Conferência visual detetou o problema; textos e digest da revisão separada foram corrigidos, raw c8439470… intacto.

Preferir apply_patch para texto versionado Unicode; se usar pipe, configurar `$OutputEncoding = [System.Text.UTF8Encoding]::new($false)` no mesmo comando antes da here-string. Python deve ainda especificar UTF-8 nos ficheiros. Verificar o conteúdo, não só exit0/links/whitespace. Não substituir pontos de interrogação indiscriminadamente: podem ser pontuação legítima ou acentos perdidos distintos. Histórico anterior à correção permanece nos commits.
