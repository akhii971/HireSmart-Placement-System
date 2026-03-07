import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    toast: null,
    filter: "All", // All | apply | interview | selected
  },
  reducers: {
    addNotification: (state, action) => {
      const n = {
        id: Date.now(),
        read: false,
        time: new Date().toLocaleString(),
        ...action.payload, // { type, message }
      };
      state.list.unshift(n);
      state.toast = n; // show toast
    },
    clearToast: (state) => {
      state.toast = null;
    },
    markAllRead: (state) => {
      state.list.forEach((n) => (n.read = true));
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const {
  addNotification,
  clearToast,
  markAllRead,
  setFilter,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
