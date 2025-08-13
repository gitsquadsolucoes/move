// Frontend API client para comunicação com o backend PostgreSQL
const getApiBaseUrl = () => {
  // Detectar ambiente baseado no hostname e protocolo
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    
    // Produção
    if (hostname === 'movemarias.squadsolucoes.com.br') {
      return `${protocol}//movemarias.squadsolucoes.com.br/api`;
    }
    
    // Desenvolvimento local
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('codespaces')) {
      return 'http://localhost:3000/api';
    }
  }
  
  // Fallback para desenvolvimento
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, { credentials: 'include', ...options });
};

interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return response.json();
  },

  async getBeneficiarias(): Promise<ApiResponse> {
    const response = await apiFetch(`${API_BASE_URL}/beneficiarias`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  async createBeneficiaria(data: any): Promise<ApiResponse> {
    const response = await apiFetch(`${API_BASE_URL}/beneficiarias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  async testConnection(): Promise<ApiResponse> {
    const response = await apiFetch(`${API_BASE_URL}/test-db`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  // Projetos
  async getProjetos(page = 1, limit = 10): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/projetos?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  async createProjeto(data: any): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/projetos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  async updateProjeto(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/projetos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  async deleteProjeto(id: string): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/projetos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  // Oficinas
  async getOficinas(page = 1, limit = 10): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/oficinas?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  async createOficina(data: any): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/oficinas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  async updateOficina(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/oficinas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  async deleteOficina(id: string): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/oficinas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  // Atividades
  async getAtividades(beneficiariaId: string): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/beneficiarias/${beneficiariaId}/atividades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  async createParticipacao(data: any): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/participacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  async updateParticipacao(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/participacoes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Mensagens
  async getMensagens(page = 1, limit = 20): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/mensagens?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  async sendMensagem(data: any): Promise<ApiResponse<any>> {
    const response = await apiFetch(`${API_BASE_URL}/mensagens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Auth methods
  auth: {
    async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
      const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      return response.json();
    },

    async register(userData: { email: string; password: string; nome_completo: string }): Promise<ApiResponse> {
      const response = await apiFetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return response.json();
    },

    async logout(): Promise<void> {
      await apiFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST'
      });
    },

    async getProfile(): Promise<ApiResponse> {
      const response = await apiFetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.json();
    }
  }
};
