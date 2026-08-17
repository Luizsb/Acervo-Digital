import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import express from 'express';
import multer from 'multer';
import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { authMiddleware, requireAdmin, type AuthRequest } from '../middleware/auth';
import {
  catalogReviewWhere,
  hasResourceLink,
  isVisibleInCatalog,
  reviewGroupFor,
  REVIEW_GROUP_ORDER,
  type ReviewGroup,
} from '../lib/catalogVisibility';
import { findWorkbook, importCategorizacao } from '../scripts/import-categorizacao';
import { captureMissingThumbs } from '../scripts/capture-thumbs';

const router = express.Router();
type SpreadsheetJob = {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  phase: 'reading' | 'importing' | 'finishing' | 'completed';
  current: number;
  total: number;
  percent: number;
  fileName: string;
  summary?: Record<string, unknown>;
  error?: string;
};
const spreadsheetJobs = new Map<string, SpreadsheetJob>();
let activeSpreadsheetJobId: string | null = null;
type ThumbJob = {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  scope: 'all' | 'public';
  current: number;
  total: number;
  percent: number;
  captured: number;
  skipped: number;
  failed: number;
  withoutLink: number;
  failures: { codigo: string; error: string }[];
  error?: string;
};
const thumbJobs = new Map<string, ThumbJob>();
let activeThumbJobId: string | null = null;

function publicImportSummary(summary: Awaited<ReturnType<typeof importCategorizacao>>) {
  return {
    processed: summary.processed,
    created: summary.created,
    updated: summary.updated,
    unchanged: summary.unchanged,
    reactivated: summary.reactivated,
    deactivated: summary.deactivated,
    skipped: summary.skipped,
    errors: summary.errors,
    totalActive: summary.totalActive,
    totalAudiovisual: summary.totalAudiovisual,
    totalOed: summary.totalOed,
    missingThumbsTotal: summary.missingThumbs.length,
    missingThumbsPublic: summary.missingThumbsPublic,
    missingThumbs: summary.missingThumbs
      .filter((item) => isVisibleInCatalog(item.status, item.linkRepositorio))
      .slice(0, 50),
  };
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    if (name.endsWith('.xlsx')) {
      cb(null, true);
      return;
    }
    cb(new Error('Envie um arquivo .xlsx (planilha Excel).'));
  },
});

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
      reviewGroup: reviewGroupFor(oda),
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

router.post(
  '/spreadsheet',
  (req, res, next) => {
    upload.single('spreadsheet')(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'Falha no upload da planilha.';
        return res.status(400).json({ error: message });
      }
      next();
    });
  },
  async (req: AuthRequest, res) => {
    try {
      if (activeSpreadsheetJobId) {
        return res.status(409).json({
          error: 'Já existe uma sincronização em andamento. Aguarde a conclusão.',
          jobId: activeSpreadsheetJobId,
        });
      }
      const file = req.file;
      if (!file?.buffer?.length) {
        return res.status(400).json({ error: 'Selecione a planilha .xlsx para sincronizar.' });
      }

      const targetPath = findWorkbook();
      const backupPath = `${targetPath}.bak`;
      if (fs.existsSync(targetPath)) fs.copyFileSync(targetPath, backupPath);
      fs.writeFileSync(targetPath, file.buffer);

      const jobId = randomUUID();
      const job: SpreadsheetJob = {
        id: jobId,
        status: 'processing',
        phase: 'reading',
        current: 0,
        total: 1,
        percent: 1,
        fileName: file.originalname,
      };
      spreadsheetJobs.set(jobId, job);
      activeSpreadsheetJobId = jobId;
      res.status(202).json({
        ok: true,
        jobId,
        message: 'Planilha recebida. Sincronização iniciada.',
      });

      void importCategorizacao({
        filePath: targetPath,
        log: true,
        onProgress: ({ phase, current, total }) => {
          job.phase = phase;
          job.current = current;
          job.total = total;
          const raw = total > 0 ? Math.round((current / total) * 100) : 0;
          job.percent =
            phase === 'reading' ? 2 : phase === 'finishing' ? 99 : Math.max(3, Math.min(98, raw));
        },
      })
        .then((summary) => {
          if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
          job.status = 'completed';
          job.phase = 'completed';
          job.percent = 100;
          job.summary = publicImportSummary(summary);
        })
        .catch((error: unknown) => {
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, targetPath);
            fs.unlinkSync(backupPath);
          }
          job.status = 'failed';
          job.error = error instanceof Error ? error.message : 'Erro ao sincronizar a planilha.';
          console.error('Admin spreadsheet import error:', error);
        })
        .finally(() => {
          activeSpreadsheetJobId = null;
          setTimeout(() => spreadsheetJobs.delete(jobId), 30 * 60 * 1000);
        });
    } catch (error: any) {
      console.error('Admin spreadsheet upload error:', error);
      res.status(500).json({ error: error.message || 'Erro ao receber a planilha.' });
    }
  }
);

router.get('/spreadsheet/jobs/:jobId', (req, res) => {
  const job = spreadsheetJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Sincronização não encontrada ou expirada.' });
  res.json(job);
});

router.get('/spreadsheet/status', async (_req, res) => {
  try {
    const filePath = findWorkbook();
    const stats = fs.statSync(filePath);
    const activeItems = await prisma.oDA.findMany({
      where: { ativo: true },
      select: { codigoOda: true, titulo: true, status: true, linkRepositorio: true },
      orderBy: { titulo: 'asc' },
    });
    const thumbsPath = path.join(path.dirname(filePath), 'thumbs');
    const missingThumbs = activeItems
      .filter((item) => {
        const code = String(item.codigoOda || '').replace(/\.(webp|jpg|jpeg|png)$/i, '');
        return !code || !fs.existsSync(path.join(thumbsPath, `${code}.webp`));
      })
      .map((item) => ({
        codigo: item.codigoOda,
        titulo: item.titulo,
        status: item.status,
        isPublic: isVisibleInCatalog(item.status, item.linkRepositorio),
        hasLink: hasResourceLink(item.linkRepositorio),
      }));

    // Publicados primeiro: são os que aparecem sem capa na galeria.
    missingThumbs.sort((a, b) => Number(b.isPublic) - Number(a.isPublic));

    res.json({
      fileName: path.basename(filePath),
      sizeBytes: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      totalActive: activeItems.length,
      missingThumbsTotal: missingThumbs.length,
      missingThumbsPublic: missingThumbs.filter((item) => item.isPublic).length,
      missingThumbsWithoutLink: missingThumbs.filter((item) => !item.hasLink).length,
      missingThumbsPublicWithoutLink: missingThumbs.filter(
        (item) => item.isPublic && !item.hasLink
      ).length,
      missingThumbs: missingThumbs.slice(0, 200),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao ler status da planilha.' });
  }
});

router.post('/thumbs/capture', (_req, res) => {
  if (activeThumbJobId) {
    return res.status(409).json({
      error: 'Já existe uma captura de thumbs em andamento.',
      jobId: activeThumbJobId,
    });
  }

  const jobId = randomUUID();
  const job: ThumbJob = {
    id: jobId,
    status: 'processing',
    scope: 'public',
    current: 0,
    total: 0,
    percent: 0,
    captured: 0,
    skipped: 0,
    failed: 0,
    withoutLink: 0,
    failures: [],
  };
  thumbJobs.set(jobId, job);
  activeThumbJobId = jobId;
  res.status(202).json({ ok: true, jobId, message: 'Captura de thumbs iniciada.' });

  void captureMissingThumbs({
    // Somente status Funcionando. Quebrados, incorretos e itens em cadastro
    // continuam na auditoria, mas nunca entram na fila automática de captura.
    onlyPublic: true,
    onProgress: (progress) => {
      job.current = progress.current;
      job.total = progress.total;
      job.captured = progress.captured;
      job.skipped = progress.skipped;
      job.failed = progress.failed;
      job.withoutLink = progress.withoutLink;
      job.failures = progress.failures;
      job.percent =
        progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 100;
    },
  })
    .then((result) => {
      job.status = 'completed';
      job.current = result.total;
      job.total = result.total;
      job.percent = 100;
      job.captured = result.captured;
      job.skipped = result.skipped;
      job.failed = result.failed;
      job.withoutLink = result.withoutLink;
      job.failures = result.failures;
    })
    .catch((error: unknown) => {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Erro ao capturar thumbs.';
      console.error('Admin thumb capture error:', error);
    })
    .finally(() => {
      activeThumbJobId = null;
      setTimeout(() => thumbJobs.delete(jobId), 30 * 60 * 1000);
    });
});

router.get('/thumbs/jobs/:jobId', (req, res) => {
  const job = thumbJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Captura não encontrada ou expirada.' });
  res.json(job);
});

export default router;
