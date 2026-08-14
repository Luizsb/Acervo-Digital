import express from 'express';
import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { authMiddleware, requireAdmin, type AuthRequest } from '../middleware/auth';
import {
  catalogReviewWhere,
  reviewGroupFromStatus,
  REVIEW_GROUP_ORDER,
  type ReviewGroup,
} from '../lib/catalogVisibility';

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/review', async (req: AuthRequest, res) => {
  try {
    const group = typeof req.query.group === 'string' ? req.query.group : 'todos';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const where: Prisma.ODAWhereInput = { ...catalogReviewWhere() };
    if (search) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { titulo: { contains: search, mode: 'insensitive' } },
            { codigoOda: { contains: search, mode: 'insensitive' } },
            { status: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const odas = await prisma.oDA.findMany({
      where,
      select: {
        id: true,
        titulo: true,
        codigoOda: true,
        status: true,
        tipoConteudo: true,
        tipoObjeto: true,
        macroformato: true,
        linkRepositorio: true,
        marca: true,
        anoSerie: true,
        componenteCurricular: true,
      },
      orderBy: { titulo: 'asc' },
    });

    const items = odas.map((oda) => ({
      ...oda,
      reviewGroup: reviewGroupFromStatus(oda.status),
    }));

    const counts = Object.fromEntries(REVIEW_GROUP_ORDER.map((key) => [key, 0])) as Record<
      ReviewGroup,
      number
    >;
    for (const item of items) {
      counts[item.reviewGroup] += 1;
    }

    const filtered =
      group && group !== 'todos'
        ? items.filter((item) => item.reviewGroup === group)
        : items;

    const rank = (key: ReviewGroup) => REVIEW_GROUP_ORDER.indexOf(key);
    filtered.sort((a, b) => {
      const byGroup = rank(a.reviewGroup) - rank(b.reviewGroup);
      if (byGroup !== 0) return byGroup;
      return a.titulo.localeCompare(b.titulo, 'pt-BR');
    });

    res.json({
      data: filtered,
      total: filtered.length,
      counts,
      totalReview: items.length,
    });
  } catch (error: any) {
    console.error('Admin review error:', error);
    res.status(500).json({ error: error.message || 'Erro ao listar a fila de revisão.' });
  }
});

export default router;
