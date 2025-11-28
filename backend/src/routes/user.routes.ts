import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

export const userRoutes = Router();

// POST /api/users/register - Registrar novo usuário
userRoutes.post('/register', userController.register);

// POST /api/users/login - Login
userRoutes.post('/login', userController.login);

// GET /api/users/me - Obter dados do usuário logado
userRoutes.get('/me', authenticate, userController.getMe);

// PUT /api/users/me - Atualizar perfil do usuário logado
userRoutes.put('/me', authenticate, userController.updateProfile);

