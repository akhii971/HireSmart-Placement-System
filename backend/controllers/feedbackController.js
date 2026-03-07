import Feedback from "../models/Feedback.js";

// POST /api/feedback/user
export const submitUserFeedback = async (req, res) => {
    try {
        const { type, message, rating } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const feedback = await Feedback.create({
            authorId: req.user._id,
            authorModel: "User",
            type: type || "Feedback",
            message,
            rating: type !== "Report" ? rating : undefined,
        });

        res.status(201).json({ message: "Submitted successfully", feedback });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/feedback/recruiter
export const submitRecruiterFeedback = async (req, res) => {
    try {
        const { type, message, rating } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const feedback = await Feedback.create({
            authorId: req.recruiter._id,
            authorModel: "Recruiter",
            type: type || "Feedback",
            message,
            rating: type !== "Report" ? rating : undefined,
        });

        res.status(201).json({ message: "Submitted successfully", feedback });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/feedback/admin
export const getAllFeedbackAdmin = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate({ path: "authorId", select: "name email role company" })
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/feedback/admin/:id/status
export const updateFeedbackStatus = async (req, res) => {
    try {
        const { status } = req.body; // Pending, Reviewed, Resolved
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });

        feedback.status = status;
        await feedback.save();
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/feedback/admin/:id
export const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });

        await feedback.deleteOne();
        res.json({ message: "Feedback deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
