import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                participantId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },
                participantModel: {
                    type: String,
                    required: true,
                    enum: ["User", "Recruiter"],
                },
            },
        ],
        lastMessage: {
            type: String,
            default: "",
        },
        unreadCounts: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
