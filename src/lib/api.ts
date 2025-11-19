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

export interface Author {
  id: number | string;
  name: string;
  avatar?: string;
  books?: number;
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

// Forgot password
export async function apiForgotPassword(payload: { email: string }) {
  return http<ApiResponse<unknown>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Authors
export async function apiGetAuthors() {
  const res = await http<ApiResponse<{ authors: Author[] }>>('/authors', { method: 'GET' });
  return res.data.authors;
}

export async function apiGetAuthorById(authorId: string) {
  const res = await http<ApiResponse<Author>>(`/authors/${authorId}`, { method: 'GET' });
  return res.data;
}

// Category detail
export async function apiGetCategoryById(categoryId: string) {
  const res = await http<ApiResponse<Category>>(`/categories/${categoryId}`, { method: 'GET' });
  return res.data;
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

export async function apiSearchBooks(q: string) {
  const res = await http<ApiResponse<BooksResponse>>(`/books/search?q=${encodeURIComponent(q)}`, { method: "GET" });
  return res.data.books;
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

// Cart types
export interface CartItem {
  book: Book;
}

export interface CartResponse {
  items: CartItem[];
}

// GET /api/cart
export async function apiGetCart() {
  const res = await http<ApiResponse<CartResponse>>("/cart", { method: "GET" });
  return res.data.items;
}

// POST /api/cart
export async function apiAddToCart(bookId: number) {
  return http<ApiResponse<CartResponse>>("/cart", {
    method: "POST",
    body: JSON.stringify({ book_id: bookId }),
  });
}

// DELETE /api/cart/{bookId}
export async function apiRemoveFromCart(bookId: number) {
  return http<ApiResponse<CartResponse>>(`/cart/${bookId}`, { method: "DELETE" });
}

// POST /api/cart/checkout
export async function apiCheckoutCart(bookIds: number[]) {
  return http<ApiResponse<{ success: boolean }>>("/cart/checkout", {
    method: "POST",
    body: JSON.stringify({ book_ids: bookIds }),
  });
}

// Me endpoints
export interface MeProfile {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export type UpdateMePayload = Partial<Pick<MeProfile, 'name' | 'phone' | 'avatar'>>;

export interface Loan {
  id: number;
  book: Book;
  borrowed_at?: string;
  due_at?: string;
  status?: string;
}

export interface Review {
  id: number;
  book: Book;
  rating: number;
  comment?: string;
  created_at?: string;
}

export async function apiGetMeProfile() {
  const res = await http<ApiResponse<MeProfile>>("/me", { method: "GET" });
  return res.data;
}

export async function apiUpdateMeProfile(payload: UpdateMePayload) {
  const res = await http<ApiResponse<MeProfile>>("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function apiGetMyLoans() {
  const res = await http<ApiResponse<{ loans: Loan[] }>>("/me/loans", { method: "GET" });
  return res.data.loans;
}

export async function apiGetMyReviews() {
  const res = await http<ApiResponse<{ reviews: Review[] }>>("/me/reviews", { method: "GET" });
  return res.data.reviews;
}

// Reviews endpoints
export type UpsertReviewPayload = {
  book_id: number;
  rating: number;
  comment?: string;
  id?: number;
};

export async function apiUpsertReview(payload: UpsertReviewPayload) {
  return http<ApiResponse<Review>>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiGetReviewsByBook(bookId: number) {
  const res = await http<ApiResponse<{ reviews: Review[] }>>(`/reviews/book/${bookId}`, { method: "GET" });
  return res.data.reviews;
}

export async function apiDeleteReview(reviewId: number) {
  return http<ApiResponse<null>>(`/reviews/${reviewId}`, { method: "DELETE" });
}
