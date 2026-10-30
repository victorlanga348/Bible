import React, { useState } from 'react';
import {
  BookOpen,
  Compass,
  Library,
  Clock,
  Sparkles,
  Sun,
  Moon,
  KeyRound,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../hooks/use-theme';
import { useSession } from '../hooks/use-session';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Input } from './input';

export type NavTab = 'reader' | 'study' | 'sources' | 'history';

interface ShellProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  children: React.ReactNode;
  contextPanel?: React.ReactNode;
  isContextOpen?: boolean;
  onToggleContext?: () => void;
}

export function AppShell({
  activeTab,
  onTabChange,
  children,
  contextPanel,
  isContextOpen = true,
  onToggleContext,
}: ShellProps) {
  const { theme, toggleTheme } = useTheme();
  const { token, isAuthenticated, setSession, clearSession } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState(token || '');

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'reader', label: 'Bíblia', icon: <BookOpen className="w-[1.125rem] h-[1.125rem]" /> },
    { id: 'study', label: 'Estudo Estruturado', icon: <Compass className="w-[1.125rem] h-[1.125rem]" /> },
    { id: 'sources', label: 'Fontes Históricas', icon: <Library className="w-[1.125rem] h-[1.125rem]" /> },
    { id: 'history', label: 'Histórico & Workspace', icon: <Clock className="w-[1.125rem] h-[1.125rem]" /> },
  ];

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      setSession(tokenInput.trim());
      setAuthDialogOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* 1. Região Esquerda — Navegação Desktop */}
      <aside className="hidden md:flex flex-col w-[16rem] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-[1rem] justify-between z-20">
        <div className="space-y-[1.5rem]">
          {/* Logo e Identidade */}
          <div className="flex items-center gap-[0.75rem] px-[0.5rem] py-[0.25rem]">
            <div className="flex items-center justify-center w-[2rem] h-[2rem] rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-foreground)] font-serif font-bold text-[1.125rem]">
              Ω
            </div>
            <div>
              <span className="font-editorial-heading font-semibold text-[1.05rem] tracking-tight block leading-tight text-[var(--foreground)]">
                Bíblia App
              </span>
              <span className="text-[0.7rem] text-[var(--foreground-muted)] tracking-wide uppercase font-medium">
                Investigação
              </span>
            </div>
          </div>

          {/* Menus de Navegação */}
          <nav className="space-y-[0.35rem]">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-[0.875rem] py-[0.625rem] rounded-[var(--radius-md)] text-[0.875rem] font-medium font-ui transition-all duration-150 cursor-pointer ${
                    active
                      ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold shadow-xs'
                      : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]/60 hover:text-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-[0.75rem]">
                    <span className={active ? 'text-[var(--accent)]' : 'text-current'}>{item.icon}</span>
                    {item.label}
                  </div>
                  {active && <ChevronRight className="w-[0.9rem] h-[0.9rem] text-[var(--accent)]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Sessão & Tema */}
        <div className="space-y-[0.75rem] pt-[1rem] border-t border-[var(--border)]">
          {/* Estado de Sessão */}
          <div className="flex items-center justify-between px-[0.5rem]">
            <div className="flex items-center gap-[0.5rem]">
              <span
                className={`w-[0.5rem] h-[0.5rem] rounded-full ${
                  isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
                {isAuthenticated ? 'Sessão Ativa' : 'Sem Token'}
              </span>
            </div>
            <button
              onClick={() => {
                setTokenInput(token || '');
                setAuthDialogOpen(true);
              }}
              title="Configurar Bearer Token"
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-[0.25rem] rounded-[var(--radius-sm)] hover:bg-[var(--surface-muted)] cursor-pointer"
            >
              <KeyRound className="w-[0.95rem] h-[0.95rem]" />
            </button>
          </div>

          {/* Toggle de Tema */}
          <div className="flex items-center justify-between px-[0.5rem]">
            <span className="text-[0.75rem] text-[var(--foreground-muted)] font-ui">
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
            <button
              onClick={toggleTheme}
              className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] cursor-pointer transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-[1rem] h-[1rem]" />
              ) : (
                <Moon className="w-[1rem] h-[1rem]" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Região Central & Superior (Mobile Header + Conteúdo) */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header Mobile */}
        <header className="md:hidden flex items-center justify-between px-[1rem] py-[0.75rem] border-b border-[var(--border)] bg-[var(--surface)] z-30">
          <div className="flex items-center gap-[0.5rem]">
            <div className="w-[1.75rem] h-[1.75rem] rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-foreground)] font-serif font-bold text-[0.9rem] flex items-center justify-center">
              Ω
            </div>
            <span className="font-editorial-heading font-semibold text-[1rem]">Bíblia App</span>
          </div>
          <div className="flex items-center gap-[0.5rem]">
            {onToggleContext && (
              <button
                onClick={onToggleContext}
                className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
              >
                <Sparkles className="w-[1.125rem] h-[1.125rem] text-[var(--accent)]" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            >
              {mobileMenuOpen ? <X className="w-[1.25rem] h-[1.25rem]" /> : <Menu className="w-[1.25rem] h-[1.25rem]" />}
            </button>
          </div>
        </header>

        {/* Menu Dropdown Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] px-[1rem] py-[0.75rem] space-y-[0.5rem] z-20">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-[0.75rem] px-[0.75rem] py-[0.5rem] rounded-[var(--radius-md)] text-[0.875rem] font-ui ${
                  activeTab === item.id
                    ? 'bg-[var(--surface-muted)] text-[var(--foreground)] font-semibold'
                    : 'text-[var(--foreground-muted)]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="pt-[0.5rem] border-t border-[var(--border)] flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthDialogOpen(true);
                }}
              >
                <KeyRound className="w-[0.85rem] h-[0.85rem]" />
                Token da Sessão
              </Button>
              <button
                onClick={toggleTheme}
                className="p-[0.35rem] rounded-[var(--radius-md)] text-[var(--foreground-muted)]"
              >
                {theme === 'dark' ? <Sun className="w-[1rem] h-[1rem]" /> : <Moon className="w-[1rem] h-[1rem]" />}
              </button>
            </div>
          </div>
        )}

        {/* Área Principal de Conteúdo e Painel Contextual */}
        <div className="flex flex-1 min-w-0 h-full overflow-hidden">
          {/* Palco Central (Leitor / Estudo / Fontes) */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto">
            {children}
          </main>

          {/* 3. Região Direita — Painel Contextual Inteligente */}
          {contextPanel && isContextOpen && (
            <aside className="hidden lg:flex flex-col w-[min(38vw,26rem)] shrink-0 border-l border-[var(--border)] bg-[var(--surface)] h-full overflow-y-auto z-10 transition-all duration-200">
              {contextPanel}
            </aside>
          )}
        </div>
      </div>

      {/* Modal de Configuração de Sessão / Token do Operador */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sessão do Operador (Local Token)</DialogTitle>
            <DialogDescription>
              O backend utiliza tokens simétricos HS256 (`biblia-local`) emitidos exclusivamente via terminal para o proprietário local.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-[1rem] py-[0.5rem]">
            <div className="p-[0.75rem] rounded-[var(--radius-md)] bg-[var(--surface-muted)] text-[0.8rem] font-ui space-y-[0.35rem] text-[var(--foreground-muted)] border border-[var(--border)]">
              <div className="flex items-center gap-[0.35rem] text-[var(--foreground)] font-medium">
                <ShieldCheck className="w-[1rem] h-[1rem] text-[var(--accent)]" />
                Como gerar o token:
              </div>
              <code className="block p-[0.35rem] rounded bg-[var(--background)] font-mono text-[0.75rem] select-all">
                npm --prefix backend run auth:token -- local-owner
              </code>
            </div>

            <div className="space-y-[0.35rem]">
              <label className="text-[0.8rem] font-medium text-[var(--foreground)] font-ui">
                Bearer Token JWT (Válido por 1 hora):
              </label>
              <Input
                placeholder="Cole o token emitido..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            {token && (
              <Button
                variant="ghost"
                onClick={() => {
                  clearSession();
                  setTokenInput('');
                  setAuthDialogOpen(false);
                }}
              >
                Limpar Sessão
              </Button>
            )}
            <Button onClick={handleSaveToken}>
              Salvar na Memória
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
