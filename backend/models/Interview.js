import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
    {
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recruiter",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String, // e.g., "14:30" or "02:30 PM"
            required: true,
        },
        type: {
            type: String,
            enum: ["Technical", "HR", "Managerial", "General"],
            default: "General",
        },
        status: {
            type: String,
            enum: ["Scheduled", "Completed", "Canceled", "Rescheduled"],
            default: "Scheduled",
        },
        meetingLink: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

export const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
