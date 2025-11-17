export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'USER';
};
export type AuthState = {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error?: string | null;
};
