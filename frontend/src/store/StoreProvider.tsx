import type { ReactNode } from 'react';
import { AuthProvider } from './auth';
import { CartProvider } from './cart';

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
