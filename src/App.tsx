import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import BookDetail from './pages/BookDetail';
import BookList from './pages/BookList';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import AuthorDetail from './pages/AuthorDetail';
import CategoryDetail from './pages/CategoryDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import { authSuccessUser, logout } from './features/auth/authSlice';
import type { RootState, AppDispatch } from './app/store';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function BookDetailRoute() {
  const { bookId } = useParams();
  const isValid = !!bookId && /^[0-9]+$/.test(bookId);
  return isValid ? <BookDetail /> : <Navigate to="/bookdetail" replace />;
}

function App() {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (token) {
      const validateToken = async () => {
        try {
          const response = await fetch(
            'https://be-library-api-xh3x6c5iiq-et.a.run.app/api/me',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Sesi tidak valid');
          }

          const userData = await response.json();
          dispatch(authSuccessUser(userData.data));
        } catch {
          // Jika token tidak valid, logout
          dispatch(logout());
        }
      };

      validateToken();
    }
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/bookdetail" element={<BookDetail />} />
        <Route path="/books/:bookId" element={<BookDetailRoute />} />
        <Route path="/authors/:authorId" element={<AuthorDetail />} />
        <Route path="/categories/:categoryId" element={<CategoryDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
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
