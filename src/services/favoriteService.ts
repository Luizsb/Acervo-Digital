import { api } from './api';
import { ODA } from './odaService';

export const favoriteService = {
  async getAll(): Promise<ODA[]> {
    return api.get<ODA[]>('/favorites');
  },

  async add(odaId: string): Promise<void> {
    return api.post(`/favorites/${odaId}`);
  },

  async remove(odaId: string): Promise<void> {
    return api.delete(`/favorites/${odaId}`);
  },

  async check(odaId: string): Promise<boolean> {
    try {
      const response = await api.get<{ isFavorite: boolean }>(
        `/favorites/check/${odaId}`
      );
      return response.isFavorite;
    } catch {
      return false;
    }
  },
};

