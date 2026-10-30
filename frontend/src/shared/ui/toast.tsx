import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextValue {
  toast: (title: string, options?: { description?: string; type?: ToastType }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(
    (title: string, options?: { description?: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description: options?.description, type: options?.type || 'info' }]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle2 className="w-[1.125rem] h-[1.125rem] text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-[1.125rem] h-[1.125rem] text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-[1.125rem] h-[1.125rem] text-rose-400 shrink-0" />,
    info: <Info className="w-[1.125rem] h-[1.125rem] text-sky-400 shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map(({ id, title, description, type = 'info' }) => (
          <ToastPrimitive.Root
            key={id}
            onOpenChange={(open) => !open && removeToast(id)}
            className={cn(
              'z-50 flex items-start gap-[0.75rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-[1rem] shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full'
            )}
          >
            {icons[type]}
            <div className="flex-1 space-y-[0.25rem]">
              <ToastPrimitive.Title className="text-[0.875rem] font-medium text-[var(--foreground)]">
                {title}
              </ToastPrimitive.Title>
              {description && (
                <ToastPrimitive.Description className="text-[0.8rem] text-[var(--foreground-muted)]">
                  {description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-[0.2rem] rounded-[var(--radius-sm)] cursor-pointer">
              <X className="w-[0.95rem] h-[0.95rem]" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex max-h-screen w-[min(100vw,24rem)] flex-col p-[1rem] gap-[0.5rem] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
