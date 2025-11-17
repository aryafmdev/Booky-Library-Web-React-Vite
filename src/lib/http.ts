const BASE_URL = import.meta.env.VITE_API_URL;

export async function http<T>(
  path: string,
  opts: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? JSON.parse(text) : ({} as T);
}
