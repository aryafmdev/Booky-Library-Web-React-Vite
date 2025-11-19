export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
};
export type AuthState = {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error?: string | null;
};
