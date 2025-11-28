import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';

export const adminRoutes = Router();

// GET /api/admin/stats - Estatísticas do banco
adminRoutes.get('/stats', adminController.getStats);

// GET /api/admin/users - Listar usuários
adminRoutes.get('/users', adminController.getUsers);

// GET /api/admin/odas - Listar ODAs (resumo)
adminRoutes.get('/odas', adminController.getODAs);

// GET /api/admin/favorites - Listar favoritos
adminRoutes.get('/favorites', adminController.getFavorites);

