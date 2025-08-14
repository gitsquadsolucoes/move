import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

// Configurações globais de cache
export const cacheConfig = {
  auth: {
    staleTime: 30 * 60 * 1000, // 30 minutos para dados de autenticação
    cacheTime: 60 * 60 * 1000, // 1 hora
  },
  feed: {
    staleTime: 2 * 60 * 1000, // 2 minutos para feed
    cacheTime: 10 * 60 * 1000, // 10 minutos
  },
  user: {
    staleTime: 10 * 60 * 1000, // 10 minutos para dados de usuário
    cacheTime: 30 * 60 * 1000, // 30 minutos
  },
};
