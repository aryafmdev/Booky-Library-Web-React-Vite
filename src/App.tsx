import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import BookDetail from './pages/BookDetail';
import BookList from './pages/BookList';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import { authSuccessUser, logout } from './features/auth/authSlice';
import type { RootState, AppDispatch } from './app/store';

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
        <Route path="/books/:bookId" element={<BookDetail />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/books/:bookId/edit" element={<EditBook />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
