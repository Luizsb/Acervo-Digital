import { isSupabaseBackend } from '../../config/backend';
import {
  supabaseAdminReview,
  supabaseAdminViewsTop,
  supabaseLocalJobOnly,
  supabaseSpreadsheetStatus,
} from '../supabaseApi';
import { requestJson, requireAuthToken } from './http';
import type {
  AdminReviewResponse,
  AsyncJobStartResponse,
  OdaViewKind,
  SpreadsheetJob,
  SpreadsheetStatusResponse,
  ThumbCaptureJob,
  ViewRankingPeriod,
  ViewRankingResponse,
} from './types';

function adminGet<T>(path: string, fallback: string): Promise<T> {
  const token = requireAuthToken();
  return requestJson<T>(path, { headers: { Authorization: `Bearer ${token}` } }, fallback);
}

export async function apiAdminReview(params?: {
  group?: string;
  search?: string;
}): Promise<AdminReviewResponse> {
  if (isSupabaseBackend()) return supabaseAdminReview(params);
  const query = new URLSearchParams();
  if (params?.group) query.set('group', params.group);
  if (params?.search) query.set('search', params.search);
  return adminGet(`/admin/review?${query.toString()}`, 'Erro ao carregar a fila de revisão.');
}

export async function apiAdminViewsTop(params?: {
  kind?: OdaViewKind;
  period?: ViewRankingPeriod;
  limit?: number;
}): Promise<ViewRankingResponse> {
  if (isSupabaseBackend()) return supabaseAdminViewsTop(params);
  const query = new URLSearchParams();
  if (params?.kind) query.set('kind', params.kind);
  if (params?.period) query.set('period', params.period);
  if (params?.limit) query.set('limit', String(params.limit));
  return adminGet(`/admin/views/top?${query.toString()}`, 'Erro ao carregar o ranking de acessos.');
}

export async function apiAdminSpreadsheetStatus(): Promise<SpreadsheetStatusResponse> {
  if (isSupabaseBackend()) return supabaseSpreadsheetStatus();
  return adminGet('/admin/spreadsheet/status', 'Erro ao ler status da planilha.');
}

export async function apiAdminImportSpreadsheet(file: File): Promise<AsyncJobStartResponse> {
  if (isSupabaseBackend()) supabaseLocalJobOnly();
  const token = requireAuthToken();
  const body = new FormData();
  body.append('spreadsheet', file);
  return requestJson(
    '/admin/spreadsheet',
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body },
    'Erro ao sincronizar a planilha.',
  );
}

export async function apiAdminSpreadsheetJob(jobId: string): Promise<SpreadsheetJob> {
  if (isSupabaseBackend()) supabaseLocalJobOnly();
  return adminGet(
    `/admin/spreadsheet/jobs/${encodeURIComponent(jobId)}`,
    'Erro ao acompanhar a sincronização.',
  );
}

export async function apiAdminStartThumbCapture(): Promise<AsyncJobStartResponse> {
  if (isSupabaseBackend()) supabaseLocalJobOnly();
  const token = requireAuthToken();
  return requestJson(
    '/admin/thumbs/capture',
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
    'Erro ao iniciar a captura de thumbs.',
  );
}

export async function apiAdminThumbJob(jobId: string): Promise<ThumbCaptureJob> {
  if (isSupabaseBackend()) supabaseLocalJobOnly();
  return adminGet(
    `/admin/thumbs/jobs/${encodeURIComponent(jobId)}`,
    'Erro ao acompanhar a captura de thumbs.',
  );
}
