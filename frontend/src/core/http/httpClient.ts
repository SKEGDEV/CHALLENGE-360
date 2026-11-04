import { env } from '@core/config';
import { ApiError } from './ApiError';

type Params = Record<string, string | number | boolean | undefined>;
interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Params;
  body?: unknown;
}

async function request<T>(path: string, { params, body, headers, ...init }: RequestOptions = {}): Promise<T> {
  const query = params
    ? '?' +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      )
    : '';
  const res = await fetch(`${env.apiUrl}${path}${query}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, res.statusText, await res.json().catch(() => undefined));
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const http = {
  get: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'GET' }),
  post: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, { ...o, method: 'POST', body: b }),
  put: <T>(p: string, b?: unknown, o?: RequestOptions) => request<T>(p, { ...o, method: 'PUT', body: b }),
  delete: <T>(p: string, o?: RequestOptions) => request<T>(p, { ...o, method: 'DELETE' }),
};
