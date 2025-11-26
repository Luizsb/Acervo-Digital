const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  error: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...customHeaders,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          error: 'Request failed',
        }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Se a resposta estiver vazia (204 No Content), retorna void
      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors (connection refused, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      // Re-throw other errors
      throw error;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, customHeaders);
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

