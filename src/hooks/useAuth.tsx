import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  nome_completo: string;
}

interface Session {
  access_token: string;
  user: User;
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
  signUp: (email: string, password: string, nomeCompleto: string, tipoUsuario?: 'admin' | 'profissional') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  loadProfile: () => Promise<void>;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.auth.getProfile();
        if (response.user) {
          const userWithName = {
            ...response.user,
            id: String(response.user.id),
            nome_completo: response.user.nome_completo || response.user.email
          };
          setUser(userWithName);
          setSession({ access_token: '', user: userWithName });
          await loadProfile();
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const loadProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      // For now, use user data as profile since we don't have a separate profiles table
      const mockProfile: Profile = {
        id: session.user.id,
        user_id: session.user.id,
        nome_completo: session.user.nome_completo,
        email: session.user.email,
        tipo_usuario: 'admin',
        ativo: true,
        data_criacao: new Date().toISOString()
      };
      
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string, nomeCompleto: string, tipoUsuario: 'admin' | 'profissional' = 'profissional') => {
    try {
      // Mock signup - in real implementation, call API
      const response = await api.auth.register({ email, password, nome_completo: nomeCompleto });
      
      if (response.success) {
        return { error: null };
      } else {
        return { error: new Error(response.message || 'Erro no cadastro') };
      }
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.auth.login({ email, password });

      if (response.success && response.user) {
        const userWithName = {
          ...response.user,
          id: String(response.user.id), // Convert to string
          nome_completo: response.user.name || response.user.email
        };

        const sessionData = { access_token: '', user: userWithName };
        setUser(userWithName);
        setSession(sessionData);

        await loadProfile();

        return { error: null };
      } else {
        return { error: new Error(response.message || 'Erro no login') };
      }
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await api.auth.logout();

      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!profile) return { error: new Error('No profile loaded') };
      
      // Mock update - in real implementation, call API
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loadProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
