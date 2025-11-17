const BASE_URL = import.meta.env.VITE_API_URL;

export async function http<T>(
  path: string,
  opts: RequestInit = {},
  token?: string | null
): Promise<T> {
  // siapkan headers default + merge dengan custom headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };

  // tambahkan Authorization jika ada token
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // lakukan request
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  const text = await res.text();

  // error handling
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  // parse JSON jika ada body, kalau kosong return object kosong
  return text ? (JSON.parse(text) as T) : ({} as T);
}
