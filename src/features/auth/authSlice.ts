import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './types';

const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
const user = storedUser ? JSON.parse(storedUser) : null;
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const initialState: AuthState = {
  token,
  user,
  status: token && user ? 'authenticated' : 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    // Simpan token dulu (login/register)
    authSuccessToken(state, action: PayloadAction<string>) {
      state.status = 'authenticated';
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload);
      }
    },
    // Simpan user setelah panggil /me
    authSuccessUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    authError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    logout(state) {
      state.status = 'idle';
      state.token = null;
      state.user = null;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    // optional: update user info manual
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
});

export const {
  authStart,
  authSuccessToken,
  authSuccessUser,
  authError,
  logout,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;
