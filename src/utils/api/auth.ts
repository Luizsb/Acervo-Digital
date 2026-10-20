import { isSupabaseBackend } from '../../config/backend';
import { supabaseAuthMe, supabaseLogin, supabaseLogout } from '../supabaseApi';
import {
  API_BASE_URL,
  getAuthToken,
  removeStoredAuthToken,
  requestJson,
  requireAuthToken,
} from './http';
import type { AuthUserResponse } from './types';

const SUPABASE_PASSWORD_RESET =
  'Redefinição de senha neste MVP: Authentication no painel do Supabase.';

type AuthSession = { token: string; user: AuthUserResponse };

export function clearAuthToken(): void {
  removeStoredAuthToken();
  if (isSupabaseBackend()) {
    void supabaseLogout();
  }
}

export async function apiLogin(email: string, password: string): Promise<AuthSession> {
  if (isSupabaseBackend()) return supabaseLogin(email, password);
  return requestJson<AuthSession>(
    '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    },
    'Erro ao entrar.',
  );
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthSession> {
  if (isSupabaseBackend()) throw new Error('Cadastro público está desativado. Use o acesso interno.');
  return requestJson<AuthSession>(
    '/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
    },
    'Erro ao cadastrar.',
  );
}

export async function apiAuthMe(): Promise<AuthUserResponse | null> {
  if (isSupabaseBackend()) return supabaseAuthMe();
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Erro ao verificar sessão.');
  return res.json();
}

export async function apiUpdateMe(params: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<AuthUserResponse> {
  if (isSupabaseBackend()) throw new Error('Altere a senha pelo painel do Supabase Auth neste MVP.');
  const token = requireAuthToken();
  return requestJson<AuthUserResponse>(
    '/auth/me',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(params),
    },
    'Erro ao atualizar.',
  );
}

export async function apiForgotPassword(
  email: string,
): Promise<{ message: string; emailExists: boolean; token?: string }> {
  if (isSupabaseBackend()) throw new Error(SUPABASE_PASSWORD_RESET);
  return requestJson(
    '/auth/forgot-password',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    },
    'Erro ao solicitar redefinição.',
  );
}

export async function apiResetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  if (isSupabaseBackend()) throw new Error(SUPABASE_PASSWORD_RESET);
  return requestJson(
    '/auth/reset-password',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    },
    'Erro ao redefinir senha.',
  );
}
