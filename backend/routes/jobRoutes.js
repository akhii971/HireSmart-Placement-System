import express from "express";
import { protectRecruiter } from "../middleware/recruiterAuthMiddleware.js";
import {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  deleteJob,
  updateJob,
} from "../controllers/jobController.js";

const router = express.Router();

// ─── Public Routes ───────────────────────────────────
router.get("/", getAllJobs);

// ─── Recruiter Routes (Protected by Recruiter JWT) ───
// ⚠️ MUST be defined BEFORE /:id to avoid "my" being treated as an id
router.get("/my/jobs", protectRecruiter, getMyJobs);
router.post("/", protectRecruiter, createJob);
router.delete("/:id", protectRecruiter, deleteJob);
router.put("/:id", protectRecruiter, updateJob);

// ─── Public: Single Job Detail ───────────────────────
// Must come AFTER /my/jobs so "/my" doesn't match /:id
router.get("/:id", getJobById);

export default router;