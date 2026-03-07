import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Recruiter from "../models/Recruiter.js";

// Utility to find or create conversation
const getOrCreateConversation = async (participantId1, model1, participantId2, model2) => {
    let conversation = await Conversation.findOne({
        "participants": {
            $all: [
                { $elemMatch: { participantId: participantId1, participantModel: model1 } },
                { $elemMatch: { participantId: participantId2, participantModel: model2 } },
            ]
        }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [
                { participantId: participantId1, participantModel: model1 },
                { participantId: participantId2, participantModel: model2 }
            ],
            unreadCounts: new Map([
                [participantId1.toString(), 0],
                [participantId2.toString(), 0]
            ])
        });
    }
    return conversation;
};

// ──────────────────────────────────
//  G E T   C O N V E R S A T I O N S
// ──────────────────────────────────
export const getMyConversations = async (req, res) => {
    try {
        const userId = req.user?._id || req.recruiter?._id;
        const userModel = req.user ? "User" : "Recruiter";

        if (!userId) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const conversations = await Conversation.find({
            "participants.participantId": userId
        }).sort({ updatedAt: -1 });

        // We need to manually populate the *other* participant's details
        // since it's a polymorphic relationship (User or Recruiter)
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherParticipant = conv.participants.find(
                    (p) => p.participantId.toString() !== userId.toString()
                );

                let otherDetails = null;
                if (otherParticipant) {
                    if (otherParticipant.participantModel === "User") {
                        otherDetails = await User.findById(otherParticipant.participantId).select("name email profilePicture");
                    } else {
                        otherDetails = await Recruiter.findById(otherParticipant.participantId).select("name email company");
                    }
                }

                // Convert map to plain object
                const unreads = conv.unreadCounts instanceof Map ? Object.fromEntries(conv.unreadCounts) : conv.unreadCounts;

                return {
                    _id: conv._id,
                    lastMessage: conv.lastMessage,
                    updatedAt: conv.updatedAt,
                    unreadCount: unreads[userId.toString()] || 0,
                    otherParticipant: otherDetails,
                    otherParticipantModel: otherParticipant?.participantModel,
                };
            })
        );

        res.json(populatedConversations);
    } catch (error) {
        console.error("Error getting conversations:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ──────────────────────────────────
//  G E T   M E S S A G E S
// ──────────────────────────────────
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id || req.recruiter?._id;

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        // Reset unread count for the current user
        if (userId) {
            const conversation = await Conversation.findById(conversationId);
            if (conversation && conversation.unreadCounts) {
                if (conversation.unreadCounts instanceof Map) {
                    conversation.unreadCounts.set(userId.toString(), 0);
                } else {
                    conversation.unreadCounts[userId.toString()] = 0;
                }
                await conversation.save();
            }
        }

        res.json(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ──────────────────────────────────
//  S E N D   M E S S A G E
// ──────────────────────────────────
export const sendMessage = async (req, res) => {
    try {
        const { text, receiverId, receiverModel } = req.body;
        const senderId = req.user?._id || req.recruiter?._id;
        const senderModel = req.user ? "User" : "Recruiter";

        if (!text || !receiverId || !receiverModel || !senderId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find or create the conversation thread
        const conversation = await getOrCreateConversation(senderId, senderModel, receiverId, receiverModel);

        // Save the message
        const message = await Message.create({
            conversationId: conversation._id,
            senderId,
            senderModel,
            text,
        });

        // Update conversation's last message and recipient's unread count
        conversation.lastMessage = text;

        let unreadCount = 0;
        if (conversation.unreadCounts instanceof Map) {
            unreadCount = conversation.unreadCounts.get(receiverId.toString()) || 0;
            conversation.unreadCounts.set(receiverId.toString(), unreadCount + 1);
        } else {
            unreadCount = conversation.unreadCounts[receiverId.toString()] || 0;
            conversation.unreadCounts[receiverId.toString()] = unreadCount + 1;
        }

        await conversation.save();

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
