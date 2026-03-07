import express from "express";
import { protectRecruiter } from "../middleware/recruiterAuthMiddleware.js";
import {
    registerRecruiter,
    loginRecruiter,
    getRecruiterProfile,
    updateRecruiterProfile,
    changePassword,
    getRecruiterDashboardStats,
    forgotPassword,
    resetPassword,
} from "../controllers/recruiterController.js";

const router = express.Router();

// ─── Public ───────────────────────────────────────// Public
router.post("/register", registerRecruiter);
router.post("/login", loginRecruiter);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected (requires valid recruiter token and approved status) ────────────────────
router.get("/profile", protectRecruiter, getRecruiterProfile);
router.put("/profile", protectRecruiter, updateRecruiterProfile);
router.get("/dashboard-stats", protectRecruiter, getRecruiterDashboardStats);

export default router;
