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
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, nomeCompleto: string, tipoUsuario?: 'admin' | 'profissional') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAdmin: boolean;
  isProfissional: boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // Verifica se está usando configuração dummy tentando acessar o supabase
      let isDummyConfig = false;
      try {
        await supabase.auth.getSession();
      } catch (error) {
        isDummyConfig = true;
      }
      
      if (isDummyConfig || import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
        // Dados mock para desenvolvimento - usuário administrador
        const mockProfile: Profile = {
          id: userId,
          user_id: userId,
          nome_completo: 'Administrador Move Marias',
          email: 'admin@movemarias.org',
          telefone: '(11) 99999-0000',
          cargo: 'Coordenadora Geral',
          departamento: 'Administração',
          foto_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b526?w=400',
          bio: 'Coordenadora responsável pela gestão geral do sistema Move Marias.',
          endereco: 'São Paulo, SP',
          data_nascimento: '1985-01-01',
          tipo_usuario: 'super_admin',
          ativo: true,
          data_criacao: new Date().toISOString(),
          ultimo_acesso: new Date().toISOString()
        };
        setProfile(mockProfile);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          ...data,
          ativo: (data as any).ativo ?? true,
          telefone: (data as any).telefone || '',
          cargo: (data as any).cargo || '',
          departamento: (data as any).departamento || '',
          foto_url: (data as any).foto_url || (data as any).avatar_url || '',
          bio: (data as any).bio || '',
          endereco: (data as any).endereco || '',
          data_nascimento: (data as any).data_nascimento || '',
          ultimo_acesso: (data as any).ultimo_acesso || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile when user is authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    nomeCompleto: string, 
    tipoUsuario: 'admin' | 'profissional' = 'profissional'
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome_completo: nomeCompleto,
          tipo_usuario: tipoUsuario,
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }

    return { error };
  };

  // Computed values with safe fallbacks
  const isAdmin = profile?.tipo_usuario === 'admin' || profile?.tipo_usuario === 'super_admin' || false;
  const isProfissional = profile?.tipo_usuario === 'profissional' || false;

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isProfissional,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};