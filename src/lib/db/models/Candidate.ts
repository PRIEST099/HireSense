import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICandidate extends Document {
  jobId: mongoose.Types.ObjectId;
  source: "platform" | "csv" | "excel" | "resume";
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    portfolio: string;
    summary: string;
    skills: {
      name: string;
      level: "beginner" | "intermediate" | "advanced" | "expert";
      yearsOfExperience: number;
    }[];
    experience: {
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string;
      achievements: string[];
    }[];
    education: {
      degree: string;
      institution: string;
      field: string;
      graduationYear: number;
    }[];
    certifications: string[];
    languages: string[];
    totalYearsExperience: number;
  };
  rawResumeText: string;
  rawCsvRow: Record<string, string>;
  resumeFileUrl: string;
  profileParsedByAI: boolean;
  createdAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    source: {
      type: String,
      enum: ["platform", "csv", "excel", "resume"],
      required: true,
    },
    profile: {
      name: { type: String, required: true },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      linkedIn: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      summary: { type: String, default: "" },
      skills: [
        {
          name: String,
          level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "expert"],
            default: "intermediate",
          },
          yearsOfExperience: { type: Number, default: 0 },
        },
      ],
      experience: [
        {
          title: String,
          company: String,
          startDate: String,
          endDate: String,
          description: String,
          achievements: [String],
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          field: String,
          graduationYear: Number,
        },
      ],
      certifications: [String],
      languages: [String],
      totalYearsExperience: { type: Number, default: 0 },
    },
    rawResumeText: { type: String, default: "" },
    rawCsvRow: { type: Schema.Types.Mixed, default: {} },
    resumeFileUrl: { type: String, default: "" },
    profileParsedByAI: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CandidateSchema.index({ jobId: 1 });
CandidateSchema.index(
  { jobId: 1, "profile.email": 1 },
  { unique: true, partialFilterExpression: { "profile.email": { $exists: true, $gt: "" } } }
);

const Candidate: Model<ICandidate> =
  mongoose.models.Candidate ||
  mongoose.model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;
