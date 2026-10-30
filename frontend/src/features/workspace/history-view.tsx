import { useState, useEffect } from 'react';
import { api, type WorkspaceStudyItem } from '../../shared/api/services';
import { useSession } from '../../shared/hooks/use-session';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { Skeleton } from '../../shared/ui/skeleton';
import { Clock, BookOpen, KeyRound } from 'lucide-react';

interface HistoryViewProps {
  onOpenStudy?: (reference: string) => void;
}

export function HistoryView({ onOpenStudy }: HistoryViewProps) {
  const { token, isAuthenticated } = useSession();
  const [studies, setStudies] = useState<WorkspaceStudyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let active = true;
    setLoading(true);
    setError(null);

    api
      .workspaceStudies(token)
      .then((res) => {
        if (active) {
          setStudies(res.items);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Erro ao carregar o histórico do workspace.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  return (
    <div className="flex flex-col h-full max-w-[min(100%,76ch)] mx-auto px-[1.25rem] py-[1.5rem]">
      {/* Cabeçalho */}
      <div className="pb-[1.5rem] border-b border-[var(--border)] space-y-[0.35rem]">
        <h1 className="font-editorial-heading font-semibold text-[clamp(1.5rem,1.35rem+0.8vw,2.2rem)] text-[var(--foreground)]">
          Histórico de Estudos & Workspace
        </h1>
        <p className="text-[0.85rem] text-[var(--foreground-muted)] font-ui">
          Estudos persistidos no banco de dados com histórico de versões e anotações.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 py-[1.5rem]">
        {!isAuthenticated ? (
          <div className="p-[2rem] text-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] space-y-[1rem] my-[2rem]">
            <KeyRound className="w-[2.5rem] h-[2.5rem] mx-auto text-[var(--accent)] opacity-80" />
            <div className="space-y-[0.35rem]">
              <h3 className="font-editorial-heading text-[1.15rem] font-semibold text-[var(--foreground)]">
                Histórico Privado Protegido
              </h3>
              <p className="text-[0.85rem] text-[var(--foreground-muted)] font-ui max-w-[40ch] mx-auto leading-relaxed">
                Insira o token JWT de operador na barra lateral para carregar os estudos gravados no PostgreSQL local.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-[1rem]">
            <Skeleton className="w-full h-[5rem]" />
            <Skeleton className="w-full h-[5rem]" />
          </div>
        ) : error ? (
          <div className="p-[1.5rem] rounded-[var(--radius-md)] border border-rose-900/30 bg-rose-950/10 text-rose-300">
            {error}
          </div>
        ) : studies.length === 0 ? (
          <div className="text-center py-[4rem] text-[var(--foreground-muted)] font-ui space-y-[0.75rem]">
            <Clock className="w-[3rem] h-[3rem] mx-auto opacity-40" />
            <p>Nenhum estudo persistido ainda no workspace.</p>
          </div>
        ) : (
          <div className="space-y-[0.75rem]">
            {studies.map((item) => (
              <div
                key={item.id}
                className="p-[1.25rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-[1rem] transition-colors hover:border-[var(--accent)]/60"
              >
                <div className="space-y-[0.25rem]">
                  <div className="flex items-center gap-[0.5rem]">
                    <BookOpen className="w-[1rem] h-[1rem] text-[var(--accent)]" />
                    <span className="font-editorial-heading font-semibold text-[1.1rem] text-[var(--foreground)]">
                      {item.reference.normalized}
                    </span>
                    <Badge classification="neutral">v{item.version}</Badge>
                  </div>
                  <p className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
                    Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {onOpenStudy && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenStudy(item.reference.normalized)}
                  >
                    Abrir Estudo
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
