import { useCrossReferences } from '../../shared/api/hooks';
import { Badge } from '../../shared/ui/badge';
import { Skeleton } from '../../shared/ui/skeleton';
import { Link2, BookOpen, AlertCircle } from 'lucide-react';

interface CrossRefPanelProps {
  reference: string;
  onNavigateToPassage?: (reference: string) => void;
}

export function CrossRefPanel({ reference, onNavigateToPassage }: CrossRefPanelProps) {
  const { data: page, isLoading, error } = useCrossReferences('porbr2018', reference);

  const relations = page?.items || [];

  const typeLabels: Record<string, string> = {
    'direct-citation': 'Citação Direta',
    'allusion': 'Alusão Textual',
    'prophetic-fulfillment': 'Cumprimento Profético',
    'thematic-parallel': 'Paralelo Temático',
  };

  const assessmentLabels: Record<string, string> = {
    high: 'Conexão Alta',
    moderate: 'Conexão Moderada',
    traditional: 'Interpretação Tradicional',
    disputed: 'Debatida',
  };

  return (
    <div className="space-y-[1rem] font-ui">
      <div className="flex items-center justify-between">
        <h4 className="text-[0.85rem] font-semibold text-[var(--foreground)] flex items-center gap-[0.35rem]">
          <Link2 className="w-[0.9rem] h-[0.9rem] text-[var(--accent)]" />
          Referências para {reference}
        </h4>
        <span className="text-[0.7rem] text-[var(--foreground-muted)]">
          {relations.length} {relations.length === 1 ? 'conexão' : 'conexões'}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-[0.75rem]">
          <Skeleton className="w-full h-[4.5rem]" />
          <Skeleton className="w-full h-[4.5rem]" />
        </div>
      ) : error ? (
        <div className="p-[0.75rem] rounded-[var(--radius-md)] border border-rose-900/30 bg-rose-950/10 text-rose-300 text-[0.75rem]">
          {error instanceof Error ? error.message : 'Erro ao buscar referências cruzadas.'}
        </div>
      ) : relations.length === 0 ? (
        <div className="p-[1.5rem] text-center border border-[var(--border)] rounded-[var(--radius-md)] text-[0.8rem] text-[var(--foreground-muted)] space-y-[0.35rem]">
          <AlertCircle className="w-[1.5rem] h-[1.5rem] mx-auto opacity-40" />
          <p>Nenhuma referência cruzada catalogada para esta passagem.</p>
        </div>
      ) : (
        <div className="space-y-[0.75rem]">
          {relations.map((rel) => (
            <article
              key={rel.id}
              className="p-[0.875rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.5rem] hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-[0.5rem]">
                <button
                  onClick={() => onNavigateToPassage?.(rel.to.normalized)}
                  className="font-editorial-heading font-semibold text-[0.95rem] text-[var(--foreground)] hover:text-[var(--accent)] flex items-center gap-[0.25rem] cursor-pointer"
                >
                  <BookOpen className="w-[0.8rem] h-[0.8rem]" />
                  {rel.to.normalized}
                </button>
                <Badge classification="inference">
                  {typeLabels[rel.type] || rel.type}
                </Badge>
              </div>

              <p className="text-[0.8rem] text-[var(--foreground)] leading-relaxed">
                {rel.rationale}
              </p>

              <div className="flex justify-between items-center text-[0.7rem] text-[var(--foreground-muted)] pt-[0.25rem] border-t border-[var(--border)]/60">
                <span>Avaliação: {assessmentLabels[rel.assessment] || rel.assessment}</span>
                <span>{rel.evidence.length} evidência(s)</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
