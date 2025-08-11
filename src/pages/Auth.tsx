import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Tentando login com:', { email: loginEmail, password: '***' });
      
      // Tentar login direto com supabase para debug
      const { data, error: directError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      console.log('Resposta do login:', { data, error: directError });

      if (directError) {
        console.error('Erro direto do Supabase:', directError);
        setError(`Erro de autenticação: ${directError.message}`);
      } else if (data.user) {
        console.log('Login bem-sucedido:', data.user);
        navigate(from, { replace: true });
      } else {
        setError('Login falhou sem erro específico');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Criando usuário de teste...');
      
      const { data, error } = await supabase.auth.signUp({
        email: 'bruno@move.com',
        password: '15002031',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo: 'Bruno Santos',
            tipo_usuario: 'admin',
          }
        }
      });

      console.log('Resultado da criação:', { data, error });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Usuário já existe. Tente fazer login.');
        } else {
          setError(`Erro ao criar usuário: ${error.message}`);
        }
      } else {
        setError('Usuário criado! Agora tente fazer login.');
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      setError('Erro inesperado ao criar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Instituto Move Marias</CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestão - Acesso Restrito
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant={error.includes('criado') ? 'default' : 'destructive'} className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="bruno@move.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="15002031"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={createTestUser}
              disabled={isLoading}
            >
              Criar Usuário de Teste (Debug)
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Credenciais padrão:</p>
            <p>Email: bruno@move.com</p>
            <p>Senha: 15002031</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}