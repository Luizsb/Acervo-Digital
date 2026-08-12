import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

function parseNonNegativeInteger(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

router.get('/', async (req, res) => {
  try {
    const { search, componente, ano } = req.query;
    const requestedLimit = parseNonNegativeInteger(req.query.limit);
    const limit = requestedLimit === undefined ? undefined : Math.min(requestedLimit, 500);
    const offset = parseNonNegativeInteger(req.query.offset);
    const where: Record<string, unknown> = {};

    if (typeof search === 'string' && search.trim()) {
      where.OR = [
        { codigo: { contains: search.trim(), mode: 'insensitive' } },
        { habilidade: { contains: search.trim(), mode: 'insensitive' } },
        { descricao: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    if (typeof componente === 'string' && componente.trim()) {
      where.componente = componente.trim();
    }
    if (typeof ano === 'string' && ano.trim()) {
      where.ano = ano.trim();
    }

    const [data, total] = await Promise.all([
      prisma.bNCC.findMany({
        where,
        orderBy: { codigo: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.bNCC.count({ where }),
    ]);

    res.json({ data, total, limit: limit ?? null, offset: offset ?? null });
  } catch (error) {
    console.error('Erro ao listar BNCC:', error);
    res.status(500).json({ error: 'Não foi possível listar as habilidades BNCC.' });
  }
});

router.get('/:codigo', async (req, res) => {
  try {
    const bncc = await prisma.bNCC.findUnique({
      where: { codigo: req.params.codigo },
    });

    if (!bncc) {
      return res.status(404).json({ error: 'Habilidade BNCC não encontrada.' });
    }

    res.json(bncc);
  } catch (error) {
    console.error('Erro ao consultar BNCC:', error);
    res.status(500).json({ error: 'Não foi possível consultar a habilidade BNCC.' });
  }
});

export default router;
