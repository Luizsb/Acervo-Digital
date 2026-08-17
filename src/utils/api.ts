import { getVideoThumbnail } from './videoThumbnails';
import { looksLikeAudiovisual, isVideoAulaCodigo } from './contentType';
import type { Project } from '../types/project';
import { extractBnccCode, extractBnccDescription, formatDuration } from './formatters';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

const AUTH_TOKEN_KEY = 'acervo_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

function authHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

// Auth API
export interface AuthUserResponse {
  id: number;
  email: string;
  name: string | null;
  role?: string;
}

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: AuthUserResponse }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao entrar.');
  return data;
}

export async function apiRegister(name: string, email: string, password: string): Promise<{ token: string; user: AuthUserResponse }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar.');
  return data;
}

export async function apiAuthMe(): Promise<AuthUserResponse | null> {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Erro ao verificar sessão.');
  return res.json();
}

export async function apiUpdateMe(params: { name?: string; currentPassword?: string; newPassword?: string }): Promise<AuthUserResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar.');
  return data;
}

export async function apiForgotPassword(email: string): Promise<{ message: string; emailExists: boolean; token?: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Erro ao solicitar redefinição.');
  return data;
}

export async function apiResetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha.');
  return data;
}

// Favoritos do usuário logado
export async function apiFavoritesGet(): Promise<number[]> {
  const token = getAuthToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE_URL}/users/me/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Erro ao carregar favoritos.');
  return res.json();
}

export async function apiFavoriteAdd(projectId: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/users/me/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erro ao adicionar favorito.');
  }
}

export async function apiFavoriteRemove(projectId: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/users/me/favorites/${projectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Erro ao remover favorito.');
  }
}

export type ReviewGroup =
  | 'em-cadastro'
  | 'quebrado'
  | 'incorreto'
  | 'acesso-restrito'
  | 'nao-avaliado'
  | 'duvida'
  | 'outro';

export interface AdminReviewItem {
  id: number;
  titulo: string;
  codigoOda?: string | null;
  status?: string | null;
  tipoConteudo: string;
  tipoObjeto?: string | null;
  macroformato?: string | null;
  linkRepositorio?: string | null;
  marca?: string | null;
  anoSerie?: string | null;
  componenteCurricular?: string | null;
  reviewGroup: ReviewGroup;
}

export interface AdminReviewResponse {
  data: AdminReviewItem[];
  total: number;
  totalReview: number;
  counts: Record<ReviewGroup, number>;
}

export async function apiAdminReview(params?: {
  group?: string;
  search?: string;
}): Promise<AdminReviewResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const queryParams = new URLSearchParams();
  if (params?.group) queryParams.set('group', params.group);
  if (params?.search) queryParams.set('search', params.search);
  const res = await fetch(`${API_BASE_URL}/admin/review?${queryParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao carregar a fila de revisão.');
  return data;
}

export interface SpreadsheetImportSummary {
  processed: number;
  created: number;
  updated: number;
  unchanged: number;
  reactivated: number;
  deactivated: number;
  skipped: number;
  errors: number;
  totalActive: number;
  totalAudiovisual: number;
  totalOed: number;
  missingThumbsTotal: number;
  missingThumbsPublic: number;
  missingThumbs: { codigo: string; titulo: string; status: string | null }[];
}

export interface SpreadsheetJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  phase: 'reading' | 'importing' | 'finishing' | 'completed';
  current: number;
  total: number;
  percent: number;
  fileName: string;
  summary?: SpreadsheetImportSummary;
  error?: string;
}

export interface AsyncJobStartResponse {
  ok: boolean;
  jobId: string;
  message: string;
}

export interface MissingThumbItem {
  codigo: string | null;
  titulo: string;
  status: string | null;
  isPublic: boolean;
  hasLink: boolean;
}

export interface SpreadsheetStatusResponse {
  fileName: string;
  sizeBytes: number;
  modifiedAt: string;
  totalActive: number;
  missingThumbsTotal: number;
  missingThumbsPublic: number;
  missingThumbsWithoutLink: number;
  missingThumbsPublicWithoutLink: number;
  missingThumbs: MissingThumbItem[];
  googleSheets?: {
    configured: boolean;
    sheetId: string | null;
    hasServiceAccount: boolean;
    sourceLabel: string;
  };
}

export async function apiAdminSpreadsheetStatus(): Promise<SpreadsheetStatusResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/admin/spreadsheet/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao ler status da planilha.');
  return data;
}

export async function apiAdminImportSpreadsheet(file: File): Promise<AsyncJobStartResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const body = new FormData();
  body.append('spreadsheet', file);
  const res = await fetch(`${API_BASE_URL}/admin/spreadsheet`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar a planilha.');
  return data;
}

export async function apiAdminImportFromGoogle(): Promise<AsyncJobStartResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/admin/spreadsheet/from-google`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar do Google Sheets.');
  return data;
}

export async function apiAdminSpreadsheetJob(jobId: string): Promise<SpreadsheetJob> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/admin/spreadsheet/jobs/${encodeURIComponent(jobId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao acompanhar a sincronização.');
  return data;
}

export interface ThumbCaptureJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  scope: 'public';
  current: number;
  total: number;
  percent: number;
  captured: number;
  skipped: number;
  failed: number;
  withoutLink: number;
  failures: { codigo: string; error: string }[];
  error?: string;
}

export async function apiAdminStartThumbCapture(): Promise<AsyncJobStartResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/admin/thumbs/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao iniciar a captura de thumbs.');
  return data;
}

export async function apiAdminThumbJob(jobId: string): Promise<ThumbCaptureJob> {
  const token = getAuthToken();
  if (!token) throw new Error('Não autorizado.');
  const res = await fetch(`${API_BASE_URL}/admin/thumbs/jobs/${encodeURIComponent(jobId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao acompanhar a captura de thumbs.');
  return data;
}

export interface BNCC {
  id: number;
  codigo: string;
  habilidade?: string | null;
  descricao?: string | null;
  componente?: string | null;
  ano?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ODA {
  id: number;
  codigoOda?: string | null;
  titulo: string;
  componenteCurricular?: string | null;
  tags?: string | null;
  tagColor?: string | null;
  anoSerie?: string | null;
  imagem?: string | null;
  linkRepositorio?: string | null;
  codigoBncc?: string | null;
  descricaoBncc?: string | null;
  bncc?: BNCC | null; // Dados da BNCC relacionada (opcional)
  categoria?: string | null;
  duracao?: string | null;
  volume?: string | null;
  segmento?: string | null;
  pagina?: string | null;
  marca?: string | null;
  tipoConteudo: 'Audiovisual' | 'OED';
  categoriaVideo?: string | null;
  escalaSamr?: string | null;
  tipoObjeto?: string | null;
  descricao?: string | null;
  objetivosAprendizagem?: string | null;
  recursosPedagogicos?: string | null;
  requisitosTecnicos?: string | null;
  urlMetodologiaPdf?: string | null;
  status?: string | null;
  colecao?: string | null;
  livro?: string | null;
  envioEscola?: string | null;
  blocoCapitulo?: string | null;
  anoProducao?: string | null;
  macroformato?: string | null;
  palavrasChave?: string | null;
  codigoBnccSecundaria?: string | null;
  descricaoBnccSecundaria?: string | null;
  tempoMedioEstimado?: string | null;
  usuarioPrincipal?: string | null;
  ambienteUso?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ODAResponse {
  data: ODA[];
  total: number;
  limit?: number | null;
  offset?: number | null;
}

function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

// Converter ODA da API para formato do frontend
export function apiODAToFrontend(oda: ODA): Project {
  const bnccDescription = oda.bncc?.habilidade ?? undefined;
  
  // Debug: verificar se escalaSamr está presente
  if (process.env.NODE_ENV === 'development' && !oda.escalaSamr) {
    console.log(`⚠️ ODA ${oda.id} (${oda.titulo}) não tem escalaSamr`);
  }
  
  return {
    id: oda.id,
    codigoODA: oda.codigoOda || undefined,
    title: oda.titulo,
    tag: oda.componenteCurricular || '',
    tags: parseJsonArray(oda.tags),
    tagColor: oda.tagColor || 'bg-gray-600',
    location: oda.anoSerie || '',
    image: oda.imagem || '',
    videoUrl: oda.linkRepositorio || undefined,
    bnccCode: extractBnccCode(oda.codigoBncc) || undefined,
    bnccDescription: extractBnccDescription(oda.codigoBncc, oda.descricaoBncc || bnccDescription) || undefined,
    category: oda.categoria || oda.tipoObjeto || oda.macroformato || (isVideoAulaCodigo(oda.codigoOda) ? 'Vídeo' : undefined),
    duration: formatDuration(oda.duracao || oda.tempoMedioEstimado) || undefined,
    volume: oda.volume || undefined,
    segmento: oda.segmento || undefined,
    pagina: oda.pagina || undefined,
    marca: oda.marca || undefined,
    contentType: looksLikeAudiovisual({
      macroformato: oda.macroformato,
      tipoPrincipal: oda.tipoObjeto || oda.categoria,
      codigoOda: oda.codigoOda,
    })
      ? 'Audiovisual'
      : oda.tipoConteudo,
    videoCategory: oda.categoriaVideo || undefined,
    samr: oda.escalaSamr || undefined, // Mapear escalaSamr para samr
    tipoObjeto: oda.tipoObjeto || oda.categoria || oda.macroformato || undefined,
    description: oda.descricao || undefined,
    learningObjectives: parseJsonArray(oda.objetivosAprendizagem),
    pedagogicalResources: parseJsonArray(oda.recursosPedagogicos),
    technicalRequirements: oda.requisitosTecnicos || undefined,
    metodologiaPdfUrl: oda.urlMetodologiaPdf || undefined,
    status: oda.status || undefined,
    colecao: oda.colecao || undefined,
    livro: oda.livro || undefined,
    envioEscola: oda.envioEscola || undefined,
    blocoCapitulo: oda.blocoCapitulo || undefined,
    anoProducao: oda.anoProducao || undefined,
    macroformato: oda.macroformato || (isVideoAulaCodigo(oda.codigoOda) ? 'Vídeo' : undefined),
    palavrasChave: parseJsonArray(oda.palavrasChave),
    bnccCodeSecondary: extractBnccCode(oda.codigoBnccSecundaria) || undefined,
    bnccDescriptionSecondary:
      extractBnccDescription(oda.codigoBnccSecundaria, oda.descricaoBnccSecundaria) || undefined,
    tempoMedioEstimado: oda.tempoMedioEstimado || undefined,
    usuarioPrincipal: oda.usuarioPrincipal || undefined,
    ambienteUso: oda.ambienteUso || undefined,
  };
}

// Buscar todos os ODAs
export async function fetchAllODAs(params?: {
  tipoConteudo?: 'Audiovisual' | 'OED' | 'Todos';
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ODA[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.tipoConteudo && params.tipoConteudo !== 'Todos') {
    queryParams.append('tipoConteudo', params.tipoConteudo);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.offset) {
    queryParams.append('offset', params.offset.toString());
  }

  try {
    const response = await fetch(`${API_BASE_URL}/odas?${queryParams.toString()}`, {
      headers: authHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ODAResponse = await response.json();
    return data.data;
  } catch (error: any) {
    // Melhorar mensagem de erro para conexão recusada
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
      const connectionError = new Error(
        `Não foi possível conectar ao servidor backend em ${API_BASE_URL}. ` +
        `Certifique-se de que o servidor está rodando na porta 3001. ` +
        `Execute 'npm run server:dev' em um terminal separado.`
      );
      connectionError.name = 'ConnectionError';
      throw connectionError;
    }
    throw error;
  }
}

// Buscar ODA por ID
export async function fetchODAById(id: number): Promise<ODA | null> {
  const response = await fetch(`${API_BASE_URL}/odas/${id}`, {
    headers: authHeaders(),
  });
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Criar novo ODA
export async function createODA(oda: Partial<ODA>): Promise<ODA> {
  const response = await fetch(`${API_BASE_URL}/odas`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(oda),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Atualizar ODA
export async function updateODA(id: number, oda: Partial<ODA>): Promise<ODA> {
  const response = await fetch(`${API_BASE_URL}/odas/${id}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(oda),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Deletar ODA
export async function deleteODA(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/odas/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
}

// Contar ODAs
export async function countODAs(tipoConteudo?: 'Audiovisual' | 'OED' | 'Todos'): Promise<number> {
  const queryParams = new URLSearchParams();
  if (tipoConteudo && tipoConteudo !== 'Todos') {
    queryParams.append('tipoConteudo', tipoConteudo);
  }

  const response = await fetch(`${API_BASE_URL}/odas/stats/count?${queryParams.toString()}`, {
    headers: authHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.count;
}

