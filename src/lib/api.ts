import { http } from "./http";

// Login: hanya balikan token
export async function apiLogin(payload: { email: string; password: string }) {
  // Sesuaikan dengan respons backend kamu
  // Contoh respons: { success, message, data: { token } }
  const res = await http<{
    success: boolean;
    message: string;
    data: { token: string };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return { token: res.data.token };
}

// Ambil profil user setelah login
export async function apiMe(token: string) {
  // Sesuaikan path dengan backend kamu (misalnya /auth/me atau /me)
  return http<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    avatar?: string;
  }>("/auth/me", { method: "GET" }, token);
}

// Register user baru
export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export async function apiRegister(payload: RegisterPayload) {
  // Sesuaikan dengan respons backend kamu
  // Contoh respons: { success, message, data: { token } }
  return http<{
    success: boolean;
    message: string;
    data: { token: string };
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
