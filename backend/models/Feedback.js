import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "authorModel",
        },
        authorModel: {
            type: String,
            required: true,
            enum: ["User", "Recruiter"],
        },
        type: {
            type: String,
            required: true,
            enum: ["Feedback", "Report"],
            default: "Feedback",
        },
        message: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        status: {
            type: String,
            enum: ["Pending", "Reviewed", "Resolved"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
