import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  toast: null,          // 👈 for toast popup
  muted: false,
  snoozedUntil: null,   // timestamp or null
  preferences: {
    onlyInternships: false,
    onlyRemote: false,
    skills: ["React"], // default watched skills
  },
};

const notificationsSlice = createSlice({
  name: "userNotifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        read: false,
        time: new Date().toLocaleString(),
        ...action.payload,
      };

      state.list.unshift(notification);

      // show toast unless muted or snoozed
      const now = Date.now();
      if (
        !state.muted &&
        (!state.snoozedUntil || now > state.snoozedUntil)
      ) {
        state.toast = notification.message;
      }
    },

    clearToast: (state) => {
      state.toast = null;
    },

    markAllRead: (state) => {
      state.list.forEach((n) => (n.read = true));
    },

    toggleMute: (state) => {
      state.muted = !state.muted;
    },

    snoozeForHours: (state, action) => {
      const hours = action.payload;
      state.snoozedUntil = Date.now() + hours * 60 * 60 * 1000;
    },

    clearSnooze: (state) => {
      state.snoozedUntil = null;
    },

    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
  },
});

export const {
  addNotification,
  clearToast,      // ✅ now exists
  markAllRead,
  toggleMute,
  snoozeForHours,
  clearSnooze,
  setPreferences,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

