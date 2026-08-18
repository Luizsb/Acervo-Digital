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
import { findWorkbook } from '../scripts/import-categorizacao';
import { captureMissingThumbs } from '../scripts/capture-thumbs';
import { isPlaceholderResourceCode } from '../scripts/map-categorizacao';
import {
  downloadGoogleSheetToWorkbook,
  getGoogleSheetsSource,
} from '../lib/googleSheets';
import {
  beginSpreadsheetImport,
  getActiveSpreadsheetJobId,
  getLastSync,
  getLastSyncFromDatabase,
  getLatestImportChanges,
  getSpreadsheetJob,
  SYNC_SOURCE_LABELS,
} from '../lib/spreadsheetSync';
import { getTopOdaViews, isViewKind, isViewPeriod } from '../lib/odaViews';

const router = express.Router();
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
      if (getActiveSpreadsheetJobId()) {
        return res.status(409).json({
          error: 'Já existe uma sincronização em andamento. Aguarde a conclusão.',
          jobId: getActiveSpreadsheetJobId(),
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

      const job = beginSpreadsheetImport(file.originalname, targetPath, {
        source: 'upload',
        onSuccess: () => {
          if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
        },
        onFailure: () => {
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, targetPath);
            fs.unlinkSync(backupPath);
          }
        },
      });
      res.status(202).json({
        ok: true,
        jobId: job.id,
        message: 'Planilha recebida. Sincronização iniciada.',
      });
    } catch (error: any) {
      console.error('Admin spreadsheet upload error:', error);
      res.status(500).json({ error: error.message || 'Erro ao receber a planilha.' });
    }
  }
);

router.post('/spreadsheet/from-google', async (_req, res) => {
  try {
    if (getActiveSpreadsheetJobId()) {
      return res.status(409).json({
        error: 'Já existe uma sincronização em andamento. Aguarde a conclusão.',
        jobId: getActiveSpreadsheetJobId(),
      });
    }

    const source = getGoogleSheetsSource();
    if (!source.configured || !source.sheetId) {
      return res.status(400).json({
        error: 'Configure GOOGLE_SHEETS_ID (ou GOOGLE_SHEETS_URL) no .env da API.',
      });
    }

    const targetPath = findWorkbook();
    const backupPath = `${targetPath}.bak`;
    if (fs.existsSync(targetPath)) fs.copyFileSync(targetPath, backupPath);

    let downloaded;
    try {
      downloaded = await downloadGoogleSheetToWorkbook(targetPath);
    } catch (error) {
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, targetPath);
        fs.unlinkSync(backupPath);
      }
      throw error;
    }

    const job = beginSpreadsheetImport(`Google Sheets (${downloaded.sheetId})`, targetPath, {
      source: 'google',
      onSuccess: () => {
        if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
      },
      onFailure: () => {
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, targetPath);
          fs.unlinkSync(backupPath);
        }
      },
    });

    res.status(202).json({
      ok: true,
      jobId: job.id,
      message: `Planilha baixada do Google (${downloaded.via}). Sincronização iniciada.`,
      bytes: downloaded.bytes,
      via: downloaded.via,
    });
  } catch (error: any) {
    console.error('Admin Google Sheets sync error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao baixar a planilha do Google Sheets.',
    });
  }
});

router.get('/spreadsheet/jobs/:jobId', (req, res) => {
  const job = getSpreadsheetJob(req.params.jobId);
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
        if (isPlaceholderResourceCode(item.codigoOda)) return false;
        const code = String(item.codigoOda || '').replace(/\.(webp|jpg|jpeg|png)$/i, '');
        return Boolean(code) && !fs.existsSync(path.join(thumbsPath, `${code}.webp`));
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

    const memorySync = getLastSync();
    const importLog = await getLatestImportChanges();
    const databaseSyncAt = await getLastSyncFromDatabase();
    const lastSync = memorySync
      ? {
          at: memorySync.at,
          source: memorySync.source,
          sourceLabel: SYNC_SOURCE_LABELS[memorySync.source],
          fileName: memorySync.fileName,
          created: memorySync.created,
          updated: memorySync.updated,
          deactivated: memorySync.deactivated,
          reactivated: memorySync.reactivated,
          changes: memorySync.changes,
        }
      : importLog
        ? {
            at: importLog.at,
            source: null,
            sourceLabel: 'importação local',
            fileName: path.basename(filePath),
            created: importLog.created,
            updated: importLog.updated,
            deactivated: importLog.deactivated,
            reactivated: importLog.reactivated,
            changes: importLog.changes,
          }
        : databaseSyncAt
          ? {
              at: databaseSyncAt,
              source: null,
              sourceLabel: 'registro no banco',
              fileName: path.basename(filePath),
            }
          : null;

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
      googleSheets: getGoogleSheetsSource(),
      lastSync,
      autoSyncEnabled: Boolean((process.env.SPREADSHEET_SYNC_TOKEN || '').trim()),
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

router.get('/views/top', async (req, res) => {
  try {
    const kindParam = typeof req.query.kind === 'string' ? req.query.kind : 'open';
    const periodParam = typeof req.query.period === 'string' ? req.query.period : '30d';
    const limitRaw = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 20;

    if (!isViewKind(kindParam)) {
      return res.status(400).json({ error: 'kind deve ser "page" ou "open".' });
    }
    if (!isViewPeriod(periodParam)) {
      return res.status(400).json({ error: 'period deve ser "7d", "30d" ou "all".' });
    }

    const limit = Number.isInteger(limitRaw) ? Math.min(50, Math.max(1, limitRaw)) : 20;
    const items = await getTopOdaViews({ kind: kindParam, period: periodParam, limit });

    res.json({
      kind: kindParam,
      period: periodParam,
      limit,
      items,
    });
  } catch (error: any) {
    console.error('Admin views top error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
