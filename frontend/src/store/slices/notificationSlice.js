import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: 'success', // 'success' | 'error' | 'info' | 'warning'
  open: false
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'success';
      state.open = true;
    },
    hideNotification: (state) => {
      state.open = false;
      state.message = null;
    }
  }
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
