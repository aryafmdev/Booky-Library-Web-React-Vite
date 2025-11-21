import { http } from './http';

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
  const res = await http<ApiResponse<{ token: string }>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return { token: res.data.token };
}

// Ambil profil user setelah login
type MeUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
};

export async function apiMe(token: string) {
  const res = await http<unknown>('/auth/me', { method: 'GET' }, token);
  const raw = res as Record<string, unknown>;
  const dataLayer = ((): Record<string, unknown> => {
    const d = (raw && 'success' in raw && 'data' in raw ? (raw.data as Record<string, unknown>) : raw) as Record<string, unknown>;
    if (d && 'user' in d && typeof (d as Record<string, unknown>).user === 'object') {
      return (d as Record<string, unknown>).user as Record<string, unknown>;
    }
    if (d && 'profile' in d && typeof (d as Record<string, unknown>).profile === 'object') {
      return (d as Record<string, unknown>).profile as Record<string, unknown>;
    }
    return d;
  })();
  const id = String(
    (dataLayer?.id as string | number | undefined) ??
      (dataLayer?.user_id as string | number | undefined) ??
      (dataLayer?.uid as string | number | undefined) ??
      ''
  );
  const nameSrc = (dataLayer?.name as string | undefined) ?? (dataLayer?.full_name as string | undefined) ?? (dataLayer?.username as string | undefined) ?? '';
  const cap = (s: string) => s.trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '')).join(' ');
  const email = String((dataLayer?.email as string | undefined) ?? '');
  const phone = (dataLayer?.phone as string | undefined) ?? undefined;
  const roleRaw = (dataLayer?.role as string | undefined) ?? undefined;
  const isAdminFlag = Boolean(
    (dataLayer?.is_admin as boolean | undefined) ||
      (dataLayer?.admin as boolean | undefined) ||
      (dataLayer?.isAdmin as boolean | undefined)
  );
  const role = roleRaw ?? (isAdminFlag ? 'admin' : undefined);
  const avatar = (dataLayer?.avatar as string | undefined) ?? undefined;
  const user: MeUser = { id: id || (email ? email : '0'), name: cap(nameSrc), email, phone, role, avatar };
  return user;
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
  return http<ApiResponse<{ token: string }>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Forgot password
export async function apiForgotPassword(payload: { email: string }) {
  return http<ApiResponse<unknown>>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Authors
export async function apiGetAuthors() {
  const res = await http<ApiResponse<{ authors: Author[] }>>('/authors', {
    method: 'GET',
  });
  return res.data.authors;
}

export async function apiGetAuthorById(authorId: string) {
  const res = await http<ApiResponse<Author>>(`/authors/${authorId}`, {
    method: 'GET',
  });
  return res.data;
}

export async function apiGetBooksByAuthor(authorId: number | string) {
  const res = await http<ApiResponse<BooksResponse>>(
    `/authors/${authorId}/books`,
    { method: 'GET' }
  );
  return res.data.books;
}

// Category detail
export async function apiGetCategoryById(categoryId: string) {
  const res = await http<ApiResponse<Category>>(`/categories/${categoryId}`, {
    method: 'GET',
  });
  return res.data;
}

// Hapus buku berdasarkan ID
export async function apiDeleteBook(bookId: number) {
  return http<ApiResponse<null>>(`/books/${bookId}`, {
    method: 'DELETE',
  });
}

// Tipe data untuk payload pembaruan buku
export type UpdateBookPayload = Partial<AddBookPayload>;

// Perbarui buku berdasarkan ID
export async function apiUpdateBook(
  bookId: number,
  payload: UpdateBookPayload
) {
  return http<ApiResponse<Book>>(`/books/${bookId}`, {
    method: 'PATCH', // atau PUT, tergantung implementasi backend
    body: JSON.stringify(payload),
  });
}

// Ambil semua buku
export async function apiGetBooks() {
  const res = await http<ApiResponse<BooksResponse>>('/books', {
    method: 'GET',
  });
  return res.data.books; // Return the nested array of books
}

export type GetBooksParams = {
  page?: number;
  limit?: number;
  q?: string;
  category_id?: number;
  author_id?: number;
  status?: string;
  sort?: string;
  rating_min?: number;
  rating_max?: number;
};

export async function apiGetBooksPaged(params: GetBooksParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.q) query.set('q', params.q);
  if (params.category_id) query.set('category_id', String(params.category_id));
  if (params.author_id) query.set('author_id', String(params.author_id));
  if (params.status) query.set('status', params.status);
  if (params.sort) query.set('sort', params.sort);
  if (params.rating_min) query.set('rating_min', String(params.rating_min));
  if (params.rating_max) query.set('rating_max', String(params.rating_max));
  const res = await http<ApiResponse<BooksResponse>>(
    `/books?${query.toString()}`,
    { method: 'GET' }
  );
  return res.data.books;
}

export async function apiGetRecommendedBooks() {
  const res = await http<ApiResponse<BooksResponse>>('/books/recommend', {
    method: 'GET',
  });
  return res.data.books;
}

export async function apiSearchBooks(q: string) {
  const res = await http<ApiResponse<BooksResponse>>(
    `/books/search?q=${encodeURIComponent(q)}`,
    { method: 'GET' }
  );
  return res.data.books;
}

// Ambil semua kategori
export async function apiGetCategories() {
  const res = await http<ApiResponse<CategoriesResponse>>('/categories', {
    method: 'GET',
  });
  return res.data.categories;
}

// Ambil buku berdasarkan ID
export async function apiGetBookById(bookId: string) {
  const res = await http<ApiResponse<Book | Record<string, unknown>>>(
    `/books/${bookId}`,
    { method: 'GET' }
  );
  const raw =
    (res as ApiResponse<Record<string, unknown>>)?.data ??
    (res as unknown as Record<string, unknown>);
  const r = raw as Record<string, unknown>;
  const author = ((): { id: number; name: string } => {
    const obj = r.author as Record<string, unknown> | undefined;
    const id = Number(
      (obj?.id as number | string | undefined) ??
        (r.author_id as number | string | undefined) ??
        0
    );
    const name = String(
      (obj?.name as string | undefined) ??
        (r.author_name as string | undefined) ??
        (r.author as string | undefined) ??
        ''
    );
    return { id, name };
  })();
  const category = ((): { id: number; name: string } => {
    const obj = r.category as Record<string, unknown> | undefined;
    const id = Number(
      (obj?.id as number | string | undefined) ??
        (r.category_id as number | string | undefined) ??
        0
    );
    const name = String(
      (obj?.name as string | undefined) ??
        (r.category_name as string | undefined) ??
        (r.category as string | undefined) ??
        ''
    );
    return { id, name };
  })();
  const id = Number((r.id as number | string | undefined) ?? 0);
  const title = String((r.title as string | undefined) ?? '');
  const isbn = String((r.isbn as string | undefined) ?? '');
  const description = String((r.description as string | undefined) ?? '');
  const stock_available = Number(
    (r.stock_available as number | string | undefined) ?? 0
  );
  const published_year = Number(
    (r.published_year as number | string | undefined) ??
      new Date().getFullYear()
  );
  const cover_image = String((r.cover_image as string | undefined) ?? '');
  const status = String((r.status as string | undefined) ?? '');
  return {
    id,
    title,
    author,
    isbn,
    category,
    description,
    stock_available,
    published_year,
    cover_image,
    status,
  } as Book;
}

// Pinjam buku
export async function apiBorrowBook(bookId: number) {
  return http<ApiResponse<BorrowResponse>>('/borrows', {
    method: 'POST',
    body: JSON.stringify({ book_id: bookId }),
  });
}

export async function apiCreateLoan(bookId: number) {
  return http<ApiResponse<Loan>>('/loans', {
    method: 'POST',
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
  return http<ApiResponse<Book>>('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Cart types
export interface CartItem {
  id: number;
  book: Book;
  qty: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal?: number;
  grandTotal?: number;
}

// GET /api/cart
export async function apiGetCart() {
  const res = await http<ApiResponse<CartResponse>>('/cart', { method: 'GET' });
  return res.data.items;
}

// POST /api/cart
export async function apiAddCartItem(bookId: number, qty: number = 1) {
  return http<ApiResponse<CartResponse>>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ book_id: bookId, qty }),
  });
}

// DELETE /api/cart/{bookId}
export async function apiDeleteCartItem(itemId: number) {
  return http<ApiResponse<CartResponse>>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export async function apiUpdateCartItemQty(itemId: number, qty: number) {
  return http<ApiResponse<CartResponse>>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ qty }),
  });
}

export async function apiClearCart() {
  return http<ApiResponse<CartResponse>>('/cart', { method: 'DELETE' });
}

// POST /api/cart/checkout
export async function apiCheckoutCart(bookIds: number[]) {
  return http<ApiResponse<{ success: boolean }>>('/cart/checkout', {
    method: 'POST',
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

export type UpdateMePayload = Partial<
  Pick<MeProfile, 'name' | 'phone' | 'avatar'>
>;

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

export type LoanStatus = 'Active' | 'Returned' | 'Overdue' | string;
export type AdminCreateLoanPayload = {
  book_id: number;
  user_id?: number;
  due_at?: string;
};
export type AdminUpdateLoanPayload = {
  due_at?: string;
  status?: LoanStatus;
};
export interface AdminOverview {
  totals: {
    users: number;
    books: number;
    authors: number;
    categories: number;
  };
  active_loans: number;
  overdue_loans: number;
  top_borrowed_books: { book: Book; count: number }[];
}

export async function apiGetMeProfile() {
  const parse = (res: ApiResponse<MeProfile> | MeProfile) => {
    const raw = res as unknown as Record<string, unknown>;
    let data = (raw && 'success' in raw && 'data' in raw ? (raw.data as Record<string, unknown>) : raw) as Record<string, unknown>;
    if (data && 'user' in data && typeof (data as Record<string, unknown>).user === 'object') {
      data = (data as Record<string, unknown>).user as Record<string, unknown>;
    }
    if (data && 'profile' in data && typeof (data as Record<string, unknown>).profile === 'object') {
      data = (data as Record<string, unknown>).profile as Record<string, unknown>;
    }
    const id =
      (data?.id as string | number | undefined) ??
      (data?.user_id as string | number | undefined) ??
      (data?.uid as string | number | undefined) ??
      '';
    const nameSrc =
      (data?.name as string | undefined) ??
      (data?.full_name as string | undefined) ??
      (data?.username as string | undefined) ??
      '';
    const cap = (s: string) =>
      s
        .trim()
        .split(/\s+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
        .join(' ');
    const email = String((data?.email as string | undefined) ?? '');
    const phone = (data?.phone as string | undefined) ?? undefined;
    const avatar = (data?.avatar as string | undefined) ?? undefined;
    const roleRaw = (data?.role as string | undefined) ?? undefined;
    const isAdminFlag = Boolean(
      (data?.is_admin as boolean | undefined) ||
        (data?.admin as boolean | undefined) ||
        (data?.isAdmin as boolean | undefined)
    );
    const role = roleRaw ?? (isAdminFlag ? 'admin' : undefined);
    return {
      id: id || (email ? email : '0'),
      name: cap(nameSrc),
      email,
      phone,
      role,
      avatar,
    } as MeProfile;
  };
  try {
    const res = await http<ApiResponse<MeProfile> | MeProfile>('/me', {
      method: 'GET',
    });
    return parse(res);
  } catch {
    const res2 = await http<ApiResponse<MeProfile> | MeProfile>('/auth/me', {
      method: 'GET',
    });
    return parse(res2);
  }
}

export async function apiUpdateMeProfile(payload: UpdateMePayload) {
  const res = await http<ApiResponse<MeProfile>>('/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function apiGetMyLoans() {
  const res = await http<ApiResponse<{ loans: Loan[] }>>('/me/loans', {
    method: 'GET',
  });
  return res.data.loans;
}

export async function apiGetMyLoansV2() {
  const res = await http<ApiResponse<{ loans: Loan[] }>>('/loans/my', {
    method: 'GET',
  });
  return res.data.loans;
}

export async function apiReturnLoan(loanId: number) {
  return http<ApiResponse<Loan>>(`/loans/${loanId}/return`, {
    method: 'PATCH',
  });
}

export async function apiGetMyReviews() {
  const res = await http<ApiResponse<{ reviews: Review[] }>>('/me/reviews', {
    method: 'GET',
  });
  return res.data.reviews;
}

export async function apiAdminCreateLoan(payload: AdminCreateLoanPayload) {
  return http<ApiResponse<Loan>>('/admin/loans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiAdminUpdateLoan(
  loanId: number,
  payload: AdminUpdateLoanPayload
) {
  return http<ApiResponse<Loan>>(`/admin/loans/${loanId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function apiAdminGetOverdueLoans() {
  const res = await http<ApiResponse<{ loans: Loan[] }>>(
    '/admin/loans/overdue',
    { method: 'GET' }
  );
  return res.data.loans;
}

export async function apiAdminGetOverview() {
  const res = await http<ApiResponse<AdminOverview>>('/admin/overview', {
    method: 'GET',
  });
  return res.data;
}

export type AuthorCreatePayload = {
  name: string;
  avatar?: string;
};
export type AuthorUpdatePayload = Partial<AuthorCreatePayload>;

export async function apiAdminCreateAuthor(payload: AuthorCreatePayload) {
  return http<ApiResponse<Author>>('/authors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiAdminUpdateAuthor(
  authorId: number | string,
  payload: AuthorUpdatePayload
) {
  return http<ApiResponse<Author>>(`/authors/${authorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function apiAdminDeleteAuthor(authorId: number | string) {
  return http<ApiResponse<null>>(`/authors/${authorId}`, { method: 'DELETE' });
}

export type CategoryCreatePayload = {
  name: string;
};
export type CategoryUpdatePayload = Partial<CategoryCreatePayload>;

export async function apiAdminCreateCategory(payload: CategoryCreatePayload) {
  return http<ApiResponse<Category>>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiAdminUpdateCategory(
  categoryId: number | string,
  payload: CategoryUpdatePayload
) {
  return http<ApiResponse<Category>>(`/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function apiAdminDeleteCategory(categoryId: number | string) {
  return http<ApiResponse<null>>(`/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export async function apiAdminDeleteBook(bookId: number) {
  return http<ApiResponse<null>>(`/books/${bookId}`, { method: 'DELETE' });
}

// Reviews endpoints
export type UpsertReviewPayload = {
  book_id: number;
  rating: number;
  comment?: string;
  id?: number;
};

export async function apiUpsertReview(payload: UpsertReviewPayload) {
  return http<ApiResponse<Review>>('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGetReviewsByBook(bookId: number) {
  const res = await http<ApiResponse<{ reviews: Review[] }>>(
    `/reviews/book/${bookId}`,
    { method: 'GET' }
  );
  return res.data.reviews;
}

export async function apiDeleteReview(reviewId: number) {
  return http<ApiResponse<null>>(`/reviews/${reviewId}`, { method: 'DELETE' });
}
