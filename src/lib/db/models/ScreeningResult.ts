import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScreeningResult extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    cultureFitMatch: number;
  };
  rank: number;
  strengths: string[];
  gaps: string[];
  recommendation: "strong_match" | "good_match" | "partial_match" | "weak_match";
  reasoning: string;
  confidenceScore: number;
  recruiterDecision: "pending" | "shortlisted" | "rejected" | "interview";
  aiModel: string;
  promptVersion: string;
  processingTimeMs: number;
  createdAt: Date;
}

const ScreeningResultSchema = new Schema<IScreeningResult>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "ScreeningSession", required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    breakdown: {
      skillsMatch: { type: Number, min: 0, max: 100, default: 0 },
      experienceMatch: { type: Number, min: 0, max: 100, default: 0 },
      educationMatch: { type: Number, min: 0, max: 100, default: 0 },
      cultureFitMatch: { type: Number, min: 0, max: 100, default: 0 },
    },
    rank: { type: Number, required: true },
    strengths: [String],
    gaps: [String],
    recommendation: {
      type: String,
      enum: ["strong_match", "good_match", "partial_match", "weak_match"],
      required: true,
    },
    reasoning: { type: String, required: true },
    confidenceScore: { type: Number, min: 0, max: 100, default: 70 },
    recruiterDecision: {
      type: String,
      enum: ["pending", "shortlisted", "rejected", "interview"],
      default: "pending",
    },
    aiModel: { type: String, required: true },
    promptVersion: { type: String, required: true },
    processingTimeMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ScreeningResultSchema.index({ jobId: 1, rank: 1 });
ScreeningResultSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const ScreeningResult: Model<IScreeningResult> =
  mongoose.models.ScreeningResult ||
  mongoose.model<IScreeningResult>("ScreeningResult", ScreeningResultSchema);

export default ScreeningResult;
