import { useState } from 'react';

export function useCursorPages() {
  const [pages, setPages] = useState<(string | null)[]>([null]);
  return {
    cursor: pages[pages.length - 1],
    hasPrevious: pages.length > 1,
    next: (cursor: string) => setPages(previous => [...previous, cursor]),
    previous: () => setPages(previous => previous.length > 1 ? previous.slice(0, -1) : previous),
    reset: () => setPages([null]),
  };
}
