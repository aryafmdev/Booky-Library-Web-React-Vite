import { Suspense, type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import Register from '../pages/Register';
import Login from '../pages/Login';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = useSelector((s: RootState) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const token = useSelector((s: RootState) => s.auth.token);
  if (token) return <Navigate to="/books" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Routes>
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
          {/* Contoh protected page */}
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <div className="p-6">Books List Page</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
