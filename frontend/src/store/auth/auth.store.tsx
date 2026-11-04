import { useCallback } from 'react';
import { readAuthSession } from '@core';
import { createStore } from '@store/createStore';
import { authInitialState, authReducer } from './auth.reducer';
import type { LoginPayload } from './auth.types';

const { StoreProvider, useStoreState, useStoreDispatch } = createStore({
  name: 'auth',
  version: 1,
  reducer: authReducer,
  initialState: authInitialState,
});

export { StoreProvider as AuthProvider };

export function useAuth() {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const login = useCallback(
    (payload: LoginPayload) => {
      dispatch({ type: 'auth/login', payload });
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    dispatch({ type: 'auth/logout' });
  }, [dispatch]);

  return {
    idUser: state.idUser,
    roles: state.roles,
    isAuthenticated: state.accessToken !== null,
    hasRole: (role: string) => state.roles.includes(role),
    login,
    logout,
  };
}

/**
 * Reads the persisted session directly from storage, outside React.
 * Routes are configuration-only and run `beforeLoad` outside the render tree,
 * so guards cannot call the `useAuth` hook.
 */
export function getAuthSnapshot(): { isAuthenticated: boolean; roles: string[]; idUser: number | null } {
  const session = readAuthSession();
  return {
    isAuthenticated: session !== null,
    roles: session?.roles ?? [],
    idUser: session?.idUser ?? null,
  };
}
