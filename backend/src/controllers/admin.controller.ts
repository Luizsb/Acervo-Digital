import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const adminController = {
  // GET /api/admin/stats - Estatísticas do banco
  async getStats(req: Request, res: Response) {
    try {
      const userCount = await prisma.user.count();
      const odaCount = await prisma.oDA.count();
      const favoriteCount = await prisma.favorite.count();
      const viewCount = await prisma.view.count();

      res.json({
        stats: {
          users: userCount,
          odas: odaCount,
          favorites: favoriteCount,
          views: viewCount,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch stats' });
    }
  },

  // GET /api/admin/users - Listar usuários
  async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              favorites: true,
              views: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({ users, count: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  },

  // GET /api/admin/odas - Listar ODAs (resumo)
  async getODAs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const odas = await prisma.oDA.findMany({
        take: limit,
        select: {
          id: true,
          title: true,
          contentType: true,
          tag: true,
          location: true,
          views: true,
          createdAt: true,
          _count: {
            select: {
              favorites: true,
              viewRecords: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await prisma.oDA.count();

      res.json({
        odas,
        total,
        showing: odas.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch ODAs' });
    }
  },

  // GET /api/admin/favorites - Listar favoritos
  async getFavorites(req: Request, res: Response) {
    try {
      const favorites = await prisma.favorite.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
          oda: {
            select: {
              title: true,
              contentType: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({ favorites, count: favorites.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch favorites' });
    }
  },
};

