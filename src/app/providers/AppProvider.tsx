import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/cache/queryClient';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { PostgreSQLAuthProvider } from '@/hooks/usePostgreSQLAuth';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PostgreSQLAuthProvider>
          {children}
        </PostgreSQLAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
