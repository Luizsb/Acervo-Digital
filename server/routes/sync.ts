import fs from 'fs';
import express from 'express';
import multer from 'multer';
import { findWorkbook } from '../scripts/import-categorizacao';
import { captureMissingThumbs } from '../scripts/capture-thumbs';
import {
  beginSpreadsheetImport,
  getActiveSpreadsheetJobId,
  getLastSync,
  getSpreadsheetJob,
} from '../lib/spreadsheetSync';
import {
  attachJobToSyncRequest,
  claimSyncRequest,
  finishSyncRequest,
} from '../lib/syncRequests';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    const mime = file.mimetype || '';
    if (name.endsWith('.xlsx') || mime.includes('spreadsheet') || mime.includes('excel')) {
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
  return typeof req.query.token === 'string' ? req.query.token.trim() : '';
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
        'Sincronização automática desabilitada. Defina SPREADSHEET_SYNC_TOKEN no .env da API.',
    });
  }
  if (extractToken(req) !== expected) {
    return res.status(401).json({ error: 'Token de sincronização inválido.' });
  }
  next();
}

function shouldCaptureThumbsAfterSync(): boolean {
  const value = (process.env.AUTO_CAPTURE_THUMBS_AFTER_SYNC || '').trim().toLowerCase();
  return value === 'true' || value === '1';
}

function thumbCaptureLimit(): number {
  const parsed = Number(process.env.AUTO_CAPTURE_THUMBS_LIMIT || '50');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
}

/**
 * Webhook da rotina diária (Google Apps Script ou cron).
 * POST multipart campo "spreadsheet" (.xlsx) + header X-Acervo-Sync-Token.
 * Responde 202 na hora: a importação segue em background e o job pode ser consultado.
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
  (req, res) => {
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

      const requestId = typeof req.body?.requestId === 'string' ? req.body.requestId.trim() : '';
      // O id do job só existe depois de iniciar a importação, mas os hooks precisam dele.
      const jobIdRef = { value: '' };

      const job = beginSpreadsheetImport(file.originalname || 'apps-script.xlsx', targetPath, {
        source: 'apps-script',
        onSuccess: () => {
          if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
          finishSyncRequest(jobIdRef.value);
          if (!shouldCaptureThumbsAfterSync()) return;
          // Rotina opcional: gera as capas que faltam logo após a sincronização.
          void captureMissingThumbs({ onlyPublic: true, limit: thumbCaptureLimit() })
            .then((result) =>
              console.log(
                `🖼️  Captura pós-sync: ${result.captured} novas, ${result.failed} falhas, ${result.withoutLink} sem link.`
              )
            )
            .catch((error) => console.error('Captura pós-sync falhou:', error));
        },
        onFailure: () => {
          if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, targetPath);
            fs.unlinkSync(backupPath);
          }
          finishSyncRequest(jobIdRef.value, 'A importação da planilha falhou.');
        },
      });

      jobIdRef.value = job.id;
      if (requestId) attachJobToSyncRequest(requestId, job.id);

      res.status(202).json({
        ok: true,
        jobId: job.id,
        message: 'Planilha recebida. Sincronização iniciada.',
        autoCaptureThumbs: shouldCaptureThumbsAfterSync(),
      });
    } catch (error: unknown) {
      console.error('Sync spreadsheet webhook error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao sincronizar a planilha.',
      });
    }
  }
);

/**
 * O script da planilha chama isso em um acionador curto (ex.: a cada 5 min).
 * Se o admin pediu uma sincronização, devolve o requestId para o script enviar o arquivo.
 */
router.get('/pending', requireSyncToken, (_req, res) => {
  if (getActiveSpreadsheetJobId()) {
    return res.json({ pending: false, reason: 'Sincronização já em andamento.' });
  }

  const claimed = claimSyncRequest();
  if (!claimed) return res.json({ pending: false });

  res.json({
    pending: true,
    requestId: claimed.id,
    requestedAt: claimed.requestedAt,
    requestedBy: claimed.requestedBy,
  });
});

router.get('/jobs/:jobId', requireSyncToken, (req, res) => {
  const job = getSpreadsheetJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Sincronização não encontrada ou expirada.' });
  res.json(job);
});

router.get('/health', requireSyncToken, (_req, res) => {
  res.json({
    ok: true,
    syncEnabled: true,
    busy: Boolean(getActiveSpreadsheetJobId()),
    lastSync: getLastSync(),
    autoCaptureThumbs: shouldCaptureThumbsAfterSync(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
