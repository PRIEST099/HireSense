import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Job, CreateJobInput } from "@/types/job";

interface JobsState {
  items: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  items: [],
  currentJob: null,
  loading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async () => {
  const res = await fetch("/api/jobs");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Job[];
});

export const fetchJob = createAsyncThunk("jobs/fetchJob", async (jobId: string) => {
  const res = await fetch(`/api/jobs/${jobId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data as Job;
});

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (input: CreateJobInput) => {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data as Job;
  }
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ jobId, input }: { jobId: string; input: Partial<CreateJobInput> }) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data as Job;
  }
);

export const deleteJob = createAsyncThunk("jobs/deleteJob", async (jobId: string) => {
  const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return jobId;
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearCurrentJob(state) {
      state.currentJob = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchJobs.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch jobs"; })
      .addCase(fetchJob.pending, (state) => { state.loading = true; })
      .addCase(fetchJob.fulfilled, (state, action) => { state.loading = false; state.currentJob = action.payload; })
      .addCase(fetchJob.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch job"; })
      .addCase(createJob.fulfilled, (state, action) => { state.error = null; state.items.unshift(action.payload); })
      .addCase(updateJob.fulfilled, (state, action) => {
        const idx = state.items.findIndex((j) => j._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
        if (state.currentJob?._id === action.payload._id) state.currentJob = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter((j) => j._id !== action.payload);
      });
  },
});

export const { clearCurrentJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;
