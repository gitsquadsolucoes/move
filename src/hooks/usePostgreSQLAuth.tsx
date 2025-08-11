import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const savedUser = localStorage.getItem('moveAssistUser');
    const savedToken = localStorage.getItem('moveAssistToken');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
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
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
