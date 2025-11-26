import { Router } from 'express';
import { odaController } from '../controllers/oda.controller';

export const odaRoutes = Router();

// GET /api/odas - Listar ODAs com filtros e busca
odaRoutes.get('/', odaController.getAll);

// GET /api/odas/:id - Obter um ODA específico
odaRoutes.get('/:id', odaController.getById);

// POST /api/odas - Criar novo ODA (admin)
odaRoutes.post('/', odaController.create);

// PUT /api/odas/:id - Atualizar ODA (admin)
odaRoutes.put('/:id', odaController.update);

// DELETE /api/odas/:id - Deletar ODA (admin)
odaRoutes.delete('/:id', odaController.delete);

// GET /api/odas/:id/related - Obter ODAs relacionados
odaRoutes.get('/:id/related', odaController.getRelated);

// POST /api/odas/:id/view - Incrementar visualizações
odaRoutes.post('/:id/view', odaController.incrementView);

