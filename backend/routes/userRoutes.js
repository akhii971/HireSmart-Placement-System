import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  uploadResume,
  getDashboardStats,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
// 🔐 Change password (Protected)
router.put("/change-password", protect, changePassword);
// 📎 Resume upload (Protected)
router.post("/upload-resume", protect, upload.single("resume"), uploadResume);
// 📊 Dashboard stats (Protected)
router.get("/dashboard-stats", protect, getDashboardStats);

export default router;