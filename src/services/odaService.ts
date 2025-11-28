import { api } from './api';

export interface ODA {
  id: string;
  title: string;
  tag: string;
  tags: string[];
  location: string;
  image: string;
  videoUrl?: string;
  bnccCode?: string;
  bnccDescription?: string;
  category?: string;
  duration?: string;
  volume?: string;
  livro?: string;
  pagina?: string;
  marca?: string;
  contentType: 'Audiovisual' | 'OED';
  videoCategory?: string;
  tipoObjeto?: string;
  samr?: string;
  description?: string;
  learningObjectives?: string[];
  pedagogicalResources?: string[];
  technicalRequirements?: string[];
  views: number;
  lastUpdate: string;
  createdAt: string;
}

export interface ODAFilters {
  search?: string;
  contentType?: 'Todos' | 'Audiovisual' | 'OED';
  anos?: string[];
  tags?: string[];
  bnccCodes?: string[];
  livros?: string[];
  categorias?: string[];
  marcas?: string[];
  tipoObjeto?: string[];
  videoCategory?: string[];
  samr?: string[];
  volumes?: string[];
  page?: number;
  limit?: number;
}

export interface ODAResponse {
  data: ODA[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const odaService = {
  async getAll(filters: ODAFilters = {}): Promise<ODAResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const queryString = params.toString();
    return api.get<ODAResponse>(`/odas${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id: string): Promise<ODA> {
    return api.get<ODA>(`/odas/${id}`);
  },

  async getRelated(id: string, limit: number = 3): Promise<ODA[]> {
    return api.get<ODA[]>(`/odas/${id}/related?limit=${limit}`);
  },

  async incrementView(id: string, sessionId?: string): Promise<{ success: boolean; alreadyViewed: boolean }> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }
    return api.post(`/odas/${id}/view`, undefined, headers);
  },
};

