export interface ScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  cultureFitMatch: number;
}

export type Recommendation = "strong_match" | "good_match" | "partial_match" | "weak_match";
export type RecruiterDecision = "pending" | "shortlisted" | "rejected" | "interview";
export type SessionStatus = "pending" | "processing" | "completed" | "failed";

export interface ScreeningResult {
  _id: string;
  jobId: string;
  candidateId: string;
  sessionId: string;
  overallScore: number;
  breakdown: ScoreBreakdown;
  rank: number;
  strengths: string[];
  gaps: string[];
  recommendation: Recommendation;
  reasoning: string;
  confidenceScore: number;
  recruiterDecision: RecruiterDecision;
  aiModel: string;
  promptVersion: string;
  processingTimeMs: number;
  createdAt: string;
}

export interface ScreeningSession {
  _id: string;
  jobId: string;
  userId: string;
  status: SessionStatus;
  totalCandidates: number;
  processedCandidates: number;
  shortlistSize: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}
