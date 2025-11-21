import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import BookDetail from './pages/BookDetail';
import AddBook from './pages/admin/AddBook';
import EditBook from './pages/admin/EditBook';
import AuthorDetail from './pages/AuthorDetail';
import CategoryDetail from './pages/CategoryDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import { authSuccessUser, logout } from './features/auth/authSlice';
import { setItems, clearCart } from './features/cart/cartSlice.ts';
import type { RootState, AppDispatch } from './app/store';
import { apiGetMeProfile } from './lib/api';
import type { User } from './features/auth/types';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookPreview from './pages/admin/BookPreview';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useSelector((state: RootState) => state.auth.token);
  const justLoggedOut = useSelector((state: RootState) => state.auth.justLoggedOut);

  if (!token) {
    if (justLoggedOut) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }: { children: ReactElement }) {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = !!token && !!user && (/admin/i.test(String(user?.role ?? '')) || String(user?.email ?? '').toLowerCase() === 'admin@library.local');
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function BookDetailRoute() {
  const { bookId } = useParams();
  const isValid = !!bookId && /^[0-9]+$/.test(bookId);
  return isValid ? <BookDetail /> : <Navigate to="/bookdetail" replace />;
}

function RouteGuardEffects() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const prevToken = useRef<string | null>(token);

  useEffect(() => {
    const wasLoggedIn = !!prevToken.current;
    const isLoggedIn = !!token;
    prevToken.current = token ?? null;
    if (wasLoggedIn && !isLoggedIn) {
      const allowed = new Set(['/', '/login', '/register']);
      if (!allowed.has(location.pathname)) {
        navigate('/', { replace: true });
      }
    }
  }, [token, location.pathname, navigate, dispatch]);

  useEffect(() => {
    const isAdmin = !!token && !!user && (/admin/i.test(String(user?.role ?? '')) || String(user?.email ?? '').toLowerCase() === 'admin@library.local');
    if (isAdmin && location.pathname === '/') {
      navigate('/admin?tab=borrowed', { replace: true });
    }
  }, [token, user, location.pathname, navigate]);

  return null;
}

function App() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  const normalizeUser = (raw: unknown) => {
    const r = raw as Record<string, unknown> | null | undefined;
    const id = String(
      (r?.id as string | number | undefined) ??
        (r?.user_id as string | number | undefined) ??
        (r?.uid as string | number | undefined) ??
        ''
    );
    const nameSource =
      (r?.name as string | undefined) ||
      (r?.full_name as string | undefined) ||
      (r?.username as string | undefined) ||
      '';
    const cap = (s: string) => s
      .trim()
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
      .join(' ');
    const email = String((r?.email as string | undefined) ?? '');
    const phone = (r?.phone as string | undefined) ?? undefined;
    const role = (r?.role as string | undefined) ?? undefined;
    const avatar = (r?.avatar as string | undefined) ?? undefined;
    return {
      id: id || (email ? email : '0'),
      name: cap(nameSource),
      email,
      phone,
      role,
      avatar,
    };
  };

  useEffect(() => {
    if (token) {
      const validateToken = async () => {
        try {
          const me = await apiGetMeProfile();
          const normalized = normalizeUser(me) as User;
          dispatch(authSuccessUser(normalized));
        } catch {
          dispatch(logout());
        }
      };
      validateToken();
    }
  }, [token, dispatch]);

  useEffect(() => {
    const key = `cart_items:${user?.id ?? 'guest'}`;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(key);
        const arr = raw ? (JSON.parse(raw) as Array<{ book?: { id?: number } }>) : [];
        const items = Array.isArray(arr) ? arr.map((it) => String(it.book?.id ?? '')) : [];
        dispatch(setItems(items.filter((x) => x)));
      }
    } catch {
      dispatch(setItems([]));
    }
    if (!user) {
      dispatch(clearCart());
    }
  }, [user, dispatch]);

  return (
    <BrowserRouter>
      <RouteGuardEffects />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookdetail" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
        <Route path="/books/:bookId" element={<ProtectedRoute><BookDetailRoute /></ProtectedRoute>} />
        <Route path="/authors/:authorId" element={<ProtectedRoute><AuthorDetail /></ProtectedRoute>} />
        <Route path="/authordetail" element={<ProtectedRoute><AuthorDetail /></ProtectedRoute>} />
        <Route path="/categories/:categoryId" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/books/:bookId" element={<AdminRoute><AdminBookPreview /></AdminRoute>} />
        <Route path="/admin/books/:bookId/edit" element={<AdminRoute><EditBook /></AdminRoute>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-book"
          element={
            <ProtectedRoute>
              <AddBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:bookId/edit"
          element={
            <ProtectedRoute>
              <EditBook />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
