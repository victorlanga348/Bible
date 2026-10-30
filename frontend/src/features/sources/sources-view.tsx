import { useState, useEffect } from 'react';
import { api, type HistoricalSource } from '../../shared/api/services';
import { Badge } from '../../shared/ui/badge';
import { Skeleton } from '../../shared/ui/skeleton';
import { Library, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';

export function SourcesView() {
  const [sources, setSources] = useState<HistoricalSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .sources()
      .then((res) => {
        if (active) {
          setSources(res.sources);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Erro ao carregar o catálogo de fontes.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-full max-w-[min(100%,76ch)] mx-auto px-[1.25rem] py-[1.5rem]">
      {/* Cabeçalho */}
      <div className="pb-[1.5rem] border-b border-[var(--border)] space-y-[0.35rem]">
        <h1 className="font-editorial-heading font-semibold text-[clamp(1.5rem,1.35rem+0.8vw,2.2rem)] text-[var(--foreground)]">
          Biblioteca de Fontes Históricas
        </h1>
        <p className="text-[0.85rem] text-[var(--foreground-muted)] font-ui">
          Documentos extrabíblicos homologados com integridade e direitos autorais auditados.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 py-[1.5rem]">
        {loading ? (
          <div className="space-y-[1rem]">
            <Skeleton className="w-full h-[10rem]" />
            <Skeleton className="w-full h-[10rem]" />
          </div>
        ) : error ? (
          <div className="p-[1.5rem] rounded-[var(--radius-md)] border border-rose-900/30 bg-rose-950/10 text-rose-300">
            {error}
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-[4rem] text-[var(--foreground-muted)] font-ui">
            <Library className="w-[3rem] h-[3rem] mx-auto mb-[0.75rem] opacity-40" />
            Nenhuma fonte histórica cadastrada no banco.
          </div>
        ) : (
          <div className="space-y-[1.5rem]">
            {sources.map((s) => (
              <article
                key={s.id}
                className="p-[1.5rem] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] space-y-[1rem] shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-[0.75rem]">
                  <div className="space-y-[0.25rem]">
                    <h2 className="font-editorial-heading text-[1.25rem] font-semibold text-[var(--foreground)]">
                      {s.title}
                    </h2>
                    <p className="text-[0.825rem] text-[var(--foreground-muted)] font-ui">
                      Autor: <strong className="text-[var(--foreground)]">{s.author}</strong> · Tradução:{' '}
                      <strong className="text-[var(--foreground)]">{s.translator || 'Original'}</strong>
                    </p>
                  </div>
                  <Badge classification="neutral">
                    {s.kind === 'historical-work' ? 'Obra Histórica' : s.kind}
                  </Badge>
                </div>

                {/* Direitos e Licença */}
                <div className="p-[0.875rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] text-[0.8rem] font-ui space-y-[0.5rem] border border-[var(--border)]">
                  <div className="flex items-center gap-[0.4rem] font-semibold text-[var(--foreground)]">
                    <ShieldCheck className="w-[1rem] h-[1rem] text-[var(--accent)]" />
                    Declaração de Direitos & Proveniência
                  </div>
                  <p className="text-[var(--foreground-muted)] leading-relaxed">
                    {s.rightsStatement}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-[0.5rem] pt-[0.35rem]">
                    <span className="font-mono text-[0.7rem] text-[var(--foreground-muted)]">
                      SHA-256: {s.snapshotSha256.substring(0, 16)}...
                    </span>
                    <a
                      href={s.originUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-[0.25rem] text-[var(--accent)] hover:underline text-[0.75rem]"
                    >
                      Fonte Original <ExternalLink className="w-[0.75rem] h-[0.75rem]" />
                    </a>
                  </div>
                </div>

                {/* Limitações Hermenêuticas */}
                <div className="p-[0.75rem] rounded-[var(--radius-md)] border border-amber-900/30 bg-amber-950/10 text-amber-200/90 text-[0.8rem] font-ui space-y-[0.25rem]">
                  <div className="flex items-center gap-[0.35rem] font-medium text-amber-300">
                    <AlertCircle className="w-[0.95rem] h-[0.95rem]" />
                    Limitações Acadêmicas e de Escopo
                  </div>
                  <p className="leading-relaxed">
                    {s.limitations}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
