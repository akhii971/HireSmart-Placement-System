import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Job", "Internship"],
      default: "Job",
    },
    experience: {
      type: String,
    },
    salary: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    eligibility: {
      type: String,
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },
    applications: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);