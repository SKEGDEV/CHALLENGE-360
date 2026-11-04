import type { AuthAction, AuthState } from './auth.types';

export const authInitialState: AuthState = {
  idUser: null,
  roles: [],
  accessToken: null,
  refreshToken: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'auth/login':
      return { ...state, ...action.payload };
    case 'auth/logout':
      return authInitialState;
    default:
      return state;
  }
}
