import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import Recruiter from "../models/Recruiter.js";
import { sendEmail, applicationStatusEmail, newApplicationEmail } from "../utils/emailService.js";

// ─────────────────────────────────────────────────────
// 📌 USER: Apply to a job
// POST /api/applications/apply/:jobId
// ─────────────────────────────────────────────────────
export const applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter } = req.body;
        const userId = req.user._id;

        // 1. Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // 2. Check if user already applied
        const existingApplication = await Application.findOne({
            user: userId,
            job: jobId,
        });

        if (existingApplication) {
            return res
                .status(400)
                .json({ message: "You have already applied to this job" });
        }

        // 3. Create application
        const application = await Application.create({
            user: userId,
            job: jobId,
            recruiter: job.recruiter,
            resumeUrl: req.user.resumeUrl || "",
            coverLetter: coverLetter || "",
        });

        // 4. Increment application count on the job
        job.applications += 1;
        await job.save();

        // 5. Notify the recruiter
        try {
            await Notification.create({
                recruiterId: job.recruiter,
                type: "application_received",
                title: "📄 New Application",
                message: `${req.user.name || "A candidate"} applied for "${job.title}"`,
                link: `/recruiter/candidates/${application._id}`,
            });

            // 📧 Email the recruiter
            const recruiterDoc = await Recruiter.findById(job.recruiter).select("name email");
            if (recruiterDoc?.email) {
                const { subject, html } = newApplicationEmail(
                    recruiterDoc.name, req.user.name || "A candidate", job.title
                );
                sendEmail(recruiterDoc.email, subject, html);
            }
        } catch (err) {
            console.error("Failed to notify recruiter:", err);
        }

        res.status(201).json({
            message: "Application submitted successfully",
            application,
        });
    } catch (err) {
        // Handle duplicate key error (race condition)
        if (err.code === 11000) {
            return res
                .status(400)
                .json({ message: "You have already applied to this job" });
        }
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────
// 📌 USER: Get all my applications (with status)
// GET /api/applications/my
// ─────────────────────────────────────────────────────
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id })
            .populate({
                path: "job",
                select: "title company location type salary",
            })
            .populate({
                path: "recruiter",
                select: "name company",
            })
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────
// 📌 USER: Check if already applied to a specific job
// GET /api/applications/check/:jobId
// ─────────────────────────────────────────────────────
export const checkApplicationStatus = async (req, res) => {
    try {
        const application = await Application.findOne({
            user: req.user._id,
            job: req.params.jobId,
        });

        res.json({
            applied: !!application,
            application: application || null,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────
// 📌 USER: Withdraw application
// DELETE /api/applications/:id
// ─────────────────────────────────────────────────────
export const withdrawApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Only the applicant can withdraw
        if (application.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Can only withdraw if still Pending
        if (application.status !== "Pending") {
            return res.status(400).json({
                message: "Cannot withdraw application that has been processed",
            });
        }

        // Decrement application count on the job
        await Job.findByIdAndUpdate(application.job, {
            $inc: { applications: -1 },
        });

        await application.deleteOne();

        res.json({ message: "Application withdrawn successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────
// 📌 RECRUITER: Get all applications for a specific job
// GET /api/applications/job/:jobId
// ─────────────────────────────────────────────────────
export const getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Verify recruiter owns this job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.recruiter.toString() !== req.recruiter._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const applications = await Application.find({ job: jobId })
            .populate({
                path: "user",
                select:
                    "name email phone location college degree branch graduationYear cgpa skills experience resumeUrl linkedin github portfolio",
            })
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────
// 📌 RECRUITER: Get all applications across all their jobs
// GET /api/applications/recruiter/all
// ─────────────────────────────────────────────────────
export const getAllRecruiterApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            recruiter: req.recruiter._id,
        })
            .populate({
                path: "user",
                select: "name email phone location college skills experience resumeUrl",
            })
            .populate({
                path: "job",
                select: "title company location type",
            })
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────
// 📌 RECRUITER: Update application status
// PUT /api/applications/:id/status
// ─────────────────────────────────────────────────────
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, recruiterNotes } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify recruiter owns this application's job
        if (application.recruiter.toString() !== req.recruiter._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Validate status
        const validStatuses = [
            "Pending",
            "Reviewed",
            "Shortlisted",
            "Rejected",
            "Hired",
        ];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        if (status) application.status = status;
        if (recruiterNotes !== undefined)
            application.recruiterNotes = recruiterNotes;

        const updated = await application.save();

        // Re-populate for response
        await updated.populate({
            path: "user",
            select: "name email phone location college skills experience resumeUrl",
        });

        // 📧 Email the student about status change
        try {
            const job = await Job.findById(application.job).select("title company");
            if (updated.user?.email && job) {
                const { subject, html } = applicationStatusEmail(
                    updated.user.name, job.title, job.company || "Company", status
                );
                sendEmail(updated.user.email, subject, html);
            }
        } catch (emailErr) {
            console.error("Failed to send status email:", emailErr.message);
        }

        res.json({
            message: "Application status updated",
            application: updated,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────
// 📌 RECRUITER: Get single application detail
// GET /api/applications/:id
// ─────────────────────────────────────────────────────
export const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate({
                path: "user",
                select:
                    "name email phone location bio college degree branch graduationYear cgpa skills languages experience linkedin github portfolio resumeUrl certifications achievements",
            })
            .populate({
                path: "job",
                select: "title company location type salary experience skills",
            });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify recruiter owns this application
        if (application.recruiter.toString() !== req.recruiter._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(application);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
