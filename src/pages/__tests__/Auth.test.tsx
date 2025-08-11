import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/hooks/usePostgreSQLAuth';
import Auth from '@/pages/Auth';

// Mock do hook useAuth
vi.mock('@/hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

// Wrapper para testes com React Router
const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth Component', () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      loading: false,
      isAdmin: false,
      isProfissional: false
    });
  });

  it('deve renderizar formulário de login por padrão', () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve alternar para formulário de registro', async () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const registerLink = screen.getByText(/criar conta/i);
    fireEvent.click(registerLink);

    await waitFor(() => {
      expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('deve chamar login com dados válidos', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const loginButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'bruno@move.com' } });
    fireEvent.change(passwordInput, { target: { value: '15002031' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('bruno@move.com', '15002031');
    });
  });

  it('deve mostrar erro de validação para email inválido', async () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const loginButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve mostrar erro para campos obrigatórios', async () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const loginButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve mostrar loading durante autenticação', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
      loading: true,
      isAdmin: false,
      isProfissional: false
    });

    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('deve chamar register com dados válidos', async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    // Alternar para registro
    const registerLink = screen.getByText(/criar conta/i);
    fireEvent.click(registerLink);

    await waitFor(() => {
      expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const registerButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(nameInput, { target: { value: 'Usuário Teste' } });
    fireEvent.change(emailInput, { target: { value: 'teste@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SenhaForte@123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        nome_completo: 'Usuário Teste',
        email: 'teste@example.com',
        password: 'SenhaForte@123'
      });
    });
  });

  it('deve mostrar erro para senha fraca no registro', async () => {
    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    // Alternar para registro
    const registerLink = screen.getByText(/criar conta/i);
    fireEvent.click(registerLink);

    await waitFor(() => {
      expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/senha/i);
    const registerButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos/i)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('deve mostrar mensagem de erro de autenticação', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));

    render(
      <AuthWrapper>
        <Auth />
      </AuthWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const loginButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'bruno@move.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha-errada' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});
