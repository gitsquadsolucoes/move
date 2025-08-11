import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/usePostgreSQLAuth';
import { supabase } from '@/integrations/supabase/client';

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';

// Mock do supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}));

// Mock do sessionManager
vi.mock('@/lib/sessionManager', () => ({
  sessionManager: {
    setUserSession: vi.fn(),
    getUserSession: vi.fn(),
    clearSession: vi.fn(),
    isSessionValid: vi.fn()
  }
}));

// Mock do useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('deve ter função de login', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(typeof result.current.login).toBe('function');
  });

  it('deve ter função de logout', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(typeof result.current.logout).toBe('function');
  });

  it('deve ter função de registro', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(typeof result.current.signUp).toBe('function');
  });

  it('deve atualizar loading state', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Verificar estado inicial
    expect(result.current.loading).toBe(true);
    
    // Simular carregamento finalizado
    await act(async () => {
      // Hook irá atualizar loading automaticamente após verificar sessão
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('deve ter função de login', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(typeof result.current.login).toBe('function');
  });

  it('deve ter função de logout', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(typeof result.current.logout).toBe('function');
  });

  it('deve ter função de registro', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(typeof result.current.signUp).toBe('function');
  });

  it('deve atualizar loading state', async () => {
    const { result } = renderHook(() => useAuth());
    
    // Verificar estado inicial
    expect(result.current.loading).toBe(true);
    
    // Simular carregamento finalizado
    await act(async () => {
      // Hook irá atualizar loading automaticamente após verificar sessão
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});

  it('deve inicializar com usuário null', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isProfissional).toBe(false);
  });

  it('deve fazer login com credenciais válidas', async () => {
    const mockUser = {
      id: '123',
      email: 'bruno@move.com',
      user_metadata: {
        nome_completo: 'Bruno Admin'
      }
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('bruno@move.com', '15002031');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'bruno@move.com',
      password: '15002031'
    });
  });

  it('deve rejeitar login com credenciais inválidas', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    });

    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('wrong@email.com', 'wrong-password');
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('deve fazer logout corretamente', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('deve registrar novo usuário', async () => {
    const newUser = {
      nome_completo: 'Novo Usuário',
      email: 'novo@usuario.com',
      password: 'SenhaForte@123'
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { 
        user: { id: '456', email: newUser.email },
        session: { access_token: 'token' }
      },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(newUser);
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          nome_completo: newUser.nome_completo
        }
      }
    });
  });

  it('deve identificar usuário admin corretamente', () => {
    const mockAdminUser = {
      id: '123',
      email: 'bruno@move.com',
      user_metadata: {
        role: 'admin'
      }
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAdminUser },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      // Simular mudança de estado
      result.current.user = mockAdminUser;
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isProfissional).toBe(true); // Admin também é profissional
  });

  it('deve identificar usuário profissional corretamente', () => {
    const mockProfUser = {
      id: '456',
      email: 'prof@move.com',
      user_metadata: {
        role: 'profissional'
      }
    };

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.user = mockProfUser;
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isProfissional).toBe(true);
  });

  it('deve lidar com mudanças de estado de autenticação', () => {
    const mockCallback = vi.fn();
    
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    renderHook(() => useAuth());

    // Simular mudança de estado
    act(() => {
      mockCallback('SIGNED_IN', { 
        user: { 
          id: '123', 
          email: 'test@test.com' 
        } 
      });
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  it('deve limpar estado no unmount', () => {
    const mockUnsubscribe = vi.fn();
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });

    const { unmount } = renderHook(() => useAuth());
    
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('deve lidar com erros de rede', async () => {
    mockSupabase.auth.signInWithPassword.mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('test@test.com', 'password');
      })
    ).rejects.toThrow('Network error');
  });

  it('deve validar email antes do login', async () => {
    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('email-invalido', 'password');
      })
    ).rejects.toThrow('Email inválido');

    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('deve validar dados obrigatórios no registro', async () => {
    const { result } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.register({
          nome_completo: '',
          email: 'test@test.com',
          password: 'password'
        });
      })
    ).rejects.toThrow('Nome completo é obrigatório');

    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
  });
});
