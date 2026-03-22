import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Load persisted auth from localStorage
const savedUser = localStorage.getItem("authUser")
  ? JSON.parse(localStorage.getItem("authUser"))
  : null;

// ─── ASYNC THUNKS ────────────────────────────────────────────────────────────

// SIGN UP
export const signup = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/register", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

// SIGN IN
export const login = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/login", formData);
      return data;
    } catch (err) {
      const responseData = err.response?.data || {};
      return rejectWithValue({
        message: responseData.message || "Login failed",
        blocked: responseData.blocked || false,
      });
    }
  }
);

// GET PROFILE
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/profile");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load profile"
      );
    }
  }
);

// UPDATE PROFILE
export const saveProfile = createAsyncThunk(
  "auth/saveProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/users/profile", profileData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed"
      );
    }
  }
);

// 🔐 CHANGE PASSWORD
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });
      return data; // { message: "Password updated successfully" }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to change password"
      );
    }
  }
);

// 📎 UPLOAD RESUME FILE
export const uploadResumeFile = createAsyncThunk(
  "auth/uploadResumeFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await api.post("/users/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data; // { resumeUrl }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Resume upload failed"
      );
    }
  }
);

// ─── FORGOT PASSWORD ───
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/forgot-password", { email });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

// ─── RESET PASSWORD ───
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/reset-password/${token}`, { password });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

const initialState = {
  user: savedUser,
  isAuthenticated: !!savedUser,
  loading: false,
  resumeUploading: false,
  error: null,
  isBlocked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // LOGOUT
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isBlocked = false;
      localStorage.removeItem("authUser");
    },

    // CLEAR ERROR
    clearError(state) {
      state.error = null;
      state.isBlocked = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── SIGNUP ───
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("authUser", JSON.stringify(action.payload));
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── LOGIN ───
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("authUser", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isBlocked = action.payload?.blocked || false;
        state.error = action.payload?.message || action.payload;
      })

      // ─── FETCH PROFILE ───
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("authUser", JSON.stringify(state.user));
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── SAVE PROFILE ───
      .addCase(saveProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("authUser", JSON.stringify(state.user));
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── CHANGE PASSWORD ───
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── UPLOAD RESUME ───
      .addCase(uploadResumeFile.pending, (state) => {
        state.resumeUploading = true;
        state.error = null;
      })
      .addCase(uploadResumeFile.fulfilled, (state, action) => {
        state.resumeUploading = false;
        if (state.user) {
          state.user.resumeUrl = action.payload.resumeUrl;
          localStorage.setItem("authUser", JSON.stringify(state.user));
        }
      })
      .addCase(uploadResumeFile.rejected, (state, action) => {
        state.resumeUploading = false;
        state.error = action.payload;
      })

      // ─── FORGOT PASSWORD ───
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── RESET PASSWORD ───
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
