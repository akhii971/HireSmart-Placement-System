import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        // The user who applied
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // The job being applied to
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        // The recruiter who owns the job (denormalized for easy queries)
        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recruiter",
            required: true,
        },

        // Application status
        status: {
            type: String,
            enum: ["Pending", "Reviewed", "Shortlisted", "Rejected", "Hired"],
            default: "Pending",
        },

        // Resume URL at time of application (snapshot)
        resumeUrl: {
            type: String,
            default: "",
        },

        // Cover letter / message from user
        coverLetter: {
            type: String,
            default: "",
        },

        // Recruiter notes (internal, not visible to user)
        recruiterNotes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Prevent duplicate applications — one user can apply to a job only once
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
