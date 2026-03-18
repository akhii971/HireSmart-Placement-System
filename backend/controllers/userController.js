import User from "../models/User.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, passwordResetEmail } from "../utils/emailService.js";

// 🔐 Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ✅ POST /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    // 🚫 Block sign-in for blocked users
    if (user.status === "Blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by the administrator. Please contact support.",
        blocked: true,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET /api/users/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fields = [
      "name", "phone", "location", "bio", "college", "degree", "branch",
      "graduationYear", "cgpa", "experience", "skills", "languages",
      "jobType", "preferredLocation", "expectedSalary", "availability",
      "openToRemote", "linkedin", "github", "portfolio", "resumeUrl",
      "certifications", "achievements"
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    const updated = await user.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ✅ PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // req.user is set by protect middleware
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ POST /api/users/upload-resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.resumeUrl = req.file.path; // Cloudinary secure URL
    await user.save();

    res.json({ resumeUrl: user.resumeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Resume upload failed" });
  }
};

// ✅ GET /api/users/dashboard-stats
export const getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Applications count
    const appsCount = await Application.countDocuments({ user: user._id });

    // Recent applications with basic job details
    const recentApplications = await Application.find({ user: user._id })
      .populate('job', 'title location type salary')
      .populate('recruiter', 'companyName companyLogo')
      .sort({ createdAt: -1 })
      .limit(3);

    // Interviews count
    const intsCount = await Interview.countDocuments({ studentId: user._id });

    // Upcoming interviews
    const upcomingInterviews = await Interview.find({ studentId: user._id, status: 'Scheduled', date: { $gte: new Date() } })
      .populate('jobId', 'title')
      .populate('recruiterId', 'companyName')
      .sort({ date: 1 })
      .limit(2);

    // Profile Completeness
    const fields = [
      'name', 'email', 'phone', 'location', 'bio', 'college', 'degree',
      'branch', 'graduationYear', 'cgpa', 'experience', 'resumeUrl', 'linkedin', 'github'
    ];
    let filled = 0;
    fields.forEach(f => {
      if (user[f] && typeof user[f] === 'string' && user[f].trim() !== '') filled++;
    });
    if (user.skills && user.skills.length > 0) filled++;
    if (user.languages && user.languages.length > 0) filled++;
    const profileCompleteness = Math.round((filled / 16) * 100);

    // ATS Score Calculation
    let atsScore = 30;
    if (user.resumeUrl) atsScore += 30;
    if (user.skills && user.skills.length >= 5) atsScore += 15;
    else if (user.skills && user.skills.length > 0) atsScore += 10;
    if (user.experience && user.experience !== 'fresher') atsScore += 15;
    if (user.linkedin || user.github) atsScore += 10;
    atsScore = Math.min(100, atsScore);

    res.json({
      applications: appsCount,
      interviews: intsCount,
      profileCompleteness,
      atsScore,
      recentApplications,
      upcomingInterviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// ✅ POST /api/users/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "There is no user with that email address." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    // Create reset URL
    // e.g. http://localhost:5173/user/reset-password/abc123token
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/reset-password/${resetToken}`;

    const { subject, html } = passwordResetEmail(user.name.split(' ')[0], resetUrl);

    try {
      await sendEmail(user.email, subject, html);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ PUT /api/users/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};