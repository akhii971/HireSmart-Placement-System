import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

// GET /api/recommendations — AI-powered job recommendations for logged-in student
router.get("/", protect, getRecommendations);

export default router;
