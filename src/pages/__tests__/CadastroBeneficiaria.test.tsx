import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CadastroBeneficiaria from '@/pages/CadastroBeneficiaria_FINAL';
import { useAuth } from '@/hooks/useAuth';

// Mocks
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client');

const mockUseAuth = vi.mocked(useAuth);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CadastroBeneficiaria Component', () => {
  const mockUser = {
    id: '123',
    email: 'bruno@move.com',
    nome_completo: 'Bruno Admin'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loading: false,
      isAdmin: true,
      isProfissional: true
    });
  });

  it('deve renderizar formulário de cadastro', () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    expect(screen.getByText(/cadastrar beneficiária/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome completo é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/cpf é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve validar formato do CPF', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const cpfInput = screen.getByLabelText(/cpf/i);
    fireEvent.change(cpfInput, { target: { value: '123' } });
    fireEvent.blur(cpfInput);

    await waitFor(() => {
      expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
    });
  });

  it('deve formatar CPF automaticamente', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const cpfInput = screen.getByLabelText(/cpf/i) as HTMLInputElement;
    fireEvent.change(cpfInput, { target: { value: '12345678901' } });

    await waitFor(() => {
      expect(cpfInput.value).toBe('123.456.789-01');
    });
  });

  it('deve validar formato do telefone', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const telefoneInput = screen.getByLabelText(/telefone/i);
    fireEvent.change(telefoneInput, { target: { value: '123' } });
    fireEvent.blur(telefoneInput);

    await waitFor(() => {
      expect(screen.getByText(/telefone inválido/i)).toBeInTheDocument();
    });
  });

  it('deve formatar telefone automaticamente', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const telefoneInput = screen.getByLabelText(/telefone/i) as HTMLInputElement;
    fireEvent.change(telefoneInput, { target: { value: '11987654321' } });

    await waitFor(() => {
      expect(telefoneInput.value).toBe('(11) 98765-4321');
    });
  });

  it('deve validar data de nascimento', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const dataInput = screen.getByLabelText(/data de nascimento/i);
    fireEvent.change(dataInput, { target: { value: '32/01/2000' } });
    fireEvent.blur(dataInput);

    await waitFor(() => {
      expect(screen.getByText(/data inválida/i)).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ success: true });
    
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    // Preencher dados válidos
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Maria Silva Santos' }
    });
    
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: '123.456.789-01' }
    });
    
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), {
      target: { value: '01/01/1990' }
    });
    
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '(11) 98765-4321' }
    });

    fireEvent.change(screen.getByLabelText(/endereço/i), {
      target: { value: 'Rua das Flores, 123' }
    });

    fireEvent.change(screen.getByLabelText(/cidade/i), {
      target: { value: 'São Paulo' }
    });

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/beneficiária cadastrada com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar loading durante envio', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    // Preencher dados mínimos
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Maria Silva' }
    });
    
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: '123.456.789-01' }
    });

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/salvando/i)).toBeInTheDocument();
  });

  it('deve limpar formulário após sucesso', async () => {
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const nomeInput = screen.getByLabelText(/nome completo/i) as HTMLInputElement;
    
    fireEvent.change(nomeInput, { target: { value: 'Maria Silva' } });
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: '123.456.789-01' }
    });

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nomeInput.value).toBe('');
    });
  });

  it('deve mostrar erro de CPF duplicado', async () => {
    const mockError = new Error('CPF já cadastrado');
    
    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Maria Silva' }
    });
    
    fireEvent.change(screen.getByLabelText(/cpf/i), {
      target: { value: '123.456.789-01' }
    });

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/cpf já cadastrado/i)).toBeInTheDocument();
    });
  });

  it('deve navegar de volta para lista', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(
      <TestWrapper>
        <CadastroBeneficiaria />
      </TestWrapper>
    );

    const backButton = screen.getByRole('button', { name: /voltar/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/beneficiarias');
  });
});
