import { storage } from '@core/storage';

export const AUTH_STORAGE_KEY = 'auth';
export const AUTH_STORAGE_VERSION = 1;

export interface PersistedAuthSession {
  idUser: number;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}

export function readAuthSession(): PersistedAuthSession | null {
  const session = storage.read<PersistedAuthSession>(AUTH_STORAGE_KEY, AUTH_STORAGE_VERSION);
  return session?.accessToken ? session : null;
}

export function writeAuthSession(session: PersistedAuthSession): void {
  storage.write(AUTH_STORAGE_KEY, AUTH_STORAGE_VERSION, session);
}

export function clearAuthSession(): void {
  storage.remove(AUTH_STORAGE_KEY);
}
