import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "fresher", "professional", "admin"],
      default: "student",
    },

    // ✅ Admin control field
    status: {
      type: String,
      enum: ["Active", "Blocked", "Pending", "Approved", "Rejected"],
      default: "Active",
    },

    // Profile fields
    phone: String,
    location: String,
    bio: String,
    college: String,
    degree: String,
    branch: String,
    graduationYear: String,
    cgpa: String,

    experience: { type: String, default: "fresher" },

    skills: [String],
    languages: [String],

    jobType: { type: String, default: "internship" },
    preferredLocation: String,
    expectedSalary: String,
    availability: { type: String, default: "immediate" },
    openToRemote: { type: Boolean, default: true },

    linkedin: String,
    github: String,
    portfolio: String,
    resumeUrl: String,

    certifications: [String],
    achievements: [String],

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);