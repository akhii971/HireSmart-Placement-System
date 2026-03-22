import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";


// ✅ Fetch all jobs (for users)
export const fetchJobs = createAsyncThunk("jobs/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/jobs");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch jobs");
  }
});

// ✅ Fetch recruiter jobs
export const fetchMyJobs = createAsyncThunk("jobs/fetchMy", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/jobs/my/jobs");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch my jobs");
  }
});

// ✅ Create job
export const createJob = createAsyncThunk("jobs/create", async (jobData, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/jobs", jobData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create job");
  }
});
export const deleteJob = createAsyncThunk(
  "jobs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);
// ✅ Update job
export const updateJob = createAsyncThunk(
  "jobs/update",
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/jobs/${id}`, jobData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update job");
    }
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    jobs: [],
    myJobs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All jobs
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // My jobs
      .addCase(fetchMyJobs.fulfilled, (state, action) => {
        state.myJobs = action.payload;
      })

      // Create job
      .addCase(createJob.fulfilled, (state, action) => {
        state.myJobs.unshift(action.payload);
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
  state.myJobs = state.myJobs.filter((j) => j._id !== action.payload);
})
// Update job
.addCase(updateJob.fulfilled, (state, action) => {
  // Update in myJobs
  const idx = state.myJobs.findIndex(j => j._id === action.payload._id);
  if (idx !== -1) state.myJobs[idx] = action.payload;

  // Update in all jobs list (if loaded)
  const idx2 = state.jobs.findIndex(j => j._id === action.payload._id);
  if (idx2 !== -1) state.jobs[idx2] = action.payload;
});
  },
});

export default jobSlice.reducer;
