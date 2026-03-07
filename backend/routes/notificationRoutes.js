import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getUserNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes protected by user JWT
router.get("/", protect, getUserNotifications);
router.put("/read-all", protect, markAllNotificationsRead);
router.put("/:id/read", protect, markNotificationRead);

export default router;
