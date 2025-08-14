import { QueryClient } from '@tanstack/react-query';

// Configurações globais para o React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Prefixos padrão para chaves de cache
export const QueryKeys = {
  user: {
    all: ['users'] as const,
    profile: (id: string) => [...QueryKeys.user.all, id] as const,
    preferences: (id: string) => [...QueryKeys.user.profile(id), 'preferences'] as const,
  },
  feed: {
    all: ['feed'] as const,
    post: (id: string) => [...QueryKeys.feed.all, id] as const,
    comments: (postId: string) => [...QueryKeys.feed.post(postId), 'comments'] as const,
  },
  auth: {
    session: ['auth', 'session'] as const,
    token: ['auth', 'token'] as const,
  },
} as const;
