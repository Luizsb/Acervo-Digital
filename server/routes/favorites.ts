import express from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// GET /api/users/me/favorites - lista IDs dos projetos favoritos do usuário
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
    const favorites = await prisma.userFavorite.findMany({
      where: { userId: req.user.userId },
      select: { projectId: true },
    });
    res.json(favorites.map((f) => f.projectId));
  } catch (err: any) {
    console.error('Favorites list error:', err);
    res.status(500).json({ error: err.message || 'Erro ao listar favoritos.' });
  }
});

// POST /api/users/me/favorites - adiciona um projeto aos favoritos
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
    const projectId = Number(req.body?.projectId);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'projectId inválido.' });
    }
    await prisma.userFavorite.upsert({
      where: {
        userId_projectId: { userId: req.user.userId, projectId },
      },
      create: { userId: req.user.userId, projectId },
      update: {},
    });
    res.status(201).json({ projectId });
  } catch (err: any) {
    console.error('Favorites add error:', err);
    res.status(500).json({ error: err.message || 'Erro ao adicionar favorito.' });
  }
});

// DELETE /api/users/me/favorites/:projectId - remove dos favoritos
router.delete('/:projectId', async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
    const projectId = Number(req.params.projectId);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({ error: 'projectId inválido.' });
    }
    await prisma.userFavorite.deleteMany({
      where: { userId: req.user.userId, projectId },
    });
    res.json({ ok: true });
  } catch (err: any) {
    console.error('Favorites remove error:', err);
    res.status(500).json({ error: err.message || 'Erro ao remover favorito.' });
  }
});

export default router;
