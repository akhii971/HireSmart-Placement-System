import express from "express";
import userRoutes from "./userRoutes.js";
import jobRoutes from "./jobRoutes.js";
import adminRoutes from "./adminRoutes.js";
import recruiterRoutes from "./recruiterRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import interviewRoutes from "./interviewRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import recruiterNotificationRoutes from "./recruiterNotificationRoutes.js";
import messageRoutes from "./messageRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/admin", adminRoutes);
router.use("/recruiters", recruiterRoutes);
router.use("/applications", applicationRoutes);
router.use("/interviews", interviewRoutes);
router.use("/notifications", notificationRoutes);
router.use("/recruiter-notifications", recruiterNotificationRoutes);
router.use("/messages", messageRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/feedback", feedbackRoutes);

export default router;
