import { isSupabaseBackend } from '../../config/backend';
import { supabaseFavoriteAdd, supabaseFavoriteRemove, supabaseFavoritesGet } from '../supabaseApi';
import { API_BASE_URL, getAuthToken, requestJson, requireAuthToken } from './http';

export async function apiFavoritesGet(): Promise<number[]> {
  if (isSupabaseBackend()) return supabaseFavoritesGet();
  const token = getAuthToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE_URL}/users/me/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Erro ao carregar favoritos.');
  return res.json();
}

export async function apiFavoriteAdd(projectId: number): Promise<void> {
  if (isSupabaseBackend()) return supabaseFavoriteAdd(projectId);
  const token = requireAuthToken();
  await requestJson(
    '/users/me/favorites',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ projectId }),
    },
    'Erro ao adicionar favorito.',
  );
}

export async function apiFavoriteRemove(projectId: number): Promise<void> {
  if (isSupabaseBackend()) return supabaseFavoriteRemove(projectId);
  const token = requireAuthToken();
  await requestJson(
    `/users/me/favorites/${projectId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
    'Erro ao remover favorito.',
  );
}
