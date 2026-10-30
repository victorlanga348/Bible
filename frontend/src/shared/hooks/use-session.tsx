import React, { createContext, useContext, useState } from 'react';

interface SessionContextType {
  token: string | null;
  ownerId: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, ownerId?: string) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Read optional dev environment token, but store strictly in memory
  const initialToken = typeof import.meta !== 'undefined' ? (import.meta.env.VITE_LOCAL_AUTH_TOKEN as string) || null : null;
  const [token, setTokenState] = useState<string | null>(initialToken);
  const [ownerId, setOwnerId] = useState<string | null>(initialToken ? 'local-owner' : null);

  const setSession = (newToken: string, newOwnerId = 'local-owner') => {
    setTokenState(newToken.trim());
    setOwnerId(newOwnerId);
  };

  const clearSession = () => {
    setTokenState(null);
    setOwnerId(null);
  };

  return (
    <SessionContext.Provider
      value={{
        token,
        ownerId,
        isAuthenticated: !!token,
        setSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
