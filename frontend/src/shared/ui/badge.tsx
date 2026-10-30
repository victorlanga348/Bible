import React from 'react';
import { cn } from '../lib/utils';

export type EpistemicClassification =
  | 'documented-fact'
  | 'inference'
  | 'tradition'
  | 'hypothesis'
  | 'insufficient-evidence'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  classification?: EpistemicClassification;
  children: React.ReactNode;
}

export function Badge({ classification = 'neutral', className, children, ...props }: BadgeProps) {
  const styles: Record<EpistemicClassification, string> = {
    'documented-fact': 'bg-[var(--epistemic-fact-bg)] text-[var(--epistemic-fact-text)] border-[var(--epistemic-fact-border)]',
    'inference': 'bg-[var(--epistemic-inference-bg)] text-[var(--epistemic-inference-text)] border-[var(--epistemic-inference-border)]',
    'tradition': 'bg-[var(--epistemic-tradition-bg)] text-[var(--epistemic-tradition-text)] border-[var(--epistemic-tradition-border)]',
    'hypothesis': 'bg-[var(--epistemic-hypothesis-bg)] text-[var(--epistemic-hypothesis-text)] border-[var(--epistemic-hypothesis-border)]',
    'insufficient-evidence': 'bg-[var(--epistemic-insufficient-bg)] text-[var(--epistemic-insufficient-text)] border-[var(--epistemic-insufficient-border)] border-dashed',
    'neutral': 'bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-[var(--border)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[0.35rem] px-[0.55rem] py-[0.15rem] text-[0.725rem] font-medium font-ui rounded-full border transition-colors select-none',
        styles[classification],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function EpistemicBadge({ classification }: { classification: EpistemicClassification }) {
  const labels: Record<EpistemicClassification, string> = {
    'documented-fact': 'Fato Documentado',
    'inference': 'Inferência Hermenêutica',
    'tradition': 'Tradição Histórica',
    'hypothesis': 'Hipótese Debatida',
    'insufficient-evidence': 'Evidência Insuficiente',
    'neutral': 'Geral',
  };

  return <Badge classification={classification}>{labels[classification]}</Badge>;
}
