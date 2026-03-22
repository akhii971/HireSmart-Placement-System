import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://hiresmart-placement-system-dcoe.onrender.com/api";
const STORAGE_KEY = "recruiterUser";

// Load persisted recruiter session
const saved = (() => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch { return null; }
})();

// Helper: direct axios call with recruiter token
const recruiterApi = (token) =>
    axios.create({
        baseURL: API_BASE,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

// ─── REGISTER ─────────────────────────────────────
export const recruiterSignup = createAsyncThunk(
    "recruiterAuth/signup",
    async ({ name, email, password, company, industry }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API_BASE}/recruiters/register`, {
                name, email, password, company, industry,
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Registration failed");
        }
    }
);

// ─── LOGIN ────────────────────────────────────────
export const recruiterLogin = createAsyncThunk(
    "recruiterAuth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API_BASE}/recruiters/login`, {
                email, password,
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
    }
);

// ─── FETCH PROFILE ────────────────────────────────
export const fetchRecruiterProfile = createAsyncThunk(
    "recruiterAuth/fetchProfile",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().recruiterAuth.recruiter?.token || saved?.token;
            const { data } = await recruiterApi(token).get("/recruiters/profile");
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to load profile");
        }
    }
);

// ─── UPDATE PROFILE ───────────────────────────────
export const recruiterUpdateProfile = createAsyncThunk(
    "recruiterAuth/updateProfile",
    async (profileData, { getState, rejectWithValue }) => {
        try {
            const token = getState().recruiterAuth.recruiter?.token || saved?.token;
            const { data } = await recruiterApi(token).put("/recruiters/profile", profileData);
            // Update storage with fresh data (keep token)
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            const updated = { ...existing, ...data, token: existing.token };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Profile update failed");
        }
    }
);

// ─── FORGOT PASSWORD ──────────────────────────────
export const recruiterForgotPassword = createAsyncThunk(
    "recruiterAuth/forgotPassword",
    async ({ email }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API_BASE}/recruiters/forgot-password`, { email });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to send reset email");
        }
    }
);

// ─── RESET PASSWORD ───────────────────────────────
export const recruiterResetPassword = createAsyncThunk(
    "recruiterAuth/resetPassword",
    async ({ token, password }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`${API_BASE}/recruiters/reset-password/${token}`, { password });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to reset password");
        }
    }
);

// ─── SLICE ────────────────────────────────────────
const recruiterAuthSlice = createSlice({
    name: "recruiterAuth",
    initialState: {
        recruiter: saved || null,
        isAuthenticated: !!(saved?.token),
        loading: false,
        error: null,
    },
    reducers: {
        // 🔴 Live status update — called by poller without full re-login
        recruiterSetStatus(state, action) {
            if (state.recruiter) {
                state.recruiter.status = action.payload;
                // Update localStorage too
                try {
                    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
                    stored.status = action.payload;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
                } catch (_) { }
            }
        },
        recruiterLogout(state) {
            state.recruiter = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem(STORAGE_KEY);
        },
        recruiterClearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ─── SIGNUP ───
            .addCase(recruiterSignup.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(recruiterSignup.fulfilled, (state, action) => {
                state.loading = false;
                state.recruiter = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(recruiterSignup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ─── LOGIN ───
            .addCase(recruiterLogin.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(recruiterLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.recruiter = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(recruiterLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ─── FETCH PROFILE ───
            .addCase(fetchRecruiterProfile.fulfilled, (state, action) => {
                // Merge profile into existing (preserve token)
                state.recruiter = { ...state.recruiter, ...action.payload };
                const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...action.payload }));
            })

            // ─── UPDATE PROFILE ───
            .addCase(recruiterUpdateProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(recruiterUpdateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.recruiter = { ...state.recruiter, ...action.payload };
            })
            .addCase(recruiterUpdateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ─── FORGOT PASSWORD ───
            .addCase(recruiterForgotPassword.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(recruiterForgotPassword.fulfilled, (state) => { state.loading = false; state.error = null; })
            .addCase(recruiterForgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ─── RESET PASSWORD ───
            .addCase(recruiterResetPassword.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(recruiterResetPassword.fulfilled, (state) => { state.loading = false; state.error = null; })
            .addCase(recruiterResetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { recruiterLogout, recruiterClearError, recruiterSetStatus } = recruiterAuthSlice.actions;
export default recruiterAuthSlice.reducer;
