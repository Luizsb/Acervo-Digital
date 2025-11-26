import { Response } from 'express';
import { favoriteService } from '../services/favorite.service';
import { AuthRequest } from '../middleware/auth';

export const favoriteController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const favorites = await favoriteService.getAll(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  },

  async add(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { odaId } = req.params;

      const favorite = await favoriteService.add(userId, odaId);
      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to add favorite' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { odaId } = req.params;

      await favoriteService.remove(userId, odaId);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'Favorite not found' });
    }
  },

  async check(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { odaId } = req.params;

      const isFavorite = await favoriteService.check(userId, odaId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check favorite' });
    }
  },
};

