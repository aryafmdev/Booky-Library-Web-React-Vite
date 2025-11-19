import { store } from '../app/store';

const BASE_URL = import.meta.env.VITE_API_URL;

// Helper ambil token dari Redux
function getToken(): string | null {
  try {
    const state = store.getState();
    return state.auth.token;
  } catch {
    return null;
  }
}

export async function http<T>(
  path: string,
  opts: RequestInit = {},
  token?: string | null // tetap opsional, override jika perlu
): Promise<T> {
  // siapkan headers default + merge dengan custom headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };

  // ambil token dari argumen atau Redux
  const authToken = token ?? getToken();
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
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
