import { redirect } from '@tanstack/react-router';
import { getAuthSnapshot } from '@store';

export function requireAuth(): void {
  if (!getAuthSnapshot().isAuthenticated) {
    throw redirect({ to: '/login' });
  }
}

export function requireRole(role: string): () => void {
  return () => {
    const snapshot = getAuthSnapshot();
    if (!snapshot.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (!snapshot.roles.includes(role)) {
      throw redirect({ to: '/' });
    }
  };
}
