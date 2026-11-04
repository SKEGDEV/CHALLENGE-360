import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StoreProvider } from '@store';
import { queryClient } from './queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>{children}</StoreProvider>
    </QueryClientProvider>
  );
}
