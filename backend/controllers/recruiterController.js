import Recruiter from "../models/Recruiter.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, passwordResetEmail } from "../utils/emailService.js";

// 🔐 Generate JWT
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Safe response shape (no password)
const safeRecruiter = (r) => ({
    _id: r._id,
    name: r.name,
    email: r.email,
    status: r.status,
    company: r.company,
    companySize: r.companySize,
    industry: r.industry,
    location: r.location,
    website: r.website,
    linkedin: r.linkedin,
    description: r.description,
    phone: r.phone,
    createdAt: r.createdAt,
});

// ──────────────────────────────────
//  A U T H
// ──────────────────────────────────

// POST /api/recruiters/register
export const registerRecruiter = async (req, res) => {
    try {
        const { name, email, password, company, industry } = req.body;

        if (!name || !email || !password || !company) {
            return res.status(400).json({ message: "Name, email, password and company are required" });
        }

        const exists = await Recruiter.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const recruiter = await Recruiter.create({
            name,
            email,
            password: hashedPassword,
            status: "Pending",
            company,
            industry: industry || "",
        });

        res.status(201).json({
            ...safeRecruiter(recruiter),
            token: generateToken(recruiter._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/recruiters/login
export const loginRecruiter = async (req, res) => {
    try {
        const { email, password } = req.body;

        const recruiter = await Recruiter.findOne({ email });
        if (!recruiter) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const match = await bcrypt.compare(password, recruiter.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (recruiter.status === "Blocked") {
            return res.status(403).json({
                message: "Your account has been blocked by the administrator.",
                blocked: true,
            });
        }

        if (recruiter.status === "Rejected") {
            return res.status(403).json({
                message: "Your recruiter application has been rejected. Please contact support.",
            });
        }

        res.json({
            ...safeRecruiter(recruiter),
            token: generateToken(recruiter._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────
//  P R O F I L E
// ──────────────────────────────────

// GET /api/recruiters/profile
export const getRecruiterProfile = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.recruiter._id).select("-password");
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found" });
        }
        res.json(safeRecruiter(recruiter));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/recruiters/profile
export const updateRecruiterProfile = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.recruiter._id);
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found" });
        }

        const allowedFields = [
            "name", "phone", "location", "company", "companySize",
            "industry", "website", "linkedin", "description",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                recruiter[field] = req.body[field];
            }
        });

        const updated = await recruiter.save();
        res.json(safeRecruiter(updated));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ──────────────────────────────────
//  D A S H B O A R D   S T A T S
// ──────────────────────────────────

// GET /api/recruiters/dashboard-stats
export const getRecruiterDashboardStats = async (req, res) => {
    try {
        const recruiterId = req.recruiter._id;

        // 1. Total Jobs Posted
        const jobsCount = await Job.countDocuments({ recruiter: recruiterId });

        // 2. Total Applications received (for this recruiter's jobs)
        const appsCount = await Application.countDocuments({ recruiter: recruiterId });

        // 3. Shortlisted or Hired Candidates
        const shortlistedCount = await Application.countDocuments({
            recruiter: recruiterId,
            status: { $in: ["Shortlisted", "Hired"] },
        });

        // 4. Interviews (Scheduled or Rescheduled)
        const interviewsCount = await Interview.countDocuments({
            recruiterId: recruiterId,
            status: { $in: ["Scheduled", "Rescheduled"] },
        });

        res.json({
            jobs: jobsCount,
            applications: appsCount,
            shortlisted: shortlistedCount,
            interviews: interviewsCount,
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Server error fetching stats" });
    }
};

// ──────────────────────────────────
//  S E C U R I T Y
// ──────────────────────────────────

// PUT /api/recruiters/change-password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const recruiter = await Recruiter.findById(req.recruiter._id);
        if (!recruiter) {
            return res.status(404).json({ message: "Recruiter not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, recruiter.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        recruiter.password = await bcrypt.hash(newPassword, salt);
        await recruiter.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/recruiters/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOne({ email: req.body.email });
        if (!recruiter) {
            return res.status(404).json({ message: "There is no recruiter with that email address." });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        recruiter.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        recruiter.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

        await recruiter.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/recruiter/reset-password/${resetToken}`;
        const { subject, html } = passwordResetEmail(recruiter.name.split(' ')[0], resetUrl);

        try {
            await sendEmail(recruiter.email, subject, html);
            res.status(200).json({ message: "Email sent successfully" });
        } catch (err) {
            recruiter.resetPasswordToken = undefined;
            recruiter.resetPasswordExpire = undefined;
            await recruiter.save();
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/recruiters/reset-password/:token
export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const recruiter = await Recruiter.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!recruiter) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const salt = await bcrypt.genSalt(10);
        recruiter.password = await bcrypt.hash(req.body.password, salt);

        recruiter.resetPasswordToken = undefined;
        recruiter.resetPasswordExpire = undefined;
        await recruiter.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
