import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { sendEmail, interviewScheduledEmail } from "../utils/emailService.js";

// @desc    Schedule a new interview
// @route   POST /api/interviews
// @access  Private (Recruiter only)
export const scheduleInterview = async (req, res) => {
    try {
        const { studentId, applicationId, jobId, date, time, type, meetingLink, notes } = req.body;
        const recruiterId = req.recruiter._id;

        if (!studentId || !applicationId || !jobId || !date || !time || !meetingLink) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }

        const interview = await Interview.create({
            recruiterId,
            studentId,
            applicationId,
            jobId,
            date,
            time,
            type: type || "General",
            meetingLink,
            notes,
            status: "Scheduled",
        });

        // 🔔 Send notification to the student AND recruiter
        try {
            const job = await Job.findById(jobId);
            const jobTitle = job?.title || "a position";
            const formattedDate = new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
            });
            const typeLabel = type || "General";

            // For student
            await Notification.create({
                userId: studentId,
                type: "interview_scheduled",
                title: "📅 Interview Scheduled!",
                message: `You have a ${typeLabel} interview scheduled for "${jobTitle}" on ${formattedDate} at ${time}. Check your Interviews page for details.`,
                link: "/user/interviews",
            });

            // For recruiter
            await Notification.create({
                recruiterId: recruiterId,
                type: "interview_scheduled",
                title: "📅 Interview Scheduled",
                message: `You scheduled a ${typeLabel} interview for "${jobTitle}" on ${formattedDate} at ${time}.`,
                link: "/recruiter/interview",
            });

            // 📧 Email the student about the interview
            const student = await User.findById(studentId).select("name email");
            if (student?.email) {
                const { subject, html } = interviewScheduledEmail(
                    student.name, jobTitle, job?.company || "Company", formattedDate, time, typeLabel, meetingLink
                );
                sendEmail(student.email, subject, html);
            }
        } catch (notifErr) {
            console.error("Failed to create notification:", notifErr);
        }

        res.status(201).json({
            success: true,
            message: "Interview scheduled successfully",
            interview,
        });
    } catch (error) {
        console.error("Error scheduling interview:", error);
        res.status(500).json({ message: "Server error while scheduling interview", error: error.message });
    }
};

// @desc    Get all interviews for a specific recruiter
// @route   GET /api/interviews/recruiter
// @access  Private (Recruiter only)
export const getRecruiterInterviews = async (req, res) => {
    try {
        const recruiterId = req.recruiter._id;
        const interviews = await Interview.find({ recruiterId })
            .populate("studentId", "name email profilePicture")
            .populate("jobId", "title company")
            .populate("applicationId", "status")
            .sort({ date: 1, time: 1 }); // Sort by upcoming first

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews,
        });
    } catch (error) {
        console.error("Error fetching recruiter interviews:", error);
        res.status(500).json({ message: "Server error fetching interviews" });
    }
};

// @desc    Get all interviews for a specific student
// @route   GET /api/interviews/student
// @access  Private (User only)
export const getStudentInterviews = async (req, res) => {
    try {
        const studentId = req.user._id;
        const interviews = await Interview.find({ studentId })
            .populate("recruiterId", "companyName companyLogo name")
            .populate("jobId", "title company")
            .sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews,
        });
    } catch (error) {
        console.error("Error fetching student interviews:", error);
        res.status(500).json({ message: "Server error fetching interviews" });
    }
};

// @desc    Update interview status
// @route   PUT /api/interviews/:id/status
// @access  Private (Recruiter only)
export const updateInterviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const interviewId = req.params.id;

        if (!["Scheduled", "Completed", "Canceled", "Rescheduled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Ensure the recruiter updating it is the one who created it
        if (interview.recruiterId.toString() !== req.recruiter._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this interview" });
        }

        interview.status = status;
        await interview.save();

        // 🔔 Notify student AND recruiter about status change
        try {
            const job = await Job.findById(interview.jobId);
            const jobTitle = job?.title || "a position";

            const studentMessages = {
                Completed: `Your interview for "${jobTitle}" has been marked as completed. Good luck!`,
                Canceled: `Your interview for "${jobTitle}" has been canceled. Please check with the recruiter.`,
                Rescheduled: `Your interview for "${jobTitle}" has been rescheduled. Check your Interviews page for the new details.`,
                Scheduled: `Your interview for "${jobTitle}" has been re-scheduled. Check your Interviews page for details.`,
            };

            const recruiterMessages = {
                Completed: `Interview for "${jobTitle}" marked as completed.`,
                Canceled: `Interview for "${jobTitle}" was canceled.`,
                Rescheduled: `Interview for "${jobTitle}" was rescheduled.`,
                Scheduled: `Interview status for "${jobTitle}" updated to scheduled.`,
            };

            const notifType = status === "Canceled" ? "interview_canceled" : "interview_updated";
            const notifTitle = status === "Canceled" ? "❌ Interview Canceled" : "🔄 Interview Updated";

            // For student
            await Notification.create({
                userId: interview.studentId,
                type: notifType,
                title: notifTitle,
                message: studentMessages[status] || `Your interview status has been updated to ${status}.`,
                link: "/user/interviews",
            });

            // For recruiter
            await Notification.create({
                recruiterId: interview.recruiterId,
                type: notifType,
                title: notifTitle,
                message: recruiterMessages[status] || `Interview status updated to ${status}.`,
                link: "/recruiter/interview",
            });

        } catch (notifErr) {
            console.error("Failed to create notification:", notifErr);
        }

        res.status(200).json({
            success: true,
            message: `Interview marked as ${status}`,
            interview,
        });
    } catch (error) {
        console.error("Error updating interview status:", error);
        res.status(500).json({ message: "Server error updating interview" });
    }
};

// @desc    Update interview details
// @route   PUT /api/interviews/:id
// @access  Private (Recruiter only)
export const updateInterviewDetails = async (req, res) => {
    try {
        const { date, time, meetingLink, notes, type } = req.body;
        const interviewId = req.params.id;

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Ensure the recruiter updating it is the one who created it
        if (interview.recruiterId.toString() !== req.recruiter._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this interview" });
        }

        interview.date = date || interview.date;
        interview.time = time || interview.time;
        interview.meetingLink = meetingLink || interview.meetingLink;
        interview.notes = notes !== undefined ? notes : interview.notes;
        interview.type = type || interview.type;

        if (date || time) {
            interview.status = "Rescheduled";
        }

        await interview.save();

        // 🔔 Notify student AND recruiter about detail changes (Reschedule)
        if (date || time) {
            try {
                const job = await Job.findById(interview.jobId);
                const jobTitle = job?.title || "a position";
                const formattedDate = new Date(interview.date).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                });

                // For student
                await Notification.create({
                    userId: interview.studentId,
                    type: "interview_updated",
                    title: "🔄 Interview Rescheduled",
                    message: `Your interview for "${jobTitle}" was rescheduled to ${formattedDate} at ${interview.time}.`,
                    link: "/user/interviews",
                });

                // For recruiter
                await Notification.create({
                    recruiterId: interview.recruiterId,
                    type: "interview_updated",
                    title: "🔄 Interview Rescheduled",
                    message: `You rescheduled the interview for "${jobTitle}" to ${formattedDate} at ${interview.time}.`,
                    link: "/recruiter/interview",
                });
            } catch (err) {
                console.log("Failed to create reschedule notification", err);
            }
        }

        res.status(200).json({
            success: true,
            message: "Interview updated successfully",
            interview,
        });
    } catch (error) {
        console.error("Error updating interview details:", error);
        res.status(500).json({ message: "Server error updating interview" });
    }
};
