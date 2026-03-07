import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ─── Use a SEPARATE localStorage key so admin & user sessions don't collide ───
const STORAGE_KEY = "adminUser";

const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/login", { email, password });

      // 🔒 Make sure this is an admin
      if (data.role !== "admin") {
        return rejectWithValue("This account is not an admin");
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    admin: saved || null,
    isAuthenticated: !!(saved && saved.role === "admin"),
    loading: false,
    error: null,
  },
  reducers: {
    adminLogout(state) {
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEY);
    },
    adminClearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { adminLogout, adminClearError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;