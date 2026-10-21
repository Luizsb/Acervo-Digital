import { useEffect, useState } from 'react';
import type { AuthUser } from '../contexts/AuthContext';
import { apiFavoriteAdd, apiFavoriteRemove, apiFavoritesGet } from '../utils/api';

const STORAGE_KEY = 'favorites';

function readStoredFavorites(): number[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch (error) {
    console.error('Erro ao carregar favoritos do localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function toggled(list: number[], id: number): number[] {
  const unique = Array.from(new Set(list.map(Number)));
  return unique.includes(id) ? unique.filter((item) => item !== id) : [...unique, id];
}

/**
 * Favoritos do usuário. Com sessão, vão para a API e voltam atrás se a gravação
 * falhar; sem sessão, ficam no localStorage.
 */
export function useFavorites(user: AuthUser | null) {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      apiFavoritesGet()
        .then((ids) => setFavorites(Array.isArray(ids) ? ids : []))
        .catch(() => setFavorites([]));
      return;
    }
    setFavorites(readStoredFavorites());
  }, [user]);

  const isFavorite = (projectId: number) => favorites.some((id) => Number(id) === Number(projectId));

  const toggleFavorite = (projectId: number) => {
    if (!projectId || Number.isNaN(projectId)) {
      console.error('ID de projeto inválido:', projectId);
      return;
    }
    const id = Number(projectId);

    if (user) {
      const wasFavorite = isFavorite(id);
      setFavorites((prev) => toggled(prev, id));
      const request = wasFavorite ? apiFavoriteRemove(id) : apiFavoriteAdd(id);
      request.catch(() => setFavorites((prev) => toggled(prev, id)));
      return;
    }

    setFavorites((prev) => {
      const next = toggled(prev, id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error('Erro ao salvar favoritos no localStorage:', error);
      }
      return next;
    });
  };

  return { favorites, isFavorite, toggleFavorite };
}
