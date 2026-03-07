import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // Required if it's a student notification, not required if it's for a recruiter
        },
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recruiter",
            // Required if it's a recruiter notification
        },
        type: {
            type: String,
            // Added recruiter specific types: application_received
            enum: ["interview_scheduled", "interview_updated", "interview_canceled", "application_update", "application_received", "general"],
            default: "general",
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
