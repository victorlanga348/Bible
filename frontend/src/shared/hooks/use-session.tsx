import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiClient, ApiError } from '../api/client';

interface SessionState {
  token: string | null;
  ownerId: string | null;
  version: number;
  status: 'anonymous' | 'validating' | 'authenticated';
}
interface SessionContextType extends SessionState {
  isAuthenticated: boolean;
  setSession: (token: string) => Promise<boolean>;
  clearSession: () => void;
}
const SessionContext = createContext<SessionContextType | undefined>(undefined);
const anonymous = (version: number): SessionState => ({ token: null, ownerId: null, version, status: 'anonymous' });
class InvalidSessionIdentity extends Error {}
function ownerOf(body: unknown): string {
  if (!body || typeof body !== 'object' || Object.keys(body).length !== 1 || !('ownerId' in body)
    || typeof body.ownerId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(body.ownerId)) {
    throw new InvalidSessionIdentity('Não foi possível confirmar a sessão. Tenta novamente.');
  }
  return body.ownerId;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setState] = useState<SessionState>(() => anonymous(0));
  const current = useRef(session);
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const update = useCallback((state: SessionState) => { current.current = state; setState(state); }, []);
  const invalidatePending = useCallback(() => {
    pending.current?.abort();
    return ++generation.current;
  }, []);
  const clearSession = useCallback(() => { update(anonymous(invalidatePending())); }, [invalidatePending, update]);

  const setSession = useCallback(async (value: string): Promise<boolean> => {
    const version = invalidatePending();
    update({ ...anonymous(version), status: 'validating' });
    const controller = new AbortController();
    pending.current = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const token = value.trim();
      if (!token) throw new Error('Empty token');
      const identity = await apiClient<unknown>('/auth/me', {
        token, cache: 'no-store', redirect: 'error', signal: controller.signal,
      });
      const ownerId = ownerOf(identity);
      if (generation.current !== version) return false;
      update({ token, ownerId, version, status: 'authenticated' });
      return true;
    } catch {
      if (generation.current !== version) return false;
      update(anonymous(version));
      throw new Error('Não foi possível confirmar a sessão. Tenta novamente.');
    } finally {
      clearTimeout(timer);
      if (pending.current === controller) pending.current = null;
    }
  }, [invalidatePending, update]);

  useEffect(() => {
    const checkCurrent = async () => {
      const snapshot = current.current;
      if (!snapshot.token) return;
      try {
        const identity = await apiClient('/auth/me', { token: snapshot.token, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
        if (ownerOf(identity) !== snapshot.ownerId && generation.current === snapshot.version) clearSession();
      } catch (error) {
        if (generation.current === snapshot.version && (error instanceof InvalidSessionIdentity || (error instanceof ApiError && error.status === 401))) clearSession();
      }
    };
    const handleUnauthorized = () => { void checkCurrent(); };
    window.addEventListener('biblia:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('biblia:unauthorized', handleUnauthorized);
      invalidatePending();
    };
  }, [clearSession, invalidatePending]);

  return <SessionContext.Provider value={{ ...session, isAuthenticated: session.status === 'authenticated', setSession, clearSession }}>
    {children}
  </SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}
