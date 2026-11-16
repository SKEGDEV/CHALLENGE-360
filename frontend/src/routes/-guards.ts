import { redirect } from '@tanstack/react-router';
import { getAuthSnapshot, getSelection, type SelectionState } from '@store';

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

/**
 * Exige que exista un id seleccionado en el estado global; si se perdió
 * (p. ej. al recargar la pagina) redirige a la pagina padre.
 */
export function requireSelection(select: (s: SelectionState) => unknown, fallback: string): () => void {
  return () => {
    const value = select(getSelection());
    if (value === null || value === undefined) {
      throw redirect({ to: fallback });
    }
  };
}
