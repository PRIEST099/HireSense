import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ScreeningResult, ScreeningSession } from "@/types/screening";

interface ScreeningState {
  results: ScreeningResult[];
  session: ScreeningSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScreeningState = {
  results: [],
  session: null,
  loading: false,
  error: null,
};

export const triggerScreening = createAsyncThunk(
  "screening/trigger",
  async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}/screen`, { method: "POST" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data as ScreeningSession;
  }
);

export const fetchResults = createAsyncThunk(
  "screening/fetchResults",
  async ({ jobId, sessionId }: { jobId: string; sessionId?: string }) => {
    const url = sessionId
      ? `/api/jobs/${jobId}/results?sessionId=${sessionId}`
      : `/api/jobs/${jobId}/results`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data as { session: ScreeningSession; results: ScreeningResult[] };
  }
);

export const updateDecision = createAsyncThunk(
  "screening/updateDecision",
  async ({ candidateId, decision }: { candidateId: string; decision: string }) => {
    const res = await fetch(`/api/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return { candidateId, decision };
  }
);

const screeningSlice = createSlice({
  name: "screening",
  initialState,
  reducers: {
    clearScreening(state) {
      state.results = [];
      state.session = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerScreening.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(triggerScreening.fulfilled, (state, action) => { state.loading = false; state.session = action.payload; })
      .addCase(triggerScreening.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Screening failed"; })
      .addCase(fetchResults.pending, (state) => { state.loading = true; })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.results = action.payload.results;
      })
      .addCase(fetchResults.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch results"; })
      .addCase(updateDecision.fulfilled, (state, action) => {
        const result = state.results.find((r) => r.candidateId === action.payload.candidateId);
        if (result) result.recruiterDecision = action.payload.decision as ScreeningResult["recruiterDecision"];
      });
  },
});

export const { clearScreening } = screeningSlice.actions;
export default screeningSlice.reducer;
