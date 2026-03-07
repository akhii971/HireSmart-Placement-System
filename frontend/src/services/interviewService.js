import api from "../api/axios";

// ─── Recruiter Interview API ─────────────────────────

export const scheduleNewInterview = (data) =>
    api.post("/interviews", data);

export const fetchRecruiterInterviews = () =>
    api.get("/interviews/recruiter");

export const updateInterviewStatus = (id, status) =>
    api.put(`/interviews/${id}/status`, { status });

export const updateInterviewDetails = (id, data) =>
    api.put(`/interviews/${id}`, data);

// ─── Student Interview API ──────────────────────────

export const fetchStudentInterviews = () =>
    api.get("/interviews/student");
