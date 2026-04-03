import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScreeningSession extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: "pending" | "processing" | "completed" | "failed";
  totalCandidates: number;
  processedCandidates: number;
  shortlistSize: number;
  startedAt: Date;
  completedAt: Date;
  error: string;
}

const ScreeningSessionSchema = new Schema<IScreeningSession>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    totalCandidates: { type: Number, required: true },
    processedCandidates: { type: Number, default: 0 },
    shortlistSize: { type: Number, default: 10 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

ScreeningSessionSchema.index({ jobId: 1 });

const ScreeningSession: Model<IScreeningSession> =
  mongoose.models.ScreeningSession ||
  mongoose.model<IScreeningSession>("ScreeningSession", ScreeningSessionSchema);

export default ScreeningSession;
