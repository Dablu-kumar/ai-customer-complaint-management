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

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async (params = {}, { dispatch, rejectWithValue }) => {
    try {
      const { search, complaint_type, severity, risk_level, status } = params;
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (complaint_type) queryParams.append('complaint_type', complaint_type);
      if (severity) queryParams.append('severity', severity);
      if (risk_level) queryParams.append('risk_level', risk_level);
      if (status) queryParams.append('status', status);

      const response = await axios.get(`${API_URL}/complaints?${queryParams.toString()}`, getHeaders());
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch complaints';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/complaints/${id}`, getHeaders());
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch complaint details';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/create',
  async (complaintData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/complaints`, complaintData, getHeaders());
      dispatch(showNotification({ message: 'Complaint registered successfully', type: 'success' }));
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create complaint';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateComplaint = createAsyncThunk(
  'complaints/update',
  async ({ id, updateData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/complaints/${id}`, updateData, getHeaders());
      dispatch(showNotification({ message: 'Complaint updated successfully', type: 'success' }));
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update complaint';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteComplaint = createAsyncThunk(
  'complaints/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/complaints/${id}`, getHeaders());
      dispatch(showNotification({ message: 'Complaint deleted successfully', type: 'success' }));
      return id;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete complaint';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const submitRiskAssessment = createAsyncThunk(
  'complaints/submitRisk',
  async ({ id, riskData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/complaints/${id}/risk`, riskData, getHeaders());
      dispatch(showNotification({ message: 'Risk assessment submitted successfully', type: 'success' }));
      return { id, assessment: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to submit risk assessment';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  list: [],
  selectedComplaint: null,
  loading: false,
  error: null
};

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selectedComplaint = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By Id
      .addCase(fetchComplaintById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedComplaint = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // Update
      .addCase(updateComplaint.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.selectedComplaint && state.selectedComplaint.id === action.payload.id) {
          state.selectedComplaint = action.payload;
        }
      })
      // Delete
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c.id !== action.payload);
        if (state.selectedComplaint && state.selectedComplaint.id === action.payload) {
          state.selectedComplaint = null;
        }
      })
      // Risk Assessment
      .addCase(submitRiskAssessment.fulfilled, (state, action) => {
        if (state.selectedComplaint && state.selectedComplaint.id === action.payload.id) {
          state.selectedComplaint.risk_assessments.unshift(action.payload.assessment);
          // Let's refetch or update risk variables
          const r = action.payload.assessment;
          state.selectedComplaint.risk_level = r.risk_priority_number >= 15 ? 'High' : (r.risk_priority_number >= 8 ? 'Medium' : 'Low');
          state.selectedComplaint.severity = r.severity_score >= 4 ? (r.severity_score === 5 ? 'Critical' : 'Major') : 'Minor';
        }
      });
  }
});

export const { clearSelected } = complaintSlice.actions;
export default complaintSlice.reducer;
