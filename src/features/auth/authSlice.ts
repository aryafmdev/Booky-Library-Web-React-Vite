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
  justLoggedOut: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    authSuccessToken(state, action: PayloadAction<string>) {
      state.status = 'authenticated';
      state.token = action.payload;
      state.justLoggedOut = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload);
      }
    },
    authSuccessUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.justLoggedOut = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.status = 'authenticated';
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.justLoggedOut = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
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
      state.justLoggedOut = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    clearJustLoggedOut(state) {
      state.justLoggedOut = false;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
});

export const {
  authStart,
  authSuccessToken,
  authSuccessUser,
  setCredentials,
  authError,
  logout,
  clearJustLoggedOut,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;
