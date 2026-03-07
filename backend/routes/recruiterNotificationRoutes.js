import express from "express";
import { protectRecruiter } from "../middleware/recruiterAuthMiddleware.js";
import {
    getUserNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes protected by recruiter JWT
router.get("/", protectRecruiter, getUserNotifications);
router.put("/read-all", protectRecruiter, markAllNotificationsRead);
router.put("/:id/read", protectRecruiter, markNotificationRead);

export default router;
