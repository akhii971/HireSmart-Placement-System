import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  // Users
  getAllUsers,
  getUserByIdAdmin,
  toggleUserStatus,
  deleteUserAdmin,
  // Recruiters
  getAllRecruiters,
  getRecruiterByIdAdmin,
  updateRecruiterStatus,
  deleteRecruiterAdmin,
  // Jobs
  getAllJobsAdmin,
  getJobDetailsAdmin,
  deleteJobAdmin,
  // Stats
  getAdminStats,
  // Profile
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminController.js";

const router = express.Router();

// ─── Dashboard stats ───
router.get("/stats", protect, isAdmin, getAdminStats);

// ─── Profile ───
router.get("/profile", protect, isAdmin, getAdminProfile);
router.put("/profile", protect, isAdmin, updateAdminProfile);

// ─── Users ───
router.get("/users", protect, isAdmin, getAllUsers);
router.get("/users/:id", protect, isAdmin, getUserByIdAdmin);
router.put("/users/:id/toggle-status", protect, isAdmin, toggleUserStatus);
router.delete("/users/:id", protect, isAdmin, deleteUserAdmin);

// ─── Recruiters ───
router.get("/recruiters", protect, isAdmin, getAllRecruiters);
router.get("/recruiters/:id", protect, isAdmin, getRecruiterByIdAdmin);
router.put("/recruiters/:id/status", protect, isAdmin, updateRecruiterStatus);
router.delete("/recruiters/:id", protect, isAdmin, deleteRecruiterAdmin);

// ─── Jobs ───
router.get("/jobs", protect, isAdmin, getAllJobsAdmin);
router.get("/jobs/:id", protect, isAdmin, getJobDetailsAdmin);
router.delete("/jobs/:id", protect, isAdmin, deleteJobAdmin);

export default router;
