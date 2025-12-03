const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

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
export function apiODAToFrontend(oda: ODA): any {
  // Usar apenas a habilidade da tabela BNCC
  const bnccDescription = (oda as any).bncc?.habilidade || undefined;
  
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
    samr: oda.escalaSamr || undefined,
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

  const response = await fetch(`${API_BASE_URL}/odas?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ODAResponse = await response.json();
  return data.data;
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

