import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showNotification } from './notificationSlice';

const API_URL = 'http://localhost:8000/api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch(showNotification({ message: `Welcome back, ${user.full_name || user.username}!`, type: 'success' }));
      return { token: access_token, user };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Login failed';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (e) {
      // Mock logout is safe even if backend is offline
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(showNotification({ message: 'Logged out successfully', type: 'info' }));
    return null;
  }
);

const token = localStorage.getItem('token') || null;
let user = null;
try {
  const savedUser = localStorage.getItem('user');
  if (savedUser) user = JSON.parse(savedUser);
} catch (e) {
  localStorage.removeItem('user');
}

const initialState = {
  token,
  user,
  loading: false,
  error: null,
  isAuthenticated: !!token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
