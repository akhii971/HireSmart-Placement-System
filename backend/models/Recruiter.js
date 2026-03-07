import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },

        // Account status (admin controlled)
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Blocked"],
            default: "Pending",
        },

        // Company details
        company: { type: String, required: true },
        companySize: { type: String, default: "" },
        industry: { type: String, default: "" },
        location: { type: String, default: "" },
        website: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        description: { type: String, default: "" },

        // Contact
        phone: { type: String, default: "" },

        // Password Reset
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

export default mongoose.model("Recruiter", recruiterSchema);
