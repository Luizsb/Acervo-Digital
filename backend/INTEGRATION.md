# Guia de Integração Frontend-Backend

Este guia explica como integrar o frontend React com o backend API.

## 🔌 Configuração Base

### 1. Criar arquivo de configuração da API

Crie `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  baseURL: API_BASE_URL,
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  },

  post<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
```

### 2. Criar serviço de ODAs

Crie `src/services/odaService.ts`:

```typescript
import { api } from './api';

export interface ODA {
  id: string;
  title: string;
  tag: string;
  tags: string[];
  tagColor?: string;
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
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return api.get<ODAResponse>(`/odas?${params.toString()}`);
  },

  async getById(id: string): Promise<ODA> {
    return api.get<ODA>(`/odas/${id}`);
  },

  async getRelated(id: string, limit: number = 3): Promise<ODA[]> {
    return api.get<ODA[]>(`/odas/${id}/related?limit=${limit}`);
  },

  async incrementView(id: string): Promise<void> {
    return api.post(`/odas/${id}/view`);
  },
};
```

### 3. Criar serviço de autenticação

Crie `src/services/authService.ts`:

```typescript
import { api } from './api';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/register', {
      email,
      password,
      name,
    });
    
    localStorage.setItem('token', response.token);
    return response;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/login', {
      email,
      password,
    });
    
    localStorage.setItem('token', response.token);
    return response;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
```

### 4. Criar serviço de favoritos

Crie `src/services/favoriteService.ts`:

```typescript
import { api } from './api';
import { ODA } from './odaService';

export const favoriteService = {
  async getAll(): Promise<ODA[]> {
    return api.get<ODA[]>('/favorites');
  },

  async add(odaId: string): Promise<void> {
    return api.post(`/favorites/${odaId}`);
  },

  async remove(odaId: string): Promise<void> {
    return api.delete(`/favorites/${odaId}`);
  },

  async check(odaId: string): Promise<boolean> {
    const response = await api.get<{ isFavorite: boolean }>(`/favorites/check/${odaId}`);
    return response.isFavorite;
  },
};
```

## 🔄 Atualizar App.tsx

Substitua os dados mockados por chamadas à API:

```typescript
import { useState, useEffect } from 'react';
import { odaService, ODA, ODAFilters } from './services/odaService';
import { favoriteService } from './services/favoriteService';
import { authService } from './services/authService';

export default function App() {
  const [projects, setProjects] = useState<ODA[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ODAFilters>({});

  // Carregar ODAs
  useEffect(() => {
    loadODAs();
  }, [filters]);

  // Carregar favoritos se autenticado
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadFavorites();
    }
  }, []);

  const loadODAs = async () => {
    try {
      setLoading(true);
      const response = await odaService.getAll(filters);
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao carregar ODAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await favoriteService.getAll();
      setFavorites(favs.map(f => f.id));
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const handleToggleFavorite = async (projectId: string) => {
    if (!authService.isAuthenticated()) {
      // Redirecionar para login ou mostrar modal
      return;
    }

    try {
      const isFavorite = favorites.includes(projectId);
      
      if (isFavorite) {
        await favoriteService.remove(projectId);
        setFavorites(favs => favs.filter(id => id !== projectId));
      } else {
        await favoriteService.add(projectId);
        setFavorites(favs => [...favs, projectId]);
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  // ... resto do código
}
```

## 🔐 Adicionar Variável de Ambiente

Crie `.env` na raiz do projeto frontend:

```env
VITE_API_URL=http://localhost:3001/api
```

## 📝 Próximos Passos

1. **Implementar autenticação no frontend** - Tela de login/registro
2. **Adicionar loading states** - Spinners durante carregamento
3. **Tratamento de erros** - Mensagens amigáveis para o usuário
4. **Cache local** - Usar React Query ou SWR para cache
5. **Otimizações** - Debounce na busca, paginação infinita

