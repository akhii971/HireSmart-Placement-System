import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { protectRecruiter } from "../middleware/recruiterAuthMiddleware.js";
import {
    applyToJob,
    getMyApplications,
    checkApplicationStatus,
    withdrawApplication,
    getApplicationsForJob,
    getAllRecruiterApplications,
    updateApplicationStatus,
    getApplicationById,
} from "../controllers/applicationController.js";

const router = express.Router();

// ─── User Routes (Protected by User JWT) ─────────────
router.post("/apply/:jobId", protect, applyToJob);
router.get("/my", protect, getMyApplications);
router.get("/check/:jobId", protect, checkApplicationStatus);
router.delete("/:id", protect, withdrawApplication);

// ─── Recruiter Routes (Protected by Recruiter JWT) ───
router.get("/job/:jobId", protectRecruiter, getApplicationsForJob);
router.get("/recruiter/all", protectRecruiter, getAllRecruiterApplications);
router.put("/:id/status", protectRecruiter, updateApplicationStatus);
router.get("/detail/:id", protectRecruiter, getApplicationById);

export default router;
