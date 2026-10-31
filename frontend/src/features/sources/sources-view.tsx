import { useState, useEffect } from 'react';
import { api, type HistoricalSource } from '../../shared/api/services';
import type { SourceExcerptDto } from '../../shared/api/contracts';
import { Badge } from '../../shared/ui/badge';
import { Skeleton } from '../../shared/ui/skeleton';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../shared/ui/dialog';
import { Library, ShieldCheck, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import { request } from '../../shared/api/http-client';

export function SourcesView() {
  const [sources, setSources] = useState<HistoricalSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [excerpts, setExcerpts] = useState<SourceExcerptDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingExcerpts, setLoadingExcerpts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [excerptError, setExcerptError] = useState<string | null>(null);
  const [excerptAttempt, setExcerptAttempt] = useState(0);
  const [activeExcerpt, setActiveExcerpt] = useState<SourceExcerptDto | null>(null);

  // Carrega catálogo de fontes
  useEffect(() => {
    let active = true;
    api
      .sources()
      .then((res) => {
        if (active) {
          setSources(res.sources);
          if (res.sources.length > 0 && !selectedSourceId) {
            setSelectedSourceId(res.sources[0].id);
          }
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

  // Carrega trechos/excerpts da fonte selecionada
  useEffect(() => {
    if (!selectedSourceId) return;
    let active = true;
    setLoadingExcerpts(true);
    setExcerptError(null);

    request<{ excerpts: SourceExcerptDto[] }>(`/sources/${selectedSourceId}/excerpts`, {
      params: { q: searchQuery.trim() || undefined, limit: 20 },
    })
      .then((res) => {
        if (active) {
          setExcerpts(res.excerpts);
          setLoadingExcerpts(false);
        }
      })
      .catch((failure: unknown) => {
        if (active) {
          setExcerpts([]);
          setExcerptError(failure instanceof Error ? failure.message : 'Não foi possível consultar os trechos. Tenta outra vez.');
          setLoadingExcerpts(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedSourceId, searchQuery, excerptAttempt]);

  const activeSource = sources.find((s) => s.id === selectedSourceId);

  return (
    <div className="flex flex-col h-full max-w-[min(100%,76ch)] mx-auto px-[1.25rem] py-[1.5rem] space-y-[1.5rem]">
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
      <div className="flex-1 space-y-[1.5rem]">
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
          <div className="space-y-[2rem]">
            {/* Cartão de Detalhe da Obra */}
            {activeSource && (
              <article className="p-[1.5rem] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] space-y-[1rem] shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-[0.75rem]">
                  <div className="space-y-[0.25rem]">
                    <h2 className="font-editorial-heading text-[1.35rem] font-semibold text-[var(--foreground)]">
                      {activeSource.title}
                    </h2>
                    <p className="text-[0.825rem] text-[var(--foreground-muted)] font-ui">
                      Autor: <strong className="text-[var(--foreground)]">{activeSource.author}</strong> · Tradução:{' '}
                      <strong className="text-[var(--foreground)]">{activeSource.translator || 'Original'}</strong>
                    </p>
                  </div>
                  <Badge classification="neutral">
                    {activeSource.kind === 'historical-work' ? 'Obra Histórica' : activeSource.kind}
                  </Badge>
                </div>

                {/* Direitos e Licença */}
                <div className="p-[0.875rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] text-[0.8rem] font-ui space-y-[0.5rem] border border-[var(--border)]">
                  <div className="flex items-center gap-[0.4rem] font-semibold text-[var(--foreground)]">
                    <ShieldCheck className="w-[1rem] h-[1rem] text-[var(--accent)]" />
                    Declaração de Direitos & Proveniência
                  </div>
                  <p className="text-[var(--foreground-muted)] leading-relaxed">
                    {activeSource.rightsStatement}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-[0.5rem] pt-[0.35rem]">
                    <span className="font-mono text-[0.7rem] text-[var(--foreground-muted)]">
                      SHA-256: {activeSource.snapshotSha256.substring(0, 16)}...
                    </span>
                    <a
                      href={activeSource.originUrl}
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
                    {activeSource.limitations}
                  </p>
                </div>
              </article>
            )}

            {/* Trechos Homologados da Obra */}
            <div className="space-y-[1rem]">
              <div className="flex flex-wrap items-center justify-between gap-[0.75rem]">
                <h3 className="flex items-center gap-[0.5rem] text-[0.9rem] uppercase tracking-wider font-semibold text-[var(--foreground-muted)] font-ui">
                  <FileText className="w-[1rem] h-[1rem]" />
                  Trechos e Parágrafos Admitidos
                </h3>

                <div className="w-full sm:w-[16rem]">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar trechos..."
                    icon
                    className="h-[2.1rem] text-[0.8rem]"
                  />
                </div>
              </div>

              {excerptError ? <div className="space-y-[0.75rem]">
                <p role="alert" className="text-[0.85rem] text-[var(--foreground)]">{excerptError}</p>
                <Button variant="secondary" onClick={() => setExcerptAttempt(attempt => attempt + 1)}>Tentar novamente</Button>
              </div> : loadingExcerpts ? (
                <div className="space-y-[0.75rem]">
                  <Skeleton className="w-full h-[4rem]" />
                  <Skeleton className="w-full h-[4rem]" />
                </div>
              ) : excerpts.length === 0 ? (
                <div className="p-[2rem] text-center border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--foreground-muted)] font-ui text-[0.85rem]">
                  Nenhum trecho encontrado para a busca especificada.
                </div>
              ) : (
                <div className="grid gap-[0.75rem]">
                  {excerpts.map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => setActiveExcerpt(ex)}
                      className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/60 transition-all cursor-pointer space-y-[0.35rem]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-ui font-medium text-[0.85rem] text-[var(--foreground)]">
                          {ex.locator}
                        </span>
                        <span className="font-mono text-[0.7rem] text-[var(--foreground-muted)]">
                          SHA: {ex.textSha256.substring(0, 10)}...
                        </span>
                      </div>
                      <p className="text-[0.825rem] font-serif text-[var(--foreground-muted)] line-clamp-2 italic">
                        "{ex.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Leitura Integral do Trecho Histórico */}
      <Dialog open={!!activeExcerpt} onOpenChange={(open) => !open && setActiveExcerpt(null)}>
        <DialogContent>
          {activeExcerpt && (
            <>
              <DialogHeader>
                <DialogTitle>{activeExcerpt.locator}</DialogTitle>
                <DialogDescription>
                  Texto histórico integral verificado e auditado criptograficamente.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-[1rem] py-[0.5rem] font-ui text-[0.85rem]">
                <blockquote className="border-l-2 border-[var(--accent)] pl-[1rem] italic text-[0.95rem] font-serif text-[var(--foreground)] leading-relaxed">
                  "{activeExcerpt.text}"
                </blockquote>

                <div className="p-[0.75rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] text-[0.75rem] font-ui space-y-[0.25rem] text-[var(--foreground-muted)]">
                  <div>
                    <strong>Hash SHA-256 do Texto:</strong>
                  </div>
                  <code className="block p-[0.25rem] bg-[var(--background)] font-mono select-all break-all">
                    {activeExcerpt.textSha256}
                  </code>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
