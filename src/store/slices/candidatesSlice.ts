import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Candidate } from "@/types/candidate";

interface CandidatesState {
  items: Candidate[];
  loading: boolean;
  error: string | null;
  uploadProgress: { created: number; errors: string[] } | null;
}

const initialState: CandidatesState = {
  items: [],
  loading: false,
  error: null,
  uploadProgress: null,
};

export const fetchCandidates = createAsyncThunk(
  "candidates/fetchCandidates",
  async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}/applicants`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data as Candidate[];
  }
);

export const addCandidate = createAsyncThunk(
  "candidates/addCandidate",
  async ({ jobId, profile }: { jobId: string; profile: Record<string, unknown> }) => {
    const res = await fetch(`/api/jobs/${jobId}/applicants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data as Candidate | Candidate[];
  }
);

export const uploadFiles = createAsyncThunk(
  "candidates/uploadFiles",
  async ({ jobId, formData }: { jobId: string; formData: FormData }) => {
    const res = await fetch(`/api/jobs/${jobId}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
);

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    clearCandidates(state) {
      state.items = [];
    },
    clearUploadProgress(state) {
      state.uploadProgress = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCandidates.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCandidates.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch candidates"; })
      .addCase(addCandidate.fulfilled, (state, action) => {
        const newCandidates = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.items.push(...newCandidates);
      })
      .addCase(uploadFiles.pending, (state) => { state.loading = true; })
      .addCase(uploadFiles.fulfilled, (state, action) => { state.loading = false; state.uploadProgress = action.payload; })
      .addCase(uploadFiles.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Upload failed"; });
  },
});

export const { clearCandidates, clearUploadProgress } = candidatesSlice.actions;
export default candidatesSlice.reducer;
