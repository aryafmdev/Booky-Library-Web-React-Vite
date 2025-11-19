import { Suspense, type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import Home from "../pages/Home";
import BookDetail from "../pages/BookDetail";
import Register from "../pages/Register";
import Login from "../pages/Login";
import { logout } from "../features/auth/authSlice";

// Protected route
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useSelector((s: RootState) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Public only route
function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const token = useSelector((s: RootState) => s.auth.token);
  if (token) return <Navigate to="/books" replace />;
  return children;
}

// Header yang auth-aware
function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((s: RootState) => s.auth);

  return (
    <header className="w-full bg-neutral-800 text-white px-4 py-2 flex justify-between items-center">
      <h1 className="font-bold">📚 Booky</h1>
      {token && user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm">Hi, {user.name}</span>
          <button
            onClick={() => dispatch(logout())}
            className="bg-red-500 hover:bg-red-400 px-3 py-1 rounded text-sm font-bold"
          >
            Logout
          </button>
        </div>
      ) : (
        <nav className="flex gap-4 text-sm">
          <a href="/login" className="hover:underline">
            Login
          </a>
          <a href="/register" className="hover:underline">
            Register
          </a>
        </nav>
      )}
    </header>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Routes>
          {/* Home publik */}
          <Route path="/" element={<Home />} />

          {/* Book detail publik (atau bisa diproteksi sesuai kebutuhan) */}
          <Route path="/bookdetail" element={<BookDetail />} />

          {/* Register & Login hanya untuk public */}
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          {/* Protected page */}
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <div className="p-6">Books List Page</div>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
