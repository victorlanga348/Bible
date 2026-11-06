import { Button } from './button';

export function CursorControls({ pages, nextCursor, busy = false, label = '' }: {
  pages: { hasPrevious: boolean; next: (cursor: string) => void; previous: () => void };
  nextCursor?: string | null; busy?: boolean; label?: string;
}) {
  return <nav aria-label={`Paginação${label}`} className="flex flex-wrap gap-[0.75rem] py-[0.75rem]">
    <Button size="sm" variant="outline" disabled={busy || !pages.hasPrevious} onClick={pages.previous}>Página anterior{label}</Button>
    <Button size="sm" variant="outline" disabled={busy || !nextCursor} onClick={() => { if (nextCursor) pages.next(nextCursor); }}>Página seguinte{label}</Button>
  </nav>;
}
