import { useEffect, useRef, useState } from 'react';
import { ApiError, request } from '../api/http-client';
import { useSession } from '../hooks/use-session';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'Já existe uma conta com este email. Escolhe Entrar para aceder à tua conta.';
    if (error.status === 401) return 'Email ou palavra-passe incorretos. Verifica os dados e tenta novamente.';
    if (error.status === 429) return 'Demasiadas tentativas. Aguarda 15 minutos e tenta novamente.';
    if (error.status === 400) return 'Verifica o email e usa uma palavra-passe entre 15 e 128 caracteres.';
    if (error.status === 503) return 'O acesso à conta está temporariamente indisponível. Tenta novamente mais tarde.';
  }
  return 'Não foi possível entrar na conta. Tenta novamente.';
}

export function PasswordSignIn({ onAccess }: { onAccess: () => void }) {
  const { setSession, clearSession, status, version } = useSession();
  const currentVersion = useRef(version);
  useEffect(() => { currentVersion.current = version; }, [version]);
  const pending = useRef<AbortController | null>(null);
  const confirming = useRef(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => () => {
    pending.current?.abort();
    if (confirming.current) clearSession();
  }, [clearSession]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending.current || status === 'validating') return;
    setError(null);
    if (mode === 'register' && password !== confirmation) {
      setError('As palavras-passe não coincidem. Confirma a palavra-passe.');
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    const startedVersion = currentVersion.current;
    setBusy(true);
    try {
      const access = await request<{ accessToken: string; tokenType: string; expiresIn: number }>(`/auth/${mode}`, {
        method: 'POST', body: { email, password }, cache: 'no-store', redirect: 'error',
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      });
      if (controller.signal.aborted || startedVersion !== currentVersion.current) return;
      if (typeof access.accessToken !== 'string' || !access.accessToken.trim() || access.tokenType !== 'Bearer' || access.expiresIn !== 3600) throw new Error('Invalid access');
      confirming.current = true;
      const authenticated = await setSession(access.accessToken);
      confirming.current = false;
      if (authenticated && !controller.signal.aborted) {
        setPassword(''); setConfirmation(''); onAccess();
      }
    } catch (cause) {
      confirming.current = false;
      if (!controller.signal.aborted) setError(messageFor(cause));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
      if (pending.current === controller) pending.current = null;
    }
  }

  const disabled = busy || status === 'validating';
  return <div className="space-y-[0.75rem]">
    <form aria-label={mode === 'register' ? 'Criar conta' : 'Entrar com email'} className="space-y-[1rem]" onSubmit={event => { void submit(event); }}>
      <fieldset disabled={disabled} className="min-w-0 space-y-[0.75rem]">
        <div className="space-y-[0.35rem]">
          <label htmlFor="account-email" className="block text-[0.875rem] font-medium">Email</label>
          <Input id="account-email" name="email" type="email" autoComplete="username" required maxLength={254}
            value={email} onChange={event => setEmail(event.target.value)} />
        </div>
        <div className="space-y-[0.35rem]">
          <label htmlFor="account-password" className="block text-[0.875rem] font-medium">Palavra-passe</label>
          <Input id="account-password" name="password" type="password" required minLength={15} maxLength={128}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            aria-describedby={mode === 'register' ? 'account-password-help' : undefined}
            value={password} onChange={event => setPassword(event.target.value)} />
          {mode === 'register' && <p id="account-password-help" className="text-[0.8rem] text-[var(--foreground-muted)]">Usa entre 15 e 128 caracteres. Podes usar uma frase com espaços.</p>}
        </div>
        {mode === 'register' && <div className="space-y-[0.35rem]">
          <label htmlFor="account-password-confirmation" className="block text-[0.875rem] font-medium">Confirmar palavra-passe</label>
          <Input id="account-password-confirmation" name="password-confirmation" type="password" autoComplete="new-password" required minLength={15} maxLength={128}
            value={confirmation} onChange={event => setConfirmation(event.target.value)} />
        </div>}
      </fieldset>
      {error && <p role="alert" className="text-[0.875rem] text-[var(--foreground)]">{error}</p>}
      {busy && <p role="status" className="text-[0.875rem] text-[var(--foreground-muted)]">{mode === 'register' ? 'A criar a tua conta…' : 'A entrar na tua conta…'}</p>}
      <Button type="submit" className="w-full" disabled={disabled}>{mode === 'register' ? 'Criar conta e entrar' : 'Entrar com email'}</Button>
    </form>
    <div className="flex flex-wrap items-center justify-center gap-x-[0.5rem] text-[0.875rem]">
      <span className="text-[var(--foreground-muted)]">{mode === 'register' ? 'Já tens conta?' : 'Ainda não tens conta?'}</span>
      <Button type="button" variant="ghost" disabled={disabled} onClick={() => {
        setMode(mode === 'register' ? 'login' : 'register'); setPassword(''); setConfirmation(''); setError(null);
      }}>{mode === 'register' ? 'Entrar' : 'Criar conta'}</Button>
    </div>
  </div>;
}
