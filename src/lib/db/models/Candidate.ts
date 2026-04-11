import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICandidate extends Document {
  jobId: mongoose.Types.ObjectId;
  source: "platform" | "csv" | "excel" | "resume";
  profile: {
    // 3.1 Basic Info
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    bio: string;
    location: string;
    // Backward compat
    name: string;
    phone: string;
    summary: string;

    // 3.2 Skills & Languages
    skills: { name: string; level: string; yearsOfExperience: number }[];
    languages: { name: string; proficiency: string }[];

    // 3.3 Experience
    experience: {
      company: string;
      role: string;
      startDate: string;
      endDate: string;
      description: string;
      technologies: string[];
      isCurrent: boolean;
      achievements: string[];
      title: string;
    }[];

    // 3.4 Education
    education: {
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startYear: number;
      endYear: number;
      field: string;
      graduationYear: number;
    }[];

    // 3.5 Certifications
    certifications: { name: string; issuer: string; issueDate: string }[];

    // 3.6 Projects
    projects: {
      name: string;
      description: string;
      technologies: string[];
      role: string;
      link: string;
      startDate: string;
      endDate: string;
    }[];

    // 3.7 Availability
    availability: { status: string; type: string; startDate: string };

    // 3.8 Social Links
    socialLinks: { linkedin: string; github: string; portfolio: string };

    // Extensions
    totalYearsExperience: number;
    linkedIn: string;
    portfolio: string;
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
      // 3.1 Basic Info
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      email: { type: String, default: "" },
      headline: { type: String, default: "" },
      bio: { type: String, default: "" },
      location: { type: String, default: "" },
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      summary: { type: String, default: "" },

      // 3.2 Skills & Languages
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
      languages: [
        {
          name: { type: String, default: "" },
          proficiency: {
            type: String,
            enum: ["basic", "conversational", "fluent", "native", ""],
            default: "fluent",
          },
        },
      ],

      // 3.3 Experience
      experience: [
        {
          company: String,
          role: String,
          title: String, // backward compat
          startDate: String,
          endDate: String,
          description: String,
          technologies: [String],
          isCurrent: { type: Boolean, default: false },
          achievements: [String],
        },
      ],

      // 3.4 Education
      education: [
        {
          institution: String,
          degree: String,
          fieldOfStudy: String,
          field: String, // backward compat
          startYear: Number,
          endYear: Number,
          graduationYear: Number, // backward compat
        },
      ],

      // 3.5 Certifications (structured objects, not flat strings)
      certifications: [
        {
          name: String,
          issuer: { type: String, default: "" },
          issueDate: { type: String, default: "" },
        },
      ],

      // 3.6 Projects
      projects: [
        {
          name: String,
          description: { type: String, default: "" },
          technologies: [String],
          role: { type: String, default: "" },
          link: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],

      // 3.7 Availability
      availability: {
        status: { type: String, enum: ["available", "open_to_opportunities", "not_available", ""], default: "available" },
        type: { type: String, enum: ["full-time", "part-time", "contract", ""], default: "full-time" },
        startDate: { type: String, default: "" },
      },

      // 3.8 Social Links
      socialLinks: {
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        portfolio: { type: String, default: "" },
      },

      // Extensions
      totalYearsExperience: { type: Number, default: 0 },
      linkedIn: { type: String, default: "" },
      portfolio: { type: String, default: "" },
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
