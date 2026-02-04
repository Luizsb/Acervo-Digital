import { getVideoThumbnail } from './videoThumbnails';
import type { Project } from '../types/project';

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
  createdAt: string;
  updatedAt: string;
}

export interface ODAResponse {
  data: ODA[];
  total: number;
  limit?: number | null;
  offset?: number | null;
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
    tags: oda.tags ? JSON.parse(oda.tags) : [],
    tagColor: oda.tagColor || 'bg-gray-600',
    location: oda.anoSerie || '',
    image: oda.imagem || '',
    videoUrl: oda.linkRepositorio || undefined,
    bnccCode: oda.codigoBncc || undefined,
    bnccDescription: bnccDescription,
    category: oda.categoria || undefined,
    duration: oda.duracao || undefined,
    volume: oda.volume || undefined,
    segmento: oda.segmento || undefined,
    pagina: oda.pagina || undefined,
    marca: oda.marca || undefined,
    contentType: oda.tipoConteudo,
    videoCategory: oda.categoriaVideo || undefined,
    samr: oda.escalaSamr || undefined, // Mapear escalaSamr para samr
    tipoObjeto: oda.tipoObjeto || undefined,
    description: oda.descricao || undefined,
    learningObjectives: oda.objetivosAprendizagem ? JSON.parse(oda.objetivosAprendizagem) : undefined,
    pedagogicalResources: oda.recursosPedagogicos ? JSON.parse(oda.recursosPedagogicos) : undefined,
    technicalRequirements: oda.requisitosTecnicos || undefined,
    metodologiaPdfUrl: oda.urlMetodologiaPdf || undefined,
    status: oda.status || undefined,
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
    const response = await fetch(`${API_BASE_URL}/odas?${queryParams.toString()}`);
    
    if (!response.ok) {
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
  const response = await fetch(`${API_BASE_URL}/odas/${id}`);
  
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
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
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

  const response = await fetch(`${API_BASE_URL}/odas/stats/count?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.count;
}

// ==================== AUDIOVISUAL ====================

export interface Audiovisual {
  id: number;
  codigo?: string | null;
  marca?: string | null;
  segmento?: string | null;
  anoSerieModulo?: string | null;
  volume?: string | null;
  componente?: string | null;
  capitulo?: string | null;
  nomeCapitulo?: string | null;
  categoriaVideo?: string | null;
  vestibular?: string | null;
  enunciado?: string | null;
  link?: string | null;
  imagem?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudiovisualResponse {
  data: Audiovisual[];
  total: number;
  limit?: number | null;
  offset?: number | null;
}

// Buscar todos os audiovisuais
export async function fetchAllAudiovisual(params?: {
  search?: string;
  marca?: string;
  segmento?: string;
  anoSerieModulo?: string;
  volume?: string;
  componente?: string;
  categoriaVideo?: string;
  vestibular?: string;
  capitulo?: string;
  limit?: number;
  offset?: number;
}): Promise<Audiovisual[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.marca) {
    queryParams.append('marca', params.marca);
  }
  if (params?.segmento) {
    queryParams.append('segmento', params.segmento);
  }
  if (params?.anoSerieModulo) {
    queryParams.append('anoSerieModulo', params.anoSerieModulo);
  }
  if (params?.volume) {
    queryParams.append('volume', params.volume);
  }
  if (params?.componente) {
    queryParams.append('componente', params.componente);
  }
  if (params?.categoriaVideo) {
    queryParams.append('categoriaVideo', params.categoriaVideo);
  }
  if (params?.vestibular) {
    queryParams.append('vestibular', params.vestibular);
  }
  if (params?.capitulo) {
    queryParams.append('capitulo', params.capitulo);
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.offset) {
    queryParams.append('offset', params.offset.toString());
  }

  try {
    const response = await fetch(`${API_BASE_URL}/audiovisual?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AudiovisualResponse = await response.json();
    return data.data;
  } catch (error: any) {
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
      const connectionError = new Error(
        `Não foi possível conectar ao servidor backend em ${API_BASE_URL}. ` +
        `Certifique-se de que o servidor está rodando na porta 3001.`
      );
      connectionError.name = 'ConnectionError';
      throw connectionError;
    }
    throw error;
  }
}

// Converter Audiovisual para formato do frontend
export function audiovisualToFrontend(audiovisual: Audiovisual): any {
  return {
    id: audiovisual.id,
    codigoODA: audiovisual.codigo || undefined,
    title: audiovisual.nomeCapitulo || audiovisual.codigo || 'Sem título',
    tag: audiovisual.componente || '',
    tags: audiovisual.componente ? [audiovisual.componente] : [],
    tagColor: getTagColor(audiovisual.componente || ''),
    location: audiovisual.anoSerieModulo || '',
    image: getVideoThumbnail(audiovisual.link || undefined, audiovisual.imagem || undefined),
    videoUrl: audiovisual.link || undefined,
    category: audiovisual.categoriaVideo || undefined,
    volume: (() => {
      const vol = audiovisual.volume;
      if (!vol) return undefined;
      const trimmed = vol.trim();
      // Se for apenas um número, adiciona "Volume" antes
      if (/^\d+$/.test(trimmed)) {
        return `Volume ${trimmed}`;
      }
      // Se já começar com "Volume", retorna como está
      if (/^volume\s+/i.test(trimmed)) {
        return trimmed;
      }
      return trimmed;
    })(),
    segmento: audiovisual.segmento || undefined,
    marca: audiovisual.marca || undefined,
    contentType: 'Audiovisual' as const,
    videoCategory: audiovisual.categoriaVideo || undefined,
    capitulo: audiovisual.capitulo || undefined,
    vestibular: audiovisual.vestibular || undefined,
    enunciado: audiovisual.enunciado || undefined,
  };
}

// Função auxiliar para obter cor da tag
function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    'Língua Portuguesa': 'bg-blue-600',
    'Matemática': 'bg-yellow-600',
    'Ciências': 'bg-green-600',
    'História': 'bg-purple-600',
    'Geografia': 'bg-amber-600',
    'Arte': 'bg-pink-600',
    'Inglês': 'bg-indigo-600',
    'Educação Física': 'bg-lime-600',
  };
  return colors[tag] || 'bg-gray-600';
}

// Migrar planilha Excel
export async function migrateExcel(clearExisting: boolean = false): Promise<{
  success: boolean;
  imported: number;
  total: number;
  errors: string[];
}> {
  const response = await fetch(`${API_BASE_URL}/migration/excel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clearExisting }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Verificar status da migração
export async function getMigrationStatus(): Promise<{
  totalODAs: number;
  databaseExists: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/migration/status`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

