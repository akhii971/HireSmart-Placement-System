import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { protectRecruiter } from "../middleware/recruiterAuthMiddleware.js";
import {
    scheduleInterview,
    getRecruiterInterviews,
    getStudentInterviews,
    updateInterviewStatus,
    updateInterviewDetails,
} from "../controllers/interviewController.js";

const router = express.Router();

// ─── Recruiter Routes (Protected by Recruiter JWT) ───
router.post("/", protectRecruiter, scheduleInterview);
router.get("/recruiter", protectRecruiter, getRecruiterInterviews);
router.put("/:id/status", protectRecruiter, updateInterviewStatus);
router.put("/:id", protectRecruiter, updateInterviewDetails);

// ─── Student/User Routes (Protected by User JWT) ─────
router.get("/student", protect, getStudentInterviews);

export default router;
