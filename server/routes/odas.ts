import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// GET /api/odas - Buscar todos os ODAs
router.get('/', async (req, res) => {
  try {
    console.log('📊 GET /api/odas - Buscando ODAs...');
    const { tipoConteudo, search, limit, offset } = req.query;

    const where: any = {};

    if (tipoConteudo && tipoConteudo !== 'Todos') {
      where.tipoConteudo = tipoConteudo as string;
    }

    if (search) {
      const searchTerm = search as string;
      where.OR = [
        { titulo: { contains: searchTerm, mode: 'insensitive' } },
        { componenteCurricular: { contains: searchTerm, mode: 'insensitive' } },
        { codigoBncc: { contains: searchTerm, mode: 'insensitive' } },
        { categoria: { contains: searchTerm, mode: 'insensitive' } },
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
    
    console.log(`✅ GET /api/odas - Retornando ${odas.length} ODAs (total: ${total})`);

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
    const oda = await (prisma.oDA.findUnique as any)({
      where: { id },
      include: {
        bncc: true, // Incluir dados da BNCC relacionada
      },
    });

    if (!oda) {
      return res.status(404).json({ error: 'ODA not found' });
    }

    res.json(oda);
  } catch (error: any) {
    console.error('Error fetching ODA:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/odas - Criar novo ODA
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

    const where: any = {};
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

