import jwt from "jsonwebtoken";
import Recruiter from "../models/Recruiter.js";

// Protect routes for authenticated recruiters
export const protectRecruiter = async (req, res, next) => {
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

        // Look up recruiter in the Recruiter collection
        req.recruiter = await Recruiter.findById(decoded.id).select("-password");

        if (!req.recruiter) {
            return res.status(401).json({ message: "Recruiter not found" });
        }

        // 🚫 Block access for blocked/rejected recruiters
        if (req.recruiter.status === "Blocked") {
            return res.status(403).json({
                message: "Your recruiter account has been blocked",
                blocked: true,
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};
