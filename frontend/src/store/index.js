import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import authReducer, { logoutUser } from './slices/authSlice';
import complaintReducer from './slices/complaintSlice';
import dashboardReducer from './slices/dashboardSlice';
import aiReducer from './slices/aiSlice';
import notificationReducer, { showNotification } from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintReducer,
    dashboard: dashboardReducer,
    ai: aiReducer,
    notification: notificationReducer
  }
});

// Axios Global Interceptor for 401 Unauthorized & Network Offline
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      store.dispatch(logoutUser());
      store.dispatch(showNotification({
        message: 'Session expired or not authenticated. Please sign in.',
        type: 'error'
      }));
    } else if (!error.response && error.code === 'ERR_NETWORK') {
      store.dispatch(showNotification({
        message: 'Backend API is offline! Please start backend via run_backend.bat (port 8000).',
        type: 'error'
      }));
    }
    return Promise.reject(error);
  }
);
