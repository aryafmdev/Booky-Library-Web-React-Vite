import { http } from './http';

export type RegisterPayload = { name: string; email: string; password: string };
export type LoginPayload = { email: string; password: string };
export type AuthResponse = { token: string; user: { id: string; name: string; email: string } };

export const apiRegister = (payload: RegisterPayload) =>
  http<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const apiLogin = (payload: LoginPayload) =>
  http<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
