# ERR-0008 — Diretório ignorado ausente no checkout limpo

Data:2026-10-22. Estado: harness corrigido e bootstrap executável verificado; CI remota a acompanhar. Origem: [run39721380203](https://github.com/victorlanga348/Bible/actions/runs/39721380203), job119635369727.

Após corrigir os contextos do workflow, setup/serviço/instalação/downloads pinados/migração/typecheck/lint/tooling passaram remotamente. Cobertura falhou em4 testes de artefacto alterado: mkdtemp reports/admission-* recebeu ENOENT porque reports é ignorado e não existe num clone limpo.436 outros testes passaram. Não é falha da regra de admissão nem ausência do corpus, e falha de ambiente não demonstra RED de negócio.

Jest setup passa a criar reports com mkdirSync recursivo antes de qualquer suite, também para execução local num clone novo. Não depender da primeira escrita de relatório de cobertura, que ocorre depois dos testes. Guardas exit/abort e infraestrutura real permanecem iguais; nenhuma falha de teste é ignorada.

Validação de configuração: executar setup antigo e novo em diretórios temporários novos com Node real e conferir a presença de reports. Antigo não cria; novo cria. Prova não substitui o teste PostgreSQL de admissão; próxima execução CI/normal deve exercitar essas suites sem falhas. Artefacto local reports/fresh-report-bootstrap.json; não há nova regra de negócio ou motivo para inventar métricas de software.
