import { Request, Response } from 'express';
import { odaService } from '../services/oda.service';

export const odaController = {
  async getAll(req: Request, res: Response) {
    try {
      const {
        search,
        contentType,
        anos,
        tags,
        bnccCodes,
        livros,
        categorias,
        marcas,
        tipoObjeto,
        videoCategory,
        samr,
        volumes,
        page = '1',
        limit = '50',
      } = req.query;

      const filters = {
        search: search as string,
        contentType: contentType as string,
        anos: anos ? (Array.isArray(anos) ? anos : [anos]) as string[] : [],
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : [],
        bnccCodes: bnccCodes ? (Array.isArray(bnccCodes) ? bnccCodes : [bnccCodes]) as string[] : [],
        livros: livros ? (Array.isArray(livros) ? livros : [livros]) as string[] : [],
        categorias: categorias ? (Array.isArray(categorias) ? categorias : [categorias]) as string[] : [],
        marcas: marcas ? (Array.isArray(marcas) ? marcas : [marcas]) as string[] : [],
        tipoObjeto: tipoObjeto ? (Array.isArray(tipoObjeto) ? tipoObjeto : [tipoObjeto]) as string[] : [],
        videoCategory: videoCategory ? (Array.isArray(videoCategory) ? videoCategory : [videoCategory]) as string[] : [],
        samr: samr ? (Array.isArray(samr) ? samr : [samr]) as string[] : [],
        volumes: volumes ? (Array.isArray(volumes) ? volumes : [volumes]) as string[] : [],
      };

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const result = await odaService.getAll(filters, pageNum, limitNum);

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ODAs' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const oda = await odaService.getById(id);

      if (!oda) {
        return res.status(404).json({ error: 'ODA not found' });
      }

      res.json(oda);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ODA' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const oda = await odaService.create(req.body);
      res.status(201).json(oda);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create ODA' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const oda = await odaService.update(id, req.body);

      if (!oda) {
        return res.status(404).json({ error: 'ODA not found' });
      }

      res.json(oda);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update ODA' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await odaService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'ODA not found' });
    }
  },

  async getRelated(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 3;
      
      const related = await odaService.getRelated(id, limit);
      res.json(related);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch related ODAs' });
    }
  },

  async incrementView(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Obter userId do token (se autenticado) ou sessionId do header
      const userId = (req as any).userId || undefined;
      const sessionId = req.headers['x-session-id'] as string | undefined;
      
      // Log para debug
      console.log(`[Views] Incrementando view para ODA ${id} - userId: ${userId || 'null'}, sessionId: ${sessionId || 'null'}`);
      
      const result = await odaService.incrementView(id, userId, sessionId);
      
      if (result === null) {
        // Já visualizou hoje, retorna sucesso mas sem incrementar
        return res.json({ success: true, alreadyViewed: true });
      }
      
      res.json({ success: true, alreadyViewed: false });
    } catch (error: any) {
      console.error('Error incrementing view:', error);
      const message = error.message || 'Failed to increment view';
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ 
        error: message,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error.stack,
          details: error 
        })
      });
    }
  },
};

