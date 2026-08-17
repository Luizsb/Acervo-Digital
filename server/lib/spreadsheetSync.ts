import { randomUUID } from 'crypto';
import { isVisibleInCatalog } from './catalogVisibility';
import { importCategorizacao } from '../scripts/import-categorizacao';

export type SpreadsheetJob = {
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

export function getActiveSpreadsheetJobId(): string | null {
  return activeSpreadsheetJobId;
}

export function getSpreadsheetJob(jobId: string): SpreadsheetJob | undefined {
  return spreadsheetJobs.get(jobId);
}

export function publicImportSummary(summary: Awaited<ReturnType<typeof importCategorizacao>>) {
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

export function beginSpreadsheetImport(
  fileName: string,
  targetPath: string,
  hooks?: {
    onSuccess?: () => void;
    onFailure?: () => void;
  }
): SpreadsheetJob {
  if (activeSpreadsheetJobId) {
    throw new Error('Já existe uma sincronização em andamento.');
  }

  const jobId = randomUUID();
  const job: SpreadsheetJob = {
    id: jobId,
    status: 'processing',
    phase: 'reading',
    current: 0,
    total: 1,
    percent: 1,
    fileName,
  };
  spreadsheetJobs.set(jobId, job);
  activeSpreadsheetJobId = jobId;

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
      hooks?.onSuccess?.();
      job.status = 'completed';
      job.phase = 'completed';
      job.percent = 100;
      job.summary = publicImportSummary(summary);
    })
    .catch((error: unknown) => {
      hooks?.onFailure?.();
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Erro ao sincronizar a planilha.';
      console.error('Spreadsheet import error:', error);
    })
    .finally(() => {
      activeSpreadsheetJobId = null;
      setTimeout(() => spreadsheetJobs.delete(jobId), 30 * 60 * 1000);
    });

  return job;
}

/** Importa e espera o fim (útil para Apps Script / webhooks). */
export async function runSpreadsheetImportAndWait(
  fileName: string,
  targetPath: string
): Promise<SpreadsheetJob> {
  const job = beginSpreadsheetImport(fileName, targetPath);
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    const current = spreadsheetJobs.get(job.id);
    if (!current) throw new Error('Job de sincronização perdido.');
    if (current.status === 'completed' || current.status === 'failed') return current;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Tempo esgotado aguardando a sincronização da planilha.');
}
