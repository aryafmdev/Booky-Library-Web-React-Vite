import { http } from './http';

// Payload sesuai Swagger
export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

// Response sesuai Swagger
export type AuthResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'ADMIN' | 'USER';
  };
};

// Register user baru
export const apiRegister = (payload: RegisterPayload) =>
  http<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// Login user
export const apiLogin = (payload: LoginPayload) =>
  http<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
