const PREFIX = 'app';
interface Envelope<T> {
  v: number;
  data: T;
}

export const storage = {
  read<T>(key: string, version: number): T | null {
    try {
      const raw = localStorage.getItem(`${PREFIX}:${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Envelope<T>;
      return parsed.v === version ? parsed.data : null;
    } catch {
      return null;
    }
  },
  write<T>(key: string, version: number, data: T): void {
    try {
      localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify({ v: version, data } satisfies Envelope<T>));
    } catch {
      /* quota or private mode */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(`${PREFIX}:${key}`);
    } catch {
      /* noop */
    }
  },
};
