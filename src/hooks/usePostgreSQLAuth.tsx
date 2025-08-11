import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  nome_completo?: string;
  tipo_usuario?: string;
}

interface Profile {
  id: string;
  user_id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  foto_url?: string;
  bio?: string;
  endereco?: string;
  data_nascimento?: string;
  tipo_usuario: 'super_admin' | 'admin' | 'coordenador' | 'profissional' | 'assistente';
  ativo: boolean;
  data_criacao: string;
  ultimo_acesso?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const PostgreSQLAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const savedUser = localStorage.getItem('moveAssistUser');
    const savedToken = localStorage.getItem('moveAssistToken');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        
        // Criar profile baseado no user salvo
        const mockProfile: Profile = {
          id: user.id.toString(),
          user_id: user.id.toString(),
          nome_completo: user.name,
          email: user.email,
          tipo_usuario: user.role as any,
          ativo: true,
          data_criacao: new Date().toISOString()
        };
        setProfile(mockProfile);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('moveAssistUser');
        localStorage.removeItem('moveAssistToken');
      }
    }
    
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.login(email, password);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        localStorage.setItem('moveAssistUser', JSON.stringify(response.user));
        localStorage.setItem('moveAssistToken', response.token);
        
        // Criar profile baseado no user
        const mockProfile: Profile = {
          id: response.user.id.toString(),
          user_id: response.user.id.toString(),
          nome_completo: response.user.name,
          email: response.user.email,
          tipo_usuario: response.user.role as any,
          ativo: true,
          data_criacao: new Date().toISOString()
        };
        setProfile(mockProfile);
        
        return { error: null };
      } else {
        return { error: { message: response.message || 'Erro ao fazer login' } };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: { message: 'Erro de conexão' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('moveAssistUser');
      localStorage.removeItem('moveAssistToken');
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: { message: 'Erro ao fazer logout' } };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
