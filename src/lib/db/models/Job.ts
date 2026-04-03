import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  description: string;
  requirements: {
    skills: string[];
    experience: { min: number; max: number };
    education: string;
    certifications: string[];
    languages: string[];
  };
  preferences: {
    skills: string[];
    traits: string[];
  };
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  status: "draft" | "open" | "screening" | "closed";
  screeningConfig: {
    shortlistSize: number;
    weightSkills: number;
    weightExperience: number;
    weightEducation: number;
    weightCultureFit: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    department: { type: String, default: "" },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: true,
    },
    description: { type: String, required: true },
    requirements: {
      skills: [String],
      experience: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 20 },
      },
      education: { type: String, default: "" },
      certifications: [String],
      languages: [String],
    },
    preferences: {
      skills: [String],
      traits: [String],
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    status: {
      type: String,
      enum: ["draft", "open", "screening", "closed"],
      default: "draft",
    },
    screeningConfig: {
      shortlistSize: { type: Number, default: 10 },
      weightSkills: { type: Number, default: 40 },
      weightExperience: { type: Number, default: 30 },
      weightEducation: { type: Number, default: 20 },
      weightCultureFit: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

JobSchema.index({ userId: 1, status: 1 });

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
