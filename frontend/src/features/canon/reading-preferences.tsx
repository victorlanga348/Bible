import { Type, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../../shared/ui/button';

export type FontSizeOption = 'sm' | 'md' | 'lg' | 'xl';
export type ReaderWidthOption = 'compact' | 'normal' | 'wide';

export interface ReadingPreferencesProps {
  fontSize: FontSizeOption;
  onFontSizeChange: (size: FontSizeOption) => void;
  readerWidth: ReaderWidthOption;
  onReaderWidthChange: (width: ReaderWidthOption) => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

export function ReadingPreferences({
  fontSize,
  onFontSizeChange,
  readerWidth,
  onReaderWidthChange,
  isFocusMode,
  onToggleFocusMode,
}: ReadingPreferencesProps) {
  const fontSizes: FontSizeOption[] = ['sm', 'md', 'lg', 'xl'];
  const widths: Array<{ id: ReaderWidthOption; label: string }> = [
    { id: 'compact', label: 'Estreito' },
    { id: 'normal', label: 'Padrão' },
    { id: 'wide', label: 'Amplo' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-[0.75rem] text-[0.8rem] font-ui text-[var(--foreground-muted)]">
      {/* Seletor de Tamanho de Fonte */}
      <div className="flex items-center gap-[0.25rem] bg-[var(--surface-muted)] p-[0.2rem] rounded-[var(--radius-md)] border border-[var(--border)]">
        <Type className="w-[0.85rem] h-[0.85rem] ml-[0.35rem] text-[var(--foreground-muted)]" />
        {fontSizes.map((size) => (
          <button
            key={size}
            onClick={() => onFontSizeChange(size)}
            className={`px-[0.5rem] py-[0.15rem] rounded-[var(--radius-sm)] text-[0.75rem] font-medium transition-colors cursor-pointer ${
              fontSize === size
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {size.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Seletor de Largura da Linha */}
      <div className="hidden sm:flex items-center gap-[0.25rem] bg-[var(--surface-muted)] p-[0.2rem] rounded-[var(--radius-md)] border border-[var(--border)]">
        {widths.map((w) => (
          <button
            key={w.id}
            onClick={() => onReaderWidthChange(w.id)}
            className={`px-[0.5rem] py-[0.15rem] rounded-[var(--radius-sm)] text-[0.75rem] font-medium transition-colors cursor-pointer ${
              readerWidth === w.id
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Modo Foco / Zen */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleFocusMode}
        title={isFocusMode ? 'Sair do Modo Foco (Esc)' : 'Ativar Modo Foco (Leitura Imersiva)'}
        className="h-[1.9rem] px-[0.6rem] gap-[0.35rem] text-[0.75rem]"
      >
        {isFocusMode ? (
          <>
            <Minimize2 className="w-[0.85rem] h-[0.85rem]" />
            <span className="hidden sm:inline">Restaurar</span>
          </>
        ) : (
          <>
            <Maximize2 className="w-[0.85rem] h-[0.85rem]" />
            <span className="hidden sm:inline">Modo Foco</span>
          </>
        )}
      </Button>
    </div>
  );
}
