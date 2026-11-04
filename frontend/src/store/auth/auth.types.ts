export interface AuthState {
  idUser: number | null;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
}

export interface LoginPayload {
  idUser: number;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}

export type AuthAction = { type: 'auth/login'; payload: LoginPayload } | { type: 'auth/logout' };
