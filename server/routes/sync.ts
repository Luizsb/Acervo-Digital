import fs from 'fs';
import express from 'express';
import multer from 'multer';
import { findWorkbook } from '../scripts/import-categorizacao';
import {
  getActiveSpreadsheetJobId,
  runSpreadsheetImportAndWait,
} from '../lib/spreadsheetSync';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    if (name.endsWith('.xlsx') || file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) {
      cb(null, true);
      return;
    }
    cb(new Error('Envie um arquivo .xlsx (planilha Excel).'));
  },
});

function configuredSyncToken(): string {
  return (process.env.SPREADSHEET_SYNC_TOKEN || '').trim();
}

function extractToken(req: express.Request): string {
  const header = req.header('x-acervo-sync-token') || req.header('authorization') || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  if (header) return header.trim();
  const query = typeof req.query.token === 'string' ? req.query.token : '';
  return query.trim();
}

function requireSyncToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const expected = configuredSyncToken();
  if (!expected) {
    return res.status(503).json({
      error:
        'Sincronização por Apps Script desabilitada. Defina SPREADSHEET_SYNC_TOKEN no .env da API.',
    });
  }
  const provided = extractToken(req);
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Token de sincronização inválido.' });
  }
  next();
}

/**
 * Webhook para Google Apps Script (ou qualquer rotina).
 * POST multipart campo "spreadsheet" (.xlsx) + header X-Acervo-Sync-Token.
 */
router.post(
  '/spreadsheet',
  requireSyncToken,
  (req, res, next) => {
    upload.single('spreadsheet')(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'Falha no upload da planilha.';
        return res.status(400).json({ error: message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (getActiveSpreadsheetJobId()) {
        return res.status(409).json({
          error: 'Já existe uma sincronização em andamento. Tente mais tarde.',
          jobId: getActiveSpreadsheetJobId(),
        });
      }

      const file = req.file;
      if (!file?.buffer?.length) {
        return res.status(400).json({
          error: 'Envie o arquivo .xlsx no campo multipart "spreadsheet".',
        });
      }

      const targetPath = findWorkbook();
      const backupPath = `${targetPath}.bak`;
      if (fs.existsSync(targetPath)) fs.copyFileSync(targetPath, backupPath);
      fs.writeFileSync(targetPath, file.buffer);

      const job = await runSpreadsheetImportAndWait(
        file.originalname || 'apps-script.xlsx',
        targetPath
      );

      if (job.status === 'completed') {
        if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
        return res.json({
          ok: true,
          message: 'Planilha sincronizada com o Acervo.',
          jobId: job.id,
          summary: job.summary,
        });
      }

      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, targetPath);
        fs.unlinkSync(backupPath);
      }
      return res.status(500).json({
        ok: false,
        error: job.error || 'Falha na sincronização.',
        jobId: job.id,
      });
    } catch (error: unknown) {
      console.error('Sync spreadsheet webhook error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao sincronizar a planilha.',
      });
    }
  }
);

router.get('/health', requireSyncToken, (_req, res) => {
  res.json({
    ok: true,
    syncEnabled: true,
    busy: Boolean(getActiveSpreadsheetJobId()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
