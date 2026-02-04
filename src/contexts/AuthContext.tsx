import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  apiLogin,
  apiRegister,
  apiAuthMe,
  type AuthUserResponse,
} from '../utils/api';

const AUTH_USER_KEY = 'acervo_user';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (u: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toAuthUser(u: AuthUserResponse): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? u.email.split('@')[0],
    role: u.role,
  };
}

function toFriendlyError(err: any, fallback: string): string {
  const msg = err?.message?.toString() || '';
  if (msg.includes('Failed to fetch') || msg.includes('ConnectionRefused') || msg.includes('ERR_CONNECTION_REFUSED') || msg.includes('NetworkError')) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando (ex.: npm run server:dev em outro terminal).';
  }
  return msg || fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    clearAuthToken();
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!email.trim() || !password.trim()) {
      return { ok: false, error: 'Preencha e-mail e senha.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
    }
    try {
      const { token, user: u } = await apiLogin(email, password);
      const authUser = toAuthUser(u);
      setAuthToken(token);
      setUser(authUser);
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      } catch {
        // ignore
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: toFriendlyError(err, 'E-mail ou senha incorretos.') };
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      if (!email.trim() || !password.trim()) {
        return { ok: false, error: 'E-mail e senha são obrigatórios.' };
      }
      if (password.length < 6) {
        return { ok: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
      }
      try {
        const { token, user: u } = await apiRegister(name, email, password);
        const authUser = toAuthUser(u);
        setAuthToken(token);
        setUser(authUser);
        try {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        } catch {
          // ignore
        }
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: toFriendlyError(err, 'Erro ao cadastrar.') };
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiAuthMe()
      .then((u) => {
        if (!cancelled && u) setUser(toAuthUser(u));
      })
      .catch(() => {
        if (!cancelled) {
          clearAuthToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateUser = useCallback((u: AuthUser) => {
    setUser(u);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
