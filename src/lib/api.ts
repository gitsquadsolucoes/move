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

interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return response.json();
  },

  async getBeneficiarias(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/beneficiarias`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  },

  async createBeneficiaria(data: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/beneficiarias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  async testConnection(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/test-db`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }
};
