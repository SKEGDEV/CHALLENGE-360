import { env } from '@core/config';
import { ApiError, type ApiErrorBody } from './ApiError';
import { readAuthSession, writeAuthSession } from './authSession';

type Params = Record<string, string | number | boolean | undefined>;
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  params?: Params;
  body?: unknown;
}

interface RefreshSessionPayload {
  accessToken: string;
  refreshToken: string;
}

function extractRefreshSession(data: unknown): RefreshSessionPayload | null {
  if (!data || typeof data !== 'object' || !('refreshSession' in data)) return null;
  const refreshSession = (data as { refreshSession?: unknown }).refreshSession;
  if (!refreshSession || typeof refreshSession !== 'object') return null;
  const { accessToken, refreshToken } = refreshSession as Partial<RefreshSessionPayload>;
  return typeof accessToken === 'string' && typeof refreshToken === 'string'
    ? { accessToken, refreshToken }
    : null;
}

async function request<T>(path: string, method: Method, { params, body, headers, ...init }: RequestOptions = {}): Promise<T> {
  const query = params
    ? '?' +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      )
    : '';

  const session = readAuthSession();
  const authHeaders: Record<string, string> = session
    ? { Authorization: `Bearer ${session.accessToken}`, 'x-refresh-token': session.refreshToken }
    : {};

  const res = await fetch(`${env.apiUrl}${path}${query}`, {
    ...init,
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => undefined)) as ApiErrorBody | undefined;
    throw new ApiError(res.status, res.statusText, errorBody);
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (session) {
    const rotated = extractRefreshSession(json?.data);
    if (rotated) writeAuthSession({ ...session, ...rotated });
  }
  return json as T;
}

export const http = {
  get: <T>(p: string, o?: RequestOptions) => request<T>(p, 'GET', o),
  post: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, 'POST', { ...o, body: b }),
  put: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, 'PUT', { ...o, body: b }),
  patch: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, 'PATCH', { ...o, body: b }),
  delete: <T>(p: string, o?: RequestOptions) => request<T>(p, 'DELETE', o),
};
