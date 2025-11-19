import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice.ts';
import type { AuthState } from '../features/auth/types';

// Helper aman untuk baca localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch (err) {
    console.error('Failed to read token from localStorage:', err);
    return null;
  }
}

// Hydrate dari localStorage (khusus auth)
const preloadedAuth: AuthState = {
  token: getToken(),
  user: null,
  status: 'idle',
  error: null,
};

const preloadedState = { auth: preloadedAuth };

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  preloadedState,
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
