import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth';

export const favoriteRoutes = Router();

// Todas as rotas de favoritos requerem autenticação
favoriteRoutes.use(authenticate);

// GET /api/favorites - Listar favoritos do usuário
favoriteRoutes.get('/', favoriteController.getAll);

// POST /api/favorites/:odaId - Adicionar aos favoritos
favoriteRoutes.post('/:odaId', favoriteController.add);

// DELETE /api/favorites/:odaId - Remover dos favoritos
favoriteRoutes.delete('/:odaId', favoriteController.remove);

// GET /api/favorites/check/:odaId - Verificar se está nos favoritos
favoriteRoutes.get('/check/:odaId', favoriteController.check);

