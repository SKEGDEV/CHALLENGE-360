import type { ReactNode } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

// No slices yet: nests each slice provider here as the feature-builder skill adds one.
export function StoreProvider({ children }: StoreProviderProps) {
  return <>{children}</>;
}
