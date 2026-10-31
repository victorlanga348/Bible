import type { AiAnalysisDto } from '../../shared/api/contracts';
import { Badge } from '../../shared/ui/badge';

export function AnalysisResult({ analysis }: { analysis: AiAnalysisDto }) {
  return <article className="p-[1rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.75rem]">
    <h3 className="font-ui font-medium text-[0.875rem]">"{analysis.question}"</h3>
    <Badge classification={analysis.status === 'supported' ? 'documented-fact' : 'insufficient-evidence'}>
      {analysis.status === 'supported' ? 'Evidência documentada' : analysis.status === 'restricted' ? 'Acesso limitado' : 'Evidência insuficiente'}
    </Badge>
    {analysis.status === 'supported' && analysis.evidence.map(evidence => <div key={`${evidence.excerptId}:${evidence.startOffset}`} className="space-y-[0.5rem]">
      <blockquote className="font-serif italic text-[0.95rem] leading-relaxed">{evidence.quote}</blockquote>
      <p className="text-[0.75rem] text-[var(--foreground-muted)]">{evidence.attribution} · {evidence.locator}</p>
      <p className="text-[0.75rem] text-[var(--foreground-muted)]">{evidence.rightsStatement}</p>
      {(evidence.rightsUrl.startsWith('https://') || evidence.rightsUrl.startsWith('http://')) && <a href={evidence.rightsUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline text-[0.75rem]">Direitos da fonte</a>}
    </div>)}
    {analysis.status === 'insufficient-evidence' && <p className="text-[0.825rem] text-[var(--foreground-muted)]">Sem evidência documental nas fontes admitidas para esta pergunta.</p>}
    {analysis.status === 'restricted' && <p className="text-[0.825rem] text-[var(--foreground-muted)]">A política de acesso da fonte limita a apresentação desta resposta.</p>}
    {analysis.limitations.length > 0 && <ul className="list-disc pl-[1rem] text-[0.75rem] text-[var(--foreground-muted)] space-y-[0.25rem]">{analysis.limitations.map((limitation, index) => <li key={index}>{limitation}</li>)}</ul>}
    <details className="text-[0.75rem] text-[var(--foreground-muted)]">
      <summary className="cursor-pointer">Proveniência da resposta</summary>
      <p className="mt-[0.5rem] break-words">Perfil: {analysis.provenance.profileId} · {analysis.provenance.promptVersion}</p>
      <p>{new Date(analysis.createdAt).toLocaleString('pt-BR')}</p>
      <p>{analysis.provenance.totalTokens} tokens · {analysis.provenance.consultedSegments.length} segmentos consultados</p>
    </details>
  </article>;
}
