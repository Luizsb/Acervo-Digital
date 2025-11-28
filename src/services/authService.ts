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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/register', {
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/login', {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  async getMe(): Promise<User> {
    return api.get<User>('/users/me');
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    
    // Atualizar usuário no localStorage
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

