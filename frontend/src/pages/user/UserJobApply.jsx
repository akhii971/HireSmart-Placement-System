import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaPaperPlane,
  FaArrowLeft,
  FaCheckCircle,
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";
import api from "../../api/axios";

export default function UserJobApply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingApp, setExistingApp] = useState(null);

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch job details + check if already applied
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, checkRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get(`/applications/check/${id}`),
        ]);
        setJob(jobRes.data);
        if (checkRes.data.applied) {
          setAlreadyApplied(true);
          setExistingApp(checkRes.data.application);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setJobLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post(`/applications/apply/${id}`, { coverLetter });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading State ───
  if (jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600 text-xl">
        ❌ Job not found
      </div>
    );
  }

  // ─── Status badge color helper ───
  const statusColor = (s) => {
    const map = {
      Pending: "bg-yellow-100 text-yellow-700",
      Reviewed: "bg-blue-100 text-blue-700",
      Shortlisted: "bg-emerald-100 text-emerald-700",
      Rejected: "bg-red-100 text-red-700",
      Hired: "bg-green-100 text-green-700",
    };
    return map[s] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-6 pt-24">
      <div className="max-w-3xl mx-auto space-y-6 pb-24 mt-16">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Apply for Job
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Submit your application to {job.company}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-sm font-semibold transition"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* ── JOB SUMMARY CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow border"
        >
          <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <FaBuilding className="text-emerald-500" /> {job.company}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-red-400" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <FaBriefcase className="text-blue-400" /> {job.type}
            </span>
          </div>
          {job.salary && (
            <p className="text-sm text-slate-500 mt-2">
              💰 Salary: {job.salary}
            </p>
          )}
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── ALREADY APPLIED ── */}
        {alreadyApplied && !success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center"
          >
            <FaCheckCircle className="text-blue-500 text-4xl mx-auto mb-3" />
            <h2 className="text-xl font-bold text-blue-700 mb-1">
              You've Already Applied
            </h2>
            <p className="text-blue-600 text-sm mb-3">
              Your application was submitted on{" "}
              {new Date(existingApp?.createdAt).toLocaleDateString()}
            </p>
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${statusColor(
                existingApp?.status
              )}`}
            >
              Status: {existingApp?.status}
            </span>
            <div className="mt-5">
              <button
                onClick={() => navigate("/user/applications")}
                className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
              >
                View My Applications
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <FaCheckCircle className="text-emerald-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-600 mb-2">
              🎉 Application Submitted!
            </h2>
            <p className="text-slate-600 mb-6">
              Your application for <strong>{job.title}</strong> at{" "}
              <strong>{job.company}</strong> has been received. The recruiter
              will review your profile soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/user/applications")}
                className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
              >
                View My Applications
              </button>
              <button
                onClick={() => navigate("/user/jobs")}
                className="px-6 py-3 rounded-xl bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition"
              >
                Browse More Jobs
              </button>
            </div>
          </motion.div>
        )}

        {/* ── APPLICATION FORM ── */}
        {!alreadyApplied && !success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl border p-6 md:p-8"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              📝 Your Application
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Your profile details and resume from your account will be
              automatically shared with the recruiter.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile auto-fill notice */}
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">
                  ℹ️ Auto-filled from your profile
                </p>
                <p>
                  Your name, email, education, skills, experience, and resume
                  URL will be shared automatically. Make sure your{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/user/profile")}
                    className="text-emerald-600 font-semibold underline"
                  >
                    profile
                  </button>{" "}
                  is up to date.
                </p>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cover Letter / Message to Recruiter{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  placeholder="Tell the recruiter why you're a great fit for this role..."
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 transition"
              >
                <FaPaperPlane />
                {loading ? "Submitting..." : "Submit Application"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
