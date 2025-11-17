import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from './types';

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: null,
  status: 'idle',
  error: null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    authSuccess(state, action: PayloadAction<{ token: string; user: User }>) {
      state.status = 'authenticated';
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
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
      localStorage.removeItem('token');
    },
  },
});

export const { authStart, authSuccess, authError, logout } = slice.actions;
export default slice.reducer;
