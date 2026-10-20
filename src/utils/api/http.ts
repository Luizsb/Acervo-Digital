/** Base da API Express (modo `VITE_BACKEND=ec2`). */
export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

const AUTH_TOKEN_KEY = 'acervo_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeStoredAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function requireAuthToken(): string {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  return token;
}

export function authHeaders(json = false): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

/** Chama a API Express e usa `error` ou `message` do corpo como texto da falha. */
export async function requestJson<T>(path: string, init: RequestInit, fallback: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || fallback);
  return data as T;
}
