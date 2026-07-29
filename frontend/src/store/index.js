import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import complaintReducer from './slices/complaintSlice';
import dashboardReducer from './slices/dashboardSlice';
import aiReducer from './slices/aiSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintReducer,
    dashboard: dashboardReducer,
    ai: aiReducer,
    notification: notificationReducer
  }
});
