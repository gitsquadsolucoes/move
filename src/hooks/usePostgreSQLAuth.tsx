import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch, API_BASE_URL } from '@/lib/api';

interface User {
  id: string;
  nome_completo: string;
  email: string;
  tipo_usuario: 'super_admin' | 'admin' | 'coordenador' | 'profissional' | 'assistente';
  cargo?: string;
  departamento?: string;
  foto_url?: string;
  bio?: string;
  endereco?: string;
  data_nascimento?: string;
  telefone?: string;
  ativo: boolean;
  data_criacao: string;
  ultimo_acesso?: string;
  token?: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  accessibility: {
    fontSize: number;
    contrast: 'normal' | 'high';
  };
}

interface AuthState {
  isLoading: boolean;
  isSigningIn: boolean;
  isSigningOut: boolean;
  lastActivity: Date | null;
}

interface SessionInfo {
  loginTime: Date | null;
  lastActive: Date | null;
  deviceInfo: string;
}

interface LoginProgress {
  stage: 'idle' | 'validating' | 'loading_profile' | 'complete';
  progress: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authStatus: AuthState;
  sessionInfo: SessionInfo;
  loginProgress: LoginProgress;
    stage: 'idle' | 'validating' | 'loading_profile' | 'complete';
    progress: number;
  };
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };

interface AuthProviderProps {
  children: ReactNode;
}

export const PostgreSQLAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isSigningIn: false,
    isSigningOut: false,
    lastActivity: null as Date | null
  });
  const [sessionInfo, setSessionInfo] = useState({
    loginTime: null as Date | null,
    lastActive: null as Date | null,
    deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  });
  const [loginProgress, setLoginProgress] = useState<{
    stage: 'idle' | 'validating' | 'loading_profile' | 'complete';
    progress: number;
  }>({
    stage: 'idle',
    progress: 0
  });
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('user_preferences') : null;
    return saved ? JSON.parse(saved) : {
      theme: 'system',
      language: typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
      notifications: true,
      accessibility: {
        fontSize: 16,
        contrast: 'normal'
      }
    };
  });

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user_preferences', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateLastActive = () => {
    const now = new Date();
    setSessionInfo(prev => ({
      ...prev,
      lastActive: now
    }));
    setAuthStatus(prev => ({
      ...prev,
      lastActivity: now
    }));
  };

  useEffect(() => {
    if (user) {
      window.addEventListener('mousemove', updateLastActive);
      window.addEventListener('keypress', updateLastActive);
      window.addEventListener('click', updateLastActive);
      window.addEventListener('scroll', updateLastActive);
    }

    return () => {
      window.removeEventListener('mousemove', updateLastActive);
      window.removeEventListener('keypress', updateLastActive);
      window.removeEventListener('click', updateLastActive);
      window.removeEventListener('scroll', updateLastActive);
    };
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        setAuthStatus(prev => ({ ...prev, isLoading: true }));
        setLoginProgress({ stage: 'loading_profile', progress: 30 });
        
        // Tenta recuperar do cache primeiro
        const cachedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('cached_user') : null;
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setLoginProgress({ stage: 'complete', progress: 100 });
          setSessionInfo(prev => ({
            ...prev,
            lastActive: new Date()
          }));
        }

        // Atualiza em background
        setLoginProgress({ stage: 'loading_profile', progress: 60 });
        const response = await apiFetch<{ success: boolean; data: User }>(`${API_BASE_URL}/auth/profile`);
        
        if (response.success && response.data) {
          setUser(response.data);
          setLoginProgress({ stage: 'complete', progress: 100 });
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('cached_user', JSON.stringify(response.data));
          }
          setSessionInfo(prev => ({
            ...prev,
            loginTime: new Date(),
            lastActive: new Date()
          }));
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setLoginProgress({ stage: 'idle', progress: 0 });
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('cached_user');
        }
      } finally {
        setLoading(false);
        setAuthStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    load();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthStatus(prev => ({ ...prev, isSigningIn: true }));
      
      // Início do processo de login
      setLoginProgress({ stage: 'validating', progress: 25 });
      await new Promise(resolve => setTimeout(resolve, 300)); // Feedback visual

      const response = await apiFetch<{ success: boolean; data: User; message?: string }>(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      // Validação concluída, carregando perfil
      setLoginProgress({ stage: 'loading_profile', progress: 60 });
      await new Promise(resolve => setTimeout(resolve, 200)); // Feedback visual

      if (response.success && response.data) {
        setUser(response.data);
        setLoginProgress({ stage: 'complete', progress: 100 });
        
        const now = new Date();
        setSessionInfo(prev => ({
          ...prev,
          loginTime: now,
          lastActive: now
        }));

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('cached_user', JSON.stringify(response.data));
        }

        // Aguarda um momento para mostrar o sucesso
        await new Promise(resolve => setTimeout(resolve, 200));
        return { error: null };
      }

      setLoginProgress({ stage: 'idle', progress: 0 });
      return { error: response.message || 'Credenciais inválidas' };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      setLoginProgress({ stage: 'idle', progress: 0 });
      return { error: error.message };
    } finally {
      setLoading(false);
      setAuthStatus(prev => ({ ...prev, isSigningIn: false }));
    }
  };

  const signOut = async () => {
    try {
      setAuthStatus(prev => ({ ...prev, isSigningOut: true }));
      
      // Feedback visual do início do logout
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await apiFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      // Limpa todos os dados do usuário
      setUser(null);
      setLoginProgress({ stage: 'idle', progress: 0 });
      setSessionInfo({
        loginTime: null,
        lastActive: null,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      });
      
      // Limpa o cache
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('cached_user');
      }
      
      // Feedback visual de conclusão
      await new Promise(resolve => setTimeout(resolve, 200));
      return { error: null };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { error: { message: 'Erro ao fazer logout' } };
    } finally {
      setAuthStatus(prev => ({ ...prev, isSigningOut: false }));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.tipo_usuario === 'admin' || user?.tipo_usuario === 'super_admin',
    authStatus,
    sessionInfo,
    loginProgress,
    preferences,
    updatePreferences
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
