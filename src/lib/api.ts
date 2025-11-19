import { http } from "./http";

// Define a generic API response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Define the structure of a single book
export interface Book {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
  isbn: string;
  category: {
    id: number;
    name: string;
  };
  description: string;
  stock_available: number;
  published_year: number;
  cover_image: string;
  status: string;
}

// Define the structure for the books endpoint response data
export interface BooksResponse {
  books: Book[];
}

export type BorrowResponse = object;

export interface CategoriesResponse {
  categories: Category[];
}


// Define the structure of a single category
export interface Category {
  id: number;
  name: string;
}

// Login: hanya balikan token
export async function apiLogin(payload: { email: string; password: string }) {
  // Sesuaikan dengan respons backend kamu
  // Contoh respons: { success, message, data: { token } }
  const res = await http<ApiResponse<{ token: string }>>("/auth/login", {
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
  return http<ApiResponse<{ token: string }>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Hapus buku berdasarkan ID
export async function apiDeleteBook(bookId: number) {
  return http<ApiResponse<null>>(`/books/${bookId}`, {
    method: "DELETE",
  });
}

// Tipe data untuk payload pembaruan buku
export type UpdateBookPayload = Partial<AddBookPayload>;

// Perbarui buku berdasarkan ID
export async function apiUpdateBook(bookId: number, payload: UpdateBookPayload) {
  return http<ApiResponse<Book>>(`/books/${bookId}`, {
    method: "PATCH", // atau PUT, tergantung implementasi backend
    body: JSON.stringify(payload),
  });
}

// Ambil semua buku
export async function apiGetBooks() {
  const res = await http<ApiResponse<BooksResponse>>("/books", { method: "GET" });
  return res.data.books; // Return the nested array of books
}

// Ambil semua kategori
export async function apiGetCategories() {
  const res = await http<ApiResponse<CategoriesResponse>>("/categories", { method: "GET" });
  return res.data.categories;
}

// Ambil buku berdasarkan ID
export async function apiGetBookById(bookId: string) {
  const res = await http<ApiResponse<Book>>(`/books/${bookId}`, { method: "GET" });
  return res.data;
}

// Pinjam buku
export async function apiBorrowBook(bookId: number) {
  return http<ApiResponse<BorrowResponse>>("/borrows", {
    method: "POST",
    body: JSON.stringify({ book_id: bookId }),
  });
}

// Tipe data untuk payload penambahan buku baru
export type AddBookPayload = {
  title: string;
  author: string; // Backend diasumsikan dapat menangani nama penulis
  isbn: string;
  category_id: number;
  description: string;
  stock_available: number;
  published_year: number;
  cover_image: string;
};

// Tambah buku baru
export async function apiAddBook(payload: AddBookPayload) {
  return http<ApiResponse<Book>>("/books", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
