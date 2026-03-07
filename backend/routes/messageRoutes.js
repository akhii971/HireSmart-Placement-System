import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Recruiter from "../models/Recruiter.js";
import { getMyConversations, getMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

// Custom middleware: accepts BOTH User and Recruiter JWT tokens
const mixedAuth = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find as Recruiter first
        const recruiter = await Recruiter.findById(decoded.id).select("-password");
        if (recruiter) {
            req.recruiter = recruiter;
            return next();
        }

        // Then try as User
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
            req.user = user;
            return next();
        }

        return res.status(401).json({ message: "Not authorized, user not found" });
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};

router.get("/conversations", mixedAuth, getMyConversations);
router.get("/:conversationId", mixedAuth, getMessages);
router.post("/", mixedAuth, sendMessage);

export default router;
