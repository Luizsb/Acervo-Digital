import express from 'express';
import prisma from '../lib/prisma';
import { catalogVisibleWhere, isVisibleInCatalog } from '../lib/catalogVisibility';
import { isViewKind, recordOdaView } from '../lib/odaViews';
import { authMiddleware, requireAdmin, type AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

// GET /api/odas - Buscar todos os ODAs
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { tipoConteudo, search, limit, offset, includeInactive } = req.query;
    const allowInactive = includeInactive === 'true' && req.user?.role === 'admin';

    const where: any = { ...catalogVisibleWhere() };
    if (!allowInactive) {
      where.ativo = true;
    }

    if (tipoConteudo && tipoConteudo !== 'Todos') {
      where.tipoConteudo = tipoConteudo as string;
    }

    if (search) {
      const searchTerm = search as string;
      where.OR = [
        { titulo: { contains: searchTerm, mode: 'insensitive' } },
        { componenteCurricular: { contains: searchTerm, mode: 'insensitive' } },
        { codigoBncc: { contains: searchTerm, mode: 'insensitive' } },
        { codigoBnccSecundaria: { contains: searchTerm, mode: 'insensitive' } },
        { codigoOda: { contains: searchTerm, mode: 'insensitive' } },
        { categoria: { contains: searchTerm, mode: 'insensitive' } },
        { palavrasChave: { contains: searchTerm, mode: 'insensitive' } },
        { marca: { contains: searchTerm, mode: 'insensitive' } },
        { blocoCapitulo: { contains: searchTerm, mode: 'insensitive' } },
        { colecao: { contains: searchTerm, mode: 'insensitive' } },
        { macroformato: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const odas = await prisma.oDA.findMany({
      where,
      include: {
        bncc: true, // Incluir dados da BNCC relacionada
      },
      orderBy: { id: 'asc' },
      take: limit ? parseInt(limit as string) : undefined,
      skip: offset ? parseInt(offset as string) : undefined,
    });

    const total = await prisma.oDA.count({ where });

    res.json({
      data: odas,
      total,
      limit: limit ? parseInt(limit as string) : null,
      offset: offset ? parseInt(offset as string) : null,
    });
  } catch (error: any) {
    console.error('❌ Error fetching ODAs:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/odas/:id - Buscar ODA por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const oda = await prisma.oDA.findUnique({
      where: { id },
      include: {
        bncc: true,
      },
    });

    if (!oda || oda.ativo === false || !isVisibleInCatalog(oda.status, oda.linkRepositorio)) {
      return res.status(404).json({ error: 'ODA not found' });
    }

    res.json(oda);
  } catch (error: any) {
    console.error('Error fetching ODA:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/odas/:id/view - registra visita à ficha ou abertura do recurso (1x/usuário/dia)
router.post('/:id/view', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const kind = req.body?.kind;
    if (!isViewKind(kind)) {
      return res.status(400).json({ error: 'kind deve ser "page" ou "open".' });
    }

    const result = await recordOdaView({ userId, odaId: id, kind });
    if (!result) {
      return res.status(404).json({ error: 'ODA not found' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error recording ODA view:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/odas - Criar novo ODA
router.post('/', requireAdmin, async (req, res) => {
  try {
    const oda = await prisma.oDA.create({
      data: req.body,
    });

    res.status(201).json(oda);
  } catch (error: any) {
    console.error('Error creating ODA:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/odas/:id - Atualizar ODA
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const oda = await prisma.oDA.update({
      where: { id },
      data: req.body,
    });

    res.json(oda);
  } catch (error: any) {
    console.error('Error updating ODA:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'ODA not found' });
    }
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/odas/:id - Deletar ODA
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.oDA.delete({
      where: { id },
    });

    res.json({ message: 'ODA deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ODA:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'ODA not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/odas/stats/count - Contar total de ODAs
router.get('/stats/count', async (req, res) => {
  try {
    const { tipoConteudo } = req.query;

    const where: any = { ativo: true, ...catalogVisibleWhere() };
    if (tipoConteudo && tipoConteudo !== 'Todos') {
      where.tipoConteudo = tipoConteudo as string;
    }

    const count = await prisma.oDA.count({ where });
    res.json({ count });
  } catch (error: any) {
    console.error('Error counting ODAs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

