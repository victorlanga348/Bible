import React, { useState } from 'react';
import { useResolveReference } from '../../shared/api/hooks';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '../../shared/ui/toast';

interface ReferenceSearchProps {
  onPassageResolved: (bookCode: string, chapter: number, fromVerse?: number, toVerse?: number) => void;
  translationId?: string;
}

export function ReferenceSearch({ onPassageResolved, translationId = 'porbr2018' }: ReferenceSearchProps) {
  const [query, setQuery] = useState('');
  const resolveMutation = useResolveReference();
  const { toast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      const resolved = await resolveMutation.mutateAsync({
        translationId,
        reference: trimmed,
      });

      onPassageResolved(
        resolved.bookCode,
        resolved.chapter,
        resolved.fromVerse,
        resolved.toVerse
      );

      toast(`Navegado para ${resolved.normalized}`, { type: 'success' });
      setQuery('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Referência bíblica não reconhecida.';
      toast('Referência inválida', {
        description: `${msg} Exemplo: GEN 1:1-3, Jo 3:16 ou Sl 23`,
        type: 'warning',
      });
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-[0.5rem] w-full max-w-[22rem]">
      <div className="relative flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ir para passagem (ex: Jo 3:16, Gn 1)..."
          icon
          disabled={resolveMutation.isPending}
          className="h-[2.25rem] text-[0.825rem]"
        />
      </div>
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        loading={resolveMutation.isPending}
        className="h-[2.25rem] shrink-0"
      >
        <Search className="w-[0.9rem] h-[0.9rem]" />
        <span className="hidden sm:inline">Ir</span>
      </Button>
    </form>
  );
}
