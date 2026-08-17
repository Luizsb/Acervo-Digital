import { randomUUID } from 'crypto';
import prisma from './prisma';
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

export type SyncSource = 'upload' | 'google' | 'apps-script' | 'seed';

export type LastSyncInfo = {
  at: string;
  source: SyncSource;
  fileName: string;
  created: number;
  updated: number;
  deactivated: number;
  totalActive: number;
};

const spreadsheetJobs = new Map<string, SpreadsheetJob>();
let activeSpreadsheetJobId: string | null = null;
let lastSync: LastSyncInfo | null = null;

export function getActiveSpreadsheetJobId(): string | null {
  return activeSpreadsheetJobId;
}

/** Última sincronização concluída nesta instância da API. */
export function getLastSync(): LastSyncInfo | null {
  return lastSync;
}

export const SYNC_SOURCE_LABELS: Record<SyncSource, string> = {
  upload: 'upload no painel',
  google: 'Google Sheets (painel)',
  'apps-script': 'rotina do Apps Script',
  seed: 'seed na subida da API',
};

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
    source?: SyncSource;
    onSuccess?: (summary: Awaited<ReturnType<typeof importCategorizacao>>) => void;
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
      lastSync = {
        at: new Date().toISOString(),
        source: hooks?.source ?? 'upload',
        fileName,
        created: summary.created,
        updated: summary.updated,
        deactivated: summary.deactivated,
        totalActive: summary.totalActive,
      };
      hooks?.onSuccess?.(summary);
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

/** Data da última sincronização registrada no banco (sobrevive a restart da API). */
export async function getLastSyncFromDatabase(): Promise<string | null> {
  const newest = await prisma.oDA.findFirst({
    where: { sincronizadoEm: { not: null } },
    orderBy: { sincronizadoEm: 'desc' },
    select: { sincronizadoEm: true },
  });
  return newest?.sincronizadoEm ? newest.sincronizadoEm.toISOString() : null;
}
