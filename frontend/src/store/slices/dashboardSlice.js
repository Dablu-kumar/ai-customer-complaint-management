import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showNotification } from './notificationSlice';

const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`, getHeaders());
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch dashboard metrics';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  stats: {
    total_complaints: 0,
    open_complaints: 0,
    closed_complaints: 0,
    risk_distribution: { high: 0, medium: 0, low: 0 },
    status_distribution: { open: 0, under_investigation: 0, capa_pending: 0, closed: 0 },
    recent_complaints: [],
    monthly_trends: []
  },
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default dashboardSlice.reducer;
