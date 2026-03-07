import User from "../models/User.js";
import Recruiter from "../models/Recruiter.js";
import Job from "../models/Job.js";

// ──────────────────────────────────
//   A D M I N   P R O F I L E
// ──────────────────────────────────

// GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/profile
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const allowed = ["name", "phone", "location", "bio"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) admin[f] = req.body[f]; });

    const updated = await admin.save();
    const safe = await User.findById(updated._id).select("-password");
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ──────────────────────────────────
//   U S E R S  (students/freshers)
// ──────────────────────────────────

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $nin: ["admin"] } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users/:id
export const getUserByIdAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "Active" ? "Blocked" : "Active";
    await user.save();

    const updated = await User.findById(user._id).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────
//   R E C R U I T E R S  (own DB)
// ──────────────────────────────────

// GET /api/admin/recruiters
export const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(recruiters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/recruiters/:id
export const getRecruiterByIdAdmin = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id).select("-password");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }
    res.json(recruiter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/recruiters/:id/status
export const updateRecruiterStatus = async (req, res) => {
  try {
    const { status } = req.body; // Approved | Rejected | Blocked | Pending
    const recruiter = await Recruiter.findById(req.params.id);

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    recruiter.status = status;
    await recruiter.save();

    const updated = await Recruiter.findById(recruiter._id).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/recruiters/:id
export const deleteRecruiterAdmin = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    // Cascade: delete all jobs posted by this recruiter
    await Job.deleteMany({ recruiter: recruiter._id });
    await recruiter.deleteOne();

    res.json({ message: "Recruiter and their jobs deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────
//   J O B S
// ──────────────────────────────────

// GET /api/admin/jobs
export const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate({ path: "recruiter", select: "name email company", model: "Recruiter" })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/jobs/:id
export const getJobDetailsAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate({
      path: "recruiter",
      select: "name email company",
      model: "Recruiter",
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/jobs/:id
export const deleteJobAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    await job.deleteOne();
    res.json({ message: "Job deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────
//   D A S H B O A R D   S T A T S
// ──────────────────────────────────

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers, totalRecruiters, totalJobs,
      activeUsers, blockedUsers,
      pendingRecruiters, approvedRecruiters,
    ] = await Promise.all([
      User.countDocuments({ role: { $nin: ["admin"] } }),
      Recruiter.countDocuments(),
      Job.countDocuments(),
      User.countDocuments({ role: { $nin: ["admin"] }, status: "Active" }),
      User.countDocuments({ role: { $nin: ["admin"] }, status: "Blocked" }),
      Recruiter.countDocuments({ status: "Pending" }),
      Recruiter.countDocuments({ status: "Approved" }),
    ]);

    res.json({
      totalUsers,
      totalRecruiters,
      totalJobs,
      activeUsers,
      blockedUsers,
      pendingRecruiters,
      approvedRecruiters,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};