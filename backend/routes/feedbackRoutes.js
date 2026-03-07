import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { protectRecruiter } from "../middleware/recruiterAuthMiddleware.js";
import {
    submitUserFeedback,
    submitRecruiterFeedback,
    getAllFeedbackAdmin,
    updateFeedbackStatus,
    deleteFeedback
} from "../controllers/feedbackController.js";

const router = express.Router();

// User endpoints
router.post("/user", protect, submitUserFeedback);

// Recruiter endpoints
router.post("/recruiter", protectRecruiter, submitRecruiterFeedback);

// Admin endpoints
router.get("/admin", protect, isAdmin, getAllFeedbackAdmin);
router.put("/admin/:id/status", protect, isAdmin, updateFeedbackStatus);
router.delete("/admin/:id", protect, isAdmin, deleteFeedback);

export default router;
