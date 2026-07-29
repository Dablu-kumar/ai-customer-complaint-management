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

export const uploadDocument = createAsyncThunk(
  'ai/uploadDoc',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(showNotification({ message: 'Document uploaded successfully', type: 'success' }));
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Document upload failed';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const analyzeUploadedDocument = createAsyncThunk(
  'ai/analyzeDoc',
  async ({ file_path, file_type, file_name }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/ai/analyze`, {
        file_path,
        file_type,
        file_name
      }, getHeaders());
      dispatch(showNotification({ message: 'AI Analysis complete', type: 'success' }));
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'AI Document analysis failed';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

export const analyzeTextInput = createAsyncThunk(
  'ai/analyzeText',
  async (text, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/ai/analyze/text`, { text }, getHeaders());
      dispatch(showNotification({ message: 'AI Text Analysis complete', type: 'success' }));
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'AI Text analysis failed';
      dispatch(showNotification({ message: errorMsg, type: 'error' }));
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  uploadState: {
    fileName: null,
    savedName: null,
    filePath: null,
    fileType: null,
    loading: false,
    error: null
  },
  aiOutput: null,
  loading: false,
  error: null
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIState: (state) => {
      state.uploadState = initialState.uploadState;
      state.aiOutput = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload Doc
      .addCase(uploadDocument.pending, (state) => {
        state.uploadState.loading = true;
        state.uploadState.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploadState.loading = false;
        state.uploadState.fileName = action.payload.file_name;
        state.uploadState.savedName = action.payload.saved_name;
        state.uploadState.filePath = action.payload.file_path;
        state.uploadState.fileType = action.payload.file_type;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploadState.loading = false;
        state.uploadState.error = action.payload;
      })
      // Analyze Document
      .addCase(analyzeUploadedDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeUploadedDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.aiOutput = action.payload;
      })
      .addCase(analyzeUploadedDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Analyze Text Input
      .addCase(analyzeTextInput.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeTextInput.fulfilled, (state, action) => {
        state.loading = false;
        state.aiOutput = action.payload;
      })
      .addCase(analyzeTextInput.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAIState } = aiSlice.actions;
export default aiSlice.reducer;
