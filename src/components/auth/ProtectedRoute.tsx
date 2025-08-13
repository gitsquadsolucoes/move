import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/usePostgreSQLAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Em desenvolvimento ou com backend local, permita acesso sem autenticação
  const isDevelopmentMode =
    import.meta.env.DEV ||
    import.meta.env.VITE_API_BASE_URL?.includes('localhost');

  useEffect(() => {
    if (!loading && !isDevelopmentMode) {
      if (!user) {
        // Redirect to auth page, preserving the intended destination
        navigate('/auth', { 
          state: { from: location },
          replace: true 
        });
      } else if (adminOnly && profile && profile.tipo_usuario !== 'admin') {
        // User is authenticated but doesn't have admin privileges
        navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, navigate, location, adminOnly, isDevelopmentMode]);

  // Show loading while checking authentication (exceto em modo desenvolvimento)
  if (loading && !isDevelopmentMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Em modo desenvolvimento, permita acesso direto
  if (isDevelopmentMode) {
    return <>{children}</>;
  }

  // Don't render children if user is not authenticated or doesn't have required permissions
  if (!user || (adminOnly && profile && profile.tipo_usuario !== 'admin')) {
    return null;
  }

  return <>{children}</>;
};
